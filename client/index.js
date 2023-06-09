const ipcRenderer = require('electron').ipcRenderer;

window.onload = function() {
  ipcRenderer.on("uuid", (event, data) => {
    document.getElementById("code").innerHTML = "Room ID: " + data;
  });

  checkServerStatus();
};

function checkServerStatus() {
  const serverUrl = 'http://192.168.0.36:5000/view'; // Replace with your server URL

  fetch(serverUrl)
    .then(response => {
      if (response.ok) {
        document.getElementById("server-status").innerHTML = "Server Status: <span class='online'>Online</span>";
      } else {
        document.getElementById("server-status").innerHTML = "Server Status: <span class='offline'>Offline</span>";
      }
    })
    .catch(error => {
      document.getElementById("server-status").innerHTML = "Server Status: <span class='offline'>Offline</span>";
    });
}

function startShare() {
  ipcRenderer.send("start-share", {});
}

function stopShare() {
  ipcRenderer.send("stop-share", {});
}
