// nodeIntegration is deprecated and unsafe, learn to use preload and contextIsolation
const { ipcRenderer } = require("electron");
const moment = require("moment");
const mousetrap = require("mousetrap");

const body = document.querySelector("body");
const blurrable = document.querySelector(".blurrable");
let saved = true;

document.addEventListener("DOMContentLoaded", function () {
  var elems = document.querySelectorAll("select");
  var instances = M.FormSelect.init(elems);
});

document.addEventListener("mousemove", (e) => {
  // the further info class is to remove the line that comes when the list is empty
  if (topLeft.children.length == 0) {
    topLeft.classList.add("further-info");
  }
  if (topRight.children.length == 0) {
    topRight.classList.add("further-info");
  }
  if (botLeft.children.length == 0) {
    botLeft.classList.add("further-info");
  }
  if (botRight.children.length == 0) {
    botRight.classList.add("further-info");
  }
});

const btnAdd = document.getElementById("btn-add");
const prioLevel = document.getElementById("priority");
btnAdd.addEventListener("click", (e) => {
  // e.preventDefault();
  let date = moment().format("DD-MMM-YYYY HH:mm:SS");
  const taskDesc = document.getElementById("task-desc");
  const task = document.getElementById("task");
  const taskObj = {
    priority: prioLevel.value,
    taskDesc: taskDesc.value,
    task: task.value,
    date: date,
  };

  // Validating the form
  if (taskObj.task == "") {
    document.querySelector(".sub-instruction").innerHTML =
      "Fill in the required input";
    document.querySelector(".sub-instruction").classList.add("caution");
    return;
  } else if (taskObj.priority == 0) {
    document.querySelector(".sub-instruction").innerHTML =
      "Select a priority for your task";
    document.querySelector(".sub-instruction").classList.add("caution");
    prioLevel.selectedIndex = null; // Test
    return;
  }

  console.log(taskObj);
  addToQuadrant(taskObj);

  // Reverting the validation effects
  document.querySelector(".sub-instruction").innerHTML =
    "Describe and add your tasks to their appropriate place in the quadrant";
  document.querySelector(".sub-instruction").classList.remove("caution");
  ipcRenderer.send("add-tasks", taskObj);

  // Reseting the values. The select is not, call it a feature (one that allows you to focus on putting the task rather than selecting all at once)

  task.focus();
  task.value = "";
  taskDesc.value = "";

  saved = false;
});

// List of the ols of the Quadrant
const topLeft = document.querySelector(".IUList");
const topRight = document.querySelector(".NIUList");
const botLeft = document.querySelector(".INUList");
const botRight = document.querySelector(".NINUList");

// list of options of the priority select
const optTl = document.getElementById("optTl");
const optTr = document.getElementById("optTr");
const optBl = document.getElementById("optBl");
const optBr = document.getElementById("optBr");

// Called in the btnAdd eventListener
function addToQuadrant(taskObj) {
  const newLi = document.createElement("li");
  const taskTxt = document.createTextNode(taskObj.task);
  const descTxt = document.createTextNode(taskObj.taskDesc);
  const date = document.createTextNode(taskObj.date);

  if (taskObj.priority == "IU") {
    createLiNode(topLeft, newLi, taskTxt, descTxt, date);
    if (topLeft.classList.contains("further-info")) {
      topLeft.classList.remove("further-info");
    }
  } else if (taskObj.priority == "NIU") {
    createLiNode(topRight, newLi, taskTxt, descTxt, date);
    if (topRight.classList.contains("further-info")) {
      topRight.classList.remove("further-info");
    }
  } else if (taskObj.priority == "INU") {
    createLiNode(botLeft, newLi, taskTxt, descTxt, date);
    if (botLeft.classList.contains("further-info")) {
      botLeft.classList.remove("further-info");
    }
  } else if (taskObj.priority == "NINU") {
    createLiNode(botRight, newLi, taskTxt, descTxt, date);
    if (botRight.classList.contains("further-info")) {
      botRight.classList.remove("further-info");
    }
  }
}

// to display further info in a div
const extendInfo = document.querySelector(".extend-info");

