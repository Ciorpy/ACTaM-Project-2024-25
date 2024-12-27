// -------------------------------------------------------------------------------------------------------------------------------------------------
//          MODEL JAVASCRIPT
// -------------------------------------------------------------------------------------------------------------------------------------------------

// IMPORT ------------------------------------------------------------------------------------------------------------------------------------------

import { isInputDisabled } from "./kb.js";

// CLASS DEFINITION
class PianoView {

    constructor(containerId, numberOfKeys, startMidiNote) {
        this.containerId = containerId;
        this.numberOfKeys = numberOfKeys;
        this.startMidiNote = startMidiNote;
        this.blackKeys = [1, 3, 6, 8, 10];
        this.keyboardKeys = [
            "KeyW", "Digit3", "KeyE", "Digit4", "KeyR", "KeyT", "Digit6", "KeyY", "Digit7", "KeyU", "Digit8", "KeyI",
            "KeyZ", "KeyS", "KeyX", "KeyD", "KeyC", "KeyV", "KeyG", "KeyB", "KeyH", "KeyN", "KeyJ", "KeyM", "Comma"
        ];
        this.keyMap = {};
    }

    renderKeyboard() {
        const pianoContainer = document.getElementById(this.containerId);
        pianoContainer.innerHTML = ""; 
        const totalWhiteKeys = Array.from({ 
            length: this.numberOfKeys }, 
            (_, i) => this.startMidiNote + i
        ).filter(note => !this.blackKeys.includes(note % 12)).length;
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
                const keyLabel = document.createElement("span");
                keyLabel.classList.add("key-label");
                keyLabel.textContent = keyboardKey.replace("Key", "").replace("Digit", "").replace("Comma", ",");
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
        if (isActive) {
            keyElement.classList.add("active");
        } else {
            keyElement.classList.remove("active");
        }
    }

    bindNoteEvents(playCallback, stopCallback) {
        const keys = document.querySelectorAll(".key");
        const activeKeys = new Set();
        keys.forEach(key => {
            key.addEventListener("mousedown", () => {
                if (isInputDisabled) return;
                const midiNote = parseInt(key.dataset.midiNote);
                playCallback(midiNote);
                activeKeys.add(midiNote);
            });
            key.addEventListener("mouseup", () => {
                if (isInputDisabled) return;
                const midiNote = parseInt(key.dataset.midiNote);
                stopCallback(midiNote);
                activeKeys.delete(midiNote);
            });
            key.addEventListener("mouseleave", () => {
                if (isInputDisabled) return;
                const midiNote = parseInt(key.dataset.midiNote);
                if (activeKeys.has(midiNote)) {
                    stopCallback(midiNote);
                    activeKeys.delete(midiNote);
                }
            });
        });
        document.addEventListener("keydown", (event) => {
            if (isInputDisabled) return;
            const key = event.code;
            if (this.keyMap[key] && !activeKeys.has(key)) {
                activeKeys.add(key);
                playCallback(this.keyMap[key]);
            }
        });
        document.addEventListener("keyup", (event) => {
            const key = event.code;
            if (this.keyMap[key]) {
                activeKeys.delete(key);
                stopCallback(this.keyMap[key]);
            }
        });
    }
    
    setKeyColor(note, color, keepActive = false) {
        const keyElement = document.querySelector(`.key[data-midi-note="${note}"]`);
        if (keyElement) {
            keyElement.style.backgroundColor = color;
            if (keepActive) {
                keyElement.dataset.color = color;
            }
        }
    }
    
    resetKeyColor(note) {
        const keyElement = document.querySelector(`.key[data-midi-note="${note}"]`);
        if (keyElement) {
            keyElement.style.backgroundColor = "";
            delete keyElement.dataset.color;
        }
    }
        
}

//EXPORT -------------------------------------------------------------------------------------------------------------------------------------------
export default PianoView;

// -------------------------------------------------------------------------------------------------------------------------------------------------