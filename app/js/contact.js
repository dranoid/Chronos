const { clipboard, shell } = require("electron");

const github = document.getElementById("github");
const gmail = document.getElementById("gmail");
const linkedin = document.getElementById("linkedin");

github.addEventListener("click", (e) => {
  shell.openExternal("https://github.com/dranoid");
});
gmail.addEventListener("click", (e) => {
  //copy to clipboard
  clipboard.writeText("daramoladunsin6@gmail.com");
  M.toast({ html: "Copied to clipboard", classes: "toast-color" });
});
linkedin.addEventListener("click", (e) => {
  shell.openExternal("https://www.linkedin.com/in/oluwadunsin-daramola/");
});
// for on click, to open in default window
// e.preventDefault()
// shell.openExternal(url)
