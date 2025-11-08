const prisma = require('../config/db');

const createLead = async (req, res) => {
  const { name, email, phone, company, ownerId, teamId } = req.body;
  const lead = await prisma.lead.create({
    data: { name, email, phone, company, ownerId, teamId }
  });
  res.status(201).json(lead);
};

const listLeads = async (req, res) => {
  const { status, ownerId, teamId } = req.query;
  const where = {};
  if (status) where.status = status;
  if (ownerId) where.ownerId = ownerId;
  if (teamId) where.teamId = teamId;
  const leads = await prisma.lead.findMany({ where, include: { owner: true, team: true } });
  res.json(leads);
};

const getLead = async (req, res) => {
  const { id } = req.params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { owner: true, team: true, activities: true, histories: true }
  });
  if (!lead) return res.status(404).json({ message: 'Not found' });
  res.json(lead);
};

const updateLead = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const prev = await prisma.lead.findUnique({ where: { id } });
  const updated = await prisma.lead.update({ where: { id }, data });
  if (data.status && prev && prev.status !== data.status) {
    await prisma.leadHistory.create({
      data: {
        leadId: id,
        changedBy: req.user.id,
        changeType: 'STATUS_CHANGE',
        changeData: { from: prev.status, to: data.status }
      }
    });
  }
  res.json(updated);
};

const deleteLead = async (req, res) => {
  const { id } = req.params;
  await prisma.lead.delete({ where: { id } });
  res.status(204).send();
};

module.exports = { createLead, listLeads, getLead, updateLead, deleteLead };
