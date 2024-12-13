// IMPORTAZIONI E CONFIGURAZIONE INIZIALE -----------------------------------------------------------------------------
import PianoController from "./controller.js";
import { generateRandomChord } from "./chord.js";
import { recognizeChordMIDI } from "./chord.js";

// Costanti e configurazione globale
const firstNote = 48;
const keysNumber = 25;
const lastNote = firstNote + keysNumber;
const deductionInterval = 30; 
const hintInterval = 30;
const pointsToDeduct = 25;
const percAssistant = 50;
const maxRounds = 3;

// Variabili globali
let piano = new PianoController("piano", keysNumber, firstNote);
let previousPressedNotes = [];
let totalScore = 0;
let currentScore;
let timeLeft;
let timerInterval;
let isRoundActive = false;
let activeRoundID = 0;
let assistantMode = false; 
let selectedLevel = localStorage.getItem("Difficulty");
let selectedMinigame = localStorage.getItem("Gamemode");
let practiceModeFlag = localStorage.getItem("Practice") == "true" ? true : false;
let generatedChordData = {};
let chordData = {};
let generatedChord = [];
let hintTimer;
let flagHints; 
let isShowingHint;
let isAssistanONDisabled;
let isInputDisabled = true;
let assistantFlag = false;
let flagHintsPoint = [false, false, false];
let timeOverFlag;
let goodGuessFlag;

let userLegend = {
    chords_GM: "CHORDS",
    harmony_GM: "HARMONY",
    easyDiff: "EASY",
    mediumDiff: "MEDIUM",
    hardDiff: "HARD",
};

// Elementi DOM principali
const scoreDisplay = document.getElementById("scoreDisplay");
const timerDisplay = document.getElementById("timerDisplay");
const overlayPanel = document.getElementById("overlayDiv");
const scoreLabel = document.getElementById("scoreLabel");
const overlayTitle = document.getElementById("overlayTitle");
const overlaySubtitle = document.getElementById("overlaySubtitle");
const overlayTitleSolution = document.getElementById("overlayTitleSolution");
const overlaySubtitleSolution = document.getElementById("overlaySubtitleSolution");
const startGameButton = document.getElementById("startGame");
const showSolutionButton = document.getElementById("showSolution");
const goNextRoundButton = document.getElementById("goNextRound");
const scoreDivisionLabel = document.getElementById("scoreDivisionLabel");
const toggleAssistantModeButton = document.getElementById("toggleAssistantModeButton");
const levelDisplay = document.getElementById("level");
const modeDisplay = document.getElementById("mode");
const roundDisplay = document.getElementById("round");
const playSolutionButton = document.getElementById("playSolutionButton");
const hintButton = document.getElementById("hintButton");
const hintDisplay = document.getElementById("hintDisplay");
const solutionDiv = document.getElementById("overlaySolution");
const hideSolutionButton = document.getElementById("hideSolution");
const mainMenuButton = document.getElementById("mainMenu"); 

// CONFIGURAZIONE INIZIALE DELLA PAGINA -------------------------------------------------------------------------------
if(practiceModeFlag){
    handleOverlayDisplay("hide");
    enableInput();
    startGameButton.style.display = "none";
    playSolutionButton.style.display = "none";
    hintButton.style.display = "none";
    roundDisplay.style.display = "none";
    toggleAssistantModeButton.style.display = "none";
    mainMenuButton.style.display = "block";
    mainMenuButton.style.textAlign = "center";
    roundDisplay.style.display = "none";
    scoreDisplay.style.display = "none";
    timerDisplay.style.display = "none";
    hintDisplay.style.padding = "0px";
    hintDisplay.style.fontSize = "40px";
    levelDisplay.style.fontSize = "40px";
    levelDisplay.style.marginBottom = "0px";
    levelDisplay.innerHTML = "JUST HAVE FUN! CHORDS PLAYED WILL BE RECOGNIZED"
    piano.init();
} else {
    mainMenuButton.style.display = "none";
    updateScoreDisplay();
    updateTimerDisplay();
    updateLevelDisplay();
    updateModeDisplay();
    updateRoundDisplay();
}

