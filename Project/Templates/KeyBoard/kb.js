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
let playingCadenceTimer;
let maxRounds;
let activeRoundID = 0;
let effectsvol;

// Flags
let assistantMode = false;  //?? -> UTILE AL TOGGLE -> FALSE = ASSISTANT DISATTIVO, TRUE = ASSISTANT ATTIVO, IL PULSANTE NE SCAMBIA SEMPRE IL VALORE
let assistantAvailable; // ?? non è lo stesso di doit? -> NO è IL CONTRARIO PERò FORSE doIt SI PUò CONCELLARE
let assistantPoint; // usare assistant Mode? -> NO PERCHé QUESTO STA AD INDICARE CHE DURANTE IL ROUND è STATO USATO ALMENO UNA VOLTA E QUNDI IL PUNTEGGIO DEVE ESSERE DIMINUITO, SE SI USASSE L'ALTRO IL GIOCATORE POTREBBE ATTIVARLA E DISATTIVARLA E IL PUNTEGGIO SAREBBE INALTERATO
let isInputDisabled;
let flagHintsPoint;
let flagHints; 
let timeOverFlag;
let goodGuessFlag;

// Games
let previousPressedNotes;
let generatedChordData;
let generatedCadenceData; //contiene missingChordData e missingChordDetails, chiamarlo generatedCadenceData? Sì POSSIAMO CAMBIARGLI IL NOME NON C'è PROBLEMA
let cadenceName;
let missingChordDetails;
let missingChord; // -> perche non usare direttamente generatedChordData? -> PER ORDINE, SONO DUE COSE DIVERSE
let chordData; //quello della practice mode? usare generatedChordData? -> SECONDO ME MEGLIO TENERLI SEPARATI, SEMPLICE ORDINE POI HANNO DUE COMPITI DIVERSI INOLTRE

// Multiplayer -> stanziarle direttamente dentro l'if multiplayerFlag sotto? -> NO, VARIABILI E QUESTI DOC DEVONO ESSERE STANZIATI IN GENERALE, AL MASSIMO GLI SI PUò DARE UN VALORE IN DETERMINATI CASI
let playersRef;
let playerScoreRef;
let gameStructureRef;
let updateRankingInterval;
let generatedChordsData;
let generatedCadencesData;

// Effects
let preloadedEffects = [];

// DOC ELEMENTS ------------------------------------------------------------------------------------------------------------------------------------

// Game Info
const selectedGameMode = localStorage.getItem("Gamemode");
const gameModeDisplay = document.getElementById("gameMode");
const selectedDifficulty = localStorage.getItem("Difficulty");
const difficultyDisplay = document.getElementById("difficultyDisplay");
const roundDisplay = document.getElementById("roundDisplay");
const timerDisplay = document.getElementById("timerDisplay"); 
const scoreDisplay = document.getElementById("scoreDisplay");
const hintDisplay = document.getElementById("hintDisplay");

// Overlay Info
const overlayPanel = document.getElementById("overlayDiv");
const overlayTitle = document.getElementById("overlayTitle");
const overlaySubtitle = document.getElementById("overlaySubtitle");
const overlayScoreDisplay = document.getElementById("overlayScoreDisplay");
const overlaySolutionPanel = document.getElementById("overlaySolutionDiv");
const overlayTitleSolution = document.getElementById("overlayTitleSolution");
const overlaySubtitleSolution = document.getElementById("overlaySubtitleSolution");

// Overlay Button
const startGameButton = document.getElementById("startGame");
const nextRoundButton = document.getElementById("nextRound");
const showSolutionButton = document.getElementById("showSolution");
const hideSolutionButton = document.getElementById("hideSolution");

// Game Button
const playSolutionButton = document.getElementById("playSolutionButton");
const assistantModeButton = document.getElementById("assistantModeButton");
const hintButton = document.getElementById("hintButton");

// Practice Mode
const practiceModeFlag = localStorage.getItem("Practice") == "true" ? true : false; //chiedere al team isole se vogliono uniformare i booleani -> Sì E NO, CIOè CHISSENE FREGA... IL NOSTRO è MEGLIO AHAHAH
const mainMenuButton = document.getElementById("mainMenu"); 

