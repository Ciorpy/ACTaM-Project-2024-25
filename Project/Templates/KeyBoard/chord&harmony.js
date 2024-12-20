const notesInOctave = 12;

function generateChordsMIDI(rootMIDI) {
  return {
    // Triadi
    "Maj": [rootMIDI, rootMIDI + 4, rootMIDI + 7],      // Maggiore: T-4-7
    "min": [rootMIDI, rootMIDI + 3, rootMIDI + 7],      // Minore: T-3-7
    "dim": [rootMIDI, rootMIDI + 3, rootMIDI + 6],      // Diminuita: T-3-6
    "aug": [rootMIDI, rootMIDI + 4, rootMIDI + 8],      // Aumentata: T-4-8

    // Sospesi
    "sus2": [rootMIDI, rootMIDI + 2, rootMIDI + 7],     // Sus2: T-2-7
    "sus4": [rootMIDI, rootMIDI + 5, rootMIDI + 7],     // Sus4: T-5-7

    // Sesta
    "6": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 9],      // Maggiore con sesta: T-4-7-9
    "m6": [rootMIDI, rootMIDI + 3, rootMIDI + 7, rootMIDI + 9],      // Minore con sesta: T-3-7-9
    "dim6": [rootMIDI, rootMIDI + 3, rootMIDI + 6, rootMIDI + 9],      // diminuita con sesta: T-3-6-9

    // Settima
    "Maj7": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 11],      // Maggiore con settima maggiore: T-4-7-11
    "mMaj7": [rootMIDI, rootMIDI + 3, rootMIDI + 7, rootMIDI + 11],     // Minore con settima maggiore: T-3-7-11
    "7": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 10],         // Dominante: T-4-7-10
    "m7": [rootMIDI, rootMIDI + 3, rootMIDI + 7, rootMIDI + 10],        // Minore con settima minore: T-3-7-10
    "m7b5": [rootMIDI, rootMIDI + 3, rootMIDI + 6, rootMIDI + 10],      // Minore diminuito con settima: T-3-6-10
    "dim7": [rootMIDI, rootMIDI + 3, rootMIDI + 6, rootMIDI + 9],       // Diminuito con settima diminuita: T-3-6-9
    "Maj7#5": [rootMIDI, rootMIDI + 4, rootMIDI + 8, rootMIDI + 11],    // Maggiore con settima maggiore e quinta aumentata: T-4-8-11
    "7#5": [rootMIDI, rootMIDI + 4, rootMIDI + 8, rootMIDI + 10],       // Dominante con quinta aumentata: T-4-8-10
    "m7#5": [rootMIDI, rootMIDI + 3, rootMIDI + 8, rootMIDI + 10],      // Minore con settima e quinta aumentata: T-3-8-10

    // Accordi di nona
    "9": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 10, rootMIDI + 14],    // Dominante con nona maggiore
    "m9": [rootMIDI, rootMIDI + 3, rootMIDI + 7, rootMIDI + 10, rootMIDI + 14],   // Minore con nona maggiore
    "Maj9": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 11, rootMIDI + 14], // Maggiore con nona maggiore
    "7b9": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 10, rootMIDI + 13],  // Dominante con nona bemolle
    "7#9": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 10, rootMIDI + 15],  // Dominante con nona diesis
    "6b9": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 9, rootMIDI + 13],   // Sesta con nona bemolle
    "6#9": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 9, rootMIDI + 15],   // Sesta con nona diesis
    "6(9)": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 9, rootMIDI + 14],  // Sesta con nona maggiore

    // Accordi alterati
    "alt#5": [rootMIDI, rootMIDI + 4, rootMIDI + 8, rootMIDI + 10],                // T, 3, ♯5, ♭7
    "altb5": [rootMIDI, rootMIDI + 4, rootMIDI + 6, rootMIDI + 10],                // T, 3, ♭5, ♭7
    "altb9": [rootMIDI, rootMIDI + 4, rootMIDI + 10, rootMIDI + 15],               // T, 3, ♭7, ♭9
    "alt#9": [rootMIDI, rootMIDI + 4, rootMIDI + 10, rootMIDI + 17],               // T, 3, ♭7, ♯9
    "altb9#5": [rootMIDI, rootMIDI + 4, rootMIDI + 8, rootMIDI + 10, rootMIDI + 15], // T, 3, ♯5, ♭7, ♭9
    "alt#9#5": [rootMIDI, rootMIDI + 4, rootMIDI + 8, rootMIDI + 10, rootMIDI + 17], // T, 3, ♯5, ♭7, ♯9
    "altb9b5": [rootMIDI, rootMIDI + 4, rootMIDI + 6, rootMIDI + 10, rootMIDI + 15], // T, 3, ♭5, ♭7, ♭9
    "alt#9b5": [rootMIDI, rootMIDI + 4, rootMIDI + 6, rootMIDI + 10, rootMIDI + 17], // T, 3, ♭5, ♭7, ♯9

    // Accordi di undicesima
    "7(11)": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 10, rootMIDI + 17],                // Dominante con undicesima
    "m11": [rootMIDI, rootMIDI + 3, rootMIDI + 7, rootMIDI + 10, rootMIDI + 14, rootMIDI + 17],   // Minore con undicesima
    "Maj11": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 11, rootMIDI + 14, rootMIDI + 17], // Maggiore con undicesima
    "6(11)": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 9, rootMIDI + 17],                 // Sesta con undicesima

    // Accordi di tredicesima
    "13": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 10, rootMIDI + 14, rootMIDI + 21],    // Dominante con tredicesima
    "m13": [rootMIDI, rootMIDI + 3, rootMIDI + 7, rootMIDI + 10, rootMIDI + 14, rootMIDI + 21],   // Minore con tredicesima
    "Maj13": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 11, rootMIDI + 14, rootMIDI + 21], // Maggiore con tredicesima
  };
}


