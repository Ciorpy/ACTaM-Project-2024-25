class PianoModel {
    constructor() {
        this.currentPressedNotes = [];
    }

    getPressedNotes() {
        return [...this.currentPressedNotes]; 
    }

    setPressedNotes(notes) {
        this.currentPressedNotes = notes;
    }

    addPressedNote(note) {
        if (!this.currentPressedNotes.includes(note)) {
            this.currentPressedNotes.push(note);
        }
    }

    removePressedNote(note) {
        this.currentPressedNotes = this.currentPressedNotes.filter(n => n !== note);
    }
}

export default PianoModel;
