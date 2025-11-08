const prisma = require('../config/db')

const me = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true }
  });
  res.json(user);
};

const listUsers = async (req, res) => {
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true } });
  res.json(users);
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== 'ADMIN' && req.user.id !== id) return res.status(403).json({ message: 'Forbidden' });
  const data = req.body;
  delete data.password;
  const updated = await prisma.user.update({ where: { id }, data });
  res.json(updated);
};

module.exports = { me, listUsers, updateUser };
