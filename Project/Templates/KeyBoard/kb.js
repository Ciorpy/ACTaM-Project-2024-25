import PianoController from "./controller.js";
import { generateRandomChord } from './chord.js';

const piano = new PianoController("piano", 37, 48);

// Livelli di difficoltà
const levels = ['easy', 'medium', 'hard', 'jazz'];
let currentLevelIndex = 0;
let chordCount = 0;
let generatedChord = []; // Chord generato corrente

// Elementi della pagina
const levelDisplay = document.getElementById("level");
const chordCountDisplay = document.getElementById("chord-count");
const feedbackDisplay = document.getElementById("feedback");

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
  generatedChord = generateRandomChord(48, currentLevel).midiNotes;

  console.log(`Nuovo accordo per il livello ${currentLevel}:`, generatedChord);
  feedbackDisplay.textContent = "Nuovo accordo generato!";
}

// Funzione per controllare l'accordo
function checkChord() {
  const pressedNotes = piano.getPressedNotes();
  console.log("premute:", pressedNotes);
  console.log("da infovinare", generatedChord.sort());

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
      // Genera un nuovo accordo nello stesso livello
      generatedChord = generateRandomChord(60, levels[currentLevelIndex]).midiNotes;
      console.log("Nuovo accordo generato:", generatedChord);
    }
  } else {
    feedbackDisplay.textContent = "Accordo non corretto. Riprova!";
  }
}

// Funzione ausiliaria per confrontare due array
function arraysEqual(arr1, arr2) {
  const sortedArr1 = [...arr1].sort();
  const sortedArr2 = [...arr2].sort();
  return JSON.stringify(sortedArr1) === JSON.stringify(sortedArr2);
}

