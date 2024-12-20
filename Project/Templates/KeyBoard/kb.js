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

// IMPORTAZIONI E CONFIGURAZIONE INIZIALE -----------------------------------------------------------------------------
import PianoController from "./controller.js";
import { generateRandomChord } from "./chord&harmony.js";
import { recognizeChordMIDI } from "./chord&harmony.js";
import { generateChordPattern } from "./chord&harmony.js";

// Costanti e configurazione globale
const firstNote = 48;
const keysNumber = 25;
const lastNote = firstNote + keysNumber;
const deductionInterval = 30; 
const hintInterval = 30;
const pointsToDeduct = 25;
const percAssistant = 50;

// Variabili globali
let defaultRounds = 3; 
let loadedRounds = parseInt(localStorage.getItem("numberOfRounds")); 
let maxRounds = !isNaN(loadedRounds) ? loadedRounds : defaultRounds;

let multiplayerflag = localStorage.getItem("multiplayerflag") == "true" ? true : false;

const auth = getAuth(app);
const db = getDatabase(app);
let generatedChordsData;
let generatedCadencesData; 
let missingChordsDetails;
let missingChords;
if (multiplayerflag) maxRounds = localStorage.getItem("numberRoundsMP"); 
let userID = localStorage.getItem("userID");
let isHost = localStorage.getItem("isHost")
let lobbyName = localStorage.getItem("lobbyName");
let playersRef = ref(db, `lobbies/${lobbyName}/players`);
let playerScoreRef = ref(db,`lobbies/${lobbyName}/players/${userID}/score`);
let gameStructureRef = ref(db, `lobbies/${lobbyName}/gameStructure`);
let updateRankingInterval = setInterval(updateRanking, 100);
const rankingTable = document.getElementById("rankingTable");
const placementDisplay = document.getElementById("currentPlacement"); 
if (multiplayerflag) placementDisplay.style.display = "block"; // da vedere meglio dove metterlo

let piano = new PianoController("piano", keysNumber, firstNote);
let previousPressedNotes = [];
let totalScore = 0;
let currentScore;
let timeLeft = 120;
let timerInterval;
let isRoundActive = false;
let activeRoundID = 0;
let assistantMode = false; 
let selectedLevel = localStorage.getItem("Difficulty");
let selectedMinigame = localStorage.getItem("Gamemode");
let practiceModeFlag = localStorage.getItem("Practice") == "true" ? true : false;
let generatedChordData = {};
let chordData = {};
let hintTimer;
let flagHints; 
let isShowingHint;
let isAssistanONDisabled;
let isInputDisabled = true;
let assistantFlag = false;
let flagHintsPoint = [false, false, false];
let timeOverFlag;
let goodGuessFlag;
let missingChord = null;
let missingChordDetails = null;
let progressionData = null;
let result = "";
let delay = 0;


let userLegend = {
    chords_GM: "CHORDS",
    harmony_GM: "HARMONY",
    easyDiff: "EASY",
    mediumDiff: "MEDIUM",
    hardDiff: "HARD",
};

// Effects
let preloadedEffects = [];
const effectsFiles = [
    "/Project/Sounds/Effects/game-start.mp3",
    "/Project/Sounds/Effects/game-bonus.mp3",
    "/Project/Sounds/Effects/game-over.mp3",
    "/Project/Sounds/Effects/fail.mp3",
    "/Project/Sounds/Effects/game-finished.mp3"
];

let defaultEffectsVolume = 0.5;
let loadedEffectsVolume = parseFloat(localStorage.getItem("effectsVolume"));
let effectsvol = !isNaN(loadedEffectsVolume) ? loadedEffectsVolume : defaultEffectsVolume;
effectsvol = Math.min(Math.max(effectsvol, 0), 1);

effectsFiles.forEach((file, index) => {
    const effect = new Audio(file);
    effect.volume = effectsvol;
    preloadedEffects[index] = effect;
});

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
if(!practiceModeFlag){
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
    toggleAssistantModeButton.style.display = "none";
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
    piano.init();
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
        preloadedEffects[4].play();
    } else {
        window.location.href = "../../gameTitleScreen.html";
    }
});

