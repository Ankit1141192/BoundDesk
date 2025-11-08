const prisma = require('../config/db')

const createTeam = async (req, res) => {
  const { name, userIds = [] } = req.body;
  const team = await prisma.team.create({
    data: {
      name,
      users: { connect: userIds.map(id => ({ id })) }
    },
    include: { users: true }
  });
  res.status(201).json(team);
};

const listTeams = async (req, res) => {
  const teams = await prisma.team.findMany({ include: { users: true } });
  res.json(teams);
};

const getTeam = async (req, res) => {
  const { id } = req.params;
  const team = await prisma.team.findUnique({ where: { id }, include: { users: true, leads: true } });
  if (!team) return res.status(404).json({ message: 'Not found' });
  res.json(team);
};

const updateTeam = async (req, res) => {
  const { id } = req.params;
  const { name, userIds } = req.body;
  const data = { name };
  const updated = await prisma.team.update({
    where: { id },
    data: {
      name,
      
      ...(Array.isArray(userIds) ? {
        users: {
          set: userIds.map(uid => ({ id: uid }))
        }
      } : {})
    },
    include: { users: true }
  });
  res.json(updated);
};

const deleteTeam = async (req, res) => {
  const { id } = req.params;
  await prisma.team.delete({ where: { id } });
  res.status(204).send();
};

module.exports = { createTeam, listTeams, getTeam, updateTeam, deleteTeam };
