const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle new connections
io.on('connection', (socket) => {
  console.log('a player connected: ' + socket.id);

  // Assign a new player
  players[socket.id] = { x: 100, y: 100 };  // Starting position

  // Send the initial player data to the new player
  socket.emit('currentPlayers', players);

  // Broadcast to all players when a new player joins
  socket.broadcast.emit('newPlayer', { id: socket.id, ...players[socket.id] });

  // Listen for player movement
  socket.on('playerMovement', (movementData) => {
    if (players[socket.id]) {
      players[socket.id] = { ...players[socket.id], ...movementData };
      io.emit('playerMoved', { id: socket.id, ...players[socket.id] });
    }
  });

  // Handle player disconnection
  socket.on('disconnect', () => {
    console.log('player disconnected: ' + socket.id);
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

// Start the server
server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});