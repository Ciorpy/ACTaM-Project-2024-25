import PianoController from "./controller.js";
import { generateRandomChord } from "./chord.js";

let firstNote = 48;
let keysNumber = 25;

let piano = new PianoController("piano", keysNumber, firstNote);

const pointsToDeduct = 25; // Punti da togliere
const deductionInterval = 30; // Intervallo in secondi per la detrazione
const hintInterval = 30; // Intervallo in secondi per mostrare un nuovo hint

let totalScore = 0; // Punteggio totale accumulato
let currentScore = 100; // Punteggio iniziale per il turno corrente
let timeLeft = 120; // Tempo massimo in secondi
let timerInterval; // Variabile per il timer
let isRoundActive = false; // Flag per indicare se un round è attivo

const scoreDisplay = document.getElementById("scoreDisplay");
const timerDisplay = document.getElementById("timerDisplay");


scoreDisplay.className = "score";
timerDisplay.className = "timer";

updateScoreDisplay();
updateTimerDisplay();

// Modalità guidata
let guidedMode = false; // Modalità guidata disabilitata di default

// Aggiungi un pulsante per attivare/disattivare la modalità guidata
const toggleGuidedModeButton = document.getElementById("toggleGuidedMode");

// Event listener per il pulsante della modalità guidata
toggleGuidedModeButton.addEventListener("click", () => {
    guidedMode = !guidedMode;
    toggleGuidedModeButton.textContent = !guidedMode ? "ASSISTANT MODE OFF" : "ASSISTANT MODE ON";
});

// Utente
let selectedLevel = localStorage.getItem("Difficulty"); // Livello selezionato dall'utente
let selectedMinigame = localStorage.getItem("Gamemode")  // Gets from localStorage the selected Minigame (Chords / Harmony)
let practiceModeFlag = localStorage.getItem("Practice")  // Gets from localStorage the selected mode (Game / Practice)

// Accordi
let generatedChordData = {}; // Dettagli dell'accordo generato
let generatedChord = []; // Lista delle note MIDI dell'accordo generato

const playbackDelay = 50; // Delay in millisecondi prima di riprodurre il nuovo accordo

// Elementi della pagina
const levelDisplay = document.getElementById("level");
const playSolutionButton = document.getElementById("playSolutionButton");
let hintButton = document.getElementById("hintButton");
const hintDisplay = document.getElementById("hintDisplay");

// Assegna il livello iniziale
updateLevelDisplay();

// Variabili per la gestione degli hint
let hintTimer = 0; // Tempo trascorso per mostrare gli hint
let flagHintsButton = [true, true, true]; // Stato degli hint
let flagHintsAuto = [true, true, true]; // Stato degli hint

// Ascolta le note suonate dal giocatore
document.addEventListener("keydown", () => {
    checkChord();
}); 

// Funzione per aggiornare il display del punteggio totale
function updateScoreDisplay() {
    scoreDisplay.textContent = `Total Score: ${totalScore}`;
}

// Funzione per aggiornare il display del timer
function updateTimerDisplay() {
    timerDisplay.textContent = `Time Left: ${timeLeft}s`;
}

hintButton.addEventListener("click", () => {
    // Mostra hint in base al tempo trascorso
    if (hintTimer >= hintInterval && flagHintsButton[0]) {
        flagHintsButton[0] = false;
        hintDisplay.textContent = `Root ${generatedChordData.noteRoot}`;
    }
    if (hintTimer >= hintInterval * 2 && flagHintsButton[1]) {
        flagHintsButton[1] = false;
        hintDisplay.textContent = `${generatedChordData.noteRoot}${generatedChordData.chordType}`;
    } 
    if (hintTimer >= hintInterval * 3 && flagHintsButton[2]) {
        flagHintsButton[2] = false;
        hintDisplay.textContent = `${generatedChordData.noteRoot}${generatedChordData.chordType}\nin ${generatedChordData.inversion}`;
    } 
});

