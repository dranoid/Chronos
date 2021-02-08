const { ipcRenderer } = require("electron");
const moment = require("moment");

const body = document.querySelector("body");
const blurrable = document.querySelector(".blurrable");

document.addEventListener("DOMContentLoaded", function () {
  var elems = document.querySelectorAll("select");
  var instances = M.FormSelect.init(elems);
});

const btnAdd = document.getElementById("btn-add");
btnAdd.addEventListener("click", (e) => {
  e.preventDefault;
  let date = moment().format("DD-MMM-YYYY HH:mm:SS");
  const taskDesc = document.getElementById("task-desc");
  const prioLevel = document.getElementById("priority");
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
    return;
  }

  console.log(taskObj);
  addToQuadrant(taskObj);

  // Reverting the validation effects
  document.querySelector(".sub-instruction").innerHTML =
    "Describe and add your tasks to their appropriate place in the quadrant";
  document.querySelector(".sub-instruction").classList.remove("caution");
  ipcRenderer.send("add-tasks", taskObj);

  // Reseting the values
  prioLevel.value = 0;
  task.value = "";
  taskDesc.value = "";
});

// List of the ols
const topLeft = document.querySelector(".IUList");
const topRight = document.querySelector(".NIUList");
const botLeft = document.querySelector(".INUList");
const botRight = document.querySelector(".NINUList");

function addToQuadrant(taskObj) {
  const newLi = document.createElement("li");
  const taskTxt = document.createTextNode(taskObj.task);
  const descTxt = document.createTextNode(taskObj.taskDesc);
  const date = document.createTextNode(taskObj.date);

  if (taskObj.priority == "IU") {
    createLiNode(topLeft, newLi, taskTxt, descTxt, date);
  } else if (taskObj.priority == "NIU") {
    createLiNode(topRight, newLi, taskTxt, descTxt, date);
  } else if (taskObj.priority == "INU") {
    createLiNode(botLeft, newLi, taskTxt, descTxt, date);
  } else if (taskObj.priority == "NINU") {
    createLiNode(botRight, newLi, taskTxt, descTxt, date);
  }
}

//  Creating a new window to handle the further info
// topLeft.addEventListener("click", (e) => {
//   const children = Array.from(topLeft.children);
//   createFurtherInfo(children);
// });
// topRight.addEventListener("click", (e) => {
//   const children = Array.from(topRight.children);
//   createFurtherInfo(children);
// });
// botLeft.addEventListener("click", (e) => {
//   const children = Array.from(botLeft.children);
//   createFurtherInfo(children);
// });
// botRight.addEventListener("click", (e) => {
//   const children = Array.from(botRight.children);
//   createFurtherInfo(children);
// });

// to display further info in a div
const extendInfo = document.querySelector(".extend-info");
topLeft.addEventListener("click", (e) => {
  e.stopPropagation();
  const header = document.createTextNode(
    document.querySelector(".top-left h5").innerHTML
  );
  extendInfo.innerHTML = ""; // To reset the contents of the div on each click
  const className = "top-left-id";
  createExtendInfo(extendInfo, topLeft, header, className);
});
topRight.addEventListener("click", (e) => {
  e.stopPropagation();
  const header = document.createTextNode(
    document.querySelector(".top-right h5").innerHTML
  );
  extendInfo.innerHTML = ""; // To reset the contents of the div on each
  const className = "top-right-id";
  createExtendInfo(extendInfo, topRight, header, className);
});
botLeft.addEventListener("click", (e) => {
  e.stopPropagation();
  const header = document.createTextNode(
    document.querySelector(".bottom-left h5").innerHTML
  );
  extendInfo.innerHTML = ""; // To reset the contents of the div on each click
  const className = "bottom-left-id";
  createExtendInfo(extendInfo, botLeft, header, className);
});
botRight.addEventListener("click", (e) => {
  e.stopPropagation();
  const header = document.createTextNode(
    document.querySelector(".bottom-right h5").innerHTML
  );
  extendInfo.innerHTML = ""; // To reset the contents of the div on each click
  const className = "bottom-right-id";
  createExtendInfo(extendInfo, botRight, header, className);
});

extendInfo.addEventListener("click", (e) => {
  e.stopPropagation();
});

const completeTask = document.querySelector("ul.collection.shad");
extendInfo.addEventListener("dblclick", (e) => {
  e.stopPropagation();
  // console.log(e.target, "target");
  // console.log(e.currentTarget, "current target");
  let task = e.target;
  if (task.nodeName == "OL") {
    return;
  } else if (task.nodeName != "LI") {
    task = e.target.parentNode;
  }

  // task.parentNode.removeChild(task);
  // console.log(task.parentNode);

  if (task.parentNode.classList.contains("top-left-id")) {
    pushToComplete(task, topLeft);
  } else if (task.parentNode.classList.contains("top-right-id")) {
    pushToComplete(task, topRight);
  } else if (task.parentNode.classList.contains("bottom-left-id")) {
    pushToComplete(task, botLeft);
  } else if (task.parentNode.classList.contains("bottom-right-id")) {
    pushToComplete(task, botRight);
  }

  console.log(completeTask);
});

// Toggle the extend-info div off
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

// to add a listener to the dynamially generated list
document.addEventListener("click", function (e) {
  if (e.target && e.target.classList.contains("badge")) {
    const liNode = e.target.parentNode;
    liNode.parentNode.removeChild(liNode);
  }
});

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

function createExtendInfo(extendInfo, el, header, className) {
  const clone = el.cloneNode(true);
  const liArr = Array.from(clone.children);
  for (let i = 0; i < liArr.length; i++) {
    const elemArr = liArr[i].children;
    for (let j = 0; j < elemArr.length; j++) {
      elemArr[j].classList.remove("further-info");
    }
  }
  clone.classList.add(className);
  const h5 = document.createElement("H5");
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
  let liArr = Array.from(ol.children);

  // to delete in both extend-info and the quadrant
  for (let i = 0; i < liArr.length; i++) {
    if (liArr[i].innerHTML == task.innerHTML || areTheSame(liArr[i], task)) {
      console.log(liArr[i], "from Array");
      ol.removeChild(liArr[i]);
      task.parentNode.removeChild(task);
      // liArr.splice(i, 1);
    }
  }
  const liAdopt = document.adoptNode(task);
  const elArr = Array.from(task.children);
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
  liAdopt.appendChild(btnSpan);
  completeTask.appendChild(liAdopt);
}

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
