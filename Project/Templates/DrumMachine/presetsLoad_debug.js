let easyGroovesPanel = document.getElementById("presetsEasy");
let mediumGroovesPanel = document.getElementById("presetsMedium");
let hardGroovesPanel = document.getElementById("presetsHard");

let grooves = [easyGrooves, mediumGrooves, hardGrooves];
let groovePanels = [easyGroovesPanel, mediumGroovesPanel, hardGroovesPanel];
let groovesTypes = ["Easy", "Medium", "Hard"];

for (let i = 0; i < grooves.length; i++) {
  grooves[i].forEach((item, index) => {
    let newGroove = document.createElement("div");
    newGroove.classList.add("groove");
    newGroove.innerHTML = groovesTypes[i] + " preset N°" + (index + 1);

    newGroove.addEventListener("click", () => {
      solution = item;
    });

    groovePanels[i].appendChild(newGroove);
  });
}

let easyFillsPanel = document.getElementById("presetsEasy");
let mediumFillsPanel = document.getElementById("presetsMedium");
let hardFillsPanel = document.getElementById("presetsHard");

let fills = [easyFills, mediumFills, hardFills];
let fillsPanels = [easyGroovesPanel, mediumGroovesPanel, hardGroovesPanel];
let fillsTypes = ["Easy", "Medium", "Hard"];

for (let i = 0; i < fills.length; i++) {
  fills[i].forEach((item, index) => {
    let newFill = document.createElement("div");
    newFill.classList.add("groove");
    newFill.innerHTML = fillsTypes[i] + " preset N°" + (index + 1);

    newFill.addEventListener("click", () => {
      solution = item;
    });

    groovePanels[i].appendChild(newFill);
  });
}
