const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const screenshot = require('screenshot-desktop');

// Serve the client-side code
app.use(express.static('public'));

// Handle socket connections
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join-message', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });

  socket.on('screen-data', (data) => {
    io.to(data.room).emit('screen-data', data.image);
  });

});

// Start the web server
const port = 5000;
http.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