topLeft.addEventListener("click", (e) => {
  e.stopPropagation(); // Stop propagation to prevent the 'toggle' event in the body from firing, something that has to do with bubbling
  const headerClass = ".top-left h5";
  const olClass = "top-left-id";
  createExtendInfo(extendInfo, topLeft, headerClass, olClass);
});
topRight.addEventListener("click", (e) => {
  e.stopPropagation();
  const headerClass = ".top-right h5";
  const olClass = "top-right-id";
  createExtendInfo(extendInfo, topRight, headerClass, olClass);
});
botLeft.addEventListener("click", (e) => {
  e.stopPropagation();
  const headerClass = ".bottom-left h5";
  const olClass = "bottom-left-id";
  createExtendInfo(extendInfo, botLeft, headerClass, olClass);
});
botRight.addEventListener("click", (e) => {
  e.stopPropagation();
  const headerClass = ".bottom-right h5";
  const olClass = "bottom-right-id";
  createExtendInfo(extendInfo, botRight, headerClass, olClass);
});

extendInfo.addEventListener("click", (e) => {
  e.stopPropagation(); // Cos a click is read before a double click. To prevent bubling too
});

const completeTask = document.querySelector("ul.collection.shad");
extendInfo.addEventListener("dblclick", (e) => {
  e.stopPropagation();

  console.log(extendInfo.children[1]);

  // to make sure that task is an li
  let task = e.target;
  if (task.nodeName == "OL") {
    return;
  } else if (task.nodeName != "LI") {
    task = e.target.parentNode;
  }

  if (task.parentNode.classList.contains("top-left-id")) {
    pushToComplete(task, topLeft);
  } else if (task.parentNode.classList.contains("top-right-id")) {
    pushToComplete(task, topRight);
  } else if (task.parentNode.classList.contains("bottom-left-id")) {
    pushToComplete(task, botLeft);
  } else if (task.parentNode.classList.contains("bottom-right-id")) {
    pushToComplete(task, botRight);
  }

  if (extendInfo.children[1].children.length == 0) {
    extendInfo.children[1].classList.add("further-info");
  }

  saved = false;
});

// Toggle the extend-info div off when any other place is clicked
body.addEventListener("click", (e) => {
  if (extendInfo.style.display != "none") {
    if (e.target != extendInfo) {
      blurrable.classList.remove("blur");
      // body.style.overflow = "visible";
      // body.style.height = "auto"; // For scroll too
      extendInfo.classList.add("further-info");
      extendInfo.innerHTML = "";
    }
  }
});

// to add a listener to the dynamially generated list (takes advantage of bubbling)
document.addEventListener("click", function (e) {
  if (e.target && e.target.classList.contains("badge")) {
    const liNode = e.target.parentNode;
    liNode.parentNode.removeChild(liNode);
    if (completeTask.children.length == 0) {
      completeTask.classList.add("further-info");
    }
    saved = false;
  }
});

// Shortcuts
mousetrap.bind("mod+w", (e, combo) => {
  const headerClass = ".top-left h5";
  const olClass = "top-left-id";
  createExtendInfo(extendInfo, topLeft, headerClass, olClass);
  return false;
});
mousetrap.bind("mod+e", (e, combo) => {
  const headerClass = ".top-right h5";
  const olClass = "top-right-id";
  createExtendInfo(extendInfo, topRight, headerClass, olClass);
  return false;
});
mousetrap.bind("mod+s", (e, combo) => {
  const headerClass = ".bottom-left h5";
  const olClass = "bottom-left-id";
  createExtendInfo(extendInfo, botLeft, headerClass, olClass);
  return false;
});
mousetrap.bind("mod+d", (e, combo) => {
  const headerClass = ".bottom-right h5";
  const olClass = "bottom-right-id";
  createExtendInfo(extendInfo, botRight, headerClass, olClass);
  return false;
});

// This section handles everything from the main process
ipcRenderer.on("extend-tl", (eve) => {
  const headerClass = ".top-left h5";
  const olClass = "top-left-id";
  createExtendInfo(extendInfo, topLeft, headerClass, olClass);
});
ipcRenderer.on("extend-tr", (eve) => {
  const headerClass = ".top-right h5";
  const olClass = "top-right-id";
  createExtendInfo(extendInfo, topRight, headerClass, olClass);
});
ipcRenderer.on("extend-bl", (eve) => {
  const headerClass = ".bottom-left h5";
  const olClass = "bottom-left-id";
  createExtendInfo(extendInfo, botLeft, headerClass, olClass);
});
ipcRenderer.on("extend-br", (eve) => {
  const headerClass = ".bottom-right h5";
  const olClass = "bottom-right-id";
  createExtendInfo(extendInfo, botRight, headerClass, olClass);
});

