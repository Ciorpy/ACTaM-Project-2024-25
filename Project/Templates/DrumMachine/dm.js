let semicrome = 16;
let drumSamples = 10;
let defaultBpm = 150;
let bpm = defaultBpm;
let isPlaying = false;
let isSolutionPlaying = false;
let i = 0;
let j = 0;
let metronomeInterval;

let difficultyLevel = localStorage.getItem("Difficulty")
let selectedMinigame = localStorage.getItem("Gamemode")

let minigamePresets = {
  "grooves_GM": {
    "easyDiff": easyGrooves,
    "mediumDiff": mediumGrooves,
    "hardDiff": hardGrooves,
  },
  "fills_GM": {
    "easyDiff": easyFills,
    "mediumDiff": mediumFills,
    "hardDiff": hardFills,
  }
}
console.log(difficultyLevel)
console.log(selectedMinigame)

let selectedPresets = minigamePresets[selectedMinigame][difficultyLevel]

function getRandomDrumPatterns(array) {
  // Shuffle the array using Fisher-Yates (Knuth) algorithm
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }

  // Return the first 3 elements of the shuffled array
  return array.slice(0, 3);
}

let chosenPresets = getRandomDrumPatterns(selectedPresets);
console.log(chosenPresets)

console.log(selectedPresets)

let drumMachineController = Array.from({ length: drumSamples }, () =>
  Array(semicrome).fill(false)
);

let solution = Array.from({ length: drumSamples }, () =>
  Array(semicrome).fill(false)
);

let drumMachineItems = document.getElementsByClassName("drumMachineItem");

Array.from(drumMachineItems).forEach((item, index) => {
  for (let i = 0; i < semicrome; i++) {
    let newElement = document.createElement("div");
    newElement.classList.add("semicroma");

    if ((i + 1) % 4 == 1) {
      newElement.classList.add("newQuarto");
    }

    newElement.addEventListener("click", () => {
      newElement.classList.toggle("active");
      drumMachineController[index][i] = !drumMachineController[index][i];
      console.log(drumMachineController);
    });
    item.appendChild(newElement);
  }
  let titleDiv = item.getElementsByClassName("drumMachineItemTitle")[0]
    
  let titleLabel = document.createElement("div")
  titleLabel.classList.add("titleLabel");
  titleLabel.innerHTML = item.id;
  
  titleDiv.appendChild(titleLabel);

  let playButton = document.createElement("div")
  playButton.classList.add("playSampleButton");

  playButton.addEventListener("click", () => {
    playSound(index)
  })

  titleDiv.appendChild(playButton);
});

let preloadedSounds = [];

const audioFiles = [
  "../../Sounds/New Drum Samples/Kick 22.wav",
  "../../Sounds/New Drum Samples/Snare Ludwig Acrolite.wav",
  "../../Sounds/New Drum Samples/Tom 10.wav",
  "../../Sounds/New Drum Samples/Tom 12.wav",
  "../../Sounds/New Drum Samples/Floor Tom 16.wav",
  "../../Sounds/New Drum Samples/Hi Hat Close Sabian HHX 14.wav",
  "../../Sounds/New Drum Samples/Hi Hat Open Sabian HHX 14.wav",
  "../../Sounds/Drum Samples/RD.wav",
  "../../Sounds/New Drum Samples/Clap Stack.wav",
  "../../Sounds/New Drum Samples/Crash K 18.wav",
];

audioFiles.forEach((file, index) => {
  const audio = new Audio(file);
  preloadedSounds[index] = audio;
});

let playSound = function (sampleID) {
  if (preloadedSounds[sampleID]) {
    preloadedSounds[sampleID].currentTime = 0;
    preloadedSounds[sampleID].play();
  }
};

