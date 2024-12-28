// -------------------------------------------------------------------------------------------------------------------------------------------------
//          CHORD AND HARMONY JAVASCRIPT
// -------------------------------------------------------------------------------------------------------------------------------------------------

// CONSTANTS AND DATABASE --------------------------------------------------------------------------------------------------------------------------

const notesInOctave = 12;

// Dynamic Chords Database
function generateChords(rootMIDI) {
  return {
    "Maj": [rootMIDI, rootMIDI + 4, rootMIDI + 7],
    "min": [rootMIDI, rootMIDI + 3, rootMIDI + 7],
    "dim": [rootMIDI, rootMIDI + 3, rootMIDI + 6],
    "aug": [rootMIDI, rootMIDI + 4, rootMIDI + 8],

    "sus2": [rootMIDI, rootMIDI + 2, rootMIDI + 7],
    "sus4": [rootMIDI, rootMIDI + 5, rootMIDI + 7],

    "6": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 9],
    "m6": [rootMIDI, rootMIDI + 3, rootMIDI + 7, rootMIDI + 9],
    "dim6": [rootMIDI, rootMIDI + 3, rootMIDI + 6, rootMIDI + 9],

    "Maj7": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 11],
    "mMaj7": [rootMIDI, rootMIDI + 3, rootMIDI + 7, rootMIDI + 11],
    "7": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 10],
    "m7": [rootMIDI, rootMIDI + 3, rootMIDI + 7, rootMIDI + 10],
    "m7b5": [rootMIDI, rootMIDI + 3, rootMIDI + 6, rootMIDI + 10],
    "dim7": [rootMIDI, rootMIDI + 3, rootMIDI + 6, rootMIDI + 9],
    "Maj7#5": [rootMIDI, rootMIDI + 4, rootMIDI + 8, rootMIDI + 11],
    "7#5": [rootMIDI, rootMIDI + 4, rootMIDI + 8, rootMIDI + 10],
    "m7#5": [rootMIDI, rootMIDI + 3, rootMIDI + 8, rootMIDI + 10],

    "9": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 10, rootMIDI + 14],
    "m9": [rootMIDI, rootMIDI + 3, rootMIDI + 7, rootMIDI + 10, rootMIDI + 14],
    "Maj9": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 11, rootMIDI + 14],
    "7b9": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 10, rootMIDI + 13],
    "7#9": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 10, rootMIDI + 15],
    "6b9": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 9, rootMIDI + 13],
    "6#9": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 9, rootMIDI + 15],
    "6(9)": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 9, rootMIDI + 14],

    "alt#5": [rootMIDI, rootMIDI + 4, rootMIDI + 8, rootMIDI + 10],
    "altb5": [rootMIDI, rootMIDI + 4, rootMIDI + 6, rootMIDI + 10],
    "altb9": [rootMIDI, rootMIDI + 4, rootMIDI + 10, rootMIDI + 15],
    "alt#9": [rootMIDI, rootMIDI + 4, rootMIDI + 10, rootMIDI + 17],
    "altb9#5": [rootMIDI, rootMIDI + 4, rootMIDI + 8, rootMIDI + 10, rootMIDI + 15],
    "alt#9#5": [rootMIDI, rootMIDI + 4, rootMIDI + 8, rootMIDI + 10, rootMIDI + 17],
    "altb9b5": [rootMIDI, rootMIDI + 4, rootMIDI + 6, rootMIDI + 10, rootMIDI + 15],
    "alt#9b5": [rootMIDI, rootMIDI + 4, rootMIDI + 6, rootMIDI + 10, rootMIDI + 17],

    "7(11)": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 10, rootMIDI + 17],
    "m11": [rootMIDI, rootMIDI + 3, rootMIDI + 7, rootMIDI + 10, rootMIDI + 14, rootMIDI + 17],
    "Maj11": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 11, rootMIDI + 14, rootMIDI + 17],
    "6(11)": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 9, rootMIDI + 17],

    "13": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 10, rootMIDI + 14, rootMIDI + 21],
    "m13": [rootMIDI, rootMIDI + 3, rootMIDI + 7, rootMIDI + 10, rootMIDI + 14, rootMIDI + 21],
    "Maj13": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 11, rootMIDI + 14, rootMIDI + 21],
  };
}

