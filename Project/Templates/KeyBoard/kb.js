// IMPORTAZIONI E CONFIGURAZIONE INIZIALE -----------------------------------------------------------------------------
import PianoController from "./controller.js";
import { generateRandomChord } from "./chord.js";

// Costanti e configurazione globale
const firstNote = 48;
const keysNumber = 25;
const lastNote = firstNote + keysNumber;
const deductionInterval = 30; 
const hintInterval = 30;

// Variabili globali
let piano = new PianoController("piano", keysNumber, firstNote);
let previousPressedNotes = [];
let totalScore = 0;
let currentScore = 100;
let pointsToDeduct = 25;
let timeLeft;
let timeLeftSolution;
let timerInterval;
let timerIntervalSolution;
let isRoundActive = false;
let activeRoundID = 0;
let maxRounds = 2;
let guidedMode = false; 
let selectedLevel = localStorage.getItem("Difficulty");
let selectedMinigame = localStorage.getItem("Gamemode"); // Chords o Harmony
let practiceModeFlag = localStorage.getItem("Practice"); // Game o Practice
let generatedChordData = {};
let generatedChord = [];
let hintTimer = 0;
let flagHints; 
let isShowingHint;
let isAssistanONDisabled;
let isInputDisabled = false; // Variabile di controllo per abilitare/disabilitare gli input
let assistantFlag = false;
let flagHintsPoint = [false, false, false];
let percAssistant = 50;

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
const startGameButton = document.getElementById("startGame");
const showSolutionButton = document.getElementById("showSolution");
const goNextRoundButton = document.getElementById("goNextRound");
const scoreDivisionLabel = document.getElementById("scoreDivisionLabel");
const toggleGuidedModeButton = document.getElementById("toggleGuidedMode");
const levelDisplay = document.getElementById("level");
const modeDisplay = document.getElementById("mode");
const playSolutionButton = document.getElementById("playSolutionButton");
const hintButton = document.getElementById("hintButton");
const hintDisplay = document.getElementById("hintDisplay");
const solutionDiv = document.getElementById("overlaySolution");
const hideSolutionButton = document.getElementById("hideSolution");

// CONFIGURAZIONE INIZIALE DELLA PAGINA -------------------------------------------------------------------------------
scoreDisplay.className = "score";
timerDisplay.className = "timer";
updateScoreDisplay();
updateTimerDisplay();
updateLevelDisplay();
updateModeDisplay();

// EVENT LISTENERS ----------------------------------------------------------------------------------------------------
// Avvio del gioco e passaggio al prossimo round
startGameButton.addEventListener("click", () => {
    handleOverlayDisplay("hide");
    if (!isRoundActive) startRound();
    console.log(selectedMinigame);
});

showSolutionButton.addEventListener("click", () => {
    handleOverlayDisplay("hide")
    solutionDiv.style.display = "flex";
    piano.playChord(generatedChord);
    generatedChord.forEach(note => {
        piano.view.setKeyColor(note, "green");
    });
});

hideSolutionButton.addEventListener("click", () => {
    handleOverlayDisplay("timeOver");
    solutionDiv.style.display = "none";
    generatedChord.forEach(note => {
        piano.view.resetKeyColor(note)
    });
})

goNextRoundButton.addEventListener("click", () => {
    isAssistanONDisabled = toggleGuidedModeButton.textContent === "ASSISTANT MODE ON" ? true : false;
    if (isAssistanONDisabled){
        guidedMode = !guidedMode;
        toggleGuidedModeButton.textContent = !guidedMode ? "ASSISTANT MODE OFF" : "ASSISTANT MODE ON";
    }
    if (activeRoundID < maxRounds + 1) {
        startRound();
        handleOverlayDisplay("hide");
    }else if (activeRoundID == maxRounds + 1) {
        handleOverlayDisplay("gameOver");
        activeRoundID++;
    } else {
        window.location.href = "../../gameTitleScreen.html";
    }
});

