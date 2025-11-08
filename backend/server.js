require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const routes = require('./routes');
const { prisma, connectDB } = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// attach routes
app.use('/api/v1', routes);

// health check
app.get('/', (req, res) => res.send('CRM backend up'));

// create HTTP server + socket.io
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

// middleware to make io available in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// socket events
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('joinLead', (leadId) => {
    socket.join(`lead:${leadId}`);
  });

  socket.on('leaveLead', (leadId) => {
    socket.leave(`lead:${leadId}`);
  });

  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id);
  });
});

// connect to DB then start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
});
