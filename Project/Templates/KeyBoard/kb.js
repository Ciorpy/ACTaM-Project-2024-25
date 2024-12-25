// -------------------------------------------------------------------------------------------------------------------------------------------------

// IMPORTS -----------------------------------------------------------------------------------------------------------------------------------------

// Piano in model, view, control
import PianoController from "./controller.js";

// Games function
import { generateRandomChord, recognizeChordMIDI, generateChordPattern } from "./chord&harmony.js";

// Multiplayer and Database
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { app } from "../../../firebase.js";

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------

// Keys and Piano Object
const firstNote = 48;
const keysNumber = 25;
const lastNote = firstNote + keysNumber;
const piano = new PianoController("piano", keysNumber, firstNote);

// Intervals (Waiting time)
const deductionInterval = 30; 
const hintInterval = 30;
const assistantInterval = 60;

// Points manage
const pointsToDeduct = 25;
const percAssistant = 30;

// Default things
const defaultRounds = 3;
const defaultEffectsVolume = 0.5;

// Multiplayer
const auth = getAuth(app);
const db = getDatabase(app);

// Legend
const userLegend = {
    chords_GM: "CHORDS",
    harmony_GM: "HARMONY",
    easyDiff: "EASY",
    mediumDiff: "MEDIUM",
    hardDiff: "HARD"
};

// Effects
const effectsFiles = [
    "/Project/Sounds/Effects/game-start.mp3",
    "/Project/Sounds/Effects/game-bonus.mp3",
    "/Project/Sounds/Effects/game-over.mp3",
    "/Project/Sounds/Effects/fail.mp3",
    "/Project/Sounds/Effects/game-finished.mp3"
];

// VARIABLES ---------------------------------------------------------------------------------------------------------------------------------------

// Game info
let totalScore = 0;
let currentScore;
let timeLeft;
let timerInterval;
let hintTimer;
let maxRounds;
let activeRoundID = 0;
let result;
let delay;
let effectsvol;

// Flags
let isRoundActive = false;
let assistantMode = false;
let assistantAvailable;
let assistantPoint;
let isInputDisabled;
let flagHintsPoint;
let flagHints; 
let timeOverFlag;
let goodGuessFlag;
let doIt;

// Games
let previousPressedNotes;
let generatedChordData;
let chordData;
let missingChordDetails;
let missingChord;
let progressionData;
let generatedChordsData;
let generatedCadencesData;

// Multiplayer
let playersRef;
let playerScoreRef;
let gameStructureRef;
let updateRankingInterval;

// Effects
let preloadedEffects = [];

// DOC ELEMENTS ------------------------------------------------------------------------------------------------------------------------------------
const selectedLevel = localStorage.getItem("Difficulty");
const selectedMinigame = localStorage.getItem("Gamemode");
const scoreDisplay = document.getElementById("scoreDisplay");
const timerDisplay = document.getElementById("timerDisplay");
const overlayPanel = document.getElementById("overlayDiv");
const scoreLabel = document.getElementById("scoreLabel");
const scoreDivisionLabel = document.getElementById("scoreDivisionLabel");
const overlayTitle = document.getElementById("overlayTitle");
const overlaySubtitle = document.getElementById("overlaySubtitle");
const overlayTitleSolution = document.getElementById("overlayTitleSolution");
const overlaySubtitleSolution = document.getElementById("overlaySubtitleSolution");
const levelDisplay = document.getElementById("level");
const modeDisplay = document.getElementById("mode");
const roundDisplay = document.getElementById("round");
const hintDisplay = document.getElementById("hintDisplay");
const startGameButton = document.getElementById("startGame");
const showSolutionButton = document.getElementById("showSolution");
const goNextRoundButton = document.getElementById("goNextRound");
const assistantModeButton = document.getElementById("toggleAssistantModeButton");
const playSolutionButton = document.getElementById("playSolutionButton");
const hideSolutionButton = document.getElementById("hideSolution");
const mainMenuButton = document.getElementById("mainMenu"); 
const hintButton = document.getElementById("hintButton");
const solutionDiv = document.getElementById("overlaySolution");
const practiceModeFlag = localStorage.getItem("Practice") == "true" ? true : false;
const multiplayerflag = localStorage.getItem("multiplayerFlag") == "true" ? true : false;
const userID = localStorage.getItem("userID");
const lobbyName = localStorage.getItem("lobbyName");
const rankingTable = document.getElementById("rankingTable");
const placementDisplay = document.getElementById("currentPlacement");
const isHost = localStorage.getItem("isHost") == "true" ? true : false;
const loadedRounds = (multiplayerflag) ? parseInt(localStorage.getItem("numberRoundsMP")) : parseInt(localStorage.getItem("numberOfRounds")); 
const loadedEffectsVolume = parseFloat(localStorage.getItem("effectsVolume"));

