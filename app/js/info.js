const { ipcRenderer } = require("electron");

ipcRenderer.on("ol-delivery", (e, ol) => {
  console.log(ol);
  const olist = document.createElement("ol");
  olist.classList.add("collection");
  for (let i = 0; i < ol.length; i++) {
    const listTxt = document.createTextNode(ol[i]);
    const li = document.createElement("li");
    li.classList.add("collection-item");
    li.appendChild(listTxt);
    olist.appendChild(li);
  }
  document.querySelector("body").appendChild(olist);
});
