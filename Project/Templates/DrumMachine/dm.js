let semicrome = 16;
let drumSamples = 10;

let drumMachineController = Array.from({ length: drumSamples }, () => Array(semicrome).fill(false));
let defaultLayout = drumMachineController;

console.log(drumMachineController)

drumMachineItems = document.getElementsByClassName("drumMachineItem");

console.log(drumMachineItems)

Array.from(drumMachineItems).forEach((item, index) => {
    for(let i=0; i < semicrome; i++) {
        let newElement = document.createElement("div");
        newElement.classList.add("semicroma");
        
        if ((i + 1) % 4 == 1){   
            newElement.classList.add("newQuarto");
        }

        newElement.addEventListener("click", () =>{
            newElement.classList.toggle("active");
            drumMachineController[index][i] = !drumMachineController[index][i]
            console.log(drumMachineController)
        })
        item.appendChild(newElement);

        item.getElementsByClassName("drumMachineItemTitle")[0].innerHTML = item.id
    }
})

let isPlaying = false;
let i = 0;

playSound = function (sampleID) {
    let sound;
    switch (sampleID) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
            sound = new Audio(
                'https://media.geeksforgeeks.org/wp-content/uploads/20190531135120/beep.mp3');    
    }
    
    sound.play();
}


playBeat = function () {
    let toTurnOff = i == 0 ? 15 : i - 1

    Array.from(drumMachineItems).forEach((item) => {
        item.getElementsByClassName("semicroma")[toTurnOff].classList.toggle("highlighted", false)
    })
    Array.from(drumMachineItems).forEach((item) => {
        item.getElementsByClassName("semicroma")[i].classList.toggle("highlighted", true)
    })

    //drumMachineController.map(row => row[i]).forEach((item, sampleID) => {
    //    if (item) {
    //        playSound(sampleID)
    //    }
    //})

    console.log("palle")
    i = (i + 1) % semicrome
}

function startMetronome() {
    console.log("start")
    metronomeInterval = setInterval(playBeat, 666.6667);
}


function stopMetronome() {
    console.log("stop")
    clearInterval(metronomeInterval);


    Array.from(drumMachineItems).forEach((item) => {
        for(let i = 0; i < semicrome; i ++)
            item.getElementsByClassName("semicroma")[i].classList.toggle("highlighted", false)
    })
}

function resetDrumMachine() {
    Array.from(drumMachineItems).forEach((item) => {
        for(let i = 0; i < semicrome; i ++)
            item.getElementsByClassName("semicroma")[i].classList.toggle("active", false)
    })

    drumMachineController = defaultLayout
}


startStopButton = document.getElementById("startStopButton")
startStopButton.addEventListener("click", () => {
    i = 0
    isPlaying ? stopMetronome() : startMetronome();
    isPlaying ?
        startStopButton.innerHTML="START"
        :
        startStopButton.innerHTML="STOP"

    isPlaying = !isPlaying
})

resetButton = document.getElementById("resetButton")
resetButton.addEventListener("click", () => {
    resetDrumMachine()
})