// CONFIGURATION ------------------------------------------------------------------------------------------------------------------------------

// Piano
piano.init();

if (!practiceModeFlag) {
    // Variables
    maxRounds = !isNaN(loadedRounds) ? loadedRounds : defaultRounds;
    effectsvol = !isNaN(loadedEffectsVolume) ? loadedEffectsVolume : defaultEffectsVolume;
    effectsvol = Math.min(Math.max(effectsvol, 0), 1);


    playersRef = ref(db, `lobbies/${lobbyName}/players`);
    playerScoreRef = ref(db,`lobbies/${lobbyName}/players/${userID}/score`);
    gameStructureRef = ref(db, `lobbies/${lobbyName}/gameStructure`);
    updateRankingInterval = setInterval(updateRanking, 100);

    // Effects
    effectsFiles.forEach((file, index) => {
        const effect = new Audio(file);
        effect.volume = effectsvol;
        preloadedEffects[index] = effect;
    });
}

// Page
if (!practiceModeFlag) {
    mainMenuButton.style.display = "none";
    handleOverlayDisplay("startGame");
    updateScoreDisplay();
    updateTimerDisplay();
    updateLevelDisplay();
    updateModeDisplay();
    updateRoundDisplay();
    preloadedEffects[0].play();
} else {
    handleOverlayDisplay("hide");
    enableInput();
    startGameButton.style.display = "none";
    playSolutionButton.style.display = "none";
    hintButton.style.display = "none";
    roundDisplay.style.display = "none";
    assistantModeButton.style.display = "none";
    mainMenuButton.style.display = "block";
    mainMenuButton.style.textAlign = "center";
    roundDisplay.style.display = "none";
    scoreDisplay.style.display = "none";
    timerDisplay.style.display = "none";
    hintDisplay.style.padding = "0px";
    hintDisplay.style.fontSize = "4vh";
    levelDisplay.style.fontSize = "4vh";
    levelDisplay.style.marginBottom = "0px";
    levelDisplay.innerHTML = "JUST HAVE FUN! CHORDS PLAYED WILL BE RECOGNIZED"
    if (multiplayerflag) placementDisplay.style.display = "flex";
}

// EVENT LISTENERS ---------------------------------------------------------------------------------------------------------------------------------

// Overlay Buttons
startGameButton.addEventListener("click", () => {
    if(multiplayerflag && !isHost && !generatedChordsData.length) handleOverlayDisplay("wait");
    else handleOverlayDisplay("hide");
    updateRoundDisplay();
    if (!isRoundActive) startRound();
});
 
showSolutionButton.addEventListener("click", () => {
    handleOverlayDisplay("hide")
    solutionDiv.style.display = "flex";
    if (selectedMinigame === "chords_GM") {
        overlayTitleSolution.innerHTML = "IT'S A " + `${generatedChordData.noteRoot}${generatedChordData.chordType} IN ${generatedChordData.inversion}`;
        overlaySubtitleSolution.innerHTML = "";
        piano.playChord(generatedChordData.midiNotes);
        generatedChordData.midiNotes.forEach(note => {
            piano.view.setKeyColor(note, "green");
        });
    } else if (selectedMinigame === "harmony_GM") {
        overlayTitleSolution.innerHTML = "IT'S A " + `${progressionData.name}` + " IN " + `${missingChordDetails.noteRoot}${missingChordDetails.chordType}`;
        overlaySubtitleSolution.innerHTML = `${result} - ${missingChordDetails.noteRoot}${missingChordDetails.chordType}`;
        playProgression(progressionData, missingChord);
        setTimeout(() => {
            missingChord.forEach(note => {
                piano.view.setKeyColor(note, "green");
            });
        }, delay);
    }
});

