const ipcRenderer = require('electron').ipcRenderer;

let sharing = false; // Track the sharing status

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
        document.getElementById("server-status").innerHTML = "Server Status: Online";
      } else {
        document.getElementById("server-status").innerHTML = "Server Status: Offline";
      }
    })
    .catch(error => {
      document.getElementById("server-status").innerHTML = "Server Status: Offline";
    });
}

function startShare() {
  if (!sharing) {
    ipcRenderer.send("start-share", {});
    sharing = true;
    document.getElementById("start").style.display = "none";
    document.getElementById("stop").style.display = "block";
  }
}

function stopShare() {
  if (sharing) {
    ipcRenderer.send("stop-share", {});
    sharing = false;
    document.getElementById("stop").style.display = "none";
    document.getElementById("start").style.display = "block";
  }
}
