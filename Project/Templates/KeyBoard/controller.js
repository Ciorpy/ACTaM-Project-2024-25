import PianoModel from "./model.js";
import PianoView from "./view.js";

// Volume
let defaultVolume = 0.5;
let loadedVolume = parseFloat(localStorage.getItem("gameVolume"));
let linearVolume = !isNaN(loadedVolume) ? loadedVolume : defaultVolume;
let vol = linearVolume > 0 ? 20 * Math.log10(linearVolume) : -Infinity;

// Inizializza il Sampler con i campioni di piano
const pianoSampler = new Tone.Sampler({
    urls: {
        "A0": "A0.mp3",
        "C1": "C1.mp3",
        "D#1": "Ds1.mp3",
        "F#1": "Fs1.mp3",
        "A1": "A1.mp3",
        "C2": "C2.mp3",
        "D#2": "Ds2.mp3",
        "F#2": "Fs2.mp3",
        "A2": "A2.mp3",
        "C3": "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        "A3": "A3.mp3",
        "C4": "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        "A4": "A4.mp3",
        "C5": "C5.mp3",
        "D#5": "Ds5.mp3",
        "F#5": "Fs5.mp3",
        "A5": "A5.mp3",
        "C6": "C6.mp3",
        "D#6": "Ds6.mp3",
        "F#6": "Fs6.mp3",
        "A6": "A6.mp3",
        "C7": "C7.mp3",
        "D#7": "Ds7.mp3",
        "F#7": "Fs7.mp3",
        "A7": "A7.mp3",
        "C8": "C8.mp3"
    },
    release: 1.5,
    volume: vol,
    baseUrl: "../../Sounds/Piano Samples/"
}).toDestination();


// Aggiungi un listener per sapere quando i sample sono pronti
pianoSampler.onload = () => {
    console.log("Sampler is ready!");
};

class PianoController {
    constructor(containerId, numberOfKeys, startMidiNote) {
        this.model = new PianoModel();
        this.view = new PianoView(containerId, numberOfKeys, startMidiNote);
        //this.synths = {};
        this.allKeysReleased = true;

        this.init();
    }

    init() {
        this.view.renderKeyboard();
        //this.initializeSynths();
        this.view.bindNoteEvents(this.playNote.bind(this), this.stopNote.bind(this));
    }

    /* initializeSynths() {
        for (let i = 0; i < this.view.numberOfKeys; i++) {
            const midiNote = this.view.startMidiNote + i;
            this.synths[midiNote] = new Tone.Synth({
                oscillator: { type: "amsine" },
                envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.8 },
            }).toDestination();
        }
    } */

    playNote(note) {
        if (this.allKeysReleased) {
            this.model.setPressedNotes([]);
            this.allKeysReleased = false;
        }
    
        const pressedNotes = this.model.getPressedNotes();
    
        // Aggiungi il controllo esplicito
        if (!pressedNotes.includes(note)) {
            this.view.setActiveKey(note, true);
            pianoSampler.triggerAttackRelease(Tone.Frequency(note, "midi"), "4n");
            pressedNotes.push(note); // Aggiungi la nota alla lista dei tasti premuti
            this.model.setPressedNotes(pressedNotes); // Sincronizza il modello
        }
    }
    
    stopNote(note) {
        this.view.setActiveKey(note, false);
        this.view.resetKeyColor(note);
        //this.synths[note].triggerRelease();
    
        const pressedNotes = this.model.getPressedNotes();
        const index = pressedNotes.indexOf(note);
    
        if (index > -1) {
            pressedNotes.splice(index, 1); // Rimuovi la nota dalla lista
            this.model.setPressedNotes(pressedNotes);
        }
    
        if (pressedNotes.length === 0) {
            this.allKeysReleased = true;
        }
    }

    delayedUpdatePressedNotes(newNote) {
        const updatedNotes = this.model.getPressedNotes();
        if (!updatedNotes.includes(newNote)) {
            updatedNotes.push(newNote);
        }
        this.model.setPressedNotes(updatedNotes);
    }

    getPressedNotes() {
        return this.model.getPressedNotes();
    }

    playChord(chord) {
        chord.forEach(note => {
            pianoSampler.triggerAttackRelease(Tone.Frequency(note, "midi"), "2n");
        });
    }

}

export default PianoController;
