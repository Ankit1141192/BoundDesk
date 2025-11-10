const { prisma } = require('../config/db');

/** helper to coerce value (price) */
const toNumber = (v) => {
  if (v == null) return null;
  if (typeof v === 'number') return v;
  const cleaned = String(v).replace(/[^0-9.-]+/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
};

const createLead = async (req, res) => {
  try {
    const { name, email, phone, company, teamId, ownerId, value, source, priority, status } = req.body;

    if (!name || !email) return res.status(400).json({ message: 'Name and Email are required' });

    // Assign owner based on role
    let finalOwnerId = ownerId;
    if (req.user.role === 'SALES_EXECUTIVE') {
      finalOwnerId = req.user.id; // sales can only assign to themselves
    } else if (!ownerId) {
      finalOwnerId = req.user.id; // fallback owner
    }

    // Validate owner exists
    const ownerExists = await prisma.user.findUnique({ where: { id: finalOwnerId } });
    if (!ownerExists) return res.status(400).json({ message: 'Invalid ownerId' });

    // Validate team if provided
    let validTeamId = null;
    if (teamId) {
      const teamExists = await prisma.team.findUnique({ where: { id: teamId } });
      if (!teamExists) return res.status(400).json({ message: 'Invalid teamId' });
      validTeamId = teamId;
    }

    // coerce price/value
    const numericValue = toNumber(value);

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        company,
        ownerId: finalOwnerId,
        teamId: validTeamId,
        value: numericValue,
        source: source || undefined,
        priority: priority || undefined,
        status: status || undefined
      },
      include: { owner: true, team: true },
    });

    // emit a socket event so frontends can react (optional)
    try {
      if (req.io) {
        req.io.emit('leadCreated', lead);
        if (lead.teamId) req.io.to(`team:${lead.teamId}`).emit('leadCreated', lead);
      }
    } catch (emitErr) {
      console.warn('Socket emit failed for leadCreated:', emitErr);
    }

    res.status(201).json(lead);
  } catch (err) {
    console.error('createLead', err);
    res.status(500).json({ message: 'Failed to create lead' });
  }
};

const listLeads = async (req, res) => {
  try {
    const { status, teamId } = req.query;
    let where = {};

    if (req.user.role === 'SALES_EXECUTIVE') {
      where.ownerId = req.user.id;
    } else if (req.user.role === 'MANAGER') {
      const managerTeams = await prisma.team.findMany({
        where: { managerId: req.user.id },
        select: { id: true },
      });
      const teamIds = managerTeams.map(t => t.id);
      where.teamId = teamIds.length ? { in: teamIds } : undefined;
    }

    // Optional filters
    if (status) where.status = status;
    if (teamId && req.user.role !== 'SALES_EXECUTIVE') {
      where.teamId = { in: Array.isArray(teamId) ? teamId : [teamId] };
    }

    const leads = await prisma.lead.findMany({
      where,
      include: { owner: true, team: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(leads);
  } catch (err) {
    console.error('listLeads', err);
    res.status(500).json({ message: 'Failed to fetch leads' });
  }
};

const getLead = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { owner: true, team: true, activities: { orderBy: { createdAt: 'asc' }, include: { user: { select: { id: true, name: true } } } }, histories: true },
    });

    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    if (req.user.role === 'SALES_EXECUTIVE' && lead.ownerId !== req.user.id)
      return res.status(403).json({ message: 'Access denied' });

    if (req.user.role === 'MANAGER') {
      const managerTeams = await prisma.team.findMany({
        where: { managerId: req.user.id },
        select: { id: true },
      });
      const teamIds = managerTeams.map(t => t.id);
      if (!teamIds.includes(lead.teamId)) return res.status(403).json({ message: 'Access denied' });
    }

    res.json(lead);
  } catch (err) {
    console.error('getLead', err);
    res.status(500).json({ message: 'Failed to fetch lead' });
  }
};

const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const prev = await prisma.lead.findUnique({ where: { id } });
    if (!prev) return res.status(404).json({ message: 'Lead not found' });

    // Role-based access
    if (req.user.role === 'SALES_EXECUTIVE' && prev.ownerId !== req.user.id)
      return res.status(403).json({ message: 'Access denied' });

    if (req.user.role === 'MANAGER') {
      const managerTeams = await prisma.team.findMany({
        where: { managerId: req.user.id },
        select: { id: true },
      });
      const teamIds = managerTeams.map(t => t.id);
      if (!teamIds.includes(prev.teamId)) return res.status(403).json({ message: 'Access denied' });
    }

    // validate teamId if present
    if (data.teamId) {
      const teamExists = await prisma.team.findUnique({ where: { id: data.teamId } });
      if (!teamExists) return res.status(400).json({ message: 'Invalid teamId' });
    }

    // coerce numeric fields
    if ('value' in data) data.value = toNumber(data.value);

    const updated = await prisma.lead.update({ where: { id }, data, include: { owner: true, team: true } });

    // emit socket event for lead update
    try {
      if (req.io) {
        req.io.emit('leadUpdated', updated);
        if (updated.teamId) req.io.to(`team:${updated.teamId}`).emit('leadUpdated', updated);
      }
    } catch (emitErr) {
      console.warn('Socket emit failed for leadUpdated:', emitErr);
    }

    if (data.status && prev.status !== data.status) {
      await prisma.leadHistory.create({
        data: {
          leadId: id,
          changedBy: req.user.id,
          changeType: 'STATUS_CHANGE',
          changeData: { from: prev.status, to: data.status },
        },
      });
    }

    res.json(updated);
  } catch (err) {
    console.error('updateLead', err);
    res.status(500).json({ message: 'Failed to update lead' });
  }
};

const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await prisma.lead.findUnique({ where: { id }, include: { team: true } });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    if (req.user.role === 'SALES_EXECUTIVE' && lead.ownerId !== req.user.id)
      return res.status(403).json({ message: 'Access denied' });

    if (req.user.role === 'MANAGER') {
      const managerTeams = await prisma.team.findMany({
        where: { managerId: req.user.id },
        select: { id: true },
      });
      const teamIds = managerTeams.map(t => t.id);
      if (!teamIds.includes(lead.teamId)) return res.status(403).json({ message: 'Access denied' });
    }

    await prisma.lead.delete({ where: { id } });

    // emit deletion event
    try {
      if (req.io) req.io.emit('leadDeleted', { id });
    } catch (emitErr) {
      console.warn('Socket emit failed for leadDeleted:', emitErr);
    }

    res.status(204).send();
  } catch (err) {
    console.error('deleteLead', err);
    res.status(500).json({ message: 'Failed to delete lead' });
  }
};

module.exports = { createLead, listLeads, getLead, updateLead, deleteLead };
