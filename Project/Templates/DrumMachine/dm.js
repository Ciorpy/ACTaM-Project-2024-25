// VARIABLES ------------------------------------------------------------------------------------------------------------------------------------------

// Volume
let defaultVolume = 0.5; // Default value for volume
let loadedVolume = parseFloat(localStorage.getItem("gameVolume")); // Try to loads the stored value from the local storage
let vol = !isNaN(loadedVolume) ? loadedVolume : defaultVolume; // If the loaded volume exists then assigns it to the volume variable, otherwise use default

// Drum machine dims
let semicrome = 16; // Number of semicromes to fill
let drumSamples = 10; // Number of drum samples that are showed to the user

// Logic control data structure for storing user inputs
let drumMachineController = Array.from({ length: drumSamples }, () =>
  Array(semicrome).fill(false)
);

// Audio samples for DM
let preloadedSounds = []; // Array that will store the audio obj generates via function
const audioFiles = [
  // Function that stores the paths associated to the various samples
  "../../Sounds/Drum Samples/Kick BD.wav", // Kick
  "../../Sounds/Drum Samples/Snare SN.wav", // Snare
  "../../Sounds/Drum Samples/Tom T1.wav", // Tom 1
  "../../Sounds/Drum Samples/Tom T2.wav", // Tom 2
  "../../Sounds/Drum Samples/Floor Tom FT.wav", // Floor Tom
  "../../Sounds/Drum Samples/Hi Hat Close HH.wav", // Closed Hi Hat
  "../../Sounds/Drum Samples/Hi Hat Open HO.wav", // Opened Hi Hat
  "../../Sounds/Drum Samples/Ride RD.wav", // Ride
  "../../Sounds/Drum Samples/Bell Ride BR.wav", // Bell's Ride
  "../../Sounds/Drum Samples/Crash CR.wav", // Crash
];

// Effects
let preloadedEffects = [];
const effectsFiles = [
  "/Project/Sounds/Effects/game-start.mp3",
  "/Project/Sounds/Effects/game-bonus.mp3",
  "/Project/Sounds/Effects/game-over.mp3",
  "/Project/Sounds/Effects/fail.mp3",
  "/Project/Sounds/Effects/game-finished.mp3",
];

let defaultEffectsVolume = 0.5;
let loadedEffectsVolume = parseFloat(localStorage.getItem("effectsVolume"));
let effectsvol = !isNaN(loadedEffectsVolume)
  ? loadedEffectsVolume
  : defaultEffectsVolume;
effectsvol = Math.min(Math.max(effectsvol, 0), 1); // Clamp tra 0 e 1

effectsFiles.forEach((file, index) => {
  const effect = new Audio(file);
  effect.volume = effectsvol;
  preloadedEffects[index] = effect;
});

// BPM values
let defaultBpm = 100; // Default value of the BPM slider
let bpm = defaultBpm; // Sets actual BPM to default value

// Control Booleans
let isPlaying = false; // Control boolean used to determine if the user is playing his guess
let isSolutionPlaying = false; // Control boolean used to determine if the user is playing the solution pattern
let hasRoundEnded = false;

// Indexes
let guessIndex = 0; // Index used to have track of the actual semicrome that is being played in the guess
let solutionIndex = 0; // Index used to have track of the actual semicrome that is being played in the solution

// Intervals
let metronomeInterval; // Variable that stores the interval of the metronome
let timerInterval; // Variable that stores the interval of the timer
let solutionInterval = null; // Variable that stores the interval of the solution

// Level succession
let levelIndex = 0; // Stores the index associated to the actual level
let defaultRounds = 3; // Defaul value for max number of rounds
let loadedRounds = parseInt(localStorage.getItem("numberOfRounds")); // Loaded value
let maxRounds = !isNaN(loadedRounds) ? loadedRounds : defaultRounds;

// Score
let maxScore = 125; // Max score that the user can get (the actual Maximum score is 100, we add 125 to avoid a problem in the logic)
let roundScore = maxScore; // Sets actual score to maxScore
let totalScore = 0; // Stores the total score achieved by the user