// Multiplayer
const multiplayerFlag = localStorage.getItem("multiplayerFlag") == "true" ? true : false;
const userID = localStorage.getItem("userID"); //metterle nell'if multiplayerFlag -> NO, VARIABILI E QUESTI DOC DEVONO ESSERE STANZIATI IN GENERALE, AL MASSIMO GLI SI PUò DARE UN VALORE IN DETERMINATI CASI
const lobbyName = localStorage.getItem("lobbyName");
const rankingTable = document.getElementById("overlayMultiplayerRanking");
const placementDisplay = document.getElementById("currentPlacement");
const isHost = localStorage.getItem("isHost") == "true" ? true : false;

// Loaded Settings
const loadedRounds = (multiplayerFlag) ? parseInt(localStorage.getItem("numberRoundsMP")) : parseInt(localStorage.getItem("numberOfRounds")); 
const loadedEffectsVolume = parseFloat(localStorage.getItem("effectsVolume"));

// CONFIGURATION ------------------------------------------------------------------------------------------------------------------------------

// Piano
piano.init();

// Variables
effectsvol = !isNaN(loadedEffectsVolume) ? loadedEffectsVolume : defaultEffectsVolume;
effectsvol = Math.min(Math.max(effectsvol, 0), 1);
if (!practiceModeFlag) { // -> perchè qui? -> TUTTI QUESTI CONTROLLI LI HO INSERITI PER NON ATRRIBUIRE O ATTIVARE COSE CHE IN ALCUNE MODALITà NON SERVONO
    maxRounds = !isNaN(loadedRounds) ? loadedRounds : defaultRounds;
    if (multiplayerFlag) {
        playersRef = ref(db, `lobbies/${lobbyName}/players`);
        playerScoreRef = ref(db,`lobbies/${lobbyName}/players/${userID}/score`);
        gameStructureRef = ref(db, `lobbies/${lobbyName}/gameStructure`);
        updateRankingInterval = setInterval(updateRanking, 100);
    }
    effectsFiles.forEach((file, index) => {
        const effect = new Audio(file);
        effect.volume = effectsvol;
        preloadedEffects[index] = effect;
    });
}

// Page
if (!practiceModeFlag) {
    if (multiplayerFlag) placementDisplay.style.display = "flex";
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
    chordData = {};
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
    difficultyDisplay.style.fontSize = "4vh";
    difficultyDisplay.style.marginBottom = "0px";
    difficultyDisplay.innerHTML = "JUST HAVE FUN! CHORDS PLAYED WILL BE RECOGNIZED"
}

// EVENT LISTENERS ---------------------------------------------------------------------------------------------------------------------------------

// Overlay Buttons
startGameButton.addEventListener("click", () => {
    if (multiplayerFlag && !isHost && !generatedChordsData.length) handleOverlayDisplay("wait");
    else handleOverlayDisplay("hide");
    startRound();
});
 
showSolutionButton.addEventListener("click", () => {
    handleOverlayDisplay("hide")
    overlaySolutionPanel.style.display = "flex";
    if (selectedGameMode === "chords_GM") {
        overlayTitleSolution.innerHTML = "IT'S A " + `${generatedChordData.noteRoot}${generatedChordData.chordType} IN ${generatedChordData.inversion}`;
        overlaySubtitleSolution.innerHTML = "";
        piano.playChord(generatedChordData.midiNotes);
        generatedChordData.midiNotes.forEach(note => {
            piano.view.setKeyColor(note, "green");
        });
    } else if (selectedGameMode === "harmony_GM") {
        overlayTitleSolution.innerHTML = "IT'S A " + `${generatedCadenceData.name}` + " IN " + `${missingChordDetails.noteRoot}${missingChordDetails.chordType}`;
        overlaySubtitleSolution.innerHTML = `${cadenceName} - ${missingChordDetails.noteRoot}${missingChordDetails.chordType}`;
        playProgression(generatedCadenceData, missingChord);
        setTimeout(() => {
            missingChord.forEach(note => {
                piano.view.setKeyColor(note, "green");
            });
        }, playingCadenceTimer);
    }
});

