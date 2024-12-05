import PianoController from "./controller.js";

const piano = new PianoController("piano", 24, 60);

// Funzione per ottenere le note correnti
function getPressedNotes() {
    return piano.getPressedNotes();
}

// Esempio di utilizzo
setInterval(() => {
    console.log("Current pressed notes:", getPressedNotes());
}, 1000);
