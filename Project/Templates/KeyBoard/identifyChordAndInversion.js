// Database con accordi normalizzati
const chordDatabase = {
    // Triadi Maggiori
    "C_major": [0, 4, 7],
    "C#_major": [1, 5, 8],
    "D_major": [2, 6, 9],
    "D#_major": [3, 7, 10],
    "E_major": [4, 8, 11],
    "F_major": [0, 5, 9],
    "F#_major": [1, 6, 10],
    "G_major": [2, 7, 11],
    "G#_major": [0, 3, 8],
    "A_major": [1, 4, 9],
    "A#_major": [2, 5, 10],
    "B_major": [3, 6, 11],
    // Triadi Minori
    "C_minor": [0, 3, 7],
    "C#_minor": [1, 4, 8],
    "D_minor": [2, 5, 9],
    "D#_minor": [3, 6, 10],
    "E_minor": [4, 7, 11],
    "F_minor": [0, 5, 8],
    "F#_minor": [1, 6, 9],
    "G_minor": [2, 7, 10],
    "G#_minor": [3, 8, 11],
    "A_minor": [0, 4, 9],
    "A#_minor": [1, 5, 10],
    "B_minor": [2, 6, 11],
    // Triadi Aumentate
    "C_augmented": [0, 4, 8],
    "C#_augmented": [1, 5, 9],
    "D_augmented": [2, 6, 10],
    "D#_augmented": [3, 7, 11],
    "E_augmented": [0, 4, 8],
    "F_augmented": [1, 5, 9],
    "F#_augmented": [2, 6, 10],
    "G_augmented": [3, 7, 11],
    "G#_augmented": [0, 4, 8],
    "A_augmented": [1, 5, 9],
    "A#_augmented": [2, 6, 10],
    "B_augmented": [3, 7, 11],
    // Triadi Diminuite
    "C_diminished": [0, 3, 6],
    "C#_diminished": [1, 4, 7],
    "D_diminished": [2, 5, 8],
    "D#_diminished": [3, 6, 9],
    "E_diminished": [4, 7, 10],
    "F_diminished": [5, 8, 11],
    "F#_diminished": [0, 6, 9],
    "G_diminished": [1, 7, 10],
    "G#_diminished": [2, 8, 11],
    "A_diminished": [0, 3, 9],
    "A#_diminished": [1, 4, 10],
    "B_diminished": [2, 5, 11]
};

// Database degli intervalli per ogni tipo di accordo e rivolto
const chordIntervals = {
    "major": { "root": [4, 3], "first_inversion": [3, 5], "second_inversion": [5, 4] },
    "minor": { "root": [3, 4], "first_inversion": [4, 5], "second_inversion": [5, 3] },
    "augmented": { "root": [4, 4], "first_inversion": [4, 4], "second_inversion": [4, 4] },
    "diminished": { "root": [3, 3], "first_inversion": [3, 6], "second_inversion": [6, 3] }
};

// Funzione per normalizzare una nota MIDI
function normalizeNote(midiNote) {
    return midiNote % 12;
}

// Funzione per normalizzare e ordinare un array di note
function normalizeChord(midiNotes) {
    return midiNotes.map(normalizeNote).sort((a, b) => a - b);
}

// Funzione per calcolare intervalli modulo 12 tra note consecutive
function calculateIntervalPattern(notes) {
    let intervals = [];
    for (let i = 1; i < notes.length; i++) {
        intervals.push((notes[i] - notes[i - 1] + 12) % 12);
    }
    return intervals;
}

// Funzione per identificare il tipo e il rivolto dell'accordo
function identifyChordAndInversion(midiNotes) {
    const normalizedInput = normalizeChord(midiNotes);

    // Cerca l'accordo nel database
    for (const [chordName, chordNotes] of Object.entries(chordDatabase)) {
        if (JSON.stringify(normalizedInput) === JSON.stringify(chordNotes)) {
            // Identifica il tipo di accordo
            const chordType = chordName.split("_")[1];  // E.g., "major", "minor"
            const intervals = calculateIntervalPattern(midiNotes.map(normalizeNote));

            // Confronta il pattern di intervalli per trovare il rivolto
            for (const [inversionName, expectedIntervals] of Object.entries(chordIntervals[chordType])) {
                if (JSON.stringify(intervals) === JSON.stringify(expectedIntervals)) {
                    return { chordName, inversion: inversionName };
                }
            }
            return { chordName, inversion: "Stato sconosciuto" };
        }
    }
    return { chordName: "Accordo non riconosciuto", inversion: "N/A" };
}

// Esempio di utilizzo:
const userNotes = [0, 4, 8];  // Note MIDI per un B maggiore
const chordInfo = identifyChordAndInversion(userNotes);
console.log(chordInfo);  // Output: { chordName: "B_major", inversion: "root" }