hideSolutionButton.addEventListener("click", () => {
    handleOverlayDisplay("hide");
    if (timeOverFlag) handleOverlayDisplay("timeOver");
    if (goodGuessFlag) handleOverlayDisplay("goodGuess");
    overlaySolutionPanel.style.display = "none";
    if (selectedGameMode === "chords_GM") generatedChordData.midiNotes.forEach(note => {
        piano.view.resetKeyColor(note)
    });
    else if (selectedGameMode === "harmony_GM") missingChord.forEach(note => {
        piano.view.resetKeyColor(note)
    });
})

nextRoundButton.addEventListener("click", () => { // TOLTO UPDATE PERCHé GIà IN START ROUND, COME TOLTO isRoundActive
    let isAssistanON = assistantModeButton.textContent === "ASSISTANT MODE ON" ? true : false; // mettere in resetvariable assistantMode=false -> GIUSTO, FATTO
    if (isAssistanON){
        assistantMode = !assistantMode;
        assistantModeButton.textContent = !assistantMode ? "ASSISTANT MODE OFF" : "ASSISTANT MODE ON";
    }
    if (activeRoundID < maxRounds) { //si potrebbe mettere in handleGuess questo controllo -> NON CAPISCO PERCHé, DEVE STARE QUA, QUANDO SI CLICCA IL PULSANTE SI VA AVANTI CON I ROUND SOLO SE CE NE SONO ANCORA
        handleOverlayDisplay("hide");
        startRound();
    } else if (activeRoundID == maxRounds) { // CONTINUO QUA -> NELL'ULTIMO ROUND SI VEDE PRIMA IL GOOD GUESS O TIME OVER E POI GAME OVER QUINDI I CONTROLLI DI ROUND SONO TUTTI QUA
        handleOverlayDisplay("gameOver"); 
        activeRoundID++; //già in resetvariable (da mettere in start round) -> INOLTRE AFFINCHè SI ESCA DAL GIOCO QUANDO SI SCHIACCIA NEXT ROUND DOPO L'ULTIMO ROUND DEVE AUMENTARE activeRoundID PERCHé SENNò SI ENTRA SEMPRE IN QUESTO IF
        preloadedEffects[4].play();
    } else {
        window.location.href = "../../gameTitleScreen.html"; //usare main menu button -> NON POSSIAMO USARE IL TASTO MAIN MENU DELLA PRACTICE MODE PERCHé FA PARTE DI DUE DIVERSI GRUPPI NELL'html E PER SEMPLICITà SI MODIFICA NOME E FUNZIONAMENTO DEL TASTO NEXTROUND, UN TASTO CHE GIà C'è, IO NON MODIFICHEREI QUESTO FUNZIONAMENTO
    }
});

// Game Buttons
playSolutionButton.addEventListener("click", () => {
    if (selectedGameMode === "chords_GM") piano.playChord(generatedChordData.midiNotes);
    else if (selectedGameMode === "harmony_GM") playProgression(generatedCadenceData);
});

hintButton.addEventListener("click", () => {
    if (hintTimer >= hintInterval) updateHints();
});

