
document.getElementById("funnyMSG").innerHTML = "Ear training, but funnier!";

// Menu navigation system
let mainMenu = document.getElementById("mainMenu");
let multiPlayerMenu = document.getElementById("multiPlayerMenu");
let settingsMenu = document.getElementById("settingsMenu");
let practiceMenu = document.getElementById("practiceMenu");
let creditsMenu = document.getElementById("creditsMenu");
let singplePlayerKey = document.getElementById("SP_Key");
let multiPlayerKey = document.getElementById("MP_Key");
let settingsKey = document.getElementById("S_Key");
let practiceKey = document.getElementById("H2P_Key");
let creditsKey = document.getElementById("C_Key");

singplePlayerKey.addEventListener("click", () => {
  loadGamemodeSelector();
  localStorage.setItem("multiplayerFlag", false);
});

multiPlayerKey.addEventListener("click", () => {
  mainMenu.style.display = "none";
  multiPlayerMenu.style.display = "block";
  settingsMenu.style.display = "none";
  practiceMenu.style.display = "none";
  creditsMenu.style.display = "none";
  localStorage.setItem("multiplayerFlag", true);
  localStorage.setItem("Practice", false);
});

settingsKey.addEventListener("click", () => {
  mainMenu.style.display = "none";
  multiPlayerMenu.style.display = "none";
  settingsMenu.style.display = "block";
  practiceMenu.style.display = "none";
  creditsMenu.style.display = "none";
});

practiceKey.addEventListener("click", () => {
  mainMenu.style.display = "none";
  multiPlayerMenu.style.display = "none";
  settingsMenu.style.display = "none";
  practiceMenu.style.display = "block";
  creditsMenu.style.display = "none";
});

creditsKey.addEventListener("click", () => {
  mainMenu.style.display = "none";
  multiPlayerMenu.style.display = "none";
  settingsMenu.style.display = "none";
  practiceMenu.style.display = "none";
  creditsMenu.style.display = "block";
});

// Menu Volume Handler
let volumeSlider = document.getElementById("mainVolumeSlider");

volumeSlider.value = localStorage.getItem("mainVolume")
  ? localStorage.getItem("mainVolume")
  : 0.3;

volumeSlider.addEventListener("input", () => {
  localStorage.setItem("mainVolume", volumeSlider.value);
});


// Effects Volume Handler
let effectsVolSlider = document.getElementById("effectsVolumeSlider");

effectsVolSlider.value = localStorage.getItem("effectsVolume")
  ? localStorage.getItem("effectsVolume")
  : 0.5;

effectsVolSlider.addEventListener("input", () => {
  localStorage.setItem("effectsVolume", effectsVolSlider.value);
});

// inGame Volume Handler
let inGameVolumeSlider = document.getElementById("gameVolumeSlider");

inGameVolumeSlider.value = localStorage.getItem("gameVolume")
  ? localStorage.getItem("gameVolume")
  : 0.5;

inGameVolumeSlider.addEventListener("input", () => {
  localStorage.setItem("gameVolume", inGameVolumeSlider.value);
});

// Number of rounds selector
let numberOfRounds = document.getElementById("numberRounds");

numberOfRounds.value = localStorage.getItem("numberOfRounds")
  ? localStorage.getItem("numberOfRounds")
  : 3;

numberOfRounds.addEventListener("input", () => {
  localStorage.setItem("numberOfRounds", numberOfRounds.value);
});

// Game mode selector
let loadGamemodeSelector = function () {
  mainMenu.style.display = "none";
  gamemodeSelectorMenu.style.display = "block";
};

let gamemodeSelectorMenu = document.getElementById("gamemodeSelectorMenu");

let chordsGamemodeButton = document.getElementById("chords_GM");
let harmonyGamemodeButton = document.getElementById("harmony_GM");
let groovesGamemodeButton = document.getElementById("grooves_GM");
let fillsGamemodeButton = document.getElementById("fills_GM");

let gamemodeButtons = [
  chordsGamemodeButton,
  harmonyGamemodeButton,
  groovesGamemodeButton,
  fillsGamemodeButton,
];


// Difficulty Selector
let difficultySelectorMenu = document.getElementById("difficultySelectorMenu");
gamemodeButtons.forEach((item) => {
  item.addEventListener("click", () => {
    localStorage.setItem("Gamemode", item.id);
    loadDifficultySelectorMenu();
  });
});

let loadDifficultySelectorMenu = function () {
  gamemodeSelectorMenu.style.display = "none";
  difficultySelectorMenu.style.display = "block";
};

