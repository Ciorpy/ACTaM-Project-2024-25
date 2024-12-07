import PianoController from "./controller.js";
import { generateRandomChord } from './chord.js';

const piano = new PianoController("piano", 37, 48);

// Livelli di difficoltà
const levels = ['easy', 'medium', 'hard', 'jazz'];
let currentLevelIndex = 0;
let chordCount = 0;
let generatedChord = []; // Chord generato corrente
const playbackDelay = 3000; // Delay in millisecondi prima di riprodurre il nuovo accordo

// Elementi della pagina
const levelDisplay = document.getElementById("level");
const chordCountDisplay = document.getElementById("chord-count");
const feedbackDisplay = document.getElementById("feedback");
const playSolutionButton = document.getElementById("playSolutionButton");

// Inizia il gioco
startLevel();

// Ascolta le note suonate dal giocatore
document.addEventListener("keydown", () => {
    checkChord();
});

// Funzione per iniziare un livello
function startLevel() {
    if (currentLevelIndex >= levels.length) {
        feedbackDisplay.textContent = "Gioco completato! Complimenti!";
        console.log("Gioco completato! Complimenti!");
        return;
    }

    const currentLevel = levels[currentLevelIndex];
    levelDisplay.textContent = `Livello: ${currentLevel}`;
    generateNewChord();
}

// Funzione per generare un nuovo accordo
function generateNewChord() {
    generatedChord = generateRandomChord(48, levels[currentLevelIndex]).midiNotes;
    console.log(generateRandomChord(48, levels[currentLevelIndex]))
    console.log(`Nuovo accordo per il livello ${levels[currentLevelIndex]}:`, generatedChord);
    feedbackDisplay.textContent = "Nuovo accordo generato!";

    // Riproduci il nuovo accordo dopo il delay configurabile
    setTimeout(() => {
        piano.playChord(generatedChord);
        feedbackDisplay.textContent = "Riproduzione accordo successivo!";
    }, playbackDelay);
}

// Funzione per controllare l'accordo
function checkChord() {
    const pressedNotes = piano.getPressedNotes();
    console.log("Premute:", pressedNotes);
    console.log("Da indovinare:", generatedChord.sort());

    if (arraysEqual(generatedChord, pressedNotes)) {
        chordCount++;
        feedbackDisplay.textContent = "Accordo corretto!";
        chordCountDisplay.textContent = `Accordi indovinati: ${chordCount}`;

        if (chordCount >= 2) {
            chordCount = 0;
            currentLevelIndex++;
            feedbackDisplay.textContent = "Nuovo livello!";
            startLevel();
        } else {
            generateNewChord();
        }
    } else {
        feedbackDisplay.textContent = "Accordo non corretto. Riprova!";
    }
}

// Riproduce l'accordo generato quando si preme il pulsante "PLAY SOLUTION"
playSolutionButton.addEventListener("click", () => {
    if (generatedChord.length > 0) {
        piano.playChord(generatedChord);
        feedbackDisplay.textContent = "Soluzione riprodotta!";
        console.log("Accordo riprodotto:", generatedChord);
    } else {
        feedbackDisplay.textContent = "Nessun accordo generato!";
        console.log("Nessun accordo da riprodurre");
    }
});

// Funzione ausiliaria per confrontare due array
function arraysEqual(arr1, arr2) {
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();
    return JSON.stringify(sortedArr1) === JSON.stringify(sortedArr2);
}