ipcRenderer.on("title-set", (e, data) => {
  console.log(data);
  const title = document.querySelector("title");
  title.innerHTML = data;
});

const tlHeader = document.querySelector(".top-left h5");
const trHeader = document.querySelector(".top-right h5");
const blHeader = document.querySelector(".bottom-left h5");
const brHeader = document.querySelector(".bottom-right h5");
const intervalT = document.querySelector(".sub-instruction.intervalT");

// get settings
ipcRenderer.on("settings-get", (e, settings) => {
  setSettings(settings);
});

// saving the quadrants
ipcRenderer.on("save-get-quadObj", (e) => {
  console.log("Save init");
  ipcRenderer.send("save-set-quadObj", saveQuadrant());
});

ipcRenderer.on("no-save", (e) => {
  console.log("set nosave");
  saved = false;
  console.log(saved);
});

// To check if the state of the app is saved before closing
ipcRenderer.on("saved-check", (e) => {
  console.log(saved, "this is saved");
  ipcRenderer.send("saved-status", saved);
});

ipcRenderer.on("load-set-quadObj", (e, quadObj) => {
  console.log("We go dey alright");
  loadQuadrants(JSON.parse(quadObj));
});

ipcRenderer.on("title-load-set", (e, data) => {
  const title = document.querySelector("title");
  title.innerHTML = data;
});

ipcRenderer.on("already-complete", (e, exitArr) => {
  for (let i = 0; i < exitArr.length; i++) {
    const liArr = Array.from(completeTask.children);
    for (let j = 0; j < liArr.length; j++) {
      const liChildArr = Array.from(liArr[j].children);

      for (let k = 0; k < liChildArr.length; k++) {
        if (
          liChildArr[k].classList.contains("time") &&
          liChildArr[k].innerText == exitArr[i].time
        ) {
          completeTask.removeChild(completeTask.children[j]);
          saved = false;
        }
      }
    }
  }
});

// Complete interval part
setInterval(function () {
  ipcRenderer.send("check-interval", getTask(completeTask));
}, 60000);

// Functions
function createLiNode(ol, newLi, taskTxt, descTxt, date) {
  newLi.appendChild(taskTxt);
  const taskDiv = document.createElement("div");
  taskDiv.appendChild(descTxt);
  taskDiv.classList.add("further-info");
  taskDiv.classList.add("desc-text");
  const dateSpan = document.createElement("span");
  dateSpan.appendChild(date);
  dateSpan.classList.add("further-info");
  dateSpan.classList.add("time");
  newLi.appendChild(taskDiv);
  newLi.appendChild(dateSpan);
  newLi.classList.add("collection-item");
  ol.appendChild(newLi);
}

function createExtendInfo(extendInfo, el, headerClass, olClass) {
  const header = document.createTextNode(
    document.querySelector(headerClass).innerHTML
  ); // Getting the header to be able to change the header from settings
  extendInfo.innerHTML = ""; // To reset the contents of the div on each
  const className = olClass; // The class that acts like an id

  const clone = el.cloneNode(true); // Aparently if you don't clone the element, the original one moves. (nodes are unique)
  // to burrow through and remove the further info class from the li's child elements
  const liArr = Array.from(clone.children);
  for (let i = 0; i < liArr.length; i++) {
    const elemArr = liArr[i].children;
    for (let j = 0; j < elemArr.length; j++) {
      elemArr[j].classList.remove("further-info");
    }
  }
  clone.classList.add(className);
  clone.classList.add("scrollable");
  const h5 = document.createElement("H5"); // The plan is to eventually be able to dynamically change the header
  h5.appendChild(header);
  extendInfo.appendChild(h5);
  extendInfo.appendChild(clone);
  extendInfo.style.position = "fixed"; // Fixed over absolute for the scroll thingy
  extendInfo.style.left = `${50}%`;
  extendInfo.style.transform = `translateX(${-50}%)`;
  extendInfo.style.top = "25%";
  extendInfo.classList.remove("further-info");
  blurrable.classList.add("blur");
  // body.style.overflow = "hidden"; // Just in case you want to make it unable to scroll
  // body.style.height = `${100}%`;
}