// Database delle progressioni armoniche organizzato per difficoltà
const chordPatterns = {
  easyDiff: [
    { name: "IV-V-I", degrees: [4, 5, 1], progression: ["Maj", "7", "Maj"] },
    { name: "II-V-I", degrees: [2, 5, 1], progression: ["min", "7", "Maj"] },
    { name: "VI-IV-I", degrees: [6, 4, 1], progression: ["min", "Maj", "Maj"] },
    { name: "VI-V-I", degrees: [6, 5, 1], progression: ["min", "7", "Maj"] },  
  ],

  mediumDiff: [
    { name: "VI-II-V-I", degrees: [6, 2, 5, 1], progression: ["m7", "m7", "7", "Maj7"] },
    { name: "VII-VI-V-I", degrees: [7, 6, 5, 1], progression: ["7", "m7", "7", "Maj7"] },
    { name: "III-VI-II-V-I", degrees: [3, 6, 2, 5, 1], progression: ["min", "min", "m7", "7", "Maj7"] },
    { name: "IV-V-I Minor", degrees: [4, 5, 1], progression: ["min", "7", "min"]  },
    { name: "II-V-I with Extensions", degrees: [2, 5, 1], progression: ["m7", "7#5", "Maj7"] },
    { name: "Circle Progression", degrees: [5, 4, 5, 1], progression: ["7", "Maj7", "7", "Maj"] },
    { name: "II-V-I Minor", degrees: [2, 5, 1], progression: ["m7b5", "altb9", "mMaj7"] },
    { name: "Suspended Movement", degrees: [4, 5, 1], progression: ["sus4", "7", "Maj7"] }
  ],

  hardDiff: [
    { name: "II-V-I Extended", degrees: [2, 5, 1], progression: ["m7b5", "7", "Maj7"] },
    { name: "VI-II-V-I Altered", degrees: [6, 2, 5, 1], progression: ["m7", "m7", "alt#9", "Maj7"] },
    { name: "VII-VI-V-I Extended", degrees: [7, 3, 6, 2, 5, 1], progression: ["dim7", "min", "m7", "m7b5", "7", "Maj7"] },
    //{ name: "Complex Jazz", degrees: [2, 4, 6, 5, 1], progression: ["m7", "Maj7", "m7", "7", "Maj7"] },
    { name: "Advanced Circle", degrees: [7, 3, 6, 2, 5, 1], progression: ["dim7", "m7", "m7", "m7", "7", "Maj7"] },
    { name: "II-V-I Minor Extended", degrees: [4, 2, 5, 1], progression: ["min", "m7b5", "altb9", "mMaj7"] },
    { name: "Altered 5-Step", degrees: [5, 4, 6, 2, 1], progression: ["7b9", "Maj7", "m7", "m7b5", "mMaj7"] },
    { name: "Dynamic Alteration", degrees: [3, 6, 2, 5, 1], progression: ["min", "m7", "m7b5", "7#9", "Maj7"] }
  ]
};


export function recognizeChordMIDI(inputNotes) {
  const normalizedInput = inputNotes.map(note => note % notesInOctave);
  const normalizedAndSortedInput = [...normalizedInput].sort((a, b) => a - b);
  for (let rootMIDI = 0; rootMIDI < notesInOctave; rootMIDI++) {
    const chords = generateChordsMIDI(rootMIDI);
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
    let chords = generateChordsMIDI(randomRoot);
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

export function generateChordPattern(firstNote, lastNote, difficulty = "easyDiff") {
  const numKeys = lastNote - firstNote;
  const patterns = chordPatterns[difficulty] || chordPatterns["easyDiff"];
  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
  let rootNote, progressionDetails, missingChordData;
  do {
    rootNote = firstNote + Math.floor(Math.random() * (numKeys));
    progressionDetails = [];
    missingChordData = null;
    const missingIndex = selectedPattern.degrees.length - 1;
    for (let index = 0; index < selectedPattern.degrees.length; index++) {
      const degree = selectedPattern.degrees[index];
      const degrees = calculateDegree(rootNote, degree);
      const chordType = selectedPattern.progression[index];
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
        progressionDetails.push(null);
      } else {
        progressionDetails.push(chordDetails);
      }
    }
  } while (!missingChordData || missingChordData.midiNotes[missingChordData.midiNotes.length - 1] >= lastNote);
  return {
    name: selectedPattern.name,
    degrees: selectedPattern.degrees,
    progressionDetails,
    missingChordData
  };
}