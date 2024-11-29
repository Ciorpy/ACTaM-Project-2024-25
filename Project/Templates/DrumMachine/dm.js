let semicrome = 16;
let drumSamples = 10;
let bpm = 150;
let drumMachineController = Array.from({ length: drumSamples }, () => Array(semicrome).fill(false));

console.log(drumMachineController);

drumMachineItems = document.getElementsByClassName("drumMachineItem");

solution = Array.from({ length: drumSamples }, () => Array(semicrome).fill(false));

console.log(solution)

console.log(drumMachineItems);

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

let isPlaying = false;
let isSolutionPlaying = false;
let i = 0;
let j = 0;
let metronomeInterval;

playSound = function (sampleID) {
    let sound;
    switch (sampleID) {
        case 0:
            sound = new Audio('../../Sounds/Drum Samples/BD.wav');
            break;
        case 1:
            sound = new Audio('../../Sounds/Drum Samples/SN.wav');
            break;
        case 2:
            sound = new Audio('../../Sounds/Drum Samples/T1.wav');
            break;
        case 3:
            sound = new Audio('../../Sounds/Drum Samples/T2.wav');
            break;
        case 4:
            sound = new Audio('../../Sounds/Drum Samples/T3.wav');
            break;
        case 5:
            sound = new Audio('../../Sounds/Drum Samples/CHH.wav');
            break;
        case 6:
            sound = new Audio('../../Sounds/Drum Samples/OHH.wav');
            break;
        case 7:
            sound = new Audio('../../Sounds/Drum Samples/RD.wav');
            break;
        case 8:
            sound = new Audio('../../Sounds/Drum Samples/RB.wav');
            break;
        case 9:
            sound = new Audio('../../Sounds/Drum Samples/CR.wav');
            break;
    }

    sound.play();
};

playBeat = function () {
    let toTurnOff = i == 0 ? 15 : i - 1;

    Array.from(drumMachineItems).forEach((item) => {
        item.getElementsByClassName("semicroma")[toTurnOff].classList.toggle("highlighted", false);
    });
    Array.from(drumMachineItems).forEach((item) => {
        item.getElementsByClassName("semicroma")[i].classList.toggle("highlighted", true);
    });

    drumMachineController.map(row => row[i]).forEach((item, sampleID) => {
        if (item) {
            playSound(sampleID);
        }
    });

    i = (i + 1) % semicrome;
};

playSolution = function () {
    let toTurnOff = j == 0 ? 15 : j - 1;

    Array.from(drumMachineItems).forEach((item) => {
        item.getElementsByClassName("semicroma")[toTurnOff].classList.toggle("highlightedSolution", false);
    });
    Array.from(drumMachineItems).forEach((item) => {
        item.getElementsByClassName("semicroma")[j].classList.toggle("highlightedSolution", true);
    });

    solution.map(row => row[j]).forEach((item, sampleID) => {
        if (item) {
            playSound(sampleID);
        }
    });
    j = (j + 1) % semicrome;
}

function setBpm(n) {
    let minute = 1000 * 60;
    return (minute / n) / 4;
}




// Start/Stop button event listener
startStopButton = document.getElementById("startStopButton");

function startMetronome() {
    console.log("start");
    metronomeInterval = setInterval(playBeat, setBpm(bpm));  // Start the interval with the current BPM
    startStopButton.innerHTML = "STOP";
    isPlaying = true;
}

function stopMetronome() {
    console.log("stop");
    clearInterval(metronomeInterval);  // Stop the ongoing interval

    Array.from(drumMachineItems).forEach((item) => {
        for (let i = 0; i < semicrome; i++)
            item.getElementsByClassName("semicroma")[i].classList.toggle("highlighted", false);
    });
    startStopButton.innerHTML = "START";
    isPlaying = false;
}

function resetDrumMachine() {
    Array.from(drumMachineItems).forEach((item) => {
        for (let i = 0; i < semicrome; i++)
            item.getElementsByClassName("semicroma")[i].classList.toggle("active", false);
    });

    drumMachineController = Array.from({ length: drumSamples }, () => Array(semicrome).fill(false));
}
startStopButton.addEventListener("click", () => {
    i = 0;
    if (isPlaying) {
        stopMetronome();
    } else {
        if(isSolutionPlaying){
            stopSolution();
        }
        startMetronome();
    }
});