function pushToComplete(task, ol) {
  console.log(task.parentNode.classList);
  let date = moment().format("DD-MMM-YYYY HH:mm:SS");
  console.log(date);
  let liArr = Array.from(ol.children);

  // to remove the element in both extend-info and the quadrant
  for (let i = 0; i < liArr.length; i++) {
    if (liArr[i].innerHTML == task.innerHTML || areTheSame(liArr[i], task)) {
      console.log(liArr[i], "from Array");
      ol.removeChild(liArr[i]);
      task.parentNode.removeChild(task);
      // liArr.splice(i, 1);
    }
  }
  // display only task and time
  const liAdopt = document.adoptNode(task);
  const elArr = Array.from(task.children);
  for (let j = 0; j < elArr.length; j++) {
    if (!elArr[j].classList.contains("time")) {
      elArr[j].classList.add("further-info");
    } else if (elArr[j].classList.contains("time")) {
      elArr[j].innerHTML = date;
    }
  }
  const btnSpan = document.createElement("span");
  const x = document.createTextNode("X");
  btnSpan.appendChild(x);
  btnSpan.classList.add(
    "badge",
    "btn-cable-pink",
    "white-text",
    "waves-effect",
    "waves-light"
  );
  liAdopt.appendChild(btnSpan);
  completeTask.appendChild(liAdopt);
  completeTask.classList.remove("further-info");
}

// to compare the LIs to determine whether to delete or not
function areTheSame(origLi, liDesc) {
  const origClone = origLi.cloneNode(true);

  const elemArr = Array.from(origClone.children);
  for (let j = 0; j < elemArr.length; j++) {
    elemArr[j].classList.remove("further-info");
  }

  if (origClone.innerHTML == liDesc.innerHTML) {
    return true;
  } else {
    return false;
  }
}

function setSettings(settings) {
  tlHeader.innerHTML = settings.quadName.tl;
  trHeader.innerHTML = settings.quadName.tr;
  blHeader.innerHTML = settings.quadName.bl;
  brHeader.innerHTML = settings.quadName.br;

  optTl.innerHTML = settings.quadName.tl;
  optTr.innerHTML = settings.quadName.tr;
  optBl.innerHTML = settings.quadName.bl;
  optBr.innerHTML = settings.quadName.br;
  // to change anything in the select, you'd have to reinitialize it. makes me curious if that's why the changing the value/selected index doesnt work
  var elems = document.querySelectorAll("select");
  var instances = M.FormSelect.init(elems);

  console.log("Settings gotten");

  const intervalTime = settings.interval;
  if (intervalTime % 7 == 0) {
    if (intervalTime / 7 > 1) {
      intervalT.innerHTML = `These tasks are cleared on a specified interval. Currently every ${
        intervalTime / 7
      } weeks`;
    } else {
      intervalT.innerHTML = `These tasks are cleared on a specified interval. Currently every ${
        intervalTime / 7
      } week`;
    }
  } else {
    if (intervalTime > 1) {
      intervalT.innerHTML = `These tasks are cleared on a specified interval. Currently every ${intervalTime} days`;
    } else {
      intervalT.innerHTML = `These tasks are cleared on a specified interval. Currently every ${intervalTime} day`;
    }
  }
}

function getTask(listEl) {
  let taskObj = {
    task: "",
    description: "",
    time: "",
  };
  const taskArr = [];
  if (listEl.children.length > 0) {
    const elArr = Array.from(listEl.children);
    for (let i = 0; i < elArr.length; i++) {
      taskObj = {
        task: "",
        description: "",
        time: "",
      };
      if (elArr[i].children) {
        const childArr = Array.from(elArr[i].children);
        for (let j = 0; j < childArr.length; j++) {
          if (childArr[j].classList.contains("time")) {
            taskObj["time"] = childArr[j].innerText.trim();
          } else if (childArr[j].classList.contains("desc-text")) {
            taskObj["description"] = childArr[j].innerText.trim();
          }
        }
      }
      taskObj["task"] = elArr[i].childNodes[0].nodeValue.trim();
      taskArr.push(taskObj);
    }
  }
  console.log(taskArr);
  return taskArr;
}

function saveQuadrant() {
  const quadObj = {};
  // header is in settings

  quadObj["tl"] = getTask(topLeft);

  quadObj["tr"] = getTask(topRight);

  quadObj["bl"] = getTask(botLeft);

  quadObj["br"] = getTask(botRight);

  quadObj["complete"] = getTask(completeTask);

  saved = true;

  return quadObj;
}