// Timer
let maxTimer = 120; // Stores how much time is given to the player to complete each level
let timer = maxTimer; // Sets starting timer value to default value
let scoreSubTimer = maxTimer / 4;

// Preload of stored values from main menu
let selectedMinigame = localStorage.getItem("Gamemode"); // Gets from localStorage the selected Minigame (Grooves / Fills)
let difficultyLevel = localStorage.getItem("Difficulty"); // Gets from localStorage the selected Difficulty Level
let practiceModeFlag = localStorage.getItem("Practice"); // Gets from localStorage the selected mode (Game / Practice)

let gamemodeDisplay = document.getElementById("title");
let roundDisplay = document.getElementById("roundDisplay");
let difficultyDisplay = document.getElementById("difficultyDisplay");
let practiceMessage = document.getElementById("practiceMessage");

let userLegend = {
  grooves_GM: "GROOVES",
  fills_GM: "FILLS",
  easyDiff: "EASY",
  mediumDiff: "MEDIUM",
  hardDiff: "HARD",
};

if (practiceModeFlag == "false") {
  gamemodeDisplay.innerHTML = userLegend[selectedMinigame];
  roundDisplay.innerHTML = "ROUND 1";
  difficultyDisplay.innerHTML = "DIFFICULTY " + userLegend[difficultyLevel];
  practiceMessage.style.display = "none";
} else {
  practiceMessage.style.fontSize = "4.8vh";
  roundDisplay.style.display = "none";
  difficultyDisplay.style.display = "none";
}

let mainMenuButton = document.getElementById("mainMenuButton");

if (practiceModeFlag == "true") mainMenuButton.style.display = "block";

mainMenuButton.addEventListener("click", () => {
  window.location.href = "../../gameTitleScreen.html";
});

// Dictionary of dictionaries used to access the correct array based on specified gamemode and difficulty level
let minigamePresets = {
  // Grooves Gamemode
  grooves_GM: {
    easyDiff: easyGrooves, // Easy Diff
    mediumDiff: mediumGrooves, // Medium Diff
    hardDiff: hardGrooves, // Hard Diff
  },
  // Fills Gamemode
  fills_GM: {
    easyDiff: easyFills, // Easy Diff
    mediumDiff: mediumFills, // Medium Diff
    hardDiff: hardFills, // Hard Diff
  },
};

let playSolutionButton = document.getElementById("playSolutionButton");
// OVERLAY PANEL HANDLING -----------------------------------------------------------------------------------------------------------------------------
let overlayPanel = document.getElementById("overlayDiv");
let overlayTitle = document.getElementById("overlayTitle");
let overlaySubtitle = document.getElementById("overlaySubtitle");
let scoreLabel = document.getElementById("scoreLabel");
let overlayImg = document.getElementById("overlayImg");

let startGameButton = document.getElementById("startGame");
let showSolutionButton = document.getElementById("showSolution");
let goNextRoundButton = document.getElementById("goNextRound");
let scoreDivisionLabel = document.getElementById("scoreDivisionLabel");
let rankingTable = document.getElementById("rankingTable");

let timeOverFlag;
let goodGuessFlag;

startGameButton.addEventListener("click", () => {
  timerInterval = setInterval(roundTimer, 1000);
  handleOverlayDisplay("hide");
  solutionInterval = setInterval(playSolution, setBpm(bpm));
  playSolutionButton.innerHTML = "STOP SOLUTION";
  isSolutionPlaying = true;
});

showSolutionButton.addEventListener("click", () => {
  showSolution();
});

goNextRoundButton.addEventListener("click", () => {
  if (levelIndex < maxRounds) {
    timeOverFlag = false;
    goodGuessFlag = false;
    timerInterval = setInterval(roundTimer, 1000);
    handleOverlayDisplay("hide");
    solution = chosenPresets[levelIndex];
    roundDisplay.innerHTML = "ROUND " + (levelIndex + 1);
    solutionInterval = setInterval(playSolution, setBpm(bpm));
    playSolutionButton.innerHTML = "STOP SOLUTION";
    isSolutionPlaying = true;
    hasRoundEnded = false;
    resetDrumMachine();
  } else if (levelIndex == maxRounds) {
    handleOverlayDisplay("gameOver");
    levelIndex++;
    preloadedEffects[4].play();
  } else {
    window.location.href = "../../gameTitleScreen.html";
  }
});

