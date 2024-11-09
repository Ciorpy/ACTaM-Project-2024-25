// Funny msg print handler
funnyMSGS = [
  "Da Cremona tutto bene?",
  "Good Morning Sir!",
  "Frare Jaques Simulator",
  'it goes: "WOWOWOWOWOWO"',
  "Weird Fishes/Arpeggi",
  "Biliardino??",
  "Ping Pong??",
];

randomN = Math.floor(Math.random() * 7);

document.getElementById("funnyMSG").innerHTML = funnyMSGS[randomN];

// Sets main menu volume to an acceptable level
document.getElementById("mainMenuSoundtrack").volume = 0.3;

// Menu navigation system
mainMenu = document.getElementById("mainMenu");
settingsMenu = document.getElementById("settingsMenu");
tutorialMenu = document.getElementById("tutorialMenu");

settingsKey = document.getElementById("S_Key");
tutorialKey = document.getElementById("H2P_Key");

settingsKey.addEventListener("click", () => {
  mainMenu.style.display = "none";
  settingsMenu.style.display = "block";
  tutorialMenu.style.display = "none";
});

tutorialKey.addEventListener("click", () => {
  mainMenu.style.display = "none";
  settingsMenu.style.display = "none";
  tutorialMenu.style.display = "block";
});

// Settings Menu
backButtonS = document.getElementById("backS");

backButtonS.addEventListener("click", () => {
  mainMenu.style.display = "block";
  settingsMenu.style.display = "none";
  tutorialMenu.style.display = "none";
});
