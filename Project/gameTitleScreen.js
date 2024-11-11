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

// Sets main menu volume to either stored or default value
document.getElementById("mainMenuSoundtrack").volume = localStorage.getItem("mainVolume") ? localStorage.getItem("mainVolume") : 0.3;

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
languages = document.getElementsByClassName("flag");
musicNotations = document.getElementsByClassName("musicNotationSelector");

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
volumeSlider = document.getElementById("mainVolumeSlider");
volumeSlider.value = localStorage.getItem("mainVolume") ? localStorage.getItem("mainVolume") : 0.3;

volumeSlider.addEventListener("input", ()=>{
  localStorage.setItem("mainVolume", volumeSlider.value);
});

backButtonS = document.getElementById("backS");

backButtonS.addEventListener("click", () => {
  mainMenu.style.display = "block";
  settingsMenu.style.display = "none";
  tutorialMenu.style.display = "none";
});
