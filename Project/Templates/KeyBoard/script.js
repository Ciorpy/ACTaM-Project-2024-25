function createPiano(containerId, numberOfKeys, startMidiNote = 96) {
    const pianoContainer = document.getElementById(containerId);
    pianoContainer.innerHTML = ""; // Pulisci il contenuto precedente

    const blackKeys = [1, 3, 6, 8, 10]; // Indici delle note nere in un'ottava
    const totalWhiteKeys = Array.from({ length: numberOfKeys }, (_, i) => startMidiNote + i)
        .filter(note => !blackKeys.includes(note % 12)).length; // Conta i tasti bianchi

    const whiteKeyWidthPercentage = 100 / totalWhiteKeys;
    let currentWhiteKeyIndex = 0;

    const keyboardKeys = [
        "a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j", // Prima ottava
        "k", "o", "l", "p", ";", "z", "x", "c", "v", "b", "n", "m"  // Seconda ottava
    ];

    const keyMap = {};
    let synths = {};
    let pressedNotes = []; // Lista di note correnti
    let updateTimeout = null; // Timeout per ritardare l'aggiornamento della lista
    const updateDelay = 30; // Ritardo in millisecondi
    let currentPressedNotes = []; // Tasti attualmente premuti

    function createSynth() {
        return new Tone.Synth({
            oscillator: {
                type: "amsine",
            },
            envelope: {
                attack: 0.01,
                decay: 0.3,
                sustain: 0.2,
                release: 0.8,
            },
        }).toDestination();
    }

    for (let i = 0; i < numberOfKeys; i++) {
        const midiNote = startMidiNote + i;
        const noteInOctave = midiNote % 12;

        const key = document.createElement("div");
        key.classList.add("key");
        key.dataset.midiNote = midiNote;
        key.innerHTML = midiNote;

        const keyboardKey = keyboardKeys[i];
        if (keyboardKey) {
            key.dataset.keyboardKey = keyboardKey;
            key.innerHTML += `<br>${keyboardKey}`;
            keyMap[keyboardKey] = midiNote;
        }

        synths[midiNote] = createSynth();

        if (blackKeys.includes(noteInOctave)) {
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

        key.addEventListener("mousedown", () => {
            playNote(midiNote, key);
        });

        key.addEventListener("mouseup", () => {
            stopNote(midiNote, key);
        });

        key.addEventListener("mouseleave", () => {
            stopNote(midiNote, key);
        });
    }

    document.addEventListener("keydown", (event) => {
        const key = event.key.toLowerCase();
        if (keyMap[key]) {
            const note = keyMap[key];
            const pianoKey = document.querySelector(`.key[data-midi-note="${note}"]`);
            if (pianoKey) {
                playNote(note, pianoKey);
            }
        }
    });

    document.addEventListener("keyup", (event) => {
        const key = event.key.toLowerCase();
        if (keyMap[key]) {
            const note = keyMap[key];
            const pianoKey = document.querySelector(`.key[data-midi-note="${note}"]`);
            if (pianoKey) {
                stopNote(note, pianoKey);
            }
        }
    });

    function playNote(note, keyElement) {
        // Suona la nota
        keyElement.classList.add("active");
        synths[note].triggerAttack(Tone.Frequency(note, "midi"));

        // Aggiungi la nota all'elenco delle note attualmente premute
        if (!currentPressedNotes.includes(note)) {
            currentPressedNotes.push(note);
        }

        // Ritarda l'aggiornamento della lista
        delayedUpdatePressedNotes();
    }

    function stopNote(note, keyElement) {
        // Interrompi la nota
        keyElement.classList.remove("active");
        synths[note].triggerRelease();

        // Rimuovi la nota dall'elenco delle note attualmente premute
        currentPressedNotes = currentPressedNotes.filter(n => n !== note);
    }

    function delayedUpdatePressedNotes() {
        if (updateTimeout) clearTimeout(updateTimeout); // Cancella il timeout precedente

        updateTimeout = setTimeout(() => {
            // Aggiorna la lista `pressedNotes` solo con le note attualmente premute
            pressedNotes = [...currentPressedNotes];
            console.log("Pressed notes:", pressedNotes);
        }, updateDelay);
    }
}

// Genera una tastiera con 24 tasti a partire dal Do centrale (60)
createPiano("piano", 24, 60);