// Cadences Database
const chordCadences = {
  easyDiff: [
    { name: "IV-V-I", degrees: [4, 5, 1], cadence: ["Maj", "7", "Maj"] },
    { name: "II-V-I", degrees: [2, 5, 1], cadence: ["min", "7", "Maj"] },
    { name: "VI-IV-I", degrees: [6, 4, 1], cadence: ["min", "Maj", "Maj"] },
    { name: "VI-V-I", degrees: [6, 5, 1], cadence: ["min", "7", "Maj"] },  
  ],

  mediumDiff: [
    { name: "VI-II-V-I", degrees: [6, 2, 5, 1], cadence: ["m7", "m7", "7", "Maj7"] },
    { name: "VII-VI-V-I", degrees: [7, 6, 5, 1], cadence: ["7", "m7", "7", "Maj7"] },
    { name: "III-VI-II-V-I", degrees: [3, 6, 2, 5, 1], cadence: ["min", "min", "m7", "7", "Maj7"] },
    { name: "IV-V-I Minor", degrees: [4, 5, 1], cadence: ["min", "7", "min"]  },
    { name: "II-V-I with Extensions", degrees: [2, 5, 1], cadence: ["m7", "7#5", "Maj7"] },
    { name: "Circle Cadence", degrees: [5, 4, 5, 1], cadence: ["7", "Maj7", "7", "Maj"] },
    { name: "II-V-I Minor", degrees: [2, 5, 1], cadence: ["m7b5", "altb9", "mMaj7"] },
    { name: "Suspended Movement", degrees: [4, 5, 1], cadence: ["sus4", "7", "Maj7"] }
  ],

  hardDiff: [
    { name: "II-V-I Extended", degrees: [2, 5, 1], cadence: ["m7b5", "7", "Maj7"] },
    { name: "VI-II-V-I Altered", degrees: [6, 2, 5, 1], cadence: ["m7", "m7", "alt#9", "Maj7"] },
    { name: "VII-VI-V-I Extended", degrees: [7, 3, 6, 2, 5, 1], cadence: ["dim7", "min", "m7", "m7b5", "7", "Maj7"] },
    //{ name: "Complex Jazz", degrees: [2, 4, 6, 5, 1], cadence: ["m7", "Maj7", "m7", "7", "Maj7"] },
    { name: "Advanced Circle", degrees: [7, 3, 6, 2, 5, 1], cadence: ["dim7", "m7", "m7", "m7", "7", "Maj7"] },
    { name: "II-V-I Minor Extended", degrees: [4, 2, 5, 1], cadence: ["min", "m7b5", "altb9", "mMaj7"] },
    { name: "Altered 5-Step", degrees: [5, 4, 6, 2, 1], cadence: ["7b9", "Maj7", "m7", "m7b5", "mMaj7"] },
    { name: "Dynamic Alteration", degrees: [3, 6, 2, 5, 1], cadence: ["min", "m7", "m7b5", "7#9", "Maj7"] }
  ]
};

// FUNCTIONS ---------------------------------------------------------------------------------------------------------------------------------------

// Utility
function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((val, index) => val === arr2[index]);
}

function midiToNoteName(midi) {
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return noteNames[midi % notesInOctave];
}

function calculateDegree(rootNote, degree) {
  const scaleSteps = [2, 2, 1, 2, 2, 2, 1];
  let note = rootNote;
  for (let i = 1; i < degree; i++) {
    note += scaleSteps[(i - 1) % scaleSteps.length];
  }
  return note % notesInOctave;
}

function generateInversions(chordNotes) {
  const inversions = [];
  const numNotes = chordNotes.length;
  for (let i = 0; i < numNotes; i++) {
    const inversion = chordNotes
      .slice(i)
      .concat(chordNotes.slice(0, i).map(note => note + 12));
    inversions.push(inversion);
  }
  return inversions;
}