let playBeat = function () {
  let toTurnOff = i == 0 ? 15 : i - 1;

  Array.from(drumMachineItems).forEach((item) => {
    item
      .getElementsByClassName("semicroma")
      [toTurnOff].classList.toggle("highlighted", false);
  });
  Array.from(drumMachineItems).forEach((item, index) => {
    if (
      drumMachineController[index][i] == solution[index][i] &&
      drumMachineController[index][i]
    ) {
      item
        .getElementsByClassName("semicroma")
        [i].classList.toggle("correctGuess", true);
      item.getElementsByClassName("semicroma")[i].style.pointerEvents = "none";
    } else {
      item
        .getElementsByClassName("semicroma")
        [i].classList.toggle("highlighted", true);
    }
  });

  drumMachineController
    .map((row) => row[i])
    .forEach((item, sampleID) => {
      if (item) {
        playSound(sampleID);
      }
    });

  i = (i + 1) % semicrome;
};

let playSolution = function () {
  let toTurnOff = j == 0 ? 15 : j - 1;

  Array.from(drumMachineItems).forEach((item) => {
    item
      .getElementsByClassName("semicroma")
      [toTurnOff].classList.toggle("highlightedSolution", false);
  });
  Array.from(drumMachineItems).forEach((item) => {
    item
      .getElementsByClassName("semicroma")
      [j].classList.toggle("highlightedSolution", true);
  });

  solution
    .map((row) => row[j])
    .forEach((item, sampleID) => {
      if (item) {
        playSound(sampleID);
      }
    });
  j = (j + 1) % semicrome;
};

function setBpm(n) {
  let minute = 1000 * 60;
  return minute / n / 4;
}

let startStopButton = document.getElementById("startStopButton");

function startMetronome() {
  console.log("start");
  metronomeInterval = setInterval(playBeat, setBpm(bpm)); // Start the interval with the current BPM
  startStopButton.innerHTML = "STOP";
  isPlaying = true;
}

function stopMetronome() {
  console.log("stop");
  clearInterval(metronomeInterval); // Stop the ongoing interval

  Array.from(drumMachineItems).forEach((item) => {
    for (let i = 0; i < semicrome; i++)
      item
        .getElementsByClassName("semicroma")
        [i].classList.toggle("highlighted", false);
  });
  startStopButton.innerHTML = "START";
  isPlaying = false;
}

function resetDrumMachine() {
  Array.from(drumMachineItems).forEach((item) => {
    for (let i = 0; i < semicrome; i++){
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
  i = 0;
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
  bpmDisplay.innerHTML = bpmSlider.value;
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

for (let i = 0; i < grooves.length; i++) {
  fills[i].forEach((item, index) => {
    let newGroove = document.createElement("div");
    newGroove.classList.add("groove");
    newGroove.innerHTML = fillsTypes[i] + " preset N°" + (index + 1);

    newGroove.addEventListener("click", () => {
      solution = item;
    });

    groovePanels[i].appendChild(newGroove);
  });
}

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

let checkInputButton = document.getElementById("checkInputButton");

checkInputButton.addEventListener("click", () => {
  console.log(solution);
  console.log(drumMachineController);
  if (checkSolution(solution, drumMachineController)) endGame();
  else wrongGuess()
});

let playSolutionButton = document.getElementById("playSolutionButton");

let solutionInterval = null;

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

  j = 0;
}

playSolutionButton.addEventListener("click", () => {
  if (solutionInterval != null) {
    stopSolution();
  } else {
    startSolution();
  }
});

let score = 0;

let endGamePanel = document.getElementById("endGameScreen");

let endGame = function () {
  if (isSolutionPlaying) stopSolution();
  if (isPlaying) stopMetronome();
  endGamePanel.style.display = "flex";
  const endGameAudio = new Audio("../../Sounds/maneskin.wav");
  endGameAudio.play();
};

let wrongGuessPanel = document.getElementById("wrongGuessScreen");

let wrongGuess = function () {
  if (isSolutionPlaying) stopSolution();
  if (isPlaying) stopMetronome();
  wrongGuessPanel.style.display = "flex";
  const wrongGuessAudio = new Audio("../../Sounds/morgan.mp3");
  wrongGuessAudio.play();
  
  setTimeout(() => {
    resetDrumMachine()
    wrongGuessPanel.style.display = "none"
  }, 4000);
}