let handleOverlayDisplay = function (overlayType) {
  // Default settings
  overlayPanel.style.display = "flex";
  scoreLabel.style.display = "none";
  overlayImg.innerHTML = "";
  scoreDivisionLabel.style.display = "none";
  startGameButton.style.display = "none";
  showSolutionButton.style.display = "none";
  goNextRoundButton.style.display = "none";

  switch (overlayType) {
    case "startGame":
      if (selectedMinigame === "grooves_GM") overlayTitle.innerHTML = "RECOGNIZE GROOVES AND FILL THE DRUM MACHINE WITH IT";
      else if (selectedMinigame === "fills_GM") overlayTitle.innerHTML = "RECOGNIZE DRUM FILLS AND FILL THE DRUM MACHINE WITH IT";
      overlaySubtitle.innerHTML = "PRESS START";
      startGameButton.style.display = "block";
      break;
    case "wrongGuess":
      overlayTitle.innerHTML = "WRONG GUESS";
      overlaySubtitle.innerHTML = "DON'T WORRY, KEEP TRYING!";
      break;
    case "goodGuess":
      goodGuessFlag = true;
      overlayTitle.innerHTML = "GOOD GUESS";
      overlaySubtitle.innerHTML = "YOU ARE A BOSS!";
      showSolutionButton.style.display = "none";
      goNextRoundButton.style.display = "block";
      break;
    case "timeOver":
      timeOverFlag = true;
      overlayTitle.innerHTML = "TIME OVER";
      overlaySubtitle.innerHTML = "YOU DIDN'T MAKE IT!";
      showSolutionButton.style.display = "block";
      goNextRoundButton.style.display = "block";
      break;
    case "gameOver":
      overlayTitle.innerHTML = "GAME OVER";
      overlaySubtitle.style.display = "none";
      scoreLabel.style.display = "flex";
      scoreLabel.innerHTML = "TOTAL SCORE: " + totalScore;
      if (localStorage.getItem("multiplayerFlag") == "true") {
        scoreLabel.style.display = "none";
        rankingTable.style.display = "flex";
      }
      goNextRoundButton.innerHTML = "MAIN MENU";
      goNextRoundButton.style.display = "block";
      break;
    case "hide":
      overlayPanel.style.display = "none";
      break;
    default:
      console.log("Error: overlayType '" + overlayType + "' does not exist.");
  }
};

let selectedPresets;
let solution;
let chosenPresets;

function getRandomDrumPatterns(array) {
  // Shuffle the array using Fisher-Yates (Knuth) algorithm
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }

  // Return the first 3 elements of the shuffled array
  return array.slice(0, maxRounds);
}

let timerDisplay = document.getElementById("timer");

if (practiceModeFlag == "true") {
  timerDisplay.style.display = "none";
}

let roundTimer = function () {
  if (timer <= 0) {
    clearInterval(timerInterval);
    levelIndex = levelIndex + 1;
    timer = maxTimer;
    timeOver("timeOver");
    hasRoundEnded = true;
  }
  if (timer % scoreSubTimer == 0) {
    roundScore -= 25;
  }
  timer -= 1;
  timerDisplay.innerHTML = "REMAINING TIME: " + timer + "s";
};

if (practiceModeFlag == "false") {
  selectedPresets = minigamePresets[selectedMinigame][difficultyLevel];
  chosenPresets = getRandomDrumPatterns(selectedPresets);
  solution = chosenPresets[levelIndex];
  handleOverlayDisplay("startGame");
  preloadedEffects[0].play();
} else {
  selectedPresets = null;
  solution = null;
  chosenPresets = null;
}

// MULTIPLAYER SETTINGS
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  set,
  remove,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

import { app } from "../../../firebase.js";

const auth = getAuth(app);
const db = getDatabase(app);
const lobbyName = localStorage.getItem("lobbyName");
let snapshot;
let placementDisplay = document.getElementById("currentPlacement");
let updateRankingInterval = null;

let playersRef;
let playerScoreRef;