let easyDiffButton = document.getElementById("easyDiff");
let mediumDiffButton = document.getElementById("mediumDiff");
let hardDiffButton = document.getElementById("hardDiff");

let difficultyButtons = [easyDiffButton, mediumDiffButton, hardDiffButton];

difficultyButtons.forEach((item) => {
  item.addEventListener("click", () => {
    localStorage.setItem("Difficulty", item.id);
    localStorage.setItem("Practice", false);
    loadGamePage();
  });
});

// Minigames initialization and loading

let minigamePages = {
  chords_GM: "./Templates/KeyBoard/keyBoardInput.html",
  harmony_GM: "./Templates/KeyBoard/keyBoardInput.html",
  grooves_GM: "./Templates/DrumMachine/drumMachineInput.html",
  fills_GM: "./Templates/DrumMachine/drumMachineInput.html",
};

loadGamePage = function () {
  window.location.href = minigamePages[localStorage.getItem("Gamemode")];
};

// Practice mode 
let PracticeDmButton = document.getElementById("PracticeDM");
let PracticeKbButton = document.getElementById("PracticeKB");

let PracticeButtons = [PracticeDmButton, PracticeKbButton];

let practicePages = [
  "./Templates/DrumMachine/drumMachineInput.html",
  "./Templates/KeyBoard/keyBoardInput.html",
];

PracticeButtons.forEach((item, index) => {
  item.addEventListener("click", () => {
    localStorage.setItem("Practice", true);
    window.location.href = practicePages[index];
  });
});

// Back to menu buttons

let backButtonGMS = document.getElementById("backGMS");

backButtonGMS.addEventListener("click", () => {
  mainMenu.style.display = "block";
  multiPlayerMenu.style.display = "none";
  settingsMenu.style.display = "none";
  practiceMenu.style.display = "none";
  creditsMenu.style.display = "none";
  gamemodeSelectorMenu.style.display = "none";
});

let backButtonS = document.getElementById("backS");

backButtonS.addEventListener("click", () => {
  mainMenu.style.display = "block";
  multiPlayerMenu.style.display = "none";
  settingsMenu.style.display = "none";
  practiceMenu.style.display = "none";
  creditsMenu.style.display = "none";
  gamemodeSelectorMenu.style.display = "none";
});

let backButton2GM = document.getElementById("back2GM");

backButton2GM.addEventListener("click", () => {
  mainMenu.style.display = "none";
  multiPlayerMenu.style.display = "none";
  settingsMenu.style.display = "none";
  practiceMenu.style.display = "none";
  creditsMenu.style.display = "none";
  gamemodeSelectorMenu.style.display = "block";
  difficultySelectorMenu.style.display = "none";
});

let backButtonMP = document.getElementById("backMP");

backButtonMP.addEventListener("click", () => {
  mainMenu.style.display = "block";
  multiPlayerMenu.style.display = "none";
  settingsMenu.style.display = "none";
  practiceMenu.style.display = "none";
  creditsMenu.style.display = "none";
  gamemodeSelectorMenu.style.display = "none";
});

let backButtonP = document.getElementById("backP");

backButtonP.addEventListener("click", () => {
  mainMenu.style.display = "block";
  multiPlayerMenu.style.display = "none";
  settingsMenu.style.display = "none";
  practiceMenu.style.display = "none";
  creditsMenu.style.display = "none";
  gamemodeSelectorMenu.style.display = "none";
});

let backButtonC = document.getElementById("backC");

backButtonC.addEventListener("click", () => {
  mainMenu.style.display = "block";
  multiPlayerMenu.style.display = "none";
  settingsMenu.style.display = "none";
  creditsMenu.style.display = "none";
  practiceMenu.style.display = "none";
  gamemodeSelectorMenu.style.display = "none";
});

// AUDIO MENU

// Audio files list
const audioFiles = [
  "../Project/Sounds/Music Background/Weird fishes sonicpi.mp3",
  "../Project/Sounds/Music Background/Pjano tonejs.mp3",
];

// Get a random audio file and use it as source
const randomIndex = Math.floor(Math.random() * audioFiles.length);
const selectedAudio = audioFiles[randomIndex];
const audio = document.getElementById("background-music");
audio.src = selectedAudio;

audio.volume = parseFloat(volumeSlider.value);

volumeSlider.addEventListener("input", () => {
  audio.volume = parseFloat(volumeSlider.value);
});

// Fallback if autoplay doesn't work
audio.addEventListener("error", () => {
  console.log("Autoplay blocked. Required user interaction.");
  document.body.addEventListener(
    "click",
    () => {
      audio.play();
    },
    { once: true }
  );
});