// Riproduzione della soluzione
playSolutionButton.addEventListener("click", () => {
    if (isInputDisabled) return; // Ignora il click se il tasto è disabilitato

    disableInput();
    clearInterval(timerIntervalSolution);
    timeLeftSolution = 2;
    timerIntervalSolution = setInterval( () => {
        timeLeftSolution--;
        if (timeLeftSolution <= 0) enableInput();
    }, 1000);
    piano.playChord(generatedChord); // Riproduce il tuo accordo
});

// Gestione degli hint
hintButton.addEventListener("click", () => {
    if (isInputDisabled) return; // Ignora gli input se disabilitati

    if (hintTimer >= hintInterval) updateHints();
});

// Gestione modalità guidata
toggleGuidedModeButton.addEventListener("click", () => {
    assistantFlag = true;
    guidedMode = !guidedMode;
    toggleGuidedModeButton.textContent = !guidedMode ? "ASSISTANT MODE OFF" : "ASSISTANT MODE ON";
});

// Mappatura tastiera
document.addEventListener("keydown", (event) => {
    if (isInputDisabled) return; // Ignora gli input se disabilitati
    const note = piano.view.keyMap[event.code];
    if (note !== undefined) checkChord();
});

document.addEventListener("mousedown", (event) =>{
    const pressedNotes = piano.getPressedNotes();
    if (guidedMode) piano.view.setKeyColor(pressedNotes, generatedChord.includes(pressedNotes[0]) ? "green" : "red"); 
})


// FUNZIONI PRINCIPALI -----------------------------------------------------------------------------------------------
function startRound() {
    isRoundActive = true;
    activeRoundID++;
    startTimer();
    enableInput();
    piano.init();
    if (selectedMinigame === "chords_GM") generateNewChord();
    else if (selectedMinigame === "harmony_GM") /*funzione harmonia*/;
}

function generateNewChord() {
    do {
        generatedChordData = generateRandomChord(firstNote, selectedLevel);
        generatedChord = generatedChordData.midiNotes.sort();
    } while(generatedChord[generatedChord.length - 1] > lastNote);
    piano.playChord(generatedChord);

}

function checkChord() {
    const pressedNotes = piano.getPressedNotes();
    if (guidedMode) handleGuidedMode(pressedNotes);
    if (pressedNotes.length >= 3) {
        if (arraysEqual(pressedNotes, previousPressedNotes)) return;
        previousPressedNotes = [...pressedNotes];
        console.log("Premute:", pressedNotes);
        console.log("Da indovinare:", generatedChord.sort());
        if (arraysEqual(generatedChord, pressedNotes)) handleCorrectGuess();
    }
}

function handleCorrectGuess() {
    clearInterval(timerInterval);
    if (assistantFlag) currentScore *= (1 - percAssistant / 100);
    if (flagHintsPoint[2]) currentScore -= 15;
    if (flagHintsPoint[1]) currentScore -= 8;
    if (flagHintsPoint[0]) currentScore -= 2;
    totalScore += currentScore;
    updateScoreDisplay();
    isRoundActive = false;
    handleOverlayDisplay("goodGuess");
}

function handleGuidedMode(pressedNotes) {
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
    hintDisplay.textContent = "PLAY IT!";
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    timeLeft--;
    hintTimer++;
    updateTimerDisplay();

    // Deduzione del punteggio a intervalli regolari
    if (timeLeft % deductionInterval === 0 && timeLeft > 0) {
        currentScore = Math.max(0, currentScore - pointsToDeduct);
    }

    // Gestione automatica degli hint
    for (let i = 0; i < flagHints.length; i++) {
        if (hintTimer >= hintInterval * (i + 1) && flagHints[i]) {
            flagHints[i] = false; // Disabilita il flag corrente

            // Aggiorna il display con il messaggio di hint disponibile
            if (i === 0) hintDisplay.textContent = "1st HINT AVAILABLE";
            if (i === 1) hintDisplay.textContent = "2nd HINT AVAILABLE";
            if (i === 2) hintDisplay.textContent = "3rd HINT AVAILABLE";

            // Il pulsante deve sempre restare su "SHOW HINT" per i nuovi hint disponibili
            hintButton.textContent = "SHOW HINT";
        }
    }

    // Controllo fine round
    if (timeLeft <= 0) endRound();
}