assistantModeButton.addEventListener("click", () => { //vedi assistantoToShow
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
    if (selectedGameMode === "chords_GM" && assistantMode) {
        piano.view.setKeyColor(
            midiNote,
            generatedChordData.midiNotes.includes(midiNote) ? "green" : "red",
            true
        );
    } else if (selectedGameMode === "harmony_GM" && assistantMode) {
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
    updateRoundDisplay();
    updateScoreDisplay();
    resetVariables();
    resetButtons();
    startTimer();
    enableInput();
    if (selectedGameMode === "chords_GM") {
        if (multiplayerFlag) {
            if (isHost && (!generatedChordsData.length)) generateChordsForRounds();
            startMultiplayerRound();
        } else generateNewChord(); 
    } else if (selectedGameMode === "harmony_GM") {
        if (multiplayerFlag) {
            if (isHost && (!generatedCadencesData.length)) generateCadencesForRounds();
            startMultiplayerRound();
        } else generateNewProgression();
    }
    activeRoundID++; // -> spostarlo fuori -> FATTO
}

function resetVariables() {
    if (practiceModeFlag) return; //vanno eliminati da tutte le funzioni questi controlli sulla practice, basta solo all'inizio -> TUTTI QUESTI CONTROLLI LI HO INSERITI PER NON ATRRIBUIRE O ATTIVARE COSE CHE IN ALCUNE MODALITà NON SERVONO
    currentScore = 100;
    cadenceName = "";
    playingCadenceTimer = 0;
    assistantAvailable = false;
    assistantPoint = false;
    assistantMode = false
    flagHintsPoint = [false, false, false];
    flagHints = [true, true, true]; 
    timeOverFlag = false;
    goodGuessFlag = false;
    previousPressedNotes = [];
    generatedChordData = {};
    missingChordDetails = {};
    missingChord = [];
    generatedCadenceData = {};
    if (multiplayerFlag) generatedChordsData = [];
    if (multiplayerFlag) generatedCadencesData = [];
} // -> TOLTI CHORDDATA E isRoundActive

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
    handleOverlayDisplay("goodGuess"); //fare il controllo di quanti round si è cosi si smista tra goodGuess e GameOver -> NO, VEDI SPIEGAZIONE IN NEXTROUNDBUTTON
    clearInterval(timerInterval); // non è in start timer? -> NON è NECESSARIO, MA VISTO CHE PER TIMEOVER LO è, LO LASCEREI ANCHE QUI
    if (assistantPoint) currentScore *= (1 - percAssistant / 100);
    if (flagHintsPoint[2]) currentScore -= 12;
    if (flagHintsPoint[1]) currentScore -= 8;
    if (flagHintsPoint[0]) currentScore -= 4;
    if (currentScore >= 0) totalScore += Math.floor(currentScore);
    else totalScore += 0;
    //updateScoreDisplay(); // si potrebbe mettere in start round? -> NON SO, FORSE SERVE QUANDO SONO FINITI I ROUND, PERò PROVIAMO 
    if (multiplayerFlag) updateScoreInDatabase();
    preloadedEffects[1].play();
}

/*function endRound() {  //forse si potrebbe direttamente mettere handleOverlayDisplay("timeOver") in updateTimer -> SI INFATTI
    if (practiceModeFlag) return;
    handleOverlayDisplay("timeOver");
    clearInterval(timerInterval); //non è in start timer?
    preloadedEffects[2].play();
}*/

// Timer
function startTimer() {
    if (practiceModeFlag) return;
    clearInterval(timerInterval);
    timeLeft = 120;
    hintTimer = 0;
    updateTimerDisplay(); // non è già in updateTimer? -> SI FORSE NON SERVE -> SERVE SENNò MOSTRA UNDEFINED
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
    hintsToShow();
    assistantToShow();
    if (timeLeft <= 0) {
        clearInterval(timerInterval); // NECESSARIO SENNò CONTINUA AD ENTRARCI
        handleOverlayDisplay("timeOver");
        preloadedEffects[2].play();
    }
}

// Games
function generateNewChord() {
    if (practiceModeFlag) return;
    generatedChordData = generateRandomChord(firstNote, lastNote, selectedDifficulty);
    piano.playChord(generatedChordData.midiNotes);
}

function checkChord() {
    if (practiceModeFlag) return;
    const pressedNotes = piano.getPressedNotes();
    if (assistantMode) handleAssistantMode(pressedNotes);
    if (pressedNotes.length < 3) return; // L'AVEVI FATTO APPOSTA QUESTO CAMBIO? PERCHé è MENO FLUIDO
    if (selectedGameMode === "chords_GM") {
        if (arraysEqual(pressedNotes, previousPressedNotes)) return;
        previousPressedNotes = [...pressedNotes];
        if (arraysEqual(generatedChordData.midiNotes, pressedNotes)) handleCorrectGuess();
    } else if (selectedGameMode === "harmony_GM") {
        const expectedNotes = missingChord;
        if (arraysEqual(pressedNotes, expectedNotes)) handleCorrectGuess();
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
    generatedCadenceData = generateChordPattern(firstNote, lastNote, selectedDifficulty);
    missingChordDetails = generatedCadenceData.missingChordData;
    missingChord = missingChordDetails.midiNotes
    playProgression(generatedCadenceData);
    updateCadenceName()
}

function updateCadenceName() {
    if (practiceModeFlag) return;
    let n = "";
    if (selectedGameMode === "harmony_GM") {
        let i = 0;
        do {
            n += `${generatedCadenceData.progressionDetails[i].noteRoot}${generatedCadenceData.progressionDetails[i].chordType}`;
            n += " - ";
            i++;
        } while (i < generatedCadenceData.progressionDetails.length - 1)
    }
    cadenceName = n.slice(0, -2);
}

function playProgression(generatedCadenceData, missingChord = null) { 
    if (practiceModeFlag) return;
    playingCadenceTimer = 0;
    generatedCadenceData.progressionDetails.forEach(chord => {
        if (chord) {
            setTimeout(() => {
                piano.playChord(chord.midiNotes);
            }, playingCadenceTimer);
            playingCadenceTimer += 1000;
        }
    });
    if (missingChord) {
        setTimeout(() => {
            piano.playChord(missingChord);
        }, playingCadenceTimer);
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
                    if (selectedGameMode === "chords_GM") hintDisplay.textContent = `ROOT ${generatedChordData.noteRoot}`;
                    else if (selectedGameMode === "harmony_GM") hintDisplay.textContent = `FIRST CHORD: 
                        ${generatedCadenceData.progressionDetails[0].noteRoot}${generatedCadenceData.progressionDetails[0].chordType}`; 
                    break;
                case 2:
                    flagHintsPoint[1] = true;
                    if (selectedGameMode === "chords_GM") hintDisplay.textContent = `${generatedChordData.noteRoot}${generatedChordData.chordType}`;
                    else if (selectedGameMode === "harmony_GM") hintDisplay.textContent = `CHORDS PLAYED: ${cadenceName}`; 
                    break;
                case 3:
                    flagHintsPoint[2] = true;
                    if (selectedGameMode === "chords_GM") hintDisplay.textContent = `${generatedChordData.noteRoot}${generatedChordData.chordType} IN ${generatedChordData.inversion}`;
                    else if (selectedGameMode === "harmony_GM") hintDisplay.textContent = `COMPLETE PROGRESSION: ${cadenceName} - ${missingChordDetails.noteRoot}${missingChordDetails.chordType}`; 
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
function assistantToShow() { //non ho capito -> CREDO TU TI RIFERSCA AL doIt, SERVE PER ESEGUIRE QUESTA PARTE SOLO UNA VOLTA, FORSE DA QUA SI PUò TOGLIERE
    if (practiceModeFlag) return;
    if (timeLeft <= assistantInterval && !assistantAvailable) {
        assistantAvailable = true;
        assistantModeButton.classList.remove('no-hover');
        assistantModeButton.classList.remove('notSelectable');
        assistantModeButton.textContent = !assistantMode ? "ASSISTANT MODE OFF" : "ASSISTANT MODE ON"; // vedi assistantModeButton -> OKAY
    }
}

function handleAssistantMode(pressedNotes) {
    if (practiceModeFlag) return;
    const currentColorNotes = new Set(pressedNotes);
    if (selectedGameMode === "chords_GM") pressedNotes.forEach(note => {
            piano.view.setKeyColor(note, generatedChordData.midiNotes.includes(note) ? "green" : "red");
        });
    else if (selectedGameMode === "harmony_GM") pressedNotes.forEach(note => {
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
    gameModeDisplay.innerHTML = userLegend[selectedGameMode]
}

function updateLevelDisplay() {
    if (practiceModeFlag) return;
    difficultyDisplay.innerHTML = "   DIFFICULTY " + userLegend[selectedDifficulty];
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
    overlayScoreDisplay.style.display = "none";
    startGameButton.style.display = "none";
    showSolutionButton.style.display = "none";    
    nextRoundButton.style.display = "none";
    
    switch(overlayType) {
      case "startGame":
        disableInput();
        overlayPanel.style.display = "flex";
        overlayTitle.style.display = "flex";
        overlaySubtitle.style.display = "flex";
        overlayScoreDisplay.style.display = "none";
        if (selectedGameMode === "chords_GM") overlayTitle.innerHTML = "RECOGNIZE CHORD AND PLAY IT";
        else if (selectedGameMode === "harmony_GM") overlayTitle.innerHTML = "RESOLVE CHORD CADENCES PLAYING MUTED LAST CHORD";
        overlaySubtitle.innerHTML = "PRESS START";
        startGameButton.style.display = "block";
        break;
      case "timeOver":
        disableInput();
        timeOverFlag = true;
        overlayPanel.style.display = "flex";
        overlayTitle.style.display = "flex";
        if(!multiplayerFlag) overlaySubtitle.style.display = "flex";
        overlayScoreDisplay.style.display = "none";
        overlayTitle.innerHTML = "TIME OVER";
        overlaySubtitle.innerHTML = "YOU DIDN'T MAKE IT!";
        showSolutionButton.style.display = "block";
        nextRoundButton.style.display = "block";        
        if (multiplayerFlag) rankingTable.style.display = "flex";
        break;
      case "goodGuess":
        disableInput();
        goodGuessFlag = true;
        overlayPanel.style.display = "flex";
        overlayTitle.style.display = "flex";
        if(!multiplayerFlag) overlaySubtitle.style.display = "flex";
        overlayScoreDisplay.style.display = "none";
        overlayTitle.innerHTML = "GOOD GUESS";
        overlaySubtitle.innerHTML = "YOU ARE A BOSS!";        
        showSolutionButton.style.display = "block";
        nextRoundButton.style.display = "block";
        if (multiplayerFlag) rankingTable.style.display = "flex";
        break;
      case "gameOver":
        disableInput();
        overlayPanel.style.display = "flex";
        overlayTitle.style.display = "flex";
        overlaySubtitle.style.display = "none";
        overlayScoreDisplay.style.display = "flex";
        overlayTitle.innerHTML = "GAME OVER";
        overlayScoreDisplay.innerHTML = "TOTAL SCORE: " + totalScore;
        nextRoundButton.innerHTML = "MAIN MENU"; //usare direttamente il button mainmenu della practice -> NON SI PUò VEDI SPIEGAZIONE NEXTROUNDBUTTON
        nextRoundButton.style.display = "block"; 
        if (multiplayerFlag) {
            overlayScoreDisplay.style.display = "none";
            rankingTable.style.display = "flex";
        }
        break;
    case "wait":
        disableInput();
        overlayPanel.style.display = "flex";
        overlayTitle.style.display = "flex";
        overlaySubtitle.style.display = "none";
        overlayScoreDisplay.style.display = "none";
        overlayTitle.innerHTML = "WAIT YOUR HOST!";
        showSolutionButton.style.display = "none";
        nextRoundButton.style.display = "none";
        break;
    case "hide":
        overlayPanel.style.display = "none";
        overlayTitle.style.display = "none";
        overlaySubtitle.style.display = "none";
        overlayScoreDisplay.style.display = "none";
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
    if (!multiplayerFlag || practiceModeFlag) return;
    for (let i = 0; i < maxRounds; i++) {
        generatedChordsData.push(generateRandomChord(firstNote, lastNote, selectedDifficulty));
    }
    await set(gameStructureRef, generatedChordsData); 
}

async function generateCadencesForRounds() {
    if (!multiplayerFlag || practiceModeFlag) return;
    for (let i = 0; i < maxRounds; i++) {
        generatedCadenceData = generateChordPattern(firstNote, lastNote, selectedDifficulty);
        generatedCadencesData.push(generatedCadenceData);
    }
    await set(gameStructureRef, generatedCadencesData);
}

async function startMultiplayerRound() {
    if (!multiplayerFlag || practiceModeFlag) return;
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
    if (selectedGameMode === "chords_GM") {
        generatedChordData = generatedChordsData[activeRoundID-1];
        piano.playChord(generatedChordData.midiNotes);
    } else if (selectedGameMode === "harmony_GM") {
        generatedCadenceData = generatedCadencesData[activeRoundID-1];
        missingChordDetails = generatedCadenceData.missingChordData;
        missingChord = missingChordDetails.midiNotes
        playProgression(generatedCadenceData);
    }
}

async function updateScoreInDatabase() {
    if (!multiplayerFlag || practiceModeFlag) return;
    await set(playerScoreRef, totalScore);
}

async function updateRanking() {
    if (!multiplayerFlag || practiceModeFlag) return;
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
        newPlayerRanking.innerHTML = `${index + 1}°:  ${item.playerName} - ${item.score} points`;
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