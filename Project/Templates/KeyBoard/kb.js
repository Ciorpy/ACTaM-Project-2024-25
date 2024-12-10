import PianoController from "./controller.js";
import { generateRandomChord } from "./chord.js";

let firstNote = 48;
let keysNumber = 25;
let lastNote = firstNote + keysNumber;

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

const scoreDisplay = document.createElement("div");
const timerDisplay = document.createElement("div");

scoreDisplay.className = "score";
timerDisplay.className = "timer";

document.body.appendChild(scoreDisplay);
document.body.appendChild(timerDisplay);

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
    //feedbackDisplay.textContent = guidedMode ? "Modalità guidata attivata!" : "Modalità guidata disattivata.";
});

// Livelli di difficoltà
const levels = ["easyDiff", "mediumDiff", "hardDiff"];
let selectedLevel = localStorage.getItem("Difficulty"); // Livello selezionato dall'utente
let chordCount = 0;
let wrongAttempts = 0; // Contatore errori
let generatedChordData = {}; // Dettagli dell'accordo generato
let generatedChord = []; // Lista delle note MIDI dell'accordo generato
const playbackDelay = 1500; // Delay in millisecondi prima di riprodurre il nuovo accordo

// Elementi della pagina
const levelDisplay = document.getElementById("level");
//const chordCountDisplay = document.getElementById("chordCount");
//const feedbackDisplay = document.getElementById("feedback");
const playSolutionButton = document.getElementById("playSolutionButton");
let hintButton = document.getElementById("hintButton");
const text = document.getElementById("text");

// Assegna il livello iniziale
updateLevelDisplay();

// Variabili per la gestione degli hint
let hintTimer = 0; // Tempo trascorso per mostrare gli hint
let flagHints = [true, true, true]; // Stato degli hint




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


// Funzione per avviare il timer
function startTimer() {
    clearInterval(timerInterval); // Resetta il timer precedente
    timeLeft = 120;
    currentScore = 100; // Reset del punteggio corrente
    hintTimer = 0; // Reset del timer degli hint
    flagHints = [true, true, true]; // Reset degli hint
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeft--;
        hintTimer++;
        updateTimerDisplay();

        // Riduci il punteggio corrente ogni "deductionInterval" secondi
        if (timeLeft % deductionInterval === 0 && timeLeft > 0) {
            currentScore = Math.max(0, currentScore - pointsToDeduct);
            console.log(`Current Score updated: ${currentScore}`); // Stampa il punteggio corrente in console
        } 

        // Mostra hint in base al tempo trascorso
        if (hintTimer >= hintInterval && flagHints[0]) {
            flagHints[0] = false;
            text.textContent = `Hint 1: Root ${generatedChordData.noteRoot}`;
        } else if (hintTimer >= hintInterval * 2 && flagHints[1]) {
            flagHints[1] = false;
            text.textContent = `Hint 2: ${generatedChordData.noteRoot}${generatedChordData.chordType}`;
        } else if (hintTimer >= hintInterval * 3 && flagHints[2]) {
            flagHints[2] = false;
            text.textContent += `\nHint 3: Inversion ${generatedChordData.inversion}`;
        } 

        // Gestisci lo scadere del tempo
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isRoundActive = false; // Termina il round
            text.textContent = `Time's up! The solution is: ${generatedChordData.noteRoot}${generatedChordData.chordType}`;
        }
    }, 1000);
}

// Funzione per iniziare un nuovo round
function startRound() {
    isRoundActive = true;
    text.textContent = "Let's try!";
    generateNewChord();
    startTimer();
}

// Pulsante Next Chord
const nextChordButton = document.createElement("div");
nextChordButton.className = "button";
nextChordButton.textContent = "Next Chord";
document.body.appendChild(nextChordButton);

nextChordButton.addEventListener("click", () => {
    if (!isRoundActive) {
        startRound(); // Avvia un nuovo round
    }
});



// Aggiorna il display del livello
function updateLevelDisplay() {
    levelDisplay.textContent = `${selectedLevel}`;
} //?



// Funzione per generare un nuovo accordo
function generateNewChord() {
    generatedChordData = generateRandomChord(48, selectedLevel);
    generatedChord = generatedChordData.midiNotes;
    console.log(`Nuovo accordo per il livello ${selectedLevel}:`, generatedChord);
    text.textContent = "Let's try";

    setTimeout(() => {
        piano.playChord(generatedChord);
    }, playbackDelay);

}



hintButton.addEventListener("click", () => {
    updateHints();
})



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
}



// Riproduce l'accordo generato quando si preme il pulsante "PLAY SOLUTION"
playSolutionButton.addEventListener("click", () => {
    if (generatedChord.length > 0) {
        piano.playChord(generatedChord);
        //feedbackDisplay.textContent = "Soluzione riprodotta!";
        console.log("Accordo riprodotto:", generatedChord);
    } else {
        //feedbackDisplay.textContent = "Nessun accordo generato!";
        console.log("Nessun accordo da riprodurre");
    }
});

// Funzione ausiliaria per confrontare due array
function arraysEqual(arr1, arr2) {
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();
    return JSON.stringify(sortedArr1) === JSON.stringify(sortedArr2);
}
