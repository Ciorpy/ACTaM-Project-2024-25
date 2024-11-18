// Database con accordi normalizzati
const chordDatabase = {
    // Triadi Maggiori
    "C_major": [[0, 4, 7], [0]],
    "C#_major": [[1, 5, 8], [1]],
    "D_major": [[2, 6, 9], [2]],
    "D#_major": [[3, 7, 10], [3]],
    "E_major": [[4, 8, 11], [4]],
    "F_major": [[0, 5, 9], [5]],
    "F#_major": [[1, 6, 10], [6]],
    "G_major": [[2, 7, 11], [7]],
    "G#_major": [[0, 3, 8], [8]],
    "A_major": [[1, 4, 9], [9]],
    "A#_major": [[2, 5, 10], [10]],
    "B_major": [[3, 6, 11], [11]],

    // Triadi Minori
    "C_minor": [[0, 3, 7], [0]],
    "C#_minor": [[1, 4, 8], [1]],
    "D_minor": [[2, 5, 9], [2]],
    "D#_minor": [[3, 6, 10], [3]],
    "E_minor": [[4, 7, 11], [4]],
    "F_minor": [[0, 5, 8], [5]],
    "F#_minor": [[1, 6, 9], [6]],
    "G_minor": [[2, 7, 10], [7]],
    "G#_minor": [[3, 8, 11], [8]],
    "A_minor": [[0, 4, 9], [9]],
    "A#_minor": [[1, 5, 10], [10]],
    "B_minor": [[2, 6, 11], [11]],

    // Triadi Aumentate
    "C_augmented": [[0, 4, 8], [0]],
    "C#_augmented": [[1, 5, 9], [1]],
    "D_augmented": [[2, 6, 10], [2]],
    "D#_augmented": [[3, 7, 11], [3]],
    "E_augmented": [[0, 4, 8], [4]],
    "F_augmented": [[1, 5, 9], [5]],
    "F#_augmented": [[2, 6, 10], [6]],
    "G_augmented": [[3, 7, 11], [7]],
    "G#_augmented": [[0, 4, 8], [8]],
    "A_augmented": [[1, 5, 9], [9]],
    "A#_augmented": [[2, 6, 10], [10]],
    "B_augmented": [[3, 7, 11], [11]],

    // Triadi Diminuite
    "C_diminished": [[0, 3, 6], [0]],
    "C#_diminished": [[1, 4, 7], [1]],
    "D_diminished": [[2, 5, 8], [2]],
    "D#_diminished": [[3, 6, 9], [3]],
    "E_diminished": [[4, 7, 10], [4]],
    "F_diminished": [[5, 8, 11], [5]],
    "F#_diminished": [[0, 6, 9], [6]],
    "G_diminished": [[1, 7, 10], [7]],
    "G#_diminished": [[2, 8, 11], [8]],
    "A_diminished": [[0, 3, 9], [9]],
    "A#_diminished": [[1, 4, 10], [10]],
    "B_diminished": [[2, 5, 11], [11]]
};

// Funzione per normalizzare una nota MIDI
function normalizeNote(midiNote) {
    return midiNote % 12;
}

// Funzione per normalizzare e ordinare un array di note
function normalizeChord(midiNotes) {
    return midiNotes.map(normalizeNote).sort((a, b) => a - b);
}

// Funzione per identificare un accordo
function identifyChord(midiNotes) {
    const normalizedInput = normalizeChord(midiNotes);
    for (const [chordName, chordData] of Object.entries(chordDatabase)) {
        const chordNotes = chordData[0]; // Estrae solo la parte delle note
        if (JSON.stringify(normalizedInput) === JSON.stringify(chordNotes)) {
            return chordName; // Ritorna il nome dell'accordo
        }
    }
    return null; // Accordo non riconosciuto
}

// Funzione per determinare il rivolto
function determineInversion(midiNotes, chordName) {
    if (!chordName) return "Accordo non riconosciuto";

    // Trova la chiave dell'accordo
    const chordKey = chordDatabase[chordName][1][0]; // Nota chiave dell'accordo
    const normalizedInput = midiNotes.map(normalizeNote); // Normalizza ma mantiene ordine

    // Cerca la posizione della chiave nell'input originale
    const keyPosition = normalizedInput.indexOf(chordKey);

    // Determina il rivolto in base alla posizione
    switch (keyPosition) {
        case 0:
            return "Posizione fondamentale";
        case 1:
            return "Primo rivolto";
        case 2:
            return "Secondo rivolto";
        default:
            return "Rivolto non determinato"; // Questo non dovrebbe accadere con un input corretto
    }
}

// Funzione principale: identifica l'accordo e il rivolto
function identifyChordAndInversion(midiNotes) {
    const chordName = identifyChord(midiNotes);
    const inversion = determineInversion(midiNotes, chordName);
    return { chordName, inversion };
}

// Esempio di utilizzo:
const userNotes = [48, 64, 55]; // C (Do), E (Mi), G (Sol)
const result = identifyChordAndInversion(userNotes);
console.log(result); // { chordName: "C_major", inversion: "Posizione fondamentale" }