import { generateChordsMIDI, recognizeChordMIDI, midiToNoteName } from './chord.js';

const notesInOctave = 12;

// Database delle progressioni con gradi e tipi di accordo
const chordPatterns = {
    easy: [
      { name: "2-5-1", degrees: [2, 5, 1], progression: ["min7", "7", "Maj7"] },
      { name: "4-5-1", degrees: [4, 5, 1], progression: ["Maj", "7", "Maj"] },
      { name: "1-4-5", degrees: [1, 4, 5], progression: ["Maj", "Maj", "7"] },
      { name: "1-6-2-5", degrees: [1, 6, 2, 5], progression: ["Maj7", "min7", "min7", "7"] }
    ],
    medium: [
      { name: "Turnaround", degrees: [1, 6, 2, 5], progression: ["Maj7", "min7", "min7", "7"] },
      { name: "Tritone Substitution", degrees: [2, 7, 1], progression: ["min7", "7", "Maj7"] },
      { name: "Blues Progression", degrees: [1, 4, 1, 5, 4, 1], progression: ["7", "7", "7", "7", "7", "7"] },
      { name: "Descending Chromatic", degrees: [1, 7, 6, 5], progression: ["Maj7", "7", "min7", "7"] },
      { name: "Circle of Fifths", degrees: [1, 4, 7, 3, 6, 2, 5, 1], progression: ["Maj7", "7", "7", "min7", "min7", "min7", "7", "Maj7"] }
    ],
    hard: [
      { name: "Advanced 2-5-1", degrees: [2, 5, 1], progression: ["m7b5", "7#5", "Maj7#5"] },
      { name: "Extended Turnaround", degrees: [1, 3, 6, 2, 5], progression: ["Maj7", "min7", "min7", "min7", "7"] },
      { name: "Tritone with Extensions", degrees: [2, 7, 1], progression: ["m7b5", "7b9", "Maj7#11"] },
      { name: "Jazz Blues", degrees: [1, 4, 1, 2, 5, 1, 5], progression: ["7", "7", "7", "min7", "7", "7", "7"] },
      { name: "Modal Interchange", degrees: [1, 4, 2, 5, 6], progression: ["Maj7", "min7", "min7", "7", "min7"] },
      { name: "Descending ii-Vs", degrees: [2, 5, 1, 2, 5], progression: ["min7", "7", "Maj7", "min7", "7"] }
    ],
    jazz: [
      { name: "Coltrane Changes", degrees: [1, 5, 3, 6, 2, 5], progression: ["Maj7", "7", "Maj7", "7", "min7", "7"] },
      { name: "Autumn Leaves", degrees: [2, 5, 1, 4, 7], progression: ["min7", "7", "Maj7", "min7", "7"] },
      { name: "So What", degrees: [1, 4], progression: ["min7", "min7"] },
      { name: "Take the A Train", degrees: [1, 2, 5, 1], progression: ["Maj7", "min7", "7", "Maj7"] },
      { name: "Blues for Alice", degrees: [1, 2, 5, 1, 6, 2, 5], progression: ["Maj7", "min7", "7", "Maj7", "min7", "min7", "7"] },
      { name: "Lady Bird", degrees: [2, 5, 1, 4, 7, 3], progression: ["min7", "7", "Maj7", "Maj7", "7", "Maj7"] }
    ]
  };

// Funzione per calcolare il grado di una tonalità
function calculateDegree(rootNote, degree) {
  const scaleSteps = [2, 2, 1, 2, 2, 2, 1]; // Intervalli della scala maggiore
  let note = rootNote;

  for (let i = 1; i < degree; i++) {
    note += scaleSteps[(i - 1) % scaleSteps.length];
  }

  return note % notesInOctave;
}

// Funzione per generare una successione basata su un pattern
export function generateChordPatternWithTonalities(rootNote = 60, difficulty = "easy", missingIndex = 1) {
  const patterns = chordPatterns[difficulty] || chordPatterns["easy"];
  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];

  const sequence = [];
  let missingChord;

  selectedPattern.degrees.forEach((degree, index) => {
    const degreeNote = calculateDegree(rootNote, degree);
    const chordType = selectedPattern.progression[index];
    const chordData = generateChordsMIDI(degreeNote)[chordType];

    if (index === missingIndex) {
      missingChord = { root: degreeNote, type: chordType, notes: chordData };
      sequence.push(null); // Posizione mancante
    } else {
      sequence.push({
        root: degreeNote,
        type: chordType,
        notes: chordData.map(midiToNoteName),
      });
    }
  });

  return {
    name: selectedPattern.name,
    sequence,
    missingChord, // Informazioni sull'accordo mancante
    rootNote: midiToNoteName(rootNote), // Mostra la tonalità selezionata
  };
}

// Funzione per verificare la risposta dell'utente
export function recognizeHarmony(userInputNotes, missingChord) {
  // Riconosci l'accordo proposto dall'utente
  const recognized = recognizeChordMIDI(userInputNotes);
  if (!recognized) return { correct: false, message: "Accordo non riconosciuto!" };

  // Confronta l'accordo proposto con quello mancante
  const expectedChord = `${midiToNoteName(missingChord.root)}, Chord: ${missingChord.type}`;
  
  if (recognized === expectedChord) {
    return { correct: true, message: `Risposta corretta! Il pattern era: ${missingChord.type}` };
  } else {
    return { correct: false, message: `Risposta errata. Era: ${expectedChord}` };
  }
}
