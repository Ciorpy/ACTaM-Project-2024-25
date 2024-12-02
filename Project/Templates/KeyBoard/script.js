function createPiano(containerId, numberOfKeys, startMidiNote = 60) {
    const pianoContainer = document.getElementById(containerId);
    pianoContainer.innerHTML = ""; // Pulisci il contenuto precedente

    const blackKeys = [1, 3, 6, 8, 10]; // Indici delle note nere in un'ottava
    const totalWhiteKeys = Array.from({ length: numberOfKeys }, (_, i) => startMidiNote + i)
        .filter(note => !blackKeys.includes(note % 12)).length; // Conta i tasti bianchi

    // Larghezza base per calcolare la posizione dei tasti neri
    const whiteKeyWidthPercentage = 100 / totalWhiteKeys;

    let currentWhiteKeyIndex = 0; // Traccia i tasti bianchi

    // Array di tasti della tastiera fisica (modificabile per preferenze personali)
    const keyboardKeys = [
        "a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j", // Prima ottava
        "k", "o", "l", "p", ";", "z", "x", "c", "v", "b", "n", "m"  // Seconda ottava
    ];

    // Map per associare i tasti della tastiera fisica ai tasti MIDI
    const keyMap = {};

    for (let i = 0; i < numberOfKeys; i++) {
        const midiNote = startMidiNote + i;
        const noteInOctave = midiNote % 12;

        // Crea il tasto
        const key = document.createElement("div");
        key.classList.add("key");
        key.dataset.midiNote = midiNote; // Associa la nota MIDI
        key.innerHTML = midiNote; // Mostra il numero MIDI

        // Assegna un tasto della tastiera fisica al tasto MIDI
        const keyboardKey = keyboardKeys[i];
        if (keyboardKey) {
            key.dataset.keyboardKey = keyboardKey; // Salva il tasto associato
            key.innerHTML += `<br>${keyboardKey}`; // Mostra il tasto fisico
            keyMap[keyboardKey] = midiNote; // Aggiungi alla mappa
        }

        // Controlla se è un tasto nero
        if (blackKeys.includes(noteInOctave)) {
            key.classList.add("black");
            // Posiziona il tasto nero in relazione al tasto bianco corrente
            key.style.left = `${
                (currentWhiteKeyIndex - 1) * whiteKeyWidthPercentage +
                whiteKeyWidthPercentage * 0.7
            }%`;
            key.style.width = `${whiteKeyWidthPercentage * 0.7}%`;
        } else {
            // Incrementa solo per i tasti bianchi
            currentWhiteKeyIndex++;
        }

        // Aggiungi il tasto al contenitore
        pianoContainer.appendChild(key);

        // Listener per click
        key.addEventListener("mousedown", () => {
            key.classList.add("active");
        });

        key.addEventListener("mouseup", () => {
            key.classList.remove("active");
        });

        key.addEventListener("mouseleave", () => {
            key.classList.remove("active");
        });
    }

    // Aggiungi listener per i tasti della tastiera fisica
    document.addEventListener("keydown", (event) => {
        const key = event.key.toLowerCase(); // Ottieni il tasto premuto
        if (keyMap[key]) {
            const note = keyMap[key];
            const pianoKey = document.querySelector(`.key[data-midi-note="${note}"]`);
            if (pianoKey) {
                pianoKey.classList.add("active"); // Simula pressione tasto
            }
        }
    });

    document.addEventListener("keyup", (event) => {
        const key = event.key.toLowerCase(); // Ottieni il tasto rilasciato
        if (keyMap[key]) {
            const note = keyMap[key];
            const pianoKey = document.querySelector(`.key[data-midi-note="${note}"]`);
            if (pianoKey) {
                pianoKey.classList.remove("active"); // Rimuovi classe
            }
        }
    });
}

// Genera una tastiera con 36 tasti a partire dal Do centrale (60)
createPiano("piano", 36, 60);
