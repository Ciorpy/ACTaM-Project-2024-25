// Dizionario per mappare le note ai loro indici MIDI (solo naturali e diesis)
const noteToIndex = {
    "Cb": 11, "C": 0, "C#": 1,
    "Db": 1, "D": 2, "D#": 3,
    "Eb": 3, "E": 4, "E#": 5,
    "Fb": 4, "F": 5, "F#": 6,
    "Gb": 6, "G": 7, "G#": 8,
    "Ab": 8, "A": 9, "A#": 10, 
    "Bb": 10, "B": 11, "B#": 0,
};

// Dizionario inverso per convertire indici in note
const indexToNote = Object.entries(noteToIndex).reduce((acc, [note, index]) => {
    acc[index] = note;
    return acc;
}, {});

// Database degli accordi con i nomi delle note
const chordDatabase = {
    // Triadi Maggiori
    "Cb_major": ["Cb", "Eb", "Gb"],
    "C_major": ["C", "E", "G"],
    "C#_major": ["C#", "F", "G#"],
    "Db_major": ["Db", "F", "Ab"],
    "D_major": ["D", "F#", "A"],
    "D#_major": ["D#", "G", "A#"],
    "Eb_major": ["Eb", "G", "Bb"],
    "E_major": ["E", "G#", "B"],
    "E#_major": ["E#", "A", "B#"],
    "Fb_major": ["Fb", "Ab", "Cb"],
    "F_major": ["F", "A", "C"],
    "F#_major": ["F#", "A#", "C#"],
    "Gb_major": ["Gb", "Bb", "Db"],
    "G_major": ["G", "B", "D"],
    "G#_major": ["G#", "C", "D#"],
    "Ab_major": ["Ab", "C", "Eb"],
    "A_major": ["A", "C#", "E"],
    "A#_major": ["A#", "D", "E#"],
    "Bb_major": ["Bb", "D", "F"],
    "B_major": ["B", "D#", "F#"],
    "B#_major": ["B#", "E", "G"],

    // Triadi Minori
    "Cb_minor": ["Cb", "D", "Gb"],
    "C_minor": ["C", "Eb", "G"],
    "C#_minor": ["C#", "E", "G#"],
    "Db_minor": ["Db", "Fb", "Ab"],
    "D_minor": ["D", "F", "A"],
    "D#_minor": ["D#", "F#", "A#"],
    "Eb_minor": ["Eb", "Gb", "Bb"],
    "E_minor": ["E", "G", "B"],
    "E#_minor": ["E#", "G#", "B#"],
    "Fb_minor": ["Fb", "G", "Cb"],
    "F_minor": ["F", "Ab", "C"],
    "F#_minor": ["F#", "A", "C#"],
    "Gb_minor": ["Gb", "A", "Db"],
    "G_minor": ["G", "Bb", "D"],
    "G#_minor": ["G#", "B", "D#"],
    "Ab_minor": ["Ab", "Cb", "Eb"],
    "A_minor": ["A", "C", "E"],
    "A#_minor": ["A#", "C#", "E#"],
    "Bb_minor": ["Bb", "Db", "F"],
    "B_minor": ["B", "D", "F#"],
    "B#_minor": ["B#", "D#", "G"],

    // Triadi Aumentate
    "Cb_augmented": ["Cb", "Eb", "G"],
    "C_augmented": ["C", "E", "G#"],
    "C#_augmented": ["C#", "F", "A"],
    "Db_augmented": ["Db", "F", "A"],
    "D_augmented": ["D", "F#", "A#"],
    "D#_augmented": ["D#", "G", "B"],
    "Eb_augmented": ["Eb", "G", "B"],
    "E_augmented": ["E", "G#", "B#"],
    "E#_augmented": ["E#", "A", "C"],
    "Fb_augmented": ["Fb", "Ab", "C"],
    "F_augmented": ["F", "A", "C#"],
    "F#_augmented": ["F#", "A#", "D"],
    "Gb_augmented": ["Gb", "Bb", "D"],
    "G_augmented": ["G", "B", "D#"],
    "G#_augmented": ["G#", "C", "E"],
    "Ab_augmented": ["Ab", "C", "E"],
    "A_augmented": ["A", "C#", "E#"],
    "A#_augmented": ["A#", "D", "F"],
    "Bb_augmented": ["Bb", "D", "F#"],
    "B_augmented": ["B", "D#", "G"],
    "B#_augmented": ["B#", "E", "G#"],

    // Triadi Diminuite
    "Cb_diminished": ["Cb", "D", "A"],
    "C_diminished": ["C", "Eb", "Gb"],
    "C#_diminished": ["C#", "E", "G"],
    "Db_diminished": ["Db", "Fb", "G"],
    "D_diminished": ["D", "F", "Ab"],
    "D#_diminished": ["D#", "F#", "A"],
    "Eb_diminished": ["Eb", "Gb", "A"],
    "E_diminished": ["E", "G", "Bb"],
    "E#_diminished": ["E#", "G#", "B"],
    "Fb_diminished": ["Fb", "G", "B"],
    "F_diminished": ["F", "Ab", "Cb"],
    "F#_diminished": ["F#", "A", "C"],
    "Gb_diminished": ["Gb", "A", "C"],
    "G_diminished": ["G", "Bb", "Db"],
    "G#_diminished": ["G#", "B", "D"],
    "Ab_diminished": ["Ab", "Cb", "D"],
    "A_diminished": ["A", "C", "Eb"],
    "A#_diminished": ["A#", "C#", "E"],
    "Bb_diminished": ["Bb", "Db", "Fb"],
    "B_diminished": ["B", "D", "F"],
    "B#_diminished": ["B#", "D#", "F#"],
};

// Funzione per verificare se l'input è numerico o testuale
function isNumericInput(input) {
    return typeof input[0] === "number";
}

// Funzione per convertire note da indice a nome
function indicesToNoteNames(indices) {
    return indices.map(index => indexToNote[index % 12]);
}

// Funzione per normalizzare e ordinare un array di note (in formato lettere)
function normalizeChord(noteNames) {
    const indices = noteNames.map(note => noteToIndex[note]);
    return indices.sort((a, b) => a - b).map(index => indexToNote[index]);
}

// Funzione per identificare tutti gli accordi corrispondenti
function identifyAllChords(input) {
    let noteNames = input;

    // Se l'input è numerico, converti in nomi di note
    if (isNumericInput(input)) {
        noteNames = indicesToNoteNames(input);
    }

    const normalizedInput = normalizeChord(noteNames);
    const matchingChords = [];

    for (const [chordName, chordData] of Object.entries(chordDatabase)) {
        const chordNotes = chordData;
        if (JSON.stringify(normalizedInput) === JSON.stringify(normalizeChord(chordNotes))) {
            matchingChords.push(chordName);
        }
    }

    return matchingChords.length > 0 ? matchingChords : null;
}

// Funzione principale aggiornata: identifica solo gli accordi
function identifyChords(input) {
    const matchingChords = identifyAllChords(input);
    return matchingChords ? { chords: matchingChords } : { chords: null };
}



// Esempio di utilizzo con indici MIDI

const midiNotes = [48, 64, 55]; // C (Do), E (Mi), G (Sol)
const result = identifyChords(midiNotes); // { chordName: "C_major", inversion: "Posizione fondamentale" }

// Esempio di utilizzo con note
//const noteNames = ["B", "E", "G"];
//const result = identifyChords(noteNames);

if (result.chords) {
    console.log("Accordi riconosciuti:", result.chords.join(", "));
} else {
    console.log("Nessun accordo trovato");
}
