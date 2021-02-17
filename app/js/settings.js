const { ipcRenderer } = require("electron");

// Initialize materialize elements
document.addEventListener("DOMContentLoaded", function () {
  var elems = document.querySelectorAll("select");
  var instances = M.FormSelect.init(elems);
});

// ipcRenderer.on("settings-get", (e, settings) => {
// // this would have worked but the UI is messing up
// tlChange.value = settings.quadName.tl;
// trChange.value = settings.quadName.tr;
// blChange.value = settings.quadName.bl;
// brChange.value = settings.quadName.br;
// });

const btnChange = document.getElementById("btn-change");
const tlChange = document.getElementById("tl-Change");
const trChange = document.getElementById("tr-Change");
const blChange = document.getElementById("bl-Change");
const brChange = document.getElementById("br-Change");
btnChange.addEventListener("click", (e) => {
  const newQuadName = {
    tl: tlChange.value,
    tr: trChange.value,
    bl: blChange.value,
    br: brChange.value,
  };

  // console.log(tlChange)

  // Validating the form
  if (
    newQuadName.tl == "" ||
    newQuadName.tr == "" ||
    newQuadName.bl == "" ||
    newQuadName.br == ""
  ) {
    document.querySelector(".sub-instruction.change").innerHTML =
      "Fill in the required input";
    document.querySelector(".sub-instruction.change").classList.add("caution");
    return;
  }

  console.log(newQuadName);

  // Reverting the validation effects
  document.querySelector(".sub-instruction.change").innerHTML =
    "Change the name of the quadrants";
  document.querySelector(".sub-instruction.change").classList.remove("caution");

  ipcRenderer.send("settings-quadName", newQuadName);

  tlChange.focus();
});

const btnInterval = document.getElementById("btn-interval");
const interval = document.getElementById("interval");
const dayWk = document.getElementById("dayWk");
btnInterval.addEventListener("click", (e) => {
  const intervalObj = {
    interval: interval.value,
    dayWk: dayWk.value,
  };

  if (intervalObj.interval == "") {
    document.querySelector(".sub-instruction.interval").innerHTML =
      "Fill in the required input";
    document
      .querySelector(".sub-instruction.interval")
      .classList.add("caution");
    return;
  } else if (intervalObj.dayWk == 0) {
    document.querySelector(".sub-instruction.interval").innerHTML =
      "Select an interval type";
    document
      .querySelector(".sub-instruction.interval")
      .classList.add("caution");
    // dayWk.selectedIndex=0;
    return;
  }

  // Reverting the validation effects
  document.querySelector(".sub-instruction.change").innerHTML =
    "Choose how often you want to clear the complete list";
  document.querySelector(".sub-instruction.change").classList.remove("caution");

  ipcRenderer.send("settings-interval", intervalObj);

  // Reseting the form
  interval.value = "";
  dayWk.selectedIndex = 0;
  interval.focus();
});

// const reloadCheck = document.getElementById("restart");
// reloadCheck.addEventListener("change", (e) => {
//   ipcRenderer.send("settings-reload", reloadCheck.checked);
// });

// cos of materialize, this is the validation
tlChange.addEventListener("click", (e) => {
  if (tlChange.value == "") {
    ipcRenderer.send("settings-send");
    ipcRenderer.on("settings-get-change", (e, settings) => {
      tlChange.value = settings.quadName.tl;
    });
  }
});
trChange.addEventListener("click", (e) => {
  if (trChange.value == "") {
    ipcRenderer.send("settings-send");
    ipcRenderer.on("settings-get-change", (e, settings) => {
      trChange.value = settings.quadName.tr;
    });
  }
});
blChange.addEventListener("click", (e) => {
  if (blChange.value == "") {
    ipcRenderer.send("settings-send");
    ipcRenderer.on("settings-get-change", (e, settings) => {
      blChange.value = settings.quadName.bl;
    });
  }
});

interval.addEventListener("click", (e) => {
  if (interval.value == "" && dayWk.value == 0) {
    ipcRenderer.send("settings-send");
    ipcRenderer.on("settings-get-change", (e, settings) => {
      const intervalTime = settings.interval;
      if (intervalTime % 7 == 0) {
        if (intervalTime / 7 > 1) {
          interval.value = intervalTime / 7;
          dayWk.value = "week";
          dayWk.selectedIndex = 2;
          dayWk.click();
          dayWk.focus();
        } else {
          interval.value = intervalTime / 7;
          dayWk.value = "week";
          dayWk.selectedIndex = 2;
          dayWk.click();
          dayWk.focus();
        }
      } else {
        if (intervalTime > 1) {
          interval.value = intervalTime;
          dayWk.value = "day";
          dayWk.selectedIndex = 1;
          dayWk.click();
          dayWk.focus();
        } else {
          interval.value = intervalTime;
          dayWk.value = "day";
          dayWk.selectedIndex = 1;
          dayWk.click();
          dayWk.focus();
        }
      }
    });
  }
});
