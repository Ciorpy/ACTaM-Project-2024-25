// IMPORTAZIONI E CONFIGURAZIONE INIZIALE -----------------------------------------------------------------------------
import PianoController from "./controller.js";
import { generateRandomChord } from "./chord.js";

// Costanti e configurazione globale
const firstNote = 48;
const keysNumber = 25;
const lastNote = firstNote + keysNumber;
const pointsToDeduct = 25;
const deductionInterval = 30; 
const hintInterval = 30;

// Variabili globali
let piano = new PianoController("piano", keysNumber, firstNote);
let previousPressedNotes = [];
let totalScore = 0;
let currentScore = 100;
let timeLeft;
let timerInterval;
let isRoundActive = false;
let activeRoundID = 0;
let maxRounds = 2;
let guidedMode = false; 
let selectedLevel = localStorage.getItem("Difficulty");
let selectedMinigame = localStorage.getItem("Gamemode");
let practiceModeFlag = localStorage.getItem("Practice");
let generatedChordData = {};
let generatedChord = [];
let hintTimer = 0;
let flagHintsButton;
let flagHintsAuto; 
let isShowingHint;

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
const goNextRoundButton = document.getElementById("goNextRound");
const scoreDivisionLabel = document.getElementById("scoreDivisionLabel");
const toggleGuidedModeButton = document.getElementById("toggleGuidedMode");
const levelDisplay = document.getElementById("level");
const playSolutionButton = document.getElementById("playSolutionButton");
const hintButton = document.getElementById("hintButton");
const hintDisplay = document.getElementById("hintDisplay");

// CONFIGURAZIONE INIZIALE DELLA PAGINA -------------------------------------------------------------------------------
scoreDisplay.className = "score";
timerDisplay.className = "timer";
updateScoreDisplay();
updateTimerDisplay();
updateLevelDisplay();

// EVENT LISTENERS ----------------------------------------------------------------------------------------------------
// Gestione modalità guidata
toggleGuidedModeButton.addEventListener("click", () => {
    guidedMode = !guidedMode;
    toggleGuidedModeButton.textContent = !guidedMode ? "ASSISTANT MODE OFF" : "ASSISTANT MODE ON";
});

// Avvio del gioco e passaggio al prossimo round
startGameButton.addEventListener("click", () => {
    handleOverlayDisplay("hide");
    if (!isRoundActive) startRound();
    console.log(selectedMinigame);
});

goNextRoundButton.addEventListener("click", () => {
    if (activeRoundID < maxRounds) {
        startRound();
        handleOverlayDisplay("hide");
        piano.init();
    } else {
        window.location.href = "../../gameTitleScreen.html";
    }
});

// Riproduzione della soluzione
playSolutionButton.addEventListener("click", () => {
    if (generatedChord.length > 0) {
        piano.playChord(generatedChord);
        console.log("Accordo riprodotto:", generatedChord);
    } else {
        console.log("Nessun accordo da riprodurre");
    }
});

// Gestione degli hint
hintButton.addEventListener("click", () => {
    if (hintTimer >= hintInterval) updateHints();
});

// Mappatura tastiera
document.addEventListener("keydown", (event) => {
    const note = piano.view.keyMap[event.code];
    if (note !== undefined) checkChord();
});

// FUNZIONI PRINCIPALI -----------------------------------------------------------------------------------------------
function startRound() {
    isRoundActive = true;
    activeRoundID++;
    generateNewChord();
    startTimer();
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
    totalScore += currentScore;
    updateScoreDisplay();
    isRoundActive = false;

    if (activeRoundID < maxRounds) {
        handleOverlayDisplay("goodGuess");
    } else {
        handleOverlayDisplay("gameOver");
    }
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
    flagHintsButton = false;
    flagHintsAuto = [true, true, true];
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
    for (let i = 0; i < flagHintsAuto.length; i++) {
        if (hintTimer >= hintInterval * (i + 1) && flagHintsAuto[i]) {
            flagHintsAuto[i] = false; // Disabilita il flag corrente

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
    const isShowingHint = hintButton.textContent === "SHOW HINT";

    if (isShowingHint) {
        // Mostra l'hint corrente
        switch (currentHint) {
            case 1:
                hintDisplay.textContent = `Root ${generatedChordData.noteRoot}`;
                break;
            case 2:
                hintDisplay.textContent = `${generatedChordData.noteRoot}${generatedChordData.chordType}`;
                break;
            case 3:
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
    if (activeRoundID < maxRounds) {
        handleOverlayDisplay("timeOver");
    } else {
        handleOverlayDisplay("gameOver");
    }

    clearInterval(timerInterval);
    isRoundActive = false;
}

// AGGIORNAMENTO INTERFACCIA -----------------------------------------------------------------------------------------
function updateScoreDisplay() {
    scoreDisplay.textContent = `CURRENT SCORE: ${totalScore}`;
}

function updateTimerDisplay() {
    timerDisplay.textContent = `REMAINING TIME: ${timeLeft}s`;
}

function updateLevelDisplay() {
    levelDisplay.textContent = `CHORDS DIFFICULTY: ${userLegend[selectedLevel]}`;
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
    goNextRoundButton.style.display = "none";
    
    switch(overlayType) {
      case "startGame":
        startGameButton.style.display = "block"
        break;
      case "timeOver":
        goNextRoundButton.style.display = "block"
        overlayTitle.innerHTML = "ROUND OVER \n TIME IS OVER"
        break;
      case "goodGuess":
          overlayTitle.innerHTML = "ROUND OVER\nYOU GUESSED RIGHT!"
          goNextRoundButton.style.display = "block"
          break;
      case "gameOver":
        overlayTitle.innerHTML = "GAME OVER"
        scoreLabel.style.display = "flex"
        goNextRoundButton.style.display = "block"
        goNextRoundButton.innerHTML = "MAIN MENU"
        break;
      case "hide":
        overlayPanel.style.display = "none"
        break;
      default:
        console.log("Error: overlayType '" + overlayType + "' does not exist.")
    }
  }
