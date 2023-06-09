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

io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log('User joined in a room: ' + roomId);
    io.emit('server-status', { status: true }); // Notify clients about server availability
  });

  socket.on('screen-data', function (data) {
    data = JSON.parse(data);
    const room = data.room;
    const imgStr = data.image;
    socket.broadcast.to(room).emit('screen-data', imgStr);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    io.emit('server-status', { status: false }); // Notify clients about server unavailability
  });
});

const serverPort = process.env.YOUR_PORT || process.env.PORT || 5000;
server.listen(serverPort, () => {
  console.log('Server started on port: ' + serverPort);
});
