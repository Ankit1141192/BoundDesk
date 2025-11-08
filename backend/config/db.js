const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL Connected Successfully');
  } catch (error) {
    console.error('Database Connection Failed:', error.message);
    process.exit(1);
  }
};

module.exports = { prisma, connectDB };
