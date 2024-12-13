// harmony.js - Refactored Version

import { generateRandomChord } from './chord.js';

const notesInOctave = 12;

// Database delle progressioni armoniche organizzato per difficoltà
const chordPatterns = {
  easy: [
    { name: "4-5-1", degrees: [4, 5, 1], progression: ["Maj", "7", "Maj"] },
    { name: "2-5-1", degrees: [2, 5, 1], progression: ["min", "7", "Maj"] },
    { name: "2-5-1min", degrees: [2, 5, 1], progression: ["min", "7", "min"] }
  ],
  medium: [
    { name: "1-6-2-5", degrees: [1, 6, 2, 5], progression: ["Maj7", "min7", "min7", "7"] },
    { name: "1-4-5-1", degrees: [1, 4, 5, 1], progression: ["Maj7", "Maj7", "7", "Maj7"] },        
    { name: "Descending Chromatic", degrees: [7, 6, 5, 1], progression: ["7", "min7", "7", "Maj7"] }
  ],
  hard: [
    { name: "2-5-1 Extended", degrees: [2, 5, 1], progression: ["m7b5", "7", "Maj7"] },
    { name: "Circle of Fifths", degrees: [1, 4, 7, 3, 6, 2, 5, 1], progression: ["Maj7", "7", "7", "min7", "min7", "min7", "7", "Maj7"] },
    { name: "Jazz Blues", degrees: [1, 4, 1, 2, 5, 1, 5], progression: ["7", "7", "7", "min7", "7", "7", "7"] }
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

// Funzione per generare una progressione armonica con un accordo mancante
export function generateChordPattern(firstNote = 48, difficulty = "easy") {
  const numKeys = 25;
  const lastNote = firstNote + numKeys;
  const patterns = chordPatterns[difficulty] || chordPatterns["easy"];
  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
  let rootNote, progressionDetails, missingChordData;
  do {
    rootNote = firstNote + Math.floor(Math.random() * (numKeys));
    progressionDetails = [];
    missingChordData = null;
    const missingIndex = selectedPattern.degrees.length - 1; // L'ultimo accordo è sempre quello mancante
    selectedPattern.degrees.forEach((degree, index) => {
      const degrees = rootNote + calculateDegree(rootNote, degree);
      const chordType = selectedPattern.progression[index];
      const chordData = generateRandomChord(degrees, difficulty, degrees, chordType);
      const chordDetails = {
        midiRoot: chordData.midiRoot,
        noteRoot: chordData.noteRoot,
        chordType: chordData.chordType,
        inversion: chordData.inversion,
        midiNotes: chordData.midiNotes,
        notes: chordData.notes
      };
      if (index === missingIndex) {
        missingChordData = chordDetails;
        progressionDetails.push(null); // Posizione mancante
      } else {
        progressionDetails.push(chordDetails);
      }
    });
  } while (missingChordData.midiNotes[missingChordData.midiNotes.length - 1] >= lastNote);
  return {
    name: selectedPattern.name,
    degrees: selectedPattern.degrees,
    progressionDetails,
    missingChordData
  };
}