// EVENT LISTENERS ----------------------------------------------------------------------------------------------------
// Avvio del gioco e passaggio al prossimo round
startGameButton.addEventListener("click", () => {
    updateRoundDisplay();
    handleOverlayDisplay("hide");
    if (!isRoundActive) startRound();
});
 
showSolutionButton.addEventListener("click", () => {
    handleOverlayDisplay("hide")
    solutionDiv.style.display = "flex";
    overlaySubtitleSolution.innerHTML = "";
    overlayTitleSolution.innerHTML = "IT'S A " + `${generatedChordData.noteRoot}${generatedChordData.chordType} IN ${generatedChordData.inversion}`;
    piano.playChord(generatedChord);
    generatedChord.forEach(note => {
        piano.view.setKeyColor(note, "green");
    }); // -> capire perche si possono deselezionare cliccando la tastiera
});

hideSolutionButton.addEventListener("click", () => {
    if (timeOverFlag) handleOverlayDisplay("timeOver");
    if (goodGuessFlag) handleOverlayDisplay("goodGuess");
    solutionDiv.style.display = "none";
    generatedChord.forEach(note => {
        piano.view.resetKeyColor(note)
    });
})

goNextRoundButton.addEventListener("click", () => {
    updateRoundDisplay();
    isAssistanONDisabled = toggleAssistantModeButton.textContent === "ASSISTANT MODE ON" ? true : false;
    if (isAssistanONDisabled){
        assistantMode = !assistantMode;
        toggleAssistantModeButton.textContent = !assistantMode ? "ASSISTANT MODE OFF" : "ASSISTANT MODE ON";
    }
    if (activeRoundID < maxRounds) {
        startRound();
        handleOverlayDisplay("hide");
    }else if (activeRoundID == maxRounds) {
        handleOverlayDisplay("gameOver");
        activeRoundID++;
    } else {
        window.location.href = "../../gameTitleScreen.html";
    }
});

// Riproduzione della soluzione
playSolutionButton.addEventListener("click", () => {
    piano.playChord(generatedChord); 
});

// Gestione degli hint
hintButton.addEventListener("click", () => {
    if (hintTimer >= hintInterval) updateHints();
});

// Gestione modalità guidata
toggleAssistantModeButton.addEventListener("click", () => {
    assistantFlag = true;
    assistantMode = !assistantMode;
    toggleAssistantModeButton.textContent = !assistantMode ? "ASSISTANT MODE OFF" : "ASSISTANT MODE ON";
});

mainMenuButton.addEventListener("click", () => {
    window.location.href = "../../gameTitleScreen.html";
});

// Mappatura tastiera
document.addEventListener("keydown", (event) => {
    if (isInputDisabled) return; 
    const note = piano.view.keyMap[event.code];
    if (note !== undefined && !practiceModeFlag) checkChord();
    else if (note !== undefined && practiceModeFlag) identifyChord();
});

document.addEventListener("mousedown", (event) =>{
    if (isInputDisabled) return;
    const pressedNotes = piano.getPressedNotes();
    if (assistantMode) piano.view.setKeyColor(pressedNotes, generatedChord.includes(pressedNotes[0]) ? "green" : "red"); 
})

// FUNZIONI PRINCIPALI -----------------------------------------------------------------------------------------------
function startRound() {
    timeOverFlag = false;
    goodGuessFlag = false;
    isRoundActive = true;
    hintButton.textContent = "HINT BLOCKED" // -> DA RIVEDERE
    hintButton.classList.add('no-hover'); // -> DA RIVEDERE COME SOPRA, TOGLIE HOVER QUANDO BLOCCATO (IN updateHint ovviamente lo rimetto)
    hintButton.classList.add('notSelectable'); // -> DA RIVEDERE COME SOPRA, PULSANTE  (IN updateHint ovviamente lo rimetto)
    hintButton.style.
    activeRoundID++;
    startTimer();
    enableInput();
    if (selectedMinigame === "chords_GM") {
        piano.init();
        generateNewChord();
    } else if (selectedMinigame === "harmony_GM"); // -> DA IMPLEMENTARE
}