// Riproduzione della soluzione
playSolutionButton.addEventListener("click", () => {
    if (selectedMinigame === "chords_GM") piano.playChord(generatedChordData.midiNotes);
    else if (selectedMinigame === "harmony_GM") playProgression(progressionData);
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

document.addEventListener("keyup", (event) => {
    if (practiceModeFlag) hintDisplay.textContent = "";
});

document.addEventListener("click", () => {
    if (isInputDisabled) return;
    const pressedNotes = piano.getPressedNotes();
    if (selectedMinigame === "chords_GM" && assistantMode) piano.view.setKeyColor(pressedNotes, generatedChordData.midiNotes.includes(pressedNotes[0]) ? "green" : "red");
    else if (selectedMinigame === "harmony_GM" && assistantMode) piano.view.setKeyColor(pressedNotes, missingChord.includes(pressedNotes[0]) ? "green" : "red");
})

// FUNZIONI PRINCIPALI -----------------------------------------------------------------------------------------------
function startRound() {
    timeOverFlag = false;
    goodGuessFlag = false;
    assistantFlag = false;
    isRoundActive = true;
    result = "";
    delay = 0;
    activeRoundID++;
    resetHintButton();  // -> DA RIVEDERE -> SE NON TI PIACE, COSì MI SEMBRA PIù ELEGANTE -> HA ANCORA MENO SENSO
    startTimer();
    enableInput();
    piano.init();
    if (selectedMinigame === "chords_GM") {
        if (multiplayerflag) { // --> multiplayer
            console.log("Multiplayer true")
            if (isHost && (!generatedChordsData.length)) generateChordsForRounds();
            startMultiplayerRound();
        } else generateNewChord(); 
    } else if (selectedMinigame === "harmony_GM") {
        if (multiplayerflag) { // --> multiplayer
            console.log("Multiplayer true")
            if (isHost && (!generatedCadencesData.length)) generateCadencesForRounds();
            startMultiplayerRound();
        } else generateNewProgression();
    }
}

function generateNewChord() {
    generatedChordData = generateRandomChord(firstNote, lastNote, selectedLevel);
    piano.playChord(generatedChordData.midiNotes);
}

function generateNewProgression() {
    progressionData = generateChordPattern(firstNote, lastNote, selectedLevel);
    missingChordDetails = progressionData.missingChordData;
    missingChord = missingChordDetails.midiNotes
    playProgression(progressionData);
    updateResult()
}

function playProgression(progressionData, missingChord = null) { 
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

function handleCorrectGuess() {
    handleOverlayDisplay("goodGuess");
    clearInterval(timerInterval);
    if (assistantFlag) currentScore *= (1 - percAssistant / 100);
    if (flagHintsPoint[2]) currentScore -= 12;
    if (flagHintsPoint[1]) currentScore -= 8;
    if (flagHintsPoint[0]) currentScore -= 4;
    if (currentScore >= 0) totalScore += Math.floor(currentScore);
    else totalScore += 0;
    updateScoreDisplay();
    if (multiplayerflag) updateScoreInDatabase(); // --> multiplayer 
    isRoundActive = false;
    preloadedEffects[1].play();
}

function handleAssistantMode(pressedNotes) {
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

function updateResult() {
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

function resetHintButton() {
    hintButton.textContent = "HINT BLOCKED"; // -> DA RIVEDERE
    hintButton.classList.add('no-hover'); // -> DA RIVEDERE COME SOPRA, TOGLIE HOVER QUANDO BLOCCATO (IN updateHint ovviamente lo rimetto)
    hintButton.classList.add('notSelectable'); // -> DA RIVEDERE COME SOPRA, PULSANTE  (IN updateHint ovviamente lo rimetto)
}

function endRound() {
    handleOverlayDisplay("timeOver");
    clearInterval(timerInterval);
    isRoundActive = false;
    preloadedEffects[2].play();
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
    levelDisplay.innerHTML = "   DIFFICULTY " + userLegend[selectedLevel];
}

function updateRoundDisplay() {
    let roundShowed = activeRoundID + 1; 
    roundDisplay.innerHTML = "   ROUND " + roundShowed;
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
        overlayPanel.style.display = "flex";
        overlayTitle.style.display = "flex";
        overlaySubtitle.style.display = "flex";
        scoreLabel.style.display = "none";
        if (selectedMinigame === "chords_GM") overlayTitle.innerHTML = "RECOGNIZE CHORD & PLAY IT";
        else if (selectedMinigame === "harmony_GM") overlayTitle.innerHTML = "RESOLVE CHORD CADENCES PLAYING MUTED LAST CHORD";
        overlaySubtitle.innerHTML = "PRESS START";
        startGameButton.style.display = "block";
        break;
      case "timeOver":
        disableInput();
        timeOverFlag = true;
        overlayPanel.style.display = "flex";
        overlayTitle.style.display = "flex";
        overlaySubtitle.style.display = "flex";
        scoreLabel.style.display = "none";
        overlayTitle.innerHTML = "TIME OVER";
        overlaySubtitle.innerHTML = "YOU DIDN'T MAKE IT!";
        showSolutionButton.style.display = "block";
        goNextRoundButton.style.display = "block";
        //if {multiplayerflag} displayRanking();
        break;
      case "goodGuess":
        disableInput();
        goodGuessFlag = true;
        overlayPanel.style.display = "flex";
        overlayTitle.style.display = "flex";
        overlaySubtitle.style.display = "flex";
        scoreLabel.style.display = "none";
        overlayTitle.innerHTML = "GOOD GUESS";
        overlaySubtitle.innerHTML = "YOU ARE A BOSS!";        
        showSolutionButton.style.display = "block";
        goNextRoundButton.style.display = "block";
        if (multiplayerflag) { // multiplayer
            scoreLabel.style.display = "none"; //ordine
            rankingTable.style.display = "flex";
          }
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
        if (multiplayerflag) { // multiplayer
            scoreLabel.style.display = "none"; //ordine
            rankingTable.style.display = "flex";
          }
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

// FUNZIONI MULTIPLAYER -----------------------------------------------------------------------------------------------
async function generateChordsForRounds() {
    console.log("entrato nella funzione") // togliere
    for (let i = 0; i < maxRounds; i++) {
        console.log("entrato nel ciclo, iterazione:",i) // togliere
        generatedChordsData.push(generateRandomChord(firstNote, lastNote, selectedLevel));
    }
    await set(gameStructureRef, generatedChordsData); 
    console.log(generatedChordsData) //togliere
}

async function generateCadencesForRounds() {
    console.log("entrato nella funzione") // togliere
    for (let i = 0; i < maxRounds; i++) {
        console.log("entrato nel ciclo, iterazione:",i) // togliere
        progressionData = generateChordPattern(firstNote, lastNote, selectedLevel);
        generatedCadencesData.push(progressionData);
    }
    await set(gameStructureRef, generatedCadencesData); 
    console.log(generatedCadencesData) //togliere
}

async function startMultiplayerRound() {
    if (!isHost) {generatedChordsData = await get(gameStructureRef).val(); console.log(generatedChordsData)} //togliere il log
    if (!generatedChordsData) {
        console.error("Accordi non trovati per la modalità multiplayer!");
        return;
    }
    if (selectedMinigame === "chords_GM") {
        generatedChordData = generatedChordsData[activeRoundID-1];
        console.log(activeRoundID, generatedChordData) //togliere
        piano.playChord(generatedChordData.midiNotes);
    } else if (selectedMinigame === "harmony_GM") {
        progressionData = generatedCadencesData[activeRoundID-1];
        missingChordDetails = progressionData.missingChordData;
        missingChord = missingChordDetails.midiNotes
        playProgression(progressionData);
    }
}

async function updateScoreInDatabase() {
    await set(playerScoreRef, totalScore);
    console.log("punteggio db aggiornato"); //togliere
}

async function updateRanking () {
  let playersSnapshot = await get(playersRef);

  let playersArray = Object.entries(playersSnapshot.val()).map( //oppure await get(playersRef).val() direttamente
    ([id, data]) => ({
      id,
      score: data.score,
      playerName: data.playerName,
    })
  );

  playersArray.sort((a, b) => b.score - a.score);

  let playerIndex = playersArray.findIndex(
    (player) => player.id === userID
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



export { isInputDisabled };