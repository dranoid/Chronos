const { ipcRenderer } = require("electron");

const contactDev = document.getElementById("contact");

contactDev.addEventListener("click", (e) => {
  ipcRenderer.send("open-contact");
});
