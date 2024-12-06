// Funny msg print handler
funnyMSGS = [
  "Da Cremona tutto bene?",
  "Good Morning Sir!",
  "Frare Jacques Simulator",
  'it goes: "WOWOWOWOWOWO"',
  "Weird Fishes/Arpeggi",
  "Biliardino??",
  "MADONNA RAGAZZI LEZZO",
];

randomN = Math.floor(Math.random() * 7);

document.getElementById("funnyMSG").innerHTML = funnyMSGS[randomN];

// Sets main menu volume to either stored or default value
document.getElementById("mainMenuSoundtrack").volume = localStorage.getItem("mainVolume") ? localStorage.getItem("mainVolume") : 0.3;

// Menu navigation system
let mainMenu = document.getElementById("mainMenu");
let settingsMenu = document.getElementById("settingsMenu");
let practiceMenu = document.getElementById("practiceMenu");

let singplePlayerKey = document.getElementById("SP_Key");
let settingsKey = document.getElementById("S_Key");
let practiceKey = document.getElementById("H2P_Key");

singplePlayerKey.addEventListener("click", () => {
  loadGamemodeSelector()
})

settingsKey.addEventListener("click", () => {
  mainMenu.style.display = "none";
  settingsMenu.style.display = "block";
  practiceMenu.style.display = "none";
});

practiceKey.addEventListener("click", () => {
  mainMenu.style.display = "none";
  settingsMenu.style.display = "none";
  practiceMenu.style.display = "block";
});

// Settings Menu
let languages = document.getElementsByClassName("flag");
let musicNotations = document.getElementsByClassName("musicNotationSelector");

Array.from(languages).forEach((element, index) => {
  element.addEventListener("click", () =>{
    Array.from(languages).forEach(elementToDeactivate => {
      elementToDeactivate.classList.toggle("activeSettingsItem", false)
    })
    element.classList.toggle("activeSettingsItem", true);
    localStorage.setItem("language", index);
  })
})

Array.from(musicNotations).forEach((element, index) => {
  element.addEventListener("click", () =>{
    Array.from(musicNotations).forEach(elementToDeactivate => {
      elementToDeactivate.classList.toggle("activeSettingsItem", false)
    })
    element.classList.toggle("activeSettingsItem", true);
    localStorage.setItem("musicNotation", index);
  })
})


localStorage.getItem("language") ?
  languages[localStorage.getItem("language")].classList.toggle("activeSettingsItem", true)
  :
  languages[0].classList.toggle("activeSettingsItem", true);

localStorage.getItem("musicNotation") ?
  musicNotations[localStorage.getItem("musicNotation")].classList.toggle("activeSettingsItem", true)
  :
  musicNotations[0].classList.toggle("activeSettingsItem", true);

// Volume Handler
let volumeSlider = document.getElementById("mainVolumeSlider");
volumeSlider.value = localStorage.getItem("mainVolume") ? localStorage.getItem("mainVolume") : 0.3;

volumeSlider.addEventListener("input", ()=>{
  localStorage.setItem("mainVolume", volumeSlider.value);
});




let gamemodeSelectorMenu = document.getElementById("gamemodeSelectorMenu")

let backButtonS = document.getElementById("backS");
let backButtonGMS = document.getElementById("backGMS");

backButtonGMS.addEventListener("click", () => {
  mainMenu.style.display = "block";
  settingsMenu.style.display = "none";
  practiceMenu.style.display = "none";
  gamemodeSelectorMenu.style.display = "none";
});
let loadGamemodeSelector = function () {
  mainMenu.style.display = "none"
  gamemodeSelectorMenu.style.display = "block"
}

backButtonS.addEventListener("click", () => {
  mainMenu.style.display = "block";
  settingsMenu.style.display = "none";
  practiceMenu.style.display = "none";
  gamemodeSelectorMenu.style.display = "none";
});

let chordsGamemodeButton = document.getElementById("chords_GM")
let chords2GamemodeButton = document.getElementById("chords2_GM")
let groovesGamemodeButton = document.getElementById("grooves_GM")
let fillsGamemodeButton = document.getElementById("fills_GM")

let gamemodeButtons = [chordsGamemodeButton, chords2GamemodeButton, groovesGamemodeButton, fillsGamemodeButton]

let difficultySelectorMenu = document.getElementById("difficultySelectorMenu")
gamemodeButtons.forEach((item) => {
  item.addEventListener("click", () =>{
    localStorage.setItem("Gamemode", item.id)
    loadDifficultySelectorMenu()
  })
})

let backButton2GM = document.getElementById("back2GM")

backButton2GM.addEventListener("click", () => {
  mainMenu.style.display = "none";
  settingsMenu.style.display = "none";
  practiceMenu.style.display = "none";
  gamemodeSelectorMenu.style.display = "block";
  difficultySelectorMenu.style.display = "none";
});


let loadDifficultySelectorMenu = function () {
  gamemodeSelectorMenu.style.display = "none";
  difficultySelectorMenu.style.display = "block"
}



let easyDiffButton = document.getElementById("easyDiff")
let mediumDiffButton = document.getElementById("mediumDiff")
let hardDiffButton = document.getElementById("hardDiff")

let difficultyButtons = [easyDiffButton, mediumDiffButton, hardDiffButton]

difficultyButtons.forEach((item) => {
  item.addEventListener("click", () =>{
    localStorage.setItem("Difficulty", item.id)
    localStorage.setItem("Practice", false)
    loadGamePage()
  })
})

let minigamePages = {
  "chords_GM": "./Templates/KeyBoard/keyboard.html",
  "chords2_GM": "./Templates/KeyBoard/keyboard.html",
  "grooves_GM": "./Templates/DrumMachine/drumMachineInput.html",
  "fills_GM": "./Templates/DrumMachine/drumMachineInput.html",
}

loadGamePage = function () {
  window.location.href = minigamePages[localStorage.getItem("Gamemode")];
}

let PracticeDmButton = document.getElementById("PracticeDM")
let PracticeKbButton = document.getElementById("PracticeKB")

let PracticeButtons = [PracticeDmButton, PracticeKbButton]

let practicePages = [
  "./Templates/DrumMachine/drumMachineInput.html",
  "./Templates/KeyBoard/keyboard.html",
]

PracticeButtons.forEach((item, index) => {
  item.addEventListener("click", () =>{
    localStorage.setItem("Practice", true)
    window.location.href = practicePages[index];
  })
})

let backButtonP = document.getElementById("backP");

backButtonP.addEventListener("click", () => {
  mainMenu.style.display = "block";
  settingsMenu.style.display = "none";
  practiceMenu.style.display = "none";
  gamemodeSelectorMenu.style.display = "none";
});