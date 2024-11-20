// Dizionario per mappare le note ai loro indici MIDI
const noteToIndex = {
    "C": 0, "C#": 1,
    "D": 2, "D#": 3,
    "E": 4, "F": 5,
    "F#": 6, "G": 7,
    "G#": 8, "A": 9,
    "A#": 10, "B": 11
};

// Dizionario inverso per convertire indici in note
const indexToNote = Object.entries(noteToIndex).reduce((acc, [note, index]) => {
    acc[index] = note;
    return acc;
}, {});

// Database degli accordi con i nomi delle note
const chordDatabase = {
    // Triadi Maggiori
    "C_major": [["C", "E", "G"], ["C"]],
    "C#_major": [["C#", "F", "G#"], ["C#"]],
    "D_major": [["D", "F#", "A"], ["D"]],
    "D#_major": [["D#", "G", "A#"], ["D#"]],
    "E_major": [["E", "G#", "B"], ["E"]],
    "F_major": [["F", "A", "C"], ["F"]],
    "F#_major": [["F#", "A#", "C#"], ["F#"]],
    "G_major": [["G", "B", "D"], ["G"]],
    "G#_major": [["G#", "C", "D#"], ["G#"]],
    "A_major": [["A", "C#", "E"], ["A"]],
    "A#_major": [["A#", "D", "F"], ["A#"]],
    "B_major": [["B", "D#", "F#"], ["B"]],

    // Triadi Minori
    "C_minor": [["C", "D#", "G"], ["C"]],
    "C#_minor": [["C#", "E", "G#"], ["C#"]],
    "D_minor": [["D", "F", "A"], ["D"]],
    "D#_minor": [["D#", "F#", "A#"], ["D#"]],
    "E_minor": [["E", "G", "B"], ["E"]],
    "F_minor": [["F", "G#", "C"], ["F"]],
    "F#_minor": [["F#", "A", "C#"], ["F#"]],
    "G_minor": [["G", "A#", "D"], ["G"]],
    "G#_minor": [["G#", "B", "D#"], ["G#"]],
    "A_minor": [["A", "C", "E"], ["A"]],
    "A#_minor": [["A#", "C#", "F"], ["A#"]],
    "B_minor": [["B", "D", "F#"], ["B"]],

    // Triadi Aumentate
    "C_augmented": [["C", "E", "G#"], ["C"]],
    "C#_augmented": [["C#", "F", "A"], ["C#"]],
    "D_augmented": [["D", "F#", "A#"], ["D"]],
    "D#_augmented": [["D#", "G", "B"], ["D#"]],
    "E_augmented": [["E", "G#", "C"], ["E"]],
    "F_augmented": [["F", "A", "C#"], ["F"]],
    "F#_augmented": [["F#", "A#", "D"], ["F#"]],
    "G_augmented": [["G", "B", "D#"], ["G"]],
    "G#_augmented": [["G#", "C", "E"], ["G#"]],
    "A_augmented": [["A", "C#", "F"], ["A"]],
    "A#_augmented": [["A#", "D", "F#"], ["A#"]],
    "B_augmented": [["B", "D#", "G"], ["B"]],

    // Triadi Diminuite
    "C_diminished": [["C", "D#", "F#"], ["C"]],
    "C#_diminished": [["C#", "E", "G"], ["C#"]],
    "D_diminished": [["D", "F", "G#"], ["D"]],
    "D#_diminished": [["D#", "F#", "A"], ["D#"]],
    "E_diminished": [["E", "G", "A#"], ["E"]],
    "F_diminished": [["F", "G#", "B"], ["F"]],
    "F#_diminished": [["F#", "A", "C"], ["F#"]],
    "G_diminished": [["G", "A#", "C#"], ["G"]],
    "G#_diminished": [["G#", "B", "D"], ["G#"]],
    "A_diminished": [["A", "C", "D#"], ["A"]],
    "A#_diminished": [["A#", "C#", "E"], ["A#"]],
    "B_diminished": [["B", "D", "F"], ["B"]]
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

// Funzione per identificare un accordo
function identifyChord(input) {
    let noteNames = input;

    // Se l'input è numerico, converti in nomi di note
    if (isNumericInput(input)) {
        noteNames = indicesToNoteNames(input);
    }

    const normalizedInput = normalizeChord(noteNames);
    for (const [chordName, chordData] of Object.entries(chordDatabase)) {
        const chordNotes = chordData[0];
        if (JSON.stringify(normalizedInput) === JSON.stringify(normalizeChord(chordNotes))) {
            return chordName;
        }
    }
    return null; // Accordo non riconosciuto
}

// Funzione per determinare il rivolto
function determineInversion(input, chordName) {
    if (!chordName) return "Accordo non riconosciuto";

    let noteNames = input;
    if (isNumericInput(input)) {
        noteNames = indicesToNoteNames(input);
    }

    const chordKey = chordDatabase[chordName][1][0]; // Nota chiave
    const keyPosition = noteNames.indexOf(chordKey);

    switch (keyPosition) {
        case 0:
            return "Posizione fondamentale";
        case 1:
            return "Secondo rivolto";
        case 2:
            return "Primo rivolto";
        default:
            return "Rivolto non determinato";
    }
}

// Funzione principale: identifica l'accordo e il rivolto
function identifyChordAndInversion(input) {
    const chordName = identifyChord(input);
    const inversion = determineInversion(input, chordName);
    return { chordName, inversion };
}

// Esempio di utilizzo con indici MIDI
const midiNotes = [48, 64, 55]; // C (Do), E (Mi), G (Sol)
console.log(identifyChordAndInversion(midiNotes)); // { chordName: "C_major", inversion: "Posizione fondamentale" }

// Esempio di utilizzo con note
//const noteNames = ["E", "G#", "C"];
//console.log(identifyChordAndInversion(noteNames)); // { chordName: "C_major", inversion: "Posizione fondamentale" }