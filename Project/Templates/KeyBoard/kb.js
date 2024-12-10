import PianoController from "./controller.js";
import { generateRandomChord } from "./chord.js";

let firstNote = 48;
let keysNumber = 25;

let piano = new PianoController("piano", keysNumber, firstNote);

let previousPressedNotes = []; // Variabile globale per memorizzare lo stato precedente delle note premute

const pointsToDeduct = 25; // Punti da togliere
const deductionInterval = 30; // Intervallo in secondi per la detrazione
const hintInterval = 30; // Intervallo in secondi per mostrare un nuovo hint

let totalScore = 0; // Punteggio totale accumulato
let currentScore = 100; // Punteggio iniziale per il turno corrente
let timeLeft = 120; // Tempo massimo in secondi
let timerInterval; // Variabile per il timer
let isRoundActive = false; // Flag per indicare se un round è attivo
let activeRoundID = 0;
let maxRounds = 3

const scoreDisplay = document.getElementById("scoreDisplay");
const timerDisplay = document.getElementById("timerDisplay");

// OVERLAY PANEL HANDLING -----------------------------------------------------------------------------------------------------------------------------
let overlayPanel = document.getElementById("overlayDiv")
let scoreLabel = document.getElementById("scoreLabel")
let overlayTitle = document.getElementById("overlayTitle")

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
    if (activeRoundID < maxRounds) { // Controlla se ci sono ancora round disponibili
      startRound();
      handleOverlayDisplay("hide");
      piano.init()
    } else {
        window.location.href = "../../gameTitleScreen.html";
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
      overlayTitle.innerHTML = "TIME IS OVER"
      break;
    case "goodGuess":
        overlayTitle = "YOU GUESSED RIGHT!"
        goNextRoundButton.style.display = "block"
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


document.addEventListener("keydown", (event) => {
    const note = piano.view.keyMap[event.code]; // Controlla se il tasto è mappato a una nota MIDI
    if (note !== undefined) {
        checkChord(); // Chiama la funzione solo se il tasto è valido
    } else {
        console.log(`Tasto non valido premuto: ${event.code}`); // Debug per tasti non validi
    }
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
            activeRoundID++; // Incrementa il round

            piano.deactivate()

            if(activeRoundID < maxRounds)
                handleOverlayDisplay("timeOver")
            else
                handleOverlayDisplay("gameOver")

            clearInterval(timerInterval);
            isRoundActive = false; // Termina il round
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
        // Controlla se le note premute sono diverse da quelle dell'ultima chiamata
    if (arraysEqual(pressedNotes, previousPressedNotes)) {
        return; // Esci se lo stato non è cambiato
    }

    // Aggiorna lo stato precedente con le note attuali
    previousPressedNotes = [...pressedNotes];
    console.log("Premute:", pressedNotes);
    console.log("Da indovinare:", generatedChord.sort());

    if (guidedMode) {
        // Memorizza le note attualmente premute
        const currentColorNotes = new Set(pressedNotes);

        // Colora i tasti attualmente premuti
        pressedNotes.forEach(note => {
            if (generatedChord.includes(note)) {
                piano.view.setKeyColor(note, "green");
            } else {
                piano.view.setKeyColor(note, "red");
            }
        });

        // Resetta i colori per i tasti che non sono più premuti
        for (let i = firstNote; i <= lastNote; i++) {
            if (!currentColorNotes.has(i)) {
                piano.view.resetKeyColor(i);
            }
        }
    }

    // Verifica l'accordo e aggiorna i feedback
    if (pressedNotes.length >= 3 && !arraysEqual(generatedChord, pressedNotes)) {
        wrongAttempts++;
        //feedbackDisplay.textContent = "Accordo non corretto. Riprova!";
    } else if (arraysEqual(generatedChord, pressedNotes)) {
        clearInterval(timerInterval); // Ferma il timer
        totalScore += currentScore; // Aggiungi il punteggio corrente al totale
        updateScoreDisplay(); // Aggiorna il display del punteggio
        isRoundActive = false; // Termina il round
        wrongAttempts = 0; // Reset degli errori
        chordCount++;
        //feedbackDisplay.textContent = "Accordo corretto!";
        //chordCountDisplay.textContent = `Accordi indovinati: ${chordCount}`;
        text.textContent = "Right Chord, here you another one."
    }

    if(arraysEqual(pressedNotes, generatedChord)){
        piano.deactivate()
        handleOverlayDisplay("goodGuess")
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
function arraysEqual(arr1, arr2) {
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();
    return JSON.stringify(sortedArr1) === JSON.stringify(sortedArr2);
}