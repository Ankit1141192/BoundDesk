const { prisma } = require("../config/db");

exports.createLead = async (req, res) => {
  try {
    const { name, email, phone, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and Email are required" });
    }

    const lead = await prisma.lead.create({
      data: { name, email, phone, status },
    });

    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLeads = async (req, res) => {
  const leads = await prisma.lead.findMany();
  res.json(leads);
};

exports.updateLead = async (req, res) => {
  const lead = await prisma.lead.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(lead);
};

exports.deleteLead = async (req, res) => {
  await prisma.lead.delete({ where: { id: req.params.id } });
  res.json({ message: "Lead Deleted" });
};
