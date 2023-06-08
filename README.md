Remote Desktop Client

This repository contains the client script for My Remote Desktop, a remote desktop application built with Electron.

Description:
This Remote Desktop allows you to share your screen remotely with others. It captures screenshots of your screen and streams them to a server using Socket.IO. The server then distributes the screen data to connected clients, allowing them to view the shared screen in real-time.

Prerequisites:
- Node.js - JavaScript runtime environment
- Electron - Framework for building desktop applications with web technologies

Installation:
1. Clone this repository:
   git clone https://github.com/OhWhale515/rdp-screen-share.git

2. Navigate to the project directory:
   cd rdp-screen-share

3. Install the dependencies:
   npm install

Usage:
1. Start the client application:
   npm start

2. The application window will open, and you'll be prompted with a room ID.

3. Start the server application:
   node index.js
4. Open Web Broswer to http://"server.ip.add.here:5000/view
 
5. Enter the room ID to join the remote desktop session.

6. The client script will establish a connection with the server and start capturing and streaming screen data.

7. To stop sharing your screen, click the "Stop Share" button or close the application window.

Breakdown:
   The User who is sharing their screen will run both the server and client scripts, share the room ID provided from the client pop-up window with the User that will be viewing the shared screen.
   The user who is viewing the shared screen will need to open their browser window to http://"server.ip.add.here:5000/view) and input the room ID provided from the User sharing their screen.
   
Configuration:
To configure the server address and port, modify the following line in the index.js file:
var socket = require('socket.io-client')('http://0.0.0.0:5000/view');
Replace 0.0.0.0 with the IP address or hostname of your server, and 5000 with the appropriate port number. Make sure to append "/view" at the end of the URL.

Contributing:
Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

License:
This project is licensed under the MIT License.

