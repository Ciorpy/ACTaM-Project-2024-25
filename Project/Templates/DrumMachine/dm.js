let semicrome = 16;
let drumSamples = 10;
let bpm = 150;
let drumMachineController = Array.from({ length: drumSamples }, () => Array(semicrome).fill(false));

console.log(drumMachineController);

drumMachineItems = document.getElementsByClassName("drumMachineItem");

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
let i = 0;
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

function setBpm(n) {
    let minute = 1000 * 60;
    return (minute / n) / 4;
}

function startMetronome() {
    console.log("start");
    metronomeInterval = setInterval(playBeat, setBpm(bpm));  // Start the interval with the current BPM
}

function stopMetronome() {
    console.log("stop");
    clearInterval(metronomeInterval);  // Stop the ongoing interval

    Array.from(drumMachineItems).forEach((item) => {
        for (let i = 0; i < semicrome; i++)
            item.getElementsByClassName("semicroma")[i].classList.toggle("highlighted", false);
    });
}

function resetDrumMachine() {
    Array.from(drumMachineItems).forEach((item) => {
        for (let i = 0; i < semicrome; i++)
            item.getElementsByClassName("semicroma")[i].classList.toggle("active", false);
    });

    drumMachineController = Array.from({ length: drumSamples }, () => Array(semicrome).fill(false));
}

// Start/Stop button event listener
startStopButton = document.getElementById("startStopButton");
startStopButton.addEventListener("click", () => {
    i = 0;
    if (isPlaying) {
        stopMetronome();
        startStopButton.innerHTML = "START";
    } else {
        startMetronome();
        startStopButton.innerHTML = "STOP";
    }

    isPlaying = !isPlaying;
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
    bpmDisplay.innerHTML = bpmSlider.value
    if (newBpm !== bpm) {  // Only adjust if BPM is changed
        bpm = newBpm;
        if (isPlaying) {
            clearInterval(metronomeInterval);  // Clear the current interval
            metronomeInterval = setInterval(playBeat, setBpm(bpm));  // Start a new interval with the updated BPM
        }
    }
});
