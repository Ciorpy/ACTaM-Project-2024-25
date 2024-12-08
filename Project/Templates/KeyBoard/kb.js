import PianoController from "./controller.js";
import { generateRandomChord } from "./chord.js";

const piano = new PianoController("piano", 37, 48);


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
text.textContent = "Let's try";

// Assegna il livello iniziale
updateLevelDisplay();
generateNewChord();

//hintMessage.textContent = "Prova a indovinare l'accordo!";


// Ascolta le note suonate dal giocatore
document.addEventListener("keydown", () => {
    checkChord();
});

// Aggiorna il display del livello
function updateLevelDisplay() {
    levelDisplay.textContent = `${selectedLevel}`;
}

// Funzione per generare un nuovo accordo
function generateNewChord() {
    generatedChordData = generateRandomChord(48, selectedLevel);
    generatedChord = generatedChordData.midiNotes; // Aggiorna la lista delle note MIDI

    console.log(`Nuovo accordo per il livello ${selectedLevel}:`, generatedChord);
    //feedbackDisplay.textContent = "Nuovo accordo generato!";

    // Riproduci il nuovo accordo dopo il delay configurabile
    setTimeout(() => {
        piano.playChord(generatedChord);
        //feedbackDisplay.textContent = "Riproduzione accordo successivo!";
    }, playbackDelay);
}

hintButton.addEventListener("click", () => {
    updateHints();
})

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

    // Verifica l'accordo e aggiorna i feedback
    if (pressedNotes.length >= 3 && !arraysEqual(generatedChord, pressedNotes)) {
        wrongAttempts++;
        //feedbackDisplay.textContent = "Accordo non corretto. Riprova!";
    } else if (arraysEqual(generatedChord, pressedNotes)) {
        generateNewChord();
        wrongAttempts = 0; // Reset degli errori
        chordCount++;
        //feedbackDisplay.textContent = "Accordo corretto!";
        //chordCountDisplay.textContent = `Accordi indovinati: ${chordCount}`;
        text.textContent = "Right Chord, here you another one."
        text.textContent = "Let's try";
        
    }

}

let flagHints = [true, true, true]

// Mostra suggerimenti basati sul numero di errori
function updateHints() {
        if (wrongAttempts >= 5 && flagHints[0]) {
            flagHints[0] = false
            text.textContent = `Root ${generatedChordData.noteRoot}`;
        }
        if (wrongAttempts >= 10 && flagHints[1]) {
            flagHints[1] = false
            text.textContent = `${generatedChordData.noteRoot}${generatedChordData.chordType}`;
        }
        if (wrongAttempts >= 12 && flagHints[2]) {
            flagHints[2] = false
            text.textContent += `\nin ${generatedChordData.inversion}`;
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
