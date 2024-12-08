class PianoView {
    constructor(containerId, numberOfKeys, startMidiNote) {
        this.containerId = containerId;
        this.numberOfKeys = numberOfKeys;
        this.startMidiNote = startMidiNote;
        this.blackKeys = [1, 3, 6, 8, 10]; // Indici delle note nere in un'ottava

        // Mappatura dei tasti fisici per ogni ottava
        this.keyboardKeys = [
            // Prima ottava e mezza
            "KeyQ", "Digit2", "KeyW", "Digit3", "KeyE", "KeyR", "Digit5", 
            "KeyT", "Digit6", "KeyY", "Digit7", "KeyU", "KeyI", "Digit9", 
            "KeyO", "Digit0", "KeyP", "BracketLeft", "Equal", "BracketRight",
            // Seconda ottava e mezza
            "KeyA", "KeyZ", "KeyS", "KeyX", "KeyC", "KeyF", "KeyV", "KeyG", 
            "KeyB", "KeyN", "KeyJ", "KeyM", "KeyK", "Comma", "KeyL", "Period", "Slash"
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
    
                // Mostra il nome del tasto
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
        const activeKeys = new Set(); // Set per i tasti attivi
    
        keys.forEach(key => {
            key.addEventListener("mousedown", () => playCallback(parseInt(key.dataset.midiNote)));
            key.addEventListener("mouseup", () => stopCallback(parseInt(key.dataset.midiNote)));
            key.addEventListener("mouseleave", () => stopCallback(parseInt(key.dataset.midiNote)));
        });
    
        document.addEventListener("keydown", (event) => {
            const key = event.code;
            if (this.keyMap[key] && !activeKeys.has(key)) { // Esegui solo se il tasto non è già attivo
                activeKeys.add(key); // Aggiungi il tasto attivo
                playCallback(this.keyMap[key]);
            }
        });
    
        document.addEventListener("keyup", (event) => {
            const key = event.code;
            if (this.keyMap[key]) {
                activeKeys.delete(key); // Rimuovi il tasto dai tasti attivi
                stopCallback(this.keyMap[key]);
            }
        });
    }
    
    setKeyColor(note, color) {
        const keyElement = document.querySelector(`.key[data-midi-note="${note}"]`);
        if (keyElement) {
            keyElement.style.backgroundColor = color; // Imposta il colore specificato
        }
    }
    
    resetKeyColor(note) {
        const keyElement = document.querySelector(`.key[data-midi-note="${note}"]`);
        if (keyElement) {
            keyElement.style.backgroundColor = ""; // Ripristina il colore originale
        }
    }
    
}

export default PianoView;