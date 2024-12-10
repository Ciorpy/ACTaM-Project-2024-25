import PianoModel from "./model.js";
import PianoView from "./view.js";

class PianoController {
    constructor(containerId, numberOfKeys, startMidiNote) {
        this.model = new PianoModel();
        this.view = new PianoView(containerId, numberOfKeys, startMidiNote);
        this.synths = {};
        this.allKeysReleased = true;

        this.init();
    }

    init() {
        this.view.renderKeyboard();
        this.initializeSynths();
        this.view.bindNoteEvents(this.playNote.bind(this), this.stopNote.bind(this));
    }

    initializeSynths() {
        for (let i = 0; i < this.view.numberOfKeys; i++) {
            const midiNote = this.view.startMidiNote + i;
            this.synths[midiNote] = new Tone.Synth({
                oscillator: { type: "amsine" },
                envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.8 },
            }).toDestination();
        }
    }

    playNote(note) {
        if (this.allKeysReleased) {
            this.model.setPressedNotes([]);
            this.allKeysReleased = false;
        }
    
        const pressedNotes = this.model.getPressedNotes();
    
        // Aggiungi il controllo esplicito
        if (!pressedNotes.includes(note)) {
            this.view.setActiveKey(note, true);
            this.synths[note].triggerAttack(Tone.Frequency(note, "midi"));
            pressedNotes.push(note); // Aggiungi la nota alla lista dei tasti premuti
            this.model.setPressedNotes(pressedNotes); // Sincronizza il modello
        }
    }
    
    stopNote(note) {
        this.view.setActiveKey(note, false);
        this.view.resetKeyColor(note);
        this.synths[note].triggerRelease();
    
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
            this.synths[note].triggerAttackRelease(Tone.Frequency(note, "midi"), "1n");
        });
    }
}

export default PianoController;