hideSolutionButton.addEventListener("click", () => {
    handleOverlayDisplay("hide");
    if (timeOverFlag) handleOverlayDisplay("timeOver");
    if (goodGuessFlag) handleOverlayDisplay("goodGuess");
    solutionDiv.style.display = "none";
    if (selectedMinigame === "chords_GM") generatedChordData.midiNotes.forEach(note => {
        piano.view.resetKeyColor(note)
    });
    else if (selectedMinigame === "harmony_GM") missingChord.forEach(note => {
        piano.view.resetKeyColor(note)
    });
})

goNextRoundButton.addEventListener("click", () => {
    updateRoundDisplay();
    let isAssistanON = assistantModeButton.textContent === "ASSISTANT MODE ON" ? true : false;
    if (isAssistanON){
        assistantMode = !assistantMode;
        assistantModeButton.textContent = !assistantMode ? "ASSISTANT MODE OFF" : "ASSISTANT MODE ON";
    }
    if (activeRoundID < maxRounds) {
        startRound();
        handleOverlayDisplay("hide");
    }else if (activeRoundID == maxRounds) {
        handleOverlayDisplay("gameOver");
        activeRoundID++;
        preloadedEffects[4].play();
    } else {
        window.location.href = "../../gameTitleScreen.html";
    }
});

// Game Buttons
playSolutionButton.addEventListener("click", () => {
    if (selectedMinigame === "chords_GM") piano.playChord(generatedChordData.midiNotes);
    else if (selectedMinigame === "harmony_GM") playProgression(progressionData);
});

hintButton.addEventListener("click", () => {
    if (hintTimer >= hintInterval) updateHints();
});

assistantModeButton.addEventListener("click", () => {
    if (assistantAvailable) {
        assistantPoint = true;
        assistantMode = !assistantMode;
        assistantModeButton.textContent = !assistantMode ? "ASSISTANT MODE OFF" : "ASSISTANT MODE ON";
    }
});

// Practice Mode Button
mainMenuButton.addEventListener("click", () => {
    window.location.href = "../../gameTitleScreen.html";
});

// Piano
document.addEventListener("keydown", (event) => {
    if (isInputDisabled) return; 
    const note = piano.view.keyMap[event.code];
    if (note !== undefined && !practiceModeFlag) checkChord();
    else if (note !== undefined && practiceModeFlag) identifyChord();
});

document.addEventListener("keyup", () => {
    if (practiceModeFlag) hintDisplay.textContent = "";
});

document.addEventListener("mousedown", (event) => { 
    if (isInputDisabled) return;
    const keyElement = event.target.closest(".key");
    if (!keyElement) return;
    const midiNote = parseInt(keyElement.dataset.midiNote);
    if (selectedMinigame === "chords_GM" && assistantMode) {
        piano.view.setKeyColor(
            midiNote,
            generatedChordData.midiNotes.includes(midiNote) ? "green" : "red",
            true
        );
    } else if (selectedMinigame === "harmony_GM" && assistantMode) {
        piano.view.setKeyColor(
            midiNote,
            missingChord.includes(midiNote) ? "green" : "red",
            true
        );
    }
});

// FUNCTIONS ---------------------------------------------------------------------------------------------------------------------------------------

// Start - Set - End
function startRound() {
    if (practiceModeFlag) return;
    resetVariables();
    resetButtons();
    startTimer();
    enableInput();
    if (selectedMinigame === "chords_GM") {
        if (multiplayerflag) {
            if (isHost && (!generatedChordsData.length)) generateChordsForRounds();
            startMultiplayerRound();
        } else generateNewChord(); 
    } else if (selectedMinigame === "harmony_GM") {
        if (multiplayerflag) {
            if (isHost && (!generatedCadencesData.length)) generateCadencesForRounds();
            startMultiplayerRound();
        } else generateNewProgression();
    }
}