let updateRanking = async function () {
  await set(playerScoreRef, totalScore);
  let playersSnapshot = await get(playersRef);

  let playersArray = Object.entries(playersSnapshot.val()).map(
    ([id, data]) => ({
      id,
      score: data.score,
      playerName: data.playerName,
    })
  );

  // Ordina l'array in base allo score in ordine decrescente
  playersArray.sort((a, b) => b.score - a.score);

  // Trova l'indice del giocatore basandosi sull'id
  let playerIndex = playersArray.findIndex(
    (player) => player.id === localStorage.getItem("userID")
  );

  rankingTable.innerHTML = "";

  playersArray.forEach((item, index) => {
    let newPlayerRanking = document.createElement("div");
    newPlayerRanking.classList.add("playerRanking");
    newPlayerRanking.innerHTML = `${index + 1}°:  ${item.playerName} - ${
      item.score
    } points`;
    rankingTable.append(newPlayerRanking);
  });

  placementDisplay.innerHTML = `PLACEMENT: ${playerIndex + 1}°`;
};

if (
  localStorage.getItem("multiplayerFlag") == "true" &&
  practiceModeFlag != "true"
) {
  playersRef = ref(db, `lobbies/${lobbyName}/players`);
  playerScoreRef = ref(
    db,
    `lobbies/${lobbyName}/players/${localStorage.getItem("userID")}/score`
  );
  updateRankingInterval = setInterval(updateRanking, 100);

  placementDisplay.style.display = "block";
  maxRounds = localStorage.getItem("numberRoundsMP");
  let gameStructureRef = ref(db, `lobbies/${lobbyName}/gameStructure`);
  if (localStorage.getItem("isHost") == "true") {
    chosenPresets = getRandomDrumPatterns(selectedPresets);
    await set(gameStructureRef, chosenPresets);
  } else {
    do {
      snapshot = await get(gameStructureRef);

      if (snapshot.exists()) {
        chosenPresets = snapshot.val();
      }
    } while (!snapshot.exists());
  }
}

if (localStorage.getItem("multiplayerFlag") == "false") timerDisplay.style.marginTop = "10vh";
else timerDisplay.style.marginTop = "0vh", placementDisplay.style.marginTop = "5vh";

/* ------------------------------------------------------------------------------------------------------ */

// DYNAMIC HTML LAYOUT GENERATION ---------------------------------------------------------------------------------------------------------------------
let drumMachineItems = document.getElementsByClassName("drumMachineItem"); // Gets HTML elements that will contain the DM (one for each sample)

// Iterates over samples
Array.from(drumMachineItems).forEach((item, index) => {
  // Iterates over semicromes
  for (let i = 0; i < semicrome; i++) {
    let newElement = document.createElement("div"); // Create new div element
    newElement.classList.add("semicroma"); // Adds class to new element

    // If the semicroma is the first of the quarto, adds a class that allows a proper visualization
    if ((i + 1) % 4 == 1) {
      newElement.classList.add("newQuarto");
    }

    // Adds event listener based on click over the new element
    newElement.addEventListener("click", () => {
      newElement.classList.toggle("active"); // Toggles class active for proper visualization
      drumMachineController[index][i] = !drumMachineController[index][i]; // Updates logic
    });
    item.appendChild(newElement); // Appends new element to the parent div
  }

  //
  let titleDiv = item.getElementsByClassName("drumMachineItemTitle")[0];

  let titleLabel = document.createElement("div");
  titleLabel.classList.add("titleLabel");
  titleLabel.innerHTML = item.id;

  titleDiv.appendChild(titleLabel);

  let playButton = document.createElement("div");
  playButton.classList.add("playSampleButton");

  playButton.addEventListener("click", () => {
    playSound(index);
  });

  titleDiv.appendChild(playButton);
});

audioFiles.forEach((file, index) => {
  const audio = new Audio(file);
  audio.volume = vol;
  preloadedSounds[index] = audio;
});

let playSound = function (sampleID) {
  if (preloadedSounds[sampleID]) {
    preloadedSounds[sampleID].currentTime = 0;
    preloadedSounds[sampleID].play();
  }
};