// Practice Mode
export function recognizeChord(inputNotes) {
  const normalizedInput = inputNotes.map(note => note % notesInOctave);
  const normalizedAndSortedInput = [...normalizedInput].sort((a, b) => a - b);
  for (let rootMIDI = 0; rootMIDI < notesInOctave; rootMIDI++) {
    const chords = generateChords(rootMIDI);
    for (let chordName in chords) {
      const chordNotes = chords[chordName];
      const normalizedChord = chordNotes.map(note => note % notesInOctave);
      const normalizedAndSortedChord = [...normalizedChord].sort((a, b) => a - b);
      if (arraysEqual(normalizedAndSortedInput, normalizedAndSortedChord)) {
        const rootIndex = normalizedInput.indexOf(rootMIDI % notesInOctave);
        const inversionType = rootIndex === 0 ? "ROOT POSITION" : `${normalizedInput.length - rootIndex}° INVERSION`;
        return {
          midiRoot: rootMIDI,
          noteRoot: midiToNoteName(rootMIDI),
          chordType: chordName,
          inversion: inversionType,
          midiNotes: inputNotes,
          notes: inputNotes.map(midiToNoteName),
        };
      }
    }
  }
  return {
    midiRoot: null,
    noteRoot: null,
    chordType: "UNKNOWN",
    inversion: null,
    midiNotes: [],
    notes: []
  };
}

// Chords Game
export function generateRandomChord(startNote, lastNote, difficulty = "easyDiff", root = null, type = null) {
  const chordTypesByDifficulty = {
    easyDiff: ["Maj", "min"],
    mediumDiff: ["6", "m6", "dim", "aug"],
    hardDiff: ["Maj7", "mMaj7", "7", "m7", "m7b5", "dim7", "Maj7#5", "7#5", "m7#5"],
  };
  const numKeys = lastNote - startNote;
  let updatedRoot, randomChordType, inversionType, selectedInversion;
  do {
    let randomRoot = root ?? Math.floor(Math.random() * (numKeys));
    randomRoot += startNote;
    let chordTypes = chordTypesByDifficulty[difficulty] || chordTypesByDifficulty["easyDiff"];
    randomChordType = type ?? chordTypes[Math.floor(Math.random() * chordTypes.length)];
    let chords = generateChords(randomRoot);
    let chord = chords[randomChordType];
    let inversions = generateInversions(chord);
    let selectedInversionIndex = Math.floor(Math.random() * inversions.length);
    selectedInversion = inversions[selectedInversionIndex];
    updatedRoot = selectedInversionIndex === 0 ? selectedInversion[0] : selectedInversion[selectedInversion.length - selectedInversionIndex];
    inversionType = selectedInversionIndex === 0 ? "ROOT POSITION" : `${selectedInversionIndex}° INVERSION`;
    selectedInversion = selectedInversion.sort();
  } while (selectedInversion[selectedInversion.length - 1] >= lastNote);
  return {
    midiRoot: updatedRoot,
    noteRoot: midiToNoteName(updatedRoot),
    chordType: randomChordType,
    inversion: inversionType,
    midiNotes: selectedInversion,
    notes: selectedInversion.map(midiToNoteName)
  };
}

// Harmony Game
export function generateRandomCadence(firstNote, lastNote, difficulty = "easyDiff") {
  const numKeys = lastNote - firstNote;
  const patterns = chordCadences[difficulty] || chordCadences["easyDiff"];
  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
  let rootNote, cadenceDetails, missingChordData;
  let cadenceName = "";
  let n = "";
  let i = 0;
  do {
    rootNote = firstNote + Math.floor(Math.random() * (numKeys));
    cadenceDetails = [];
    missingChordData = null;
    const missingIndex = selectedPattern.degrees.length - 1;
    for (let index = 0; index < selectedPattern.degrees.length; index++) {
      const degree = selectedPattern.degrees[index];
      const degrees = calculateDegree(rootNote, degree);
      const chordType = selectedPattern.cadence[index];
      const chordData = generateRandomChord(firstNote, lastNote, difficulty, degrees, chordType);
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
        cadenceDetails.push(null);
      } else {
        cadenceDetails.push(chordDetails);
      }
    }
  } while (!missingChordData || missingChordData.midiNotes[missingChordData.midiNotes.length - 1] >= lastNote);
  do {
      n += `${cadenceDetails[i].noteRoot}${cadenceDetails[i].chordType}`;
      n += " - ";
      i++;
  } while (i < cadenceDetails.length - 1)
  cadenceName = n.slice(0, -2);
  return {
    name: selectedPattern.name,
    degrees: selectedPattern.degrees,
    cadenceDetails,
    cadenceName,
    missingChordData
  };
}

// -------------------------------------------------------------------------------------------------------------------------------------------------