function generateNewChord() {
    do {
        generatedChordData = generateRandomChord(firstNote, selectedLevel);
        generatedChord = generatedChordData.midiNotes.sort();
    } while(generatedChord[generatedChord.length - 1] >= lastNote);
    piano.playChord(generatedChord);
}

function identifyChord() {
    const pressedNotes = piano.getPressedNotes().sort();
    if (pressedNotes.length >= 3) {
        chordData = recognizeChordMIDI(pressedNotes);
        updateHints();
    } else {
        hintDisplay.innerHTML = "";
    } 
}

function checkChord() {
    const pressedNotes = piano.getPressedNotes();
    if (assistantMode) handleAssistantMode(pressedNotes);
    if (pressedNotes.length >= 3) {
        if (arraysEqual(pressedNotes, previousPressedNotes)) return;
        previousPressedNotes = [...pressedNotes];
        if (arraysEqual(generatedChord, pressedNotes)) handleCorrectGuess();
    }
}

function handleCorrectGuess() {
    clearInterval(timerInterval);
    if (assistantFlag) currentScore *= (1 - percAssistant / 100);
    if (flagHintsPoint[2]) currentScore -= 12;
    if (flagHintsPoint[1]) currentScore -= 8;
    if (flagHintsPoint[0]) currentScore -= 4;
    if (currentScore >= 0) totalScore += Math.floor(currentScore);
    else totalScore += 0;
    updateScoreDisplay();
    isRoundActive = false;
    handleOverlayDisplay("goodGuess");
}

function handleAssistantMode(pressedNotes) {
    const currentColorNotes = new Set(pressedNotes);
    pressedNotes.forEach(note => {
        piano.view.setKeyColor(note, generatedChord.includes(note) ? "green" : "red");
    });
    for (let i = firstNote; i <= lastNote; i++) {
        if (!currentColorNotes.has(i)) piano.view.resetKeyColor(i);
    }
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 120;
    currentScore = 100;
    hintTimer = 0;
    flagHints = [true, true, true];
    updateTimerDisplay();
    hintDisplay.textContent = " ";
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    timeLeft--;
    hintTimer++;
    updateTimerDisplay();
    if (timeLeft % deductionInterval === 0 && timeLeft > 0) {
        currentScore = Math.max(0, currentScore - pointsToDeduct);
    }
    hintsToShow()
    if (timeLeft <= 0) endRound();
}


function hintsToShow() {
    for (let i = 0; i < flagHints.length; i++) {
        if (hintTimer >= hintInterval * (i + 1) && flagHints[i]) {
            flagHints[i] = false;
            if (i === 0) {
                hintButton.classList.remove('no-hover'); // Hover riattivato
                hintButton.classList.remove('notSelectable'); // Hover riattivato
                hintDisplay.textContent = "1st HINT AVAILABLE";
            }
            if (i === 1) hintDisplay.textContent = "2nd HINT AVAILABLE";
            if (i === 2) hintDisplay.textContent = "3rd HINT AVAILABLE";
            hintButton.textContent = "SHOW HINT";
        }
    }
}

