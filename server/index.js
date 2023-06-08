const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files
app.use(express.static(__dirname + '/public'));

// Handle GET requests for the view page
app.get('/view', (req, res) => {
  res.sendFile(__dirname + '/display.html');
});

const connectedClients = {}; // Keep track of connected clients

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join-message', (roomId) => {
    socket.join(roomId);
    console.log('User joined in a room: ' + roomId);

    // Store the client's socket in the connectedClients object
    connectedClients[socket.id] = { room: roomId };

    // Emit an event to notify all connected clients about the updated list of available systems
    io.emit('available-systems', getAvailableSystems());
  });

  socket.on('screen-data', function (data) {
    const { room, image } = JSON.parse(data);
    socket.broadcast.to(room).emit('screen-data', image);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');

    // Remove the client's socket from the connectedClients object
    delete connectedClients[socket.id];

    // Emit an event to notify all connected clients about the updated list of available systems
    io.emit('available-systems', getAvailableSystems());
  });
});

function getAvailableSystems() {
  // Extract the unique room IDs from connectedClients
  const availableSystems = [...new Set(Object.values(connectedClients).map(client => client.room))];
  availableSystems.push('Server'); // Add 'Server' as an available system
  return availableSystems;
}

const serverPort = process.env.YOUR_PORT || process.env.PORT || 5000;
server.listen(serverPort, () => {
  console.log('Server started on port: ' + serverPort);
});
