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

    // Settima
    "Maj7": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 11],      // Maggiore con settima maggiore: T-4-7-11
    "7": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 10],         // Dominante: T-4-7-10
    "m7": [rootMIDI, rootMIDI + 3, rootMIDI + 7, rootMIDI + 10],        // Minore con settima minore: T-3-7-10
    "m7b5": [rootMIDI, rootMIDI + 3, rootMIDI + 6, rootMIDI + 10],      // Minore diminuito con settima: T-3-6-10
    "dim7": [rootMIDI, rootMIDI + 3, rootMIDI + 6, rootMIDI + 9],       // Diminuito con settima diminuita: T-3-6-9
    "Maj7#5": [rootMIDI, rootMIDI + 4, rootMIDI + 8, rootMIDI + 11],    // Maggiore con settima maggiore e quinta aumentata: T-4-8-11
    "7#5": [rootMIDI, rootMIDI + 4, rootMIDI + 8, rootMIDI + 10],       // Dominante con quinta aumentata: T-4-8-10
    "m7#5": [rootMIDI, rootMIDI + 3, rootMIDI + 8, rootMIDI + 10],      // Minore con settima e quinta aumentata: T-3-8-10
    "mMaj7": [rootMIDI, rootMIDI + 3, rootMIDI + 7, rootMIDI + 11],     // Minore con settima maggiore: T-3-7-11

    // Accordi di nona
    "9": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 10, rootMIDI + 14],   // Dominante con nona maggiore
    "m9": [rootMIDI, rootMIDI + 3, rootMIDI + 7, rootMIDI + 10, rootMIDI + 14],  // Minore con nona maggiore
    "Maj9": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 11, rootMIDI + 14],// Maggiore con nona maggiore
    "7b9": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 10, rootMIDI + 13], // Dominante con nona bemolle
    "7#9": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 10, rootMIDI + 15], // Dominante con nona diesis

    // Accordi di undicesima
    "7(11)": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 10, rootMIDI + 17], // Dominante con undicesima
    "m11": [rootMIDI, rootMIDI + 3, rootMIDI + 7, rootMIDI + 10, rootMIDI + 14, rootMIDI + 17], // Minore con undicesima
    "Maj11": [rootMIDI, rootMIDI + 4, rootMIDI + 7, rootMIDI + 11, rootMIDI + 14, rootMIDI + 17], // Maggiore con undicesima

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
function generateRandomChord(startNote = 60, difficulty = "easy") {
  // Lista di tipi di accordi possibili
  const chordTypesByDifficulty = {
    easy: ["Maj", "min", "dim", "7", "Maj7", "m7"],
    medium: ["Maj", "min", "dim", "7", "Maj7", "m7", "Maj7#5", "m7b5", "9", "m9", "sus2", "sus4"],
    hard: [
      "Maj", "min", "dim", "7", "Maj7", "m7", "Maj7#5", "m7b5", "9", "m9", "sus2", "sus4",
      "7b9", "7#9", "7(11)", "m11", "Maj11", "13", "m13", "Maj13"
    ]
  };

  // Ottieni i tipi di accordi per il livello di difficoltà specificato
  const chordTypes = chordTypesByDifficulty[difficulty] || chordTypesByDifficulty["easy"];

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
    notes: selectedInversion.map(midiToNoteName) // Converte ogni numero MIDI in nome della nota
  };
}

// Esempi di test e utilizzo

// Generatore di accordi
console.log("Accordo facile:", generateRandomChord(60, "easy"));      // Facile
console.log("Accordo medio:", generateRandomChord(72, "medium"));     // Medio
console.log("Accordo difficile:", generateRandomChord(48, "hard"));   // Difficile

// Riconoscimento di accordi
// Accordi triadici
console.log(recognizeChordMIDI([60, 64, 67]));       // C Major
console.log(recognizeChordMIDI([61, 64, 68]));       // C# Minor
console.log(recognizeChordMIDI([62, 65, 69]));       // D Minor
console.log(recognizeChordMIDI([63, 66, 69]));       // D# Diminished

// Accordi con settima
console.log(recognizeChordMIDI([64, 67, 71, 74]));   // E Major 7
console.log(recognizeChordMIDI([65, 69, 72, 75]));   // F Dominant 7
console.log(recognizeChordMIDI([66, 70, 73, 76]));   // F# Minor 7

// Accordi con nona
console.log(recognizeChordMIDI([67, 71, 74, 77, 81])); // G Dominant 9
console.log(recognizeChordMIDI([68, 71, 75, 78, 82])); // Ab Minor 9
console.log(recognizeChordMIDI([69, 73, 76, 79, 83])); // A Major 9

// Accordi con undicesima e tredicesima
console.log(recognizeChordMIDI([70, 74, 77, 80, 84, 88])); // Bb 13
console.log(recognizeChordMIDI([71, 75, 78, 81, 85, 89])); // B Minor 13
console.log(recognizeChordMIDI([72, 76, 79, 83, 87]));     // C Maj 11

// Prima inversione
console.log(recognizeChordMIDI([64, 67, 72]));       // C Major (First inversion: E-G-C)

// Seconda inversione
console.log(recognizeChordMIDI([67, 72, 76]));       // C Major (Second inversion: G-C-E)

// Inversione di accordi complessi
console.log(recognizeChordMIDI([70, 77, 84, 91, 98])); // Bb 13 (Random inversion)
console.log(recognizeChordMIDI([76, 83, 90, 97]));     // E Minor 9 (Random inversion)

// Note fuori scala o incomplete
console.log(recognizeChordMIDI([60, 63, 66]));       // Non riconosciuto (Incomplete diminished chord)
console.log(recognizeChordMIDI([61, 64, 68]));       // Non riconosciuto (Random notes)

// Accordature non valide
console.log(recognizeChordMIDI([60, 62, 66]));       // Non riconosciuto
console.log(recognizeChordMIDI([63, 66, 70]));       // Non riconosciuto

// Cluster atonali
console.log(recognizeChordMIDI([60, 61, 62, 63]));   // Non riconosciuto
console.log(recognizeChordMIDI([64, 65, 66, 67]));   // Non riconosciuto

// Scale cromatiche
console.log(recognizeChordMIDI([60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71])); // Non riconosciuto

// Distanze ampie (Note sparse)
console.log(recognizeChordMIDI([48, 55, 60, 67]));    // Non riconosciuto (Sparse notes)
console.log(recognizeChordMIDI([50, 57, 62, 69]));    // Non riconosciuto (Sparse notes)

// Accordi complessi ma dissonanti
console.log(recognizeChordMIDI([60, 66, 72, 77]));    // Non riconosciuto
console.log(recognizeChordMIDI([61, 65, 70, 75]));    // Non riconosciuto