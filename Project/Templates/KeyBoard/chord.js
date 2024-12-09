const notesInOctave = 12;

// Funzione per generare gli accordi (database dinamico)
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
    "Maj6": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 9],      // Maggiore con sesta: T-4-7-9
    "min6": [rootMIDI, rootMIDI + 3, rootMIDI + 7, rootMIDI + 9],      // Minore con sesta: T-3-7-9
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


// Funzione per riconoscere l'accordo dato un array di note MIDI
function recognizeChordMIDI(inputNotes) {
  // Normalizza le note all'interno di un'ottava (0-11)
  const normalizedInput = inputNotes.map(note => note % notesInOctave).sort((a, b) => a - b);

  for (let rootMIDI = 0; rootMIDI < notesInOctave; rootMIDI++) {
    const chords = generateChordsMIDI(rootMIDI);

    for (let chordName in chords) {
      const normalizedChord = chords[chordName].map(note => note % notesInOctave).sort((a, b) => a - b);

      // Controllo su tutte le possibili inversioni
      if (areInversions(normalizedInput, normalizedChord)) {
        return `Root: ${midiToNoteName(rootMIDI)}, Chord: ${chordName}`;
      }
    }
  }

  return "Accordo non riconosciuto";
}

// Funzione per confrontare array e riconoscere inversioni
function areInversions(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1.every((_, j) => arr1[j] === arr2[(j + i) % arr2.length])) {
      return true;
    }
  }
  return false;
}

// Converte un numero MIDI in nome della nota
function midiToNoteName(midi) {
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return noteNames[midi % notesInOctave];
}


// Funzione per generare tutte le inversioni di un accordo
function generateInversions(chordNotes) {
  const inversions = [];
  const numNotes = chordNotes.length;

  for (let i = 0; i < numNotes; i++) {
    const inversion = chordNotes
      .slice(i) // Prendi le note dalla posizione corrente fino alla fine
      .concat(chordNotes.slice(0, i).map(note => note + 12)); // Sposta in alto le note precedenti
    inversions.push(inversion);
  }

  return inversions;
}

// Funzione di generazione di un accordo random con inversioni
export function generateRandomChord(startNote = 60, difficulty = "easyDiff") {
  // Lista di tipi di accordi possibili
  const chordTypesByDifficulty = {
    easyDiff: [
      "Maj", "min", 
      //"dim", "aug"
    ],
    mediumDiff: [
      "Maj6", "min6", "dim", "aug", 
      //"Maj7", "mMaj7", "7", "m7", 
      //"sus2", "sus4", 
      //"m7b5", "dim7", "Maj7#5", "7#5", "m7#5"
    ],
    hardDiff: [
      //"Maj", "min", "dim", "aug",
      //"Maj6", "min6", "dim6", 
      "Maj7", "mMaj7", "7", "m7", 
      //"sus2", "sus4", 
      "m7b5", "dim7", "Maj7#5", "7#5", "m7#5",
      //"9", "m9", "Maj9", "7b9", "7#9", "6b9", "6#9", "6(9)"
    ],
    //jazz: [
      //"Maj", "min", "dim",  
      //"Maj6", "min6", "dim6", "aug",
      //"Maj7", "mMaj7", "7", "m7", "sus2", "sus4", "m7b5", "dim7", "Maj7#5", "7#5", "m7#5",
      //"9", "m9", "Maj9", "7b9", "7#9", "6b9", "6#9", "6(9)", 
      //"7(11)", "m11", "Maj11", "6(11)", "13", "m13", "Maj13"
    //]
  };

  // Ottieni i tipi di accordi per il livello di difficoltà specificato
  const chordTypes = chordTypesByDifficulty[difficulty] || chordTypesByDifficulty["easyDiff"];

  // Seleziona una root e un tipo di accordo casuale
  const randomRoot = Math.floor(Math.random() * 12) + startNote;
  const randomChordType = chordTypes[Math.floor(Math.random() * chordTypes.length)];

  // Genera l'accordo in base al tipo selezionato
  const chords = generateChordsMIDI(randomRoot);
  const chord = chords[randomChordType];

  // Genera tutte le inversioni
  const inversions = generateInversions(chord);

  // Seleziona una delle inversioni casualmente
  const selectedInversionIndex = Math.floor(Math.random() * inversions.length);
  const selectedInversion = inversions[selectedInversionIndex];

  // Determina la nuova root in base all'inversione
  const updatedRoot = selectedInversionIndex === 0 ? selectedInversion[0]
    : selectedInversion[selectedInversion.length - (selectedInversionIndex)];
  const inversionType = selectedInversionIndex === 0 ? "Root Position"
    : `${selectedInversionIndex}° Inversion`;

  return {
    midiRoot: updatedRoot,
    noteRoot: midiToNoteName(updatedRoot),
    chordType: randomChordType,
    inversion: inversionType,
    midiNotes: selectedInversion,
    notes: selectedInversion.map(midiToNoteName)
  };
}

