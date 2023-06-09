const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { v4: uuidv4 } = require('uuid');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const connectedClients = {}; // Keep track of connected clients
const availableSystems = []; // Keep track of available systems

// Set up session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Configure local strategy for passport
passport.use(new LocalStrategy(
  async function(username, password, done) {
    try {
      // Replace this with your own user retrieval logic from the database
      const user = await User.findOne({ username: username });

      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      // Check if the password matches
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password.' });
      }
    } catch (err) {
      return done(err);
    }
  }
));

// Serialize user object for session storage
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// Deserialize user object from session storage
passport.deserializeUser(async function(id, done) {
  try {
    // Replace this with your own user retrieval logic from the database
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Configure body parser middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files
app.use(express.static('public'));

// Define routes for user authentication
app.post('/login', passport.authenticate('local'), function(req, res) {
  res.redirect('/dashboard'); // Replace with your own redirect URL
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/login'); // Replace with your own redirect URL
});

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login'); // Replace with your own redirect URL
}

// Routes for your application's functionality
app.get('/', isAuthenticated, function(req, res) {
  res.sendFile(__dirname + '/index.html'); // Replace with your own file path
});

app.get('/dashboard', isAuthenticated, function(req, res) {
  res.sendFile(__dirname + '/dashboard.html'); // Replace with your own file path
});

// Socket.IO connection
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
