const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { v4: uuidv4 } = require('uuid');

const connectedClients = {}; // Keep track of connected clients

app.use(express.static('public'));

io.on('connection', function(socket) {
  console.log('A user connected');

  socket.on('join-message', function(room) {
    console.log('User joined room:', room);
    socket.join(room);

    // Store the client's socket in the connectedClients object
    connectedClients[socket.id] = { room };

    // Emit an event to notify all connected clients about the updated list of available systems
    io.emit('available-systems', getAvailableSystems());
  });

  socket.on('screen-data', function(data) {
    io.to(data.room).emit('screen-data', data.image);
  });

  socket.on('disconnect', function() {
    console.log('A user disconnected');

    // Remove the client's socket from the connectedClients object
    delete connectedClients[socket.id];

    // Emit an event to notify all connected clients about the updated list of available systems
    io.emit('available-systems', getAvailableSystems());
  });

  socket.on('request-connection', function(data) {
    const { requester, target } = data;

    // Check if the target system is available
    if (isSystemAvailable(target)) {
      // Emit an event to the target system to establish the connection
      io.to(target).emit('connection-request', requester);
    }
  });

  socket.on('accept-connection', function(data) {
    const { requester, target } = data;

    // Emit an event to the requester system to confirm the connection
    io.to(requester).emit('connection-accepted', target);
  });
});

function getAvailableSystems() {
  // Extract the unique room IDs from connectedClients
  const availableSystems = [...new Set(Object.values(connectedClients).map(client => client.room))];
  availableSystems.push('Server'); // Add 'Server' as an available system
  return availableSystems;
}

function isSystemAvailable(room) {
  // Check if the specified room is available in connectedClients
  return Object.values(connectedClients).some(client => client.room === room);
}

const port = 5000;
http.listen(port, function() {
  console.log('Server listening on port ' + port);
});