// Funzione per avviare il timer
function startTimer() {
    clearInterval(timerInterval); // Resetta il timer precedente
    timeLeft = 120;
    currentScore = 100; // Reset del punteggio corrente
    hintTimer = 0; // Reset del timer degli hint
    flagHintsButton = [true, true, true]; // Reset degli hint
    flagHintsAuto = [true, true, true]; // Reset degli hint
    updateTimerDisplay();

    hintDisplay.textContent = "Play it!";

    timerInterval = setInterval(() => {
        timeLeft--;
        hintTimer++;
        updateTimerDisplay();

        // Riduci il punteggio corrente ogni "deductionInterval" secondi
        if (timeLeft % deductionInterval === 0 && timeLeft > 0) {
            currentScore = Math.max(0, currentScore - pointsToDeduct);
            console.log(`Current Score updated: ${currentScore}`); // Stampa il punteggio corrente in console
        }

        if (hintTimer >= hintInterval && flagHintsAuto[0]) {
            flagHintsAuto[0] = false;
            hintDisplay.textContent = "1st hint available";
        }
        if (hintTimer >= hintInterval * 2 && flagHintsAuto[1]) {
            flagHintsAuto[1] = false;
            hintDisplay.textContent = "2nd hint available";
        } 
        if (hintTimer >= hintInterval * 3 && flagHintsAuto[2]) {
            flagHintsAuto[2] = false;
            hintDisplay.textContent = "3rd hint available";
        } 

        // Gestisci lo scadere del tempo
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isRoundActive = false; // Termina il round
            timerDisplay.textContent = `Time's up!`;
            hintDisplay.textContent = `It was ${generatedChordData.noteRoot}${generatedChordData.chordType}\nin ${generatedChordData.inversion}`;
        }
    }, 1000); 
}

// Funzione per iniziare un nuovo round
function startRound() {
    isRoundActive = true;
    generateNewChord();
    startTimer();
}

// Aggiorna il display del livello
function updateLevelDisplay() {
    levelDisplay.textContent = `Chords difficulty - ${selectedLevel}`;
}


// Funzione per generare un nuovo accordo
function generateNewChord() {
    generatedChordData = generateRandomChord(firstNote, selectedLevel);
    generatedChord = generatedChordData.midiNotes;
    console.log(`Nuovo accordo per il livello ${selectedLevel}:`, generatedChord);

    setTimeout(() => {
        piano.playChord(generatedChord);
    }, playbackDelay);

}

// Funzione per controllare l'accordo
function checkChord() {
  const pressedNotes = piano.getPressedNotes();
  console.log("Premute:", pressedNotes);
  console.log("Da indovinare:", generatedChord.sort());

  if (guidedMode) {
      // Colora i tasti in base alla loro correttezza
      pressedNotes.forEach(note => {
          if (generatedChord.includes(note)) {
              piano.view.setKeyColor(note, "green"); // Nota corretta
          } else {
              piano.view.setKeyColor(note, "red"); // Nota errata
          }
      });
    }
}

// Riproduce l'accordo generato quando si preme il pulsante "PLAY SOLUTION"
playSolutionButton.addEventListener("click", () => {
    if (generatedChord.length > 0) {
        piano.playChord(generatedChord);
        console.log("Accordo riprodotto:", generatedChord);
    } else {
        console.log("Nessun accordo da riprodurre");
    }
});

// Funzione ausiliaria per confrontare due array


// OVERLAY PANEL HANDLING -----------------------------------------------------------------------------------------------------------------------------
let overlayPanel = document.getElementById("overlayDiv")
let scoreLabel = document.getElementById("scoreLabel")

let startGameButton = document.getElementById("startGame")
let goNextRoundButton = document.getElementById("goNextRound")
let scoreDivisionLabel = document.getElementById("scoreDivisionLabel")

startGameButton.addEventListener("click", () => {
  handleOverlayDisplay("hide")
  if (!isRoundActive) {
      startRound(); // Avvia un nuovo round
  }
})

goNextRoundButton.addEventListener("click", () => {
    if (roundIndex < maxRounds - 1) { // Controlla se ci sono ancora round disponibili
      roundIndex++; // Incrementa il round
      startRound();
      handleOverlayDisplay("hide");
      // Qui puoi inserire la logica per inizializzare il round successivo
      console.log(`Round ${levelIndex + 1} iniziato`);
    } else {
      handleOverlayDisplay("gameOver"); // Termina il gioco
      console.log("Game Over. Ritorno al menu principale.");
    }
  });


let handleOverlayDisplay = function (overlayType) {
  // Default settings
  overlayPanel.style.display = "flex";
  scoreLabel.style.display = "none";
  scoreDivisionLabel.style.display = "none";
  startGameButton.style.display = "none";
  goNextRoundButton.style.display = "none";
  
  switch(overlayType){
    case "startGame":
      startGameButton.style.display = "block"
      break;
    case "timeOver":
      goNextRoundButton.style.display = "block"
      break;
    case "gameOver":
      scoreLabel.style.display = "flex"
      goNextRoundButton.style.display = "block"
      break;
    case "hide":
      overlayPanel.style.display = "none"
      break;
    default:
      console.log("Error: overlayType '" + overlayType + "' does not exist.")
  }
}