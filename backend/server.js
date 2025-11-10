// server.js (or index.js — replace your current top-level server file)
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const routes = require('./routes'); // index.js that exports router
const { connectDB } = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// health
app.get('/', (req, res) => res.json({ ok: true }));

// attach API routes (mount under /api/v1)
app.use('/api/v1', routes);

// create http server + socket.io
const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
  cors: { origin: '*' },
  pingTimeout: 60000,
});

// make io accessible via req.app.get('io') or req.io
app.set('io', io);
app.use((req, res, next) => {
  req.io = io;
  next();
});

// socket handlers
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('joinLead', (leadId) => {
    if (!leadId) return;
    socket.join(`lead:${leadId}`);
    console.log(`${socket.id} joined lead:${leadId}`);
  });

  socket.on('leaveLead', (leadId) => {
    if (!leadId) return;
    socket.leave(`lead:${leadId}`);
    console.log(`${socket.id} left lead:${leadId}`);
  });

  // Optional: accept direct socket sendMessage (payload must include token)
  socket.on('sendMessage', async (payload) => {
    try {
      // expected payload: { token, leadId, content }
      if (!payload || typeof payload !== 'object') return;
      const { token, leadId, content } = payload;

      if (!token || !leadId || !content) {
        // invalid payload, ignore silently
        return;
      }

      const jwt = require('jsonwebtoken');
      const { prisma } = require('./config/db');

      const secret = process.env.JWT_SECRET || 'secret';
      let decoded;
      try {
        decoded = jwt.verify(token, secret);
      } catch (e) {
        console.warn('sendMessage: invalid token', e.message);
        return;
      }

      // accept various token shapes
      const userId = decoded.sub || decoded.id || decoded.userId;
      if (!userId) {
        console.warn('sendMessage: token missing user id');
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        console.warn('sendMessage: user not found for id', userId);
        return;
      }

      // create activity (message)
      const activity = await prisma.activity.create({
        data: {
          leadId,
          type: 'message',
          content,
          userId: user.id
        },
        include: { user: { select: { id: true, name: true } } }
      });

      // broadcast to room
      io.to(`lead:${leadId}`).emit('newMessage', activity);
      io.to(`lead:${leadId}`).emit('newActivity', activity);
    } catch (err) {
      console.error('sendMessage socket error', err);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('socket disconnected', socket.id, reason);
  });
});

// start server after DB prepared
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  })
  .catch(err => {
    console.error('DB connect failed', err);
    process.exit(1);
  });
