class PianoView {
    constructor(containerId, numberOfKeys, startMidiNote = 96) {
        this.containerId = containerId;
        this.numberOfKeys = numberOfKeys;
        this.startMidiNote = startMidiNote;
        this.blackKeys = [1, 3, 6, 8, 10]; // Indici delle note nere in un'ottava

        // Mappatura dei tasti fisici per ogni ottava
        this.keyboardKeys = [
            // Prima ottava
            "KeyW", "Digit3", "KeyE", "Digit4", "KeyR", "KeyT", "Digit6", 
            "KeyY", "Digit7", "KeyU", "Digit8", "KeyI",
            // Seconda ottava
            "KeyZ", "KeyS", "KeyX", "KeyD", "KeyC", "KeyV", "KeyG", 
            "KeyB", "KeyH", "KeyN", "KeyJ", "KeyM"
        ];

        this.keyMap = {};
    }

    renderKeyboard() {
        const pianoContainer = document.getElementById(this.containerId);
        pianoContainer.innerHTML = ""; 
    
        const totalWhiteKeys = Array.from({ length: this.numberOfKeys }, (_, i) => this.startMidiNote + i)
            .filter(note => !this.blackKeys.includes(note % 12)).length;
        const whiteKeyWidthPercentage = 100 / totalWhiteKeys;
        let currentWhiteKeyIndex = 0;
    
        for (let i = 0; i < this.numberOfKeys; i++) {
            const midiNote = this.startMidiNote + i;
            const noteInOctave = midiNote % 12;
    
            const key = document.createElement("div");
            key.classList.add("key");
            key.dataset.midiNote = midiNote;
    
            const keyboardKey = this.keyboardKeys[i];
            if (keyboardKey) {
                key.dataset.keyboardKey = keyboardKey;
                this.keyMap[keyboardKey] = midiNote;
    
                // Crea un elemento per mostrare il nome del tasto
                const keyLabel = document.createElement("span");
                keyLabel.classList.add("key-label");
                keyLabel.textContent = keyboardKey.replace("Key", "").replace("Digit", "");
                key.appendChild(keyLabel);
            }
    
            if (this.blackKeys.includes(noteInOctave)) {
                key.classList.add("black");
                key.style.left = `${
                    (currentWhiteKeyIndex - 1) * whiteKeyWidthPercentage +
                    whiteKeyWidthPercentage * 0.7
                }%`;
                key.style.width = `${whiteKeyWidthPercentage * 0.7}%`;
            } else {
                currentWhiteKeyIndex++;
            }
    
            pianoContainer.appendChild(key);
        }
    }    

    setActiveKey(note, isActive) {
        const keyElement = document.querySelector(`.key[data-midi-note="${note}"]`);
        if (!keyElement) return;

        // Aggiungi o rimuovi la classe active
        if (isActive) {
            keyElement.classList.add("active");
        } else {
            keyElement.classList.remove("active");
        }
    }

    bindNoteEvents(playCallback, stopCallback) {
        const keys = document.querySelectorAll(".key");

        keys.forEach(key => {
            key.addEventListener("mousedown", () => playCallback(parseInt(key.dataset.midiNote)));
            key.addEventListener("mouseup", () => stopCallback(parseInt(key.dataset.midiNote)));
            key.addEventListener("mouseleave", () => stopCallback(parseInt(key.dataset.midiNote)));
        });

        document.addEventListener("keydown", (event) => {
            const key = event.code; // Usa la proprietà `code` per identificare i tasti fisici
            if (this.keyMap[key]) {
                playCallback(this.keyMap[key]);
            }
        });

        document.addEventListener("keyup", (event) => {
            const key = event.code; // Usa la proprietà `code` per identificare i tasti fisici
            if (this.keyMap[key]) {
                stopCallback(this.keyMap[key]);
            }
        });
    }
}

export default PianoView;