function resetVariables() {
    if (practiceModeFlag) return;
    currentScore = 100;
    activeRoundID++;
    result = "";
    delay = 0;
    assistantAvailable = false;
    assistantPoint = false;
    flagHintsPoint = [false, false, false];
    flagHints = [true, true, true]; 
    timeOverFlag = false;
    goodGuessFlag = false;
    doIt = true;
    previousPressedNotes = [];
    generatedChordData = {};
    chordData = {};
    missingChordDetails = {};
    missingChord = [];
    progressionData = {};
    if (multiplayerflag) generatedChordsData = [];
    if (multiplayerflag) generatedCadencesData = [];
}

function resetButtons() {
    if (practiceModeFlag) return;
    hintDisplay.textContent = "";
    hintButton.textContent = "HINT BLOCKED";
    hintButton.classList.add('no-hover');
    hintButton.classList.add('notSelectable');
    assistantModeButton.textContent = "ASSISTANT BLOCKED";
    assistantModeButton.classList.add('no-hover');
    assistantModeButton.classList.add('notSelectable');
}

function handleCorrectGuess() {
    if (practiceModeFlag) return;
    handleOverlayDisplay("goodGuess");
    clearInterval(timerInterval);
    if (assistantPoint) currentScore *= (1 - percAssistant / 100);
    if (flagHintsPoint[2]) currentScore -= 12;
    if (flagHintsPoint[1]) currentScore -= 8;
    if (flagHintsPoint[0]) currentScore -= 4;
    if (currentScore >= 0) totalScore += Math.floor(currentScore);
    else totalScore += 0;
    updateScoreDisplay();
    if (multiplayerflag) updateScoreInDatabase();
    isRoundActive = false;
    preloadedEffects[1].play();
}

function endRound() {
    if (practiceModeFlag) return;
    handleOverlayDisplay("timeOver");
    clearInterval(timerInterval);
    isRoundActive = false;
    preloadedEffects[2].play();
}

// Timer
function startTimer() {
    if (practiceModeFlag) return;
    clearInterval(timerInterval);
    timeLeft = 120;
    hintTimer = 0;
    updateTimerDisplay();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    if (practiceModeFlag) return;
    timeLeft--;
    hintTimer++;
    updateTimerDisplay();
    if (timeLeft % deductionInterval === 0 && timeLeft > 0) {
        currentScore = Math.max(0, currentScore - pointsToDeduct);
    }
    hintsToShow()
    assistantoToShow();
    if (timeLeft <= 0) endRound();
}

// Games
function generateNewChord() {
    if (practiceModeFlag) return;
    generatedChordData = generateRandomChord(firstNote, lastNote, selectedLevel);
    piano.playChord(generatedChordData.midiNotes);
}

function checkChord() {
    if (practiceModeFlag) return;
    const pressedNotes = piano.getPressedNotes();
    if (assistantMode) handleAssistantMode(pressedNotes);
    if (pressedNotes.length < 3) return;
    if (selectedMinigame === "chords_GM"){
        if (arraysEqual(pressedNotes, previousPressedNotes)) return;
        previousPressedNotes = [...pressedNotes];
        if (arraysEqual(generatedChordData.midiNotes, pressedNotes)) handleCorrectGuess();
    } else if (selectedMinigame === "harmony_GM") {
        const expectedNotes = missingChord;
        if (arraysEqual(pressedNotes, expectedNotes)) {handleCorrectGuess();}
    }
}

function arraysEqual(arr1, arr2) {
    if (practiceModeFlag) return;
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();
    return JSON.stringify(sortedArr1) === JSON.stringify(sortedArr2);
}

