const { prisma } = require('../config/db'); // ensure you export prisma as { prisma } in db.js

// Get currently logged-in user's profile
const me = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error in me:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// List all users (ADMIN only)
const listUsers = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    res.json(users);
  } catch (err) {
    console.error("Error in listUsers:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile (ADMIN or self)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "ADMIN" && req.user.id !== id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const data = { ...req.body };
    delete data.password; // never allow updating password here

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Error in updateUser:", err);
    if (err.code === "P2025") {
      // Prisma error: record not found
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { me, listUsers, updateUser };
