const { prisma } = require('../config/db');

const createTeam = async (req, res) => {
  try {
    const { name, userIds = [] } = req.body;
    const team = await prisma.team.create({
      data: {
        name,
        users: { connect: userIds.map(id => ({ id })) }
      },
      include: { users: true }
    });
    res.status(201).json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create team' });
  }
};

const listTeams = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({ include: { users: true } });
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch teams' });
  }
};

const getTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await prisma.team.findUnique({ where: { id }, include: { users: true, leads: true } });
    if (!team) return res.status(404).json({ message: 'Not found' });
    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch team' });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, userIds } = req.body;
    const updated = await prisma.team.update({
      where: { id },
      data: {
        name,
        ...(Array.isArray(userIds) ? { users: { set: userIds.map(uid => ({ id: uid })) } } : {})
      },
      include: { users: true }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update team' });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.team.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete team' });
  }
};

module.exports = { createTeam, listTeams, getTeam, updateTeam, deleteTeam };