function generateNewProgression() {
    if (practiceModeFlag) return;
    progressionData = generateChordPattern(firstNote, lastNote, selectedLevel);
    missingChordDetails = progressionData.missingChordData;
    missingChord = missingChordDetails.midiNotes
    playProgression(progressionData);
    updateResult()
}

function updateResult() {
    if (practiceModeFlag) return;
    let r = ""
    if (selectedMinigame === "harmony_GM") {
        let i = 0;
        do {
            r += `${progressionData.progressionDetails[i].noteRoot}${progressionData.progressionDetails[i].chordType}`;
            r += " - ";
            i++;
        } while (i < progressionData.progressionDetails.length - 1)
    }
    result = r.slice(0, -2);
}

function playProgression(progressionData, missingChord = null) { 
    if (practiceModeFlag) return;
    delay = 0;
    progressionData.progressionDetails.forEach(chord => {
        if (chord) {
            setTimeout(() => {
                piano.playChord(chord.midiNotes);
            }, delay);
            delay += 1000;
        }
    });
    if (missingChord) {
        setTimeout(() => {
            piano.playChord(missingChord);
        }, delay);
    }
}

function identifyChord() {
    if (!practiceModeFlag) return;
    const pressedNotes = piano.getPressedNotes().sort();
    if (pressedNotes.length >= 3) {
        chordData = recognizeChordMIDI(pressedNotes);
        updateHints();
    } else {
        hintDisplay.innerHTML = "";
    } 
}

