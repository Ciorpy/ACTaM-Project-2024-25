// Database con accordi normalizzati
const chordDatabase = {
    // Triadi Maggiori
    "C_major": [0, 4, 7],
    "C#_major": [1, 5, 8],
    "D_major": [2, 6, 9],
    "D#_major": [3, 7, 10],
    "E_major": [4, 8, 11],
    "F_major": [5, 9, 0],
    "F#_major": [6, 10, 1],
    "G_major": [7, 11, 2],
    "G#_major": [8, 0, 3],
    "A_major": [9, 1, 4],
    "A#_major": [10, 2, 5],
    "B_major": [11, 3, 6],
    // Triadi Minori
    "C_minor": [0, 3, 7],
    "C#_minor": [1, 4, 8],
    "D_minor": [2, 5, 9],
    "D#_minor": [3, 6, 10],
    "E_minor": [4, 7, 11],
    "F_minor": [5, 8, 0],
    "F#_minor": [6, 9, 1],
    "G_minor": [7, 10, 2],
    "G#_minor": [8, 11, 3],
    "A_minor": [9, 0, 4],
    "A#_minor": [10, 1, 5],
    "B_minor": [11, 2, 6],
    // Triadi Aumentate
    "C_augmented": [0, 4, 8],
    "C#_augmented": [1, 5, 9],
    "D_augmented": [2, 6, 10],
    "D#_augmented": [3, 7, 11],
    "E_augmented": [4, 8, 0],
    "F_augmented": [5, 9, 1],
    "F#_augmented": [6, 10, 2],
    "G_augmented": [7, 11, 3],
    "G#_augmented": [8, 0, 4],
    "A_augmented": [9, 1, 5],
    "A#_augmented": [10, 2, 6],
    "B_augmented": [11, 3, 7],
    // Triadi Diminuite
    "C_diminished": [0, 3, 6],
    "C#_diminished": [1, 4, 7],
    "D_diminished": [2, 5, 8],
    "D#_diminished": [3, 6, 9],
    "E_diminished": [4, 7, 10],
    "F_diminished": [5, 8, 11],
    "F#_diminished": [6, 9, 0],
    "G_diminished": [7, 10, 1],
    "G#_diminished": [8, 11, 2],
    "A_diminished": [9, 0, 3],
    "A#_diminished": [10, 1, 4],
    "B_diminished": [11, 2, 5]
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
            const intervals = calculateIntervalPattern(normalizedInput);

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
const userNotes = [11, 6, 26];  // Note MIDI per un C maggiore
const chordInfo = identifyChordAndInversion(userNotes);
print(chordInfo);  // Output: { chordName: "C_major", inversion: "root" }
