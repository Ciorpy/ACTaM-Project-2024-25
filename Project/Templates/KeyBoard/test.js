const { identifyChords } = require('./identifyChordAndInversion');

const midiNotes = [48, 64, 55]; // C (Do), E (Mi), G (Sol)
const result = identifyChords(midiNotes);

if (result.chords) {
    console.log("Accordi riconosciuti:", result.chords.join(", "));
} else {
    console.log("Nessun accordo trovato");
}