// Hints
function hintsToShow() {
    if (practiceModeFlag) return;
    for (let i = 0; i < flagHints.length; i++) {
        if (hintTimer >= hintInterval * (i + 1) && flagHints[i]) {
            flagHints[i] = false;
            if (i === 0) {
                hintButton.classList.remove('no-hover');
                hintButton.classList.remove('notSelectable');
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
        let isShowingHint = hintButton.textContent === "SHOW HINT";
        if (isShowingHint) {
            switch (currentHint) {
                case 1:
                    flagHintsPoint[0] = true;
                    if (selectedMinigame === "chords_GM") hintDisplay.textContent = `ROOT ${generatedChordData.noteRoot}`;
                    else if (selectedMinigame === "harmony_GM") hintDisplay.textContent = `FIRST CHORD: 
                        ${progressionData.progressionDetails[0].noteRoot}${progressionData.progressionDetails[0].chordType}`; 
                    break;
                case 2:
                    flagHintsPoint[1] = true;
                    if (selectedMinigame === "chords_GM") hintDisplay.textContent = `${generatedChordData.noteRoot}${generatedChordData.chordType}`;
                    else if (selectedMinigame === "harmony_GM") hintDisplay.textContent = `CHORDS PLAYED: ${result}`; 
                    break;
                case 3:
                    flagHintsPoint[2] = true;
                    if (selectedMinigame === "chords_GM") hintDisplay.textContent = `${generatedChordData.noteRoot}${generatedChordData.chordType} IN ${generatedChordData.inversion}`;
                    else if (selectedMinigame === "harmony_GM") hintDisplay.textContent = `COMPLETE PROGRESSION: ${result} - ${missingChordDetails.noteRoot}${missingChordDetails.chordType}`; 
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

// Assistant Mode
function assistantoToShow() {
    if (practiceModeFlag) return;
    if (timeLeft <= assistantInterval && doIt) {
        assistantAvailable = true;
        assistantModeButton.classList.remove('no-hover');
        assistantModeButton.classList.remove('notSelectable');
        assistantModeButton.textContent = !assistantMode ? "ASSISTANT MODE OFF" : "ASSISTANT MODE ON";
        doIt = false;
    }
}

function handleAssistantMode(pressedNotes) {
    if (practiceModeFlag) return;
    const currentColorNotes = new Set(pressedNotes);
    if (selectedMinigame === "chords_GM") pressedNotes.forEach(note => {
            piano.view.setKeyColor(note, generatedChordData.midiNotes.includes(note) ? "green" : "red");
        });
    else if (selectedMinigame === "harmony_GM") pressedNotes.forEach(note => {
        piano.view.setKeyColor(note, missingChord.includes(note) ? "green" : "red");
    });
    for (let i = firstNote; i <= lastNote; i++) {
        if (!currentColorNotes.has(i)) piano.view.resetKeyColor(i);
    }
}

// Interface
function updateScoreDisplay() {
    if (practiceModeFlag) return;
    scoreDisplay.innerHTML = "CURRENT SCORE: " + `${totalScore}`;
}

function updateTimerDisplay() {
    if (practiceModeFlag) return;
    timerDisplay.innerHTML = "REMAINING TIME: " + `${timeLeft}s`;
}

function updateModeDisplay() {
    if (practiceModeFlag) return;
    modeDisplay.innerHTML = userLegend[selectedMinigame]
}

function updateLevelDisplay() {
    if (practiceModeFlag) return;
    levelDisplay.innerHTML = "   DIFFICULTY " + userLegend[selectedLevel];
}

function updateRoundDisplay() {
    if (practiceModeFlag) return;
    let roundShowed = activeRoundID + 1; 
    roundDisplay.innerHTML = "   ROUND " + roundShowed;
}

// Utility
function handleOverlayDisplay(overlayType) {
    if (practiceModeFlag) return;
    overlayPanel.style.display = "flex";
    scoreLabel.style.display = "none";
    scoreDivisionLabel.style.display = "none";
    startGameButton.style.display = "none";
    showSolutionButton.style.display = "none";    
    goNextRoundButton.style.display = "none";
    
    switch(overlayType) {
      case "startGame":
        overlayPanel.style.display = "flex";
        overlayTitle.style.display = "flex";
        overlaySubtitle.style.display = "flex";
        scoreLabel.style.display = "none";
        if (selectedMinigame === "chords_GM") overlayTitle.innerHTML = "RECOGNIZE CHORD AND PLAY IT";
        else if (selectedMinigame === "harmony_GM") overlayTitle.innerHTML = "RESOLVE CHORD CADENCES PLAYING MUTED LAST CHORD";
        overlaySubtitle.innerHTML = "PRESS START";
        startGameButton.style.display = "block";
        break;
      case "timeOver":
        disableInput();
        timeOverFlag = true;
        overlayPanel.style.display = "flex";
        overlayTitle.style.display = "flex";
        if(!multiplayerflag) overlaySubtitle.style.display = "flex";
        scoreLabel.style.display = "none";
        overlayTitle.innerHTML = "TIME OVER";
        overlaySubtitle.innerHTML = "YOU DIDN'T MAKE IT!";
        showSolutionButton.style.display = "block";
        goNextRoundButton.style.display = "block";        
        if (multiplayerflag) rankingTable.style.display = "flex";
        break;
      case "goodGuess":
        disableInput();
        goodGuessFlag = true;
        overlayPanel.style.display = "flex";
        overlayTitle.style.display = "flex";
        if(!multiplayerflag) overlaySubtitle.style.display = "flex";
        scoreLabel.style.display = "none";
        overlayTitle.innerHTML = "GOOD GUESS";
        overlaySubtitle.innerHTML = "YOU ARE A BOSS!";        
        showSolutionButton.style.display = "block";
        goNextRoundButton.style.display = "block";
        if (multiplayerflag) rankingTable.style.display = "flex";
        break;
      case "gameOver":
        disableInput();
        overlayPanel.style.display = "flex";
        overlayTitle.style.display = "flex";
        overlaySubtitle.style.display = "none";
        scoreLabel.style.display = "flex";
        overlayTitle.innerHTML = "GAME OVER";
        scoreLabel.innerHTML = "TOTAL SCORE: " + totalScore;
        goNextRoundButton.innerHTML = "MAIN MENU";
        goNextRoundButton.style.display = "block";
        if (multiplayerflag) {
            scoreLabel.style.display = "none";
            rankingTable.style.display = "flex";
        }
        break;
    case "wait":
        timeOverFlag = true;
        overlayPanel.style.display = "flex";
        overlayTitle.style.display = "flex";
        overlaySubtitle.style.display = "none";
        scoreLabel.style.display = "none";
        overlayTitle.innerHTML = "WAIT YOUR HOST!";
        showSolutionButton.style.display = "none";
        goNextRoundButton.style.display = "none";
        break;
    case "hide":
        overlayPanel.style.display = "none";
        overlayTitle.style.display = "none";
        overlaySubtitle.style.display = "none";
        scoreLabel.style.display = "none";
        break;    
    default: console.log("Error: overlayType '" + overlayType + "' does not exist.");
    }
}

function disableInput() {
    isInputDisabled = true;
}

function enableInput() {
    isInputDisabled = false;
}

// Multiplayer
async function generateChordsForRounds() {
    if (!multiplayerflag || practiceModeFlag) return;
    for (let i = 0; i < maxRounds; i++) {
        generatedChordsData.push(generateRandomChord(firstNote, lastNote, selectedLevel));
    }
    await set(gameStructureRef, generatedChordsData); 
}

async function generateCadencesForRounds() {
    if (!multiplayerflag || practiceModeFlag) return;
    for (let i = 0; i < maxRounds; i++) {
        progressionData = generateChordPattern(firstNote, lastNote, selectedLevel);
        generatedCadencesData.push(progressionData);
    }
    await set(gameStructureRef, generatedCadencesData);
}

async function startMultiplayerRound() {
    if (!multiplayerflag || practiceModeFlag) return;
    if (!isHost) {
        let snapshot;
        do {
            snapshot = await get(gameStructureRef);
            if (snapshot.exists()) generatedChordsData = snapshot.val();
        } while (!snapshot.exists());
        handleOverlayDisplay("hide");
        startTimer();
    }
    if (!generatedChordsData) {
        console.error("Accordi non trovati per la modalità multiplayer!");
        return;
    }
    if (selectedMinigame === "chords_GM") {
        generatedChordData = generatedChordsData[activeRoundID-1];
        piano.playChord(generatedChordData.midiNotes);
    } else if (selectedMinigame === "harmony_GM") {
        progressionData = generatedCadencesData[activeRoundID-1];
        missingChordDetails = progressionData.missingChordData;
        missingChord = missingChordDetails.midiNotes
        playProgression(progressionData);
    }
}

async function updateScoreInDatabase() {
    if (!multiplayerflag || practiceModeFlag) return;
    await set(playerScoreRef, totalScore);
}

async function updateRanking() {
    if (!multiplayerflag || practiceModeFlag) return;
    try {
      let playersSnapshot = await get(playersRef);
      let playersData = playersSnapshot.val();  
      if (!playersData) {
        console.warn("Nessun dato trovato per i giocatori.");
        rankingTable.innerHTML = "Nessun giocatore nella lobby.";
        placementDisplay.innerHTML = "PLACEMENT: N/A";
        return;
      }
      let playersArray = Object.entries(playersData).map(
        ([id, data]) => ({
          id,
          score: data.score || 0,
          playerName: data.playerName || "Anonimo",
        })
      );
      playersArray.sort((a, b) => b.score - a.score);
      let playerIndex = playersArray.findIndex(
        (player) => player.id === userID
      );
      rankingTable.innerHTML = "";
      playersArray.forEach((item, index) => {
        let newPlayerRanking = document.createElement("div");
        newPlayerRanking.classList.add("overlayRanking");
        newPlayerRanking.innerHTML = `${index + 1}°:  ${item.playerName} - ${
          item.score
        } points`;
        rankingTable.append(newPlayerRanking);
      });
      placementDisplay.innerHTML = `PLACEMENT: ${playerIndex + 1}°`;
    } catch (error) {
      console.error("Errore durante l'aggiornamento del ranking:", error);
      rankingTable.innerHTML = "Errore nel caricamento della classifica.";
      placementDisplay.innerHTML = "PLACEMENT: N/A";
    }
  }

// EXPORT ------------------------------------------------------------------------------------------------------------------------------------------
export { isInputDisabled };

// -------------------------------------------------------------------------------------------------------------------------------------------------