function updateHints() {
    let currentHint = 0;

    // Determina l'hint attuale in base al timer
    if (hintTimer >= hintInterval * 3) {
        currentHint = 3;
    } else if (hintTimer >= hintInterval * 2) {
        currentHint = 2;
    } else if (hintTimer >= hintInterval) {
        currentHint = 1;
    }

    // Determina se si sta mostrando o nascondendo l'hint
    isShowingHint = hintButton.textContent === "SHOW HINT";

    if (isShowingHint) {
        // Mostra l'hint corrente
        switch (currentHint) {
            case 1:
                flagHintsPoint[0] = true;
                hintDisplay.textContent = `Root ${generatedChordData.noteRoot}`;
                break;
            case 2:
                flagHintsPoint[1] = true;
                hintDisplay.textContent = `${generatedChordData.noteRoot}${generatedChordData.chordType}`;
                break;
            case 3:
                flagHintsPoint[2] = true;
                hintDisplay.textContent = `${generatedChordData.noteRoot}${generatedChordData.chordType}\nin ${generatedChordData.inversion}`;
                break;
        }
        hintButton.textContent = "HIDE HINT";
    } else {
        // Nasconde l'hint corrente e mostra che è disponibile
        switch (currentHint) {
            case 1:
                hintDisplay.textContent = "1st HINT HIDDEN, IT'S STILL AVAILABLE.";
                break;
            case 2:
                hintDisplay.textContent = "2nd HINT HIDDEN, IT'S STILL AVAILABLE.";
                break;
            case 3:
                hintDisplay.textContent = "3rd HINT HIDDEN, IT'S STILL AVAILABLE.";
                break;
        }
        hintButton.textContent = "SHOW HINT";
    }
}

function endRound() {
    handleOverlayDisplay("timeOver");
    clearInterval(timerInterval);
    isRoundActive = false;
}

// Funzione per disabilitare gli input
function disableInput() {
    isInputDisabled = true;
}

// Funzione per abilitare gli input
function enableInput() {
    isInputDisabled = false;
}

// AGGIORNAMENTO INTERFACCIA -----------------------------------------------------------------------------------------
function updateScoreDisplay() {
    scoreDisplay.innerHTML = "CURRENT SCORE: " + `${totalScore}`;
}

function updateTimerDisplay() {
    timerDisplay.innerHTML = `${timeLeft}s`;
}

function updateModeDisplay() {
    modeDisplay.innerHTML = "GAMEMODE: " + userLegend[selectedMinigame]
}

function updateLevelDisplay() {
    levelDisplay.innerHTML = "DIFFICULTY: " + userLegend[selectedLevel];
}

// UTILITY -----------------------------------------------------------------------------------------------------------
function arraysEqual(arr1, arr2) {
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();
    return JSON.stringify(sortedArr1) === JSON.stringify(sortedArr2);
}

function handleOverlayDisplay(overlayType) {
    // Default settings
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
        overlayTitle.innerHTML = "TIME OVER";
        overlaySubtitle.innerHTML = "YOU DIDN'T MAKE IT IN TIME!";
        showSolutionButton.style.display = "block";
        goNextRoundButton.style.display = "block"
        break;
      case "goodGuess":
        disableInput();
        overlayTitle.innerHTML = "GOOD GUESS";
        overlaySubtitle.innerHTML = "YOU ARE A BOSS!";
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
      default:
        console.log("Error: overlayType '" + overlayType + "' does not exist.")
    }
  }

export { isInputDisabled };