// Reset button event listener
resetButton = document.getElementById("resetButton");
resetButton.addEventListener("click", () => {
    resetDrumMachine();
});

// BPM slider event listener
bpmSlider = document.getElementById("bpmSlider");
bpmDisplay = document.getElementById("bpmDisplay")
bpmSlider.addEventListener("input", () => {
    let newBpm = bpmSlider.value;
    bpmDisplay.innerHTML = bpmSlider.value;
    if (newBpm !== bpm) {  // Only adjust if BPM is changed
        bpm = newBpm;

        // Clear and reset the metronome interval
        if (isPlaying) {
            clearInterval(metronomeInterval);  // Clear the current metronome interval
            metronomeInterval = setInterval(playBeat, setBpm(bpm));  // Start a new metronome interval with updated BPM
        }

        // Clear and reset the solution interval
        if (isSolutionPlaying) {
            clearInterval(solutionInterval);  // Clear the current solution interval
            solutionInterval = setInterval(playSolution, setBpm(bpm));  // Start a new solution interval with updated BPM
        }
    }
});

easyGroovesPanel = document.getElementById("presetsEasy")
mediumGroovesPanel = document.getElementById("presetsMedium")
hardGroovesPanel = document.getElementById("presetsHard")


easyGrooves.forEach((item, index) => {
    let newGroove = document.createElement("div")
    newGroove.classList.add("groove")
    newGroove.innerHTML = "Easy preset N°" + (index + 1)

    newGroove.addEventListener("click", () => {
        solution = item
    })

    easyGroovesPanel.appendChild(newGroove)
})

mediumGrooves.forEach((item, index) => {
    let newGroove = document.createElement("div")
    newGroove.classList.add("groove")
    newGroove.innerHTML = "Medium preset N°" + (index + 1)

    newGroove.addEventListener("click", () => {
        solution = item
    })

    mediumGroovesPanel.appendChild(newGroove)
})

hardGrooves.forEach((item, index) => {
    let newGroove = document.createElement("div")
    newGroove.classList.add("groove")
    newGroove.innerHTML = "Hard preset N°" + (index + 1)

    newGroove.addEventListener("click", () => {
        solution = item
    })

    hardGroovesPanel.appendChild(newGroove)
})


function checkSolution(guess, correctAnswer) {
    // First, check if the matrices have the same number of rows
    if (guess.length !== correctAnswer.length) {
      return false; // Different number of rows
    }
  
    // Then, check if each row has the same number of columns
    for (let i = 0; i < guess.length; i++) {
      if (guess[i].length !== correctAnswer[i].length) {
        return false; // Row lengths are different
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

checkInputButton = document.getElementById("checkInputButton")

checkInputButton.addEventListener("click", () => {

    console.log(solution)
    console.log(drumMachineController)
    if (checkSolution(solution, drumMachineController))
        console.log("DAJE ROMA")
    else
        console.log("ER SAMBUCONE YAYAYYAHOOOOOOOOOOOO")
})

playSolutionButton = document.getElementById("playSolutionButton")

let solutionInterval = null;

function startSolution()  {
    if(isPlaying) {
        stopMetronome()
    }
    solutionInterval = setInterval(playSolution, setBpm(bpm));
    playSolutionButton.innerHTML = "STOP SOLUTION"
    isSolutionPlaying = true;
}

function stopSolution() {
    clearInterval(solutionInterval)
    solutionInterval = null;
    playSolutionButton.innerHTML = "PLAY SOLUTION"
    isSolutionPlaying = false;

    Array.from(drumMachineItems).forEach((item) => {
        for (let i = 0; i < semicrome; i++)
            item.getElementsByClassName("semicroma")[i].classList.toggle("highlightedSolution", false);
    });

    j = 0
}

playSolutionButton.addEventListener("click", () =>{
    if(solutionInterval != null){
        stopSolution()
    } else {
        startSolution()
    }
})