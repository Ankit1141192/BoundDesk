const { prisma } = require('../config/db');

// Create Lead
const createLead = async (req, res) => {
  try {
    const { name, email, phone, company, teamId, ownerId } = req.body;

    if (!name || !email) return res.status(400).json({ message: 'Name and Email are required' });

    // Assign owner based on role
    let finalOwnerId = ownerId;
    if (req.user.role === 'SALES_EXECUTIVE') {
      finalOwnerId = req.user.id; // sales can only assign to themselves
    } else if (!ownerId) {
      finalOwnerId = req.user.id; // fallback owner
    }

    let validTeamId = null;
    if (teamId) {
      const teamExists = await prisma.team.findUnique({ where: { id: teamId } });
      if (!teamExists) return res.status(400).json({ message: 'Invalid teamId' });
      validTeamId = teamId;
    }

    const lead = await prisma.lead.create({
      data: { name, email, phone, company, ownerId: finalOwnerId, teamId: validTeamId },
      include: { owner: true, team: true },
    });

    res.status(201).json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create lead' });
  }
};

// List Leads (role-based)
const listLeads = async (req, res) => {
  try {
    const { status, teamId } = req.query;
    let where = {};

    if (req.user.role === 'SALES_EXECUTIVE') {
      where.ownerId = req.user.id;
    } else if (req.user.role === 'MANAGER') {
      // Manager sees leads only for their teams
      const managerTeams = await prisma.team.findMany({
        where: { managerId: req.user.id },
        select: { id: true },
      });
      const teamIds = managerTeams.map(t => t.id);
      where.teamId = teamIds.length ? { in: teamIds } : ''; // avoid empty query
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
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch leads' });
  }
};

// Get single Lead
const getLead = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { owner: true, team: true, activities: true, histories: true },
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
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch lead' });
  }
};

// Update Lead
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

    if (data.teamId) {
      const teamExists = await prisma.team.findUnique({ where: { id: data.teamId } });
      if (!teamExists) return res.status(400).json({ message: 'Invalid teamId' });
    }

    const updated = await prisma.lead.update({ where: { id }, data });

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
    console.error(err);
    res.status(500).json({ message: 'Failed to update lead' });
  }
};

// Delete Lead
const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await prisma.lead.findUnique({ where: { id } });
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
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete lead' });
  }
};

module.exports = { createLead, listLeads, getLead, updateLead, deleteLead };