let playBeat = function () {
  let toTurnOff = guessIndex == 0 ? 15 : guessIndex - 1;

  Array.from(drumMachineItems).forEach((item) => {
    item
      .getElementsByClassName("semicroma")
      [toTurnOff].classList.toggle("highlighted", false);
  });
  Array.from(drumMachineItems).forEach((item, index) => {
    if (
      practiceModeFlag == "false" &&
      drumMachineController[index][guessIndex] == solution[index][guessIndex] &&
      drumMachineController[index][guessIndex]
    ) {
      item
        .getElementsByClassName("semicroma")
        [guessIndex].classList.toggle("correctGuess", true);
      item.getElementsByClassName("semicroma")[guessIndex].style.pointerEvents =
        "none";
    } else {
      item
        .getElementsByClassName("semicroma")
        [guessIndex].classList.toggle("highlighted", true);
    }
  });

  drumMachineController
    .map((row) => row[guessIndex])
    .forEach((item, sampleID) => {
      if (item) {
        playSound(sampleID);
      }
    });

  guessIndex = (guessIndex + 1) % semicrome;
};

let playSolution = function () {
  let toTurnOff = solutionIndex == 0 ? 15 : solutionIndex - 1;

  Array.from(drumMachineItems).forEach((item) => {
    item
      .getElementsByClassName("semicroma")
      [toTurnOff].classList.toggle("highlightedSolution", false);
  });
  Array.from(drumMachineItems).forEach((item) => {
    item
      .getElementsByClassName("semicroma")
      [solutionIndex].classList.toggle("highlightedSolution", true);
  });

  solution
    .map((row) => row[solutionIndex])
    .forEach((item, sampleID) => {
      if (item) {
        playSound(sampleID);
      }
    });
  solutionIndex = (solutionIndex + 1) % semicrome;
};

function setBpm(n) {
  let minute = 1000 * 60;
  return minute / n / 4;
}

let startStopButton = document.getElementById("startStopButton");

if (practiceModeFlag == "true") {
  startStopButton.innerHTML = "PLAY";
}

function startMetronome() {
  metronomeInterval = setInterval(playBeat, setBpm(bpm)); // Start the interval with the current BPM
  startStopButton.innerHTML =
    practiceModeFlag == "true" ? "STOP" : "STOP YOUR GUESS";
  isPlaying = true;
}

function stopMetronome() {
  clearInterval(metronomeInterval); // Stop the ongoing interval

  Array.from(drumMachineItems).forEach((item) => {
    for (let i = 0; i < semicrome; i++)
      item
        .getElementsByClassName("semicroma")
        [i].classList.toggle("highlighted", false);
  });
  startStopButton.innerHTML =
    practiceModeFlag == "true" ? "PLAY" : "PLAY YOUR GUESS";
  isPlaying = false;
}

function resetDrumMachine() {
  Array.from(drumMachineItems).forEach((item) => {
    for (let i = 0; i < semicrome; i++) {
      item
        .getElementsByClassName("semicroma")
        [i].classList.toggle("active", false);

      item
        .getElementsByClassName("semicroma")
        [i].classList.toggle("correctGuess", false);
      item.getElementsByClassName("semicroma")[i].style.pointerEvents = "auto";
    }
  });

  drumMachineController = Array.from({ length: drumSamples }, () =>
    Array(semicrome).fill(false)
  );
}

startStopButton.addEventListener("click", () => {
  guessIndex = 0;
  if (isPlaying) {
    stopMetronome();
  } else {
    if (isSolutionPlaying) {
      stopSolution();
    }
    startMetronome();
  }
});

let resetButton = document.getElementById("resetButton");
resetButton.addEventListener("click", () => {
  resetDrumMachine();
});

let bpmSlider = document.getElementById("bpmSlider");
let bpmDisplay = document.getElementById("bpmDisplay");

bpmSlider.addEventListener("input", () => {
  let newBpm = bpmSlider.value;
  bpmDisplay.innerHTML = "BPM: " + bpmSlider.value;
  if (newBpm !== bpm) {
    bpm = newBpm;

    if (isPlaying) {
      clearInterval(metronomeInterval);
      metronomeInterval = setInterval(playBeat, setBpm(bpm));
    }

    if (isSolutionPlaying) {
      clearInterval(solutionInterval);
      solutionInterval = setInterval(playSolution, setBpm(bpm));
    }
  }
});

