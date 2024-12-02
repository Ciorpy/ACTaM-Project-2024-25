function createPiano(containerId, numberOfKeys, startMidiNote = 60) {
    const pianoContainer = document.getElementById(containerId);
    pianoContainer.innerHTML = ""; // Pulisci il contenuto precedente

    const blackKeys = [1, 3, 6, 8, 10]; // Indici delle note nere in un'ottava
    const totalWhiteKeys = Array.from({ length: numberOfKeys }, (_, i) => startMidiNote + i)
        .filter(note => !blackKeys.includes(note % 12)).length; // Conta i tasti bianchi

    // Larghezza base per calcolare la posizione dei tasti neri
    const whiteKeyWidthPercentage = 100 / totalWhiteKeys;

    let currentWhiteKeyIndex = 0; // Traccia i tasti bianchi

    for (let i = 0; i < numberOfKeys; i++) {
        const midiNote = startMidiNote + i;
        const noteInOctave = midiNote % 12;

        // Crea il tasto
        const key = document.createElement("div");
        key.classList.add("key");
        key.dataset.midiNote = midiNote; // Associa la nota MIDI
        key.innerHTML = midiNote; // Mostra il numero MIDI

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
    }
}

// Genera una tastiera con 36 tasti a partire dal Do centrale (60)
createPiano("piano", 36, 60);

