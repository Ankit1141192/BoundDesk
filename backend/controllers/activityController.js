const prisma = require('../config/db')

const createActivity = async (req, res) => {
  const { type, content, leadId, scheduledAt } = req.body;
  if (!leadId) return res.status(400).json({ message: 'leadId required' });
  const activity = await prisma.activity.create({
    data: {
      type,
      content,
      leadId,
      userId: req.user.id
    }
  });
  res.status(201).json(activity);
};

const listActivitiesForLead = async (req, res) => {
  const { leadId } = req.params;
  const items = await prisma.activity.findMany({
    where: { leadId },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, name: true } } }
  });
  res.json(items);
};

module.exports = { createActivity, listActivitiesForLead };