function checkSolution(guess, correctAnswer) {
  if (guess.length !== correctAnswer.length) {
    return false;
  }
  for (let i = 0; i < guess.length; i++) {
    if (guess[i].length !== correctAnswer[i].length) {
      return false;
    }

    for (let j = 0; j < guess[i].length; j++) {
      if (guess[i][j] !== correctAnswer[i][j]) {
        return false;
      }
    }
  }
  return true;
}

if (practiceModeFlag == "true") {
  playSolutionButton.style.display = "none";
}

function startSolution() {
  if (isPlaying) {
    stopMetronome();
  }
  solutionInterval = setInterval(playSolution, setBpm(bpm));
  playSolutionButton.innerHTML = "STOP SOLUTION";
  isSolutionPlaying = true;
}

function stopSolution() {
  clearInterval(solutionInterval);
  solutionInterval = null;
  playSolutionButton.innerHTML = "PLAY SOLUTION";
  isSolutionPlaying = false;

  Array.from(drumMachineItems).forEach((item) => {
    for (let i = 0; i < semicrome; i++)
      item
        .getElementsByClassName("semicroma")
        [i].classList.toggle("highlightedSolution", false);
  });

  solutionIndex = 0;
}

playSolutionButton.addEventListener("click", () => {
  if (solutionInterval != null) {
    stopSolution();
  } else {
    startSolution();
  }
});

let currentScore = document.getElementById("currentScore");
let finalScreen = document.getElementById("fScreen");
let finalScore = document.getElementById("finalScreenPanel");

if (practiceModeFlag == "true") {
  currentScore.style.display = "none";
}

let goodGuess = function () {
  if (isSolutionPlaying) stopSolution();
  if (isPlaying) stopMetronome();

  levelIndex = levelIndex + 1;
  totalScore += roundScore;
  currentScore.innerHTML = "CURRENT SCORE: " + totalScore;

  clearInterval(timerInterval);
  handleOverlayDisplay("goodGuess");
  roundScore = maxScore;
  timer = maxTimer;
  preloadedEffects[1].play();
};

let wrongGuess = function () {
  if (isSolutionPlaying) stopSolution();
  if (isPlaying) stopMetronome();
  handleOverlayDisplay("wrongGuess");
  preloadedEffects[3].play();

  setTimeout(() => {
    if (!hasRoundEnded) handleOverlayDisplay("hide");
  }, 2000);
};

let timeOver = function (overlayType) {
  if (isSolutionPlaying) stopSolution();
  if (isPlaying) stopMetronome();
  resetDrumMachine();
  clearInterval(timerInterval);
  handleOverlayDisplay(overlayType);
  preloadedEffects[2].play();
};

let checkInputButton = document.getElementById("checkInputButton");

if (practiceModeFlag == "true") {
  checkInputButton.style.display = "none";
}

checkInputButton.addEventListener("click", () => {
  if (checkSolution(drumMachineController, solution)) goodGuess();
  else wrongGuess();
  resetDrumMachine();
});

let solutionDiv = document.getElementById("overlaySolution");

let showSolution = function () {
  buildSolution();
  handleOverlayDisplay("hide");
  solutionDiv.style.display = "flex";
  solutionInterval = setInterval(playSolution, setBpm(bpm));
};

let hideSolutionButton = document.getElementById("hideSolution");

hideSolutionButton.addEventListener("click", () => {
  hideSolution();
});

let hideSolution = function () {
  resetDrumMachine();
  if (timeOverFlag) handleOverlayDisplay("timeOver");
  if (goodGuessFlag) handleOverlayDisplay("goodGuess");
  solutionDiv.style.display = "none";
  clearInterval(solutionInterval);
};

let buildSolution = function () {
  drumMachineController = solution;

  Array.from(drumMachineItems).forEach((item, index) => {
    for (let i = 0; i < semicrome; i++) {
      item
        .getElementsByClassName("semicroma")
        [i].classList.toggle("active", drumMachineController[index][i]);
    }
  });
};