function loadQuadrants(quadObj) {
  console.log(quadObj);
  const tlTaskArr = quadObj.tl;
  const trTaskArr = quadObj.tr;
  const blTaskArr = quadObj.bl;
  const brTaskArr = quadObj.br;
  const comTaskArr = quadObj.complete;
  setSettings(quadObj.settings);

  // const taskTxt = document.createTextNode(taskObj.task);
  // const descTxt = document.createTextNode(taskObj.taskDesc);
  // const date = document.createTextNode(taskObj.date);

  while (topLeft.firstChild) {
    topLeft.removeChild(topLeft.lastChild);
  }
  while (topRight.firstChild) {
    topRight.removeChild(topRight.lastChild);
  }
  while (botLeft.firstChild) {
    botLeft.removeChild(botLeft.lastChild);
  }
  while (botRight.firstChild) {
    botRight.removeChild(botRight.lastChild);
  }
  while (completeTask.firstChild) {
    completeTask.removeChild(completeTask.lastChild);
  }

  for (let i = 0; i < tlTaskArr.length; i++) {
    const newLi = document.createElement("li");
    const taskTxt = document.createTextNode(tlTaskArr[i].task);
    const descTxt = document.createTextNode(tlTaskArr[i].description);
    const date = document.createTextNode(tlTaskArr[i].time);
    createLiNode(topLeft, newLi, taskTxt, descTxt, date);
  }

  for (let i = 0; i < trTaskArr.length; i++) {
    const newLi = document.createElement("li");
    const taskTxt = document.createTextNode(trTaskArr[i].task);
    const descTxt = document.createTextNode(trTaskArr[i].description);
    const date = document.createTextNode(trTaskArr[i].time);
    createLiNode(topRight, newLi, taskTxt, descTxt, date);
  }

  for (let i = 0; i < blTaskArr.length; i++) {
    const newLi = document.createElement("li");
    const taskTxt = document.createTextNode(blTaskArr[i].task);
    const descTxt = document.createTextNode(blTaskArr[i].description);
    const date = document.createTextNode(blTaskArr[i].time);
    createLiNode(botLeft, newLi, taskTxt, descTxt, date);
  }

  for (let i = 0; i < brTaskArr.length; i++) {
    const newLi = document.createElement("li");
    const taskTxt = document.createTextNode(brTaskArr[i].task);
    const descTxt = document.createTextNode(brTaskArr[i].description);
    const date = document.createTextNode(brTaskArr[i].time);
    createLiNode(botRight, newLi, taskTxt, descTxt, date);
  }

  for (let i = 0; i < comTaskArr.length; i++) {
    const newLi = document.createElement("li");
    const taskTxt = document.createTextNode(comTaskArr[i].task);
    const descTxt = document.createTextNode(comTaskArr[i].description);
    const date = document.createTextNode(comTaskArr[i].time);
    loadComplete(completeTask, newLi, taskTxt, descTxt, date);
  }

  // createLiNode(topLeft, newLi, taskTxt, descTxt, date);
  if (topLeft.classList.contains("further-info")) {
    topLeft.classList.remove("further-info");
  }
  if (topRight.classList.contains("further-info")) {
    topRight.classList.remove("further-info");
  }
  if (botLeft.classList.contains("further-info")) {
    botLeft.classList.remove("further-info");
  }
  if (botRight.classList.contains("further-info")) {
    botRight.classList.remove("further-info");
  }

  saved = true;
}

function loadComplete(completeTask, newLi, taskTxt, descTxt, date) {
  newLi.appendChild(taskTxt);
  const taskDiv = document.createElement("div");
  taskDiv.appendChild(descTxt);
  taskDiv.classList.add("further-info");
  taskDiv.classList.add("desc-text");
  const dateSpan = document.createElement("span");
  dateSpan.appendChild(date);
  dateSpan.classList.add("further-info");
  dateSpan.classList.add("time");
  newLi.appendChild(taskDiv);
  newLi.appendChild(dateSpan);
  newLi.classList.add("collection-item");

  // display only task and time
  // const liAdopt = document.adoptNode(task);
  const elArr = Array.from(newLi.children);
  for (let j = 0; j < elArr.length; j++) {
    if (!elArr[j].classList.contains("time")) {
      elArr[j].classList.add("further-info");
    }
  }
  const btnSpan = document.createElement("span");
  const x = document.createTextNode("X");
  btnSpan.appendChild(x);
  btnSpan.classList.add(
    "badge",
    "btn-cable-pink",
    "white-text",
    "waves-effect",
    "waves-light"
  );
  newLi.appendChild(btnSpan);
  completeTask.appendChild(newLi);
  completeTask.classList.remove("further-info");
}

ipcRenderer.on("alert", (e) => {
  console.log("This works");
});
