// src/controllers/activityController.js
const { prisma } = require('../config/db');

/**
 * createActivity
 * body: { leadId, type, content }
 * - For chat messages, use type: 'message'
 * - will save activity.userId = req.user.id
 * - emits socket 'newActivity' and if type === 'message' also 'newMessage' to lead room
 */
const createActivity = async (req, res) => {
  try {
    const { leadId, type, content } = req.body;
    if (!leadId || !type) return res.status(400).json({ message: 'leadId and type required' });

    // validate lead exists and permission
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    // role-based check: sales exec can only add if owner
    if (req.user.role === 'SALES_EXECUTIVE' && lead.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'MANAGER') {
      const managerTeams = await prisma.team.findMany({ where: { managerId: req.user.id }, select: { id: true } });
      const teamIds = managerTeams.map(t => t.id);
      if (lead.teamId && teamIds.length && !teamIds.includes(lead.teamId)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const activity = await prisma.activity.create({
      data: {
        leadId,
        type,
        content: content || null,
        userId: req.user.id
      },
      include: { user: { select: { id: true, name: true } } }
    });

    // emit to lead room
    try {
      if (req.io) {
        req.io.to(`lead:${leadId}`).emit('newActivity', activity);
        if (type === 'message') req.io.to(`lead:${leadId}`).emit('newMessage', activity);
      }
    } catch (emitErr) {
      console.warn('Socket emit failed in createActivity:', emitErr);
    }

    return res.status(201).json(activity);
  } catch (err) {
    console.error('createActivity', err);
    return res.status(500).json({ message: 'Failed to create activity' });
  }
};

const listActivitiesForLead = async (req, res) => {
  try {
    const { leadId } = req.params; // route uses /lead/:leadId
    if (!leadId) return res.status(400).json({ message: 'leadId required' });

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    if (req.user.role === 'SALES_EXECUTIVE' && lead.ownerId !== req.user.id) return res.status(403).json({ message: 'Access denied' });

    if (req.user.role === 'MANAGER') {
      const managerTeams = await prisma.team.findMany({ where: { managerId: req.user.id }, select: { id: true } });
      const teamIds = managerTeams.map(t => t.id);
      if (lead.teamId && teamIds.length && !teamIds.includes(lead.teamId)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const activities = await prisma.activity.findMany({
      where: { leadId },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { id: true, name: true } } }
    });

    return res.json(activities);
  } catch (err) {
    console.error('listActivitiesForLead', err);
    return res.status(500).json({ message: 'Failed to fetch activities' });
  }
};

module.exports = { createActivity, listActivitiesForLead };