function updateHints() {
    if (practiceModeFlag) {
        hintDisplay.innerHTML = chordData.noteRoot !== null ? `${chordData.noteRoot}${chordData.chordType} IN ${chordData.inversion}` : "";
    } else {

        let currentHint = 0;

        if (hintTimer >= hintInterval * 3) {
            currentHint = 3;
        } else if (hintTimer >= hintInterval * 2) {
            currentHint = 2;
        } else if (hintTimer >= hintInterval) {
            currentHint = 1;
        }

        isShowingHint = hintButton.textContent === "SHOW HINT";

        if (isShowingHint) {

            switch (currentHint) {
                case 1:
                    flagHintsPoint[0] = true;
                    hintDisplay.textContent = `ROOT ${generatedChordData.noteRoot}`;
                    break;
                case 2:
                    flagHintsPoint[1] = true;
                    hintDisplay.textContent = `${generatedChordData.noteRoot}${generatedChordData.chordType}`;
                    break;
                case 3:
                    flagHintsPoint[2] = true;
                    hintDisplay.textContent = `${generatedChordData.noteRoot}${generatedChordData.chordType} IN ${generatedChordData.inversion}`;
                    break;
            }
            hintButton.textContent = "HIDE HINT";
        } else {

            switch (currentHint) {
                case 1:
                    hintDisplay.textContent = "1st HINT HIDDEN";
                    break;
                case 2:
                    hintDisplay.textContent = "2nd HINT HIDDEN";
                    break;
                case 3:
                    hintDisplay.textContent = "3rd HINT HIDDEN";
                    break;
            }
            hintButton.textContent = "SHOW HINT";
        }
    }
    
}

function endRound() {
    handleOverlayDisplay("timeOver");
    clearInterval(timerInterval);
    isRoundActive = false;
}

function disableInput() {
    isInputDisabled = true;
}

function enableInput() {
    isInputDisabled = false;
}

// AGGIORNAMENTO INTERFACCIA -----------------------------------------------------------------------------------------
function updateScoreDisplay() {
    scoreDisplay.innerHTML = "CURRENT SCORE: " + `${totalScore}`;
}

function updateTimerDisplay() {
    timerDisplay.innerHTML = "REMAINING TIME: " + `${timeLeft}s`;
}

function updateModeDisplay() {
    modeDisplay.innerHTML = userLegend[selectedMinigame]
}

function updateLevelDisplay() {
    levelDisplay.innerHTML = "   DIFFICULTY: " + userLegend[selectedLevel];
}

function updateRoundDisplay() {
    let roundShowed = activeRoundID + 1; 
    roundDisplay.innerHTML = "   ROUND: " + roundShowed;
}

// UTILITY -----------------------------------------------------------------------------------------------------------
function arraysEqual(arr1, arr2) {
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();
    return JSON.stringify(sortedArr1) === JSON.stringify(sortedArr2);
}

function handleOverlayDisplay(overlayType) {
    overlayPanel.style.display = "flex";
    scoreLabel.style.display = "none";
    scoreDivisionLabel.style.display = "none";
    startGameButton.style.display = "none";
    showSolutionButton.style.display = "none";    
    goNextRoundButton.style.display = "none";
    
    switch(overlayType) {
      case "startGame":
        overlayTitle.innerHTML = "PRESS START WHEN YOU ARE READY";
        overlaySubtitle.innerHTML = "";
        startGameButton.style.display = "block"
        break;
      case "timeOver":
        disableInput();
        timeOverFlag = true;
        overlayTitle.innerHTML = "TIME OVER";
        overlayTitle.innerHTML = "YOU DIDN'T MAKE IT IN TIME!";
        showSolutionButton.style.display = "block";
        goNextRoundButton.style.display = "block"
        break;
      case "goodGuess":
        disableInput();
        goodGuessFlag = true;
        overlayTitle.innerHTML = "GOOD GUESS";
        overlaySubtitle.innerHTML = "YOU ARE A BOSS!";        
        showSolutionButton.style.display = "block";
        goNextRoundButton.style.display = "block"
        break;
      case "gameOver":
        disableInput();
        overlayTitle.innerHTML = "GAME OVER";
        overlaySubtitle.style.display = "none";
        scoreLabel.style.display = "flex";
        scoreLabel.innerHTML = "TOTAL SCORE: " + totalScore;
        goNextRoundButton.innerHTML = "MAIN MENU";
        goNextRoundButton.style.display = "block";
        break;
    case "hide":
        overlayPanel.style.display = "none"
        break;    
    default: console.log("Error: overlayType '" + overlayType + "' does not exist.")
    }
  }

export { isInputDisabled };