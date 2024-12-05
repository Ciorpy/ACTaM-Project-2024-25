const notesInOctave = 12;

// Funzione per generare gli accordi, inclusi sus con settima
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

// Esempi di utilizzo
//console.log(recognizeChordMIDI([60, 64, 67]));       // Output: "Root: C, Chord: Maj"
//console.log(recognizeChordMIDI([65, 63, 67]));       // Output: "Root: C, Chord: min"
//console.log(recognizeChordMIDI([60, 63, 66]));       // Output: "Root: C, Chord: dim"
//console.log(recognizeChordMIDI([61, 64, 69]));       // Output: "Root: C, Chord: aug"
//console.log(recognizeChordMIDI([60, 64, 67, 70]));   // Output: "Root: C, Chord: 7"
//console.log(recognizeChordMIDI([62, 65, 69, 72]));   // Output: "Root: D, Chord: m7"
//console.log(recognizeChordMIDI([61, 65, 68, 71]));   // Output: "Root: C#, Chord: m7b5"


// Funzione per generare inversioni di accordi
function generateInversion(chordNotes) {
  let firstInversion = [chordNotes[1], chordNotes[2], chordNotes[0] + 12];  // Prima inversione
  let secondInversion = [chordNotes[2], chordNotes[0] + 12, chordNotes[1] + 12]; // Seconda inversione

  return {
    rootPosition: chordNotes,          // Posizione fondamentale
    firstInversion: firstInversion,    // Prima inversione
    secondInversion: secondInversion   // Seconda inversione
  };
}

// Funzione di generazione di un accordo random con inversioni
function generateRandomChord(startNote = 60) {
  // Lista di tipi di accordi possibili
  const chordTypes = [
    "Maj", "min", "dim", "aug",         // Triadi
    "Maj7", "7", "m7", "m7b5", "dim7", "Maj7#5", "7#5", "m7#5", "mMaj7",  // Accordi con settima
    "sus2", "sus4" // Accordi sospesi senza la settima
  ];

  // Lista di note di root possibili (da C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
  const rootNotes = Array.from({length: 12}, (_, i) => i);  // [0, 1, 2, ..., 11] rappresenta un'ottava

  // Selezionare una nota root casuale dalla lista
  const randomRoot = rootNotes[Math.floor(Math.random() * rootNotes.length)] + startNote; // Sommare la nota di partenza

  // Selezionare un tipo di accordo casuale dalla lista
  const randomChordType = chordTypes[Math.floor(Math.random() * chordTypes.length)];

  // Generare l'accordo in base alla root e al tipo di accordo selezionato
  const chords = generateChordsMIDI(randomRoot);  // Funzione generica che hai già
  const chord = chords[randomChordType];

  // Generare inversioni per l'accordo
  const inversions = generateInversion(chord);

  // Selezionare casualmente una delle inversioni
  const selectedInversion = [inversions.rootPosition, inversions.firstInversion, inversions.secondInversion][Math.floor(Math.random() * 3)];

  // Aggiornare la root in base all'inversione selezionata
  let updatedRoot;
  let inversionType;
  if (selectedInversion === inversions.firstInversion) {
    updatedRoot = selectedInversion[2]; // La root della prima inversione è la nota più bassa (E)
    inversionType = 'First Inversion';
  } else if (selectedInversion === inversions.secondInversion) {
    updatedRoot = selectedInversion[1]; // La root della seconda inversione è la nota più bassa (G)
    inversionType = 'Second Inversion';
  } else {
    updatedRoot = randomRoot; // Root fondamentale
    inversionType = 'Root Position';
  }

  // Restituire l'output dell'accordo con inversioni, la root aggiornata e l'inversione selezionata
  return {
    root: updatedRoot,
    chordType: randomChordType,
    notes: selectedInversion,
    inversion: inversionType  // Tipo di inversione
  };
}

// Esegui un esempio di test
console.log("Accordo casuale:", generateRandomChord(60));