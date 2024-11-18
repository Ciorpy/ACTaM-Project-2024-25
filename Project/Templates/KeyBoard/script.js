        // Funzione per generare una tastiera
        function createPiano(containerId, numberOfKeys, startMidiNote = 60) {
            const pianoContainer = document.getElementById(containerId);
            pianoContainer.innerHTML = ""; // Pulisci il contenuto

            // Pattern per identificare le note nere
            const blackKeys = [1, 3, 6, 8, 10]; // Indici delle note nere (in un'ottava)
            let currentWhiteKeyIndex = 0; // Posizione attuale dei tasti bianchi

            for (let i = 0; i < numberOfKeys; i++) {
                const midiNote = startMidiNote + i;
                const noteInOctave = midiNote % 12;

                // Crea il tasto
                const key = document.createElement("div");
                key.classList.add("key");
                key.dataset.midiNote = midiNote; // Associa il valore MIDI
                key.innerHTML = midiNote; // Mostra il numero MIDI (opzionale)

                // Controlla se è un tasto nero
                if (blackKeys.includes(noteInOctave)) {
                    key.classList.add("black");
                    // Posiziona il tasto nero sopra il precedente tasto bianco
                    key.style.left = `${currentWhiteKeyIndex * 40}px`;
                } else {
                    // Incrementa l'indice per i tasti bianchi
                    currentWhiteKeyIndex++;
                }

                // Aggiungi il tasto al contenitore
                pianoContainer.appendChild(key);
            }
        }

        // Genera una tastiera con 36 tasti a partire dal Do centrale (60)
        createPiano("piano", 36, 61);