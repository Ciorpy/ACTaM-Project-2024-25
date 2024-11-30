let semicrome = 16;
let drumSamples = 10;
let bpm = 150;
let isPlaying = false;
let isSolutionPlaying = false;
let i = 0;
let j = 0;
let metronomeInterval;

let preloadedSounds = [];

let drumMachineController = Array.from({ length: drumSamples }, () =>
  Array(semicrome).fill(false)
);

let solution = Array.from({ length: drumSamples }, () =>
  Array(semicrome).fill(false)
);

drumMachineItems = document.getElementsByClassName("drumMachineItem");

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

    item.getElementsByClassName("drumMachineItemTitle")[0].innerHTML = item.id;
  }
});

const audioFiles = [
  "../../Sounds/Drum Samples/BD.wav",
  "../../Sounds/Drum Samples/SN.wav",
  "../../Sounds/Drum Samples/T1.wav",
  "../../Sounds/Drum Samples/T2.wav",
  "../../Sounds/Drum Samples/T3.wav",
  "../../Sounds/Drum Samples/CHH.wav",
  "../../Sounds/Drum Samples/OHH.wav",
  "../../Sounds/Drum Samples/RD.wav",
  "../../Sounds/Drum Samples/RB.wav",
  "../../Sounds/Drum Samples/CR.wav",
];

audioFiles.forEach((file, index) => {
  const audio = new Audio(file);
  preloadedSounds[index] = audio;
});

playSound = function (sampleID) {
  if (preloadedSounds[sampleID]) {
    preloadedSounds[sampleID].currentTime = 0;
    preloadedSounds[sampleID].play();
  }
};

playBeat = function () {
  let toTurnOff = i == 0 ? 15 : i - 1;

  Array.from(drumMachineItems).forEach((item) => {
    item
      .getElementsByClassName("semicroma")
      [toTurnOff].classList.toggle("highlighted", false);
  });
  Array.from(drumMachineItems).forEach((item) => {
    item
      .getElementsByClassName("semicroma")
      [i].classList.toggle("highlighted", true);
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

playSolution = function () {
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
    for (let i = 0; i < semicrome; i++)
      item
        .getElementsByClassName("semicroma")
        [i].classList.toggle("active", false);
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

// Reset button event listener
let resetButton = document.getElementById("resetButton");
resetButton.addEventListener("click", () => {
  resetDrumMachine();
});

// BPM slider event listener
let bpmSlider = document.getElementById("bpmSlider");
let bpmDisplay = document.getElementById("bpmDisplay");
bpmSlider.addEventListener("input", () => {
  let newBpm = bpmSlider.value;
  bpmDisplay.innerHTML = bpmSlider.value;
  if (newBpm !== bpm) {
    // Only adjust if BPM is changed
    bpm = newBpm;

    // Clear and reset the metronome interval
    if (isPlaying) {
      clearInterval(metronomeInterval); // Clear the current metronome interval
      metronomeInterval = setInterval(playBeat, setBpm(bpm)); // Start a new metronome interval with updated BPM
    }

    // Clear and reset the solution interval
    if (isSolutionPlaying) {
      clearInterval(solutionInterval); // Clear the current solution interval
      solutionInterval = setInterval(playSolution, setBpm(bpm)); // Start a new solution interval with updated BPM
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

function checkSolution(guess, correctAnswer) {
  // Security checks, not necessary considering that we will always compare matrices with the same number of rows and columns but however
  if (guess.length !== correctAnswer.length) {
    return false;
  }
  for (let i = 0; i < guess.length; i++) {
    if (guess[i].length !== correctAnswer[i].length) {
      return false;
    }

    // Compare each element in the row
    for (let j = 0; j < guess[i].length; j++) {
      if (guess[i][j] !== correctAnswer[i][j]) {
        return false; // Element mismatch
      }
    }
  }

  // If no differences were found, the matrices are identical
  return true;
}

let checkInputButton = document.getElementById("checkInputButton");

checkInputButton.addEventListener("click", () => {
  console.log(solution);
  console.log(drumMachineController);
  if (checkSolution(solution, drumMachineController)) console.log("DAJE ROMA");
  else console.log("ER SAMBUCONE YAYAYYAHOOOOOOOOOOOO");
});

playSolutionButton = document.getElementById("playSolutionButton");

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
