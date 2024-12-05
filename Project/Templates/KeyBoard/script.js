
function createPiano(containerId, numberOfKeys, startMidiNote = 96) {
  const pianoContainer = document.getElementById(containerId);
  pianoContainer.innerHTML = ""; // Pulisci il contenuto precedente

  const blackKeys = [1, 3, 6, 8, 10]; // Indici delle note nere in un'ottava
  const totalWhiteKeys = Array.from({ length: numberOfKeys }, (_, i) => startMidiNote + i)
      .filter(note => !blackKeys.includes(note % 12)).length; // Conta i tasti bianchi

  const whiteKeyWidthPercentage = 100 / totalWhiteKeys;
  let currentWhiteKeyIndex = 0;

  const keyboardCodes = [
      "KeyQ", "Digit2", "KeyW", "Digit3", "KeyE", "KeyR", "Digit5", "KeyT", "Digit6", "KeyY", "Digit7", "KeyU", // Prima ottava
      "KeyZ", "KeyS", "KeyX", "KeyD", "KeyC", "KeyV", "KeyG", "KeyB", "KeyH", "KeyN", "KeyJ", "KeyM" // Seconda ottava
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

  // Funzione per ottenere il valore leggibile da un event.code
  function getReadableKey(code) {
      if (code.startsWith("Key")) return code.slice(3); // Rimuove "Key" e restituisce la lettera
      if (code.startsWith("Digit")) return code.slice(5); // Rimuove "Digit" e restituisce il numero
      return code; // Restituisce il valore originale se non corrisponde
  }

  // Popola la mappa keyMap associando i codici dei tasti alle note MIDI
  for (let i = 0; i < numberOfKeys; i++) {
      const midiNote = startMidiNote + i;
      const code = keyboardCodes[i];
      if (code) {
          keyMap[code] = midiNote;
      }
  }

  for (let i = 0; i < numberOfKeys; i++) {
      const midiNote = startMidiNote + i;
      const noteInOctave = midiNote % 12;

      const key = document.createElement("div");
      key.classList.add("key");
      key.dataset.midiNote = midiNote;

      const code = keyboardCodes[i];
      if (code) {
          key.dataset.keyboardKey = code;

          // Mostra il valore leggibile del tasto fisico solo per la prima nota di ogni ottava
          if (noteInOctave === 0) {
              const readableKey = getReadableKey(code);
              key.innerHTML = `<div>${readableKey}</div>`;
          }
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

  // Gestione degli eventi per i tasti della tastiera fisica
  document.addEventListener("keydown", (event) => {
      const code = event.code; // Usa event.code per il mapping
      if (keyMap[code]) {
          const note = keyMap[code];
          const pianoKey = document.querySelector(`.key[data-midi-note="${note}"]`);
          if (pianoKey) {
              playNote(note, pianoKey);
          }
      }
  });

  document.addEventListener("keyup", (event) => {
    console.log("ciao")
      const code = event.code; // Usa event.code per il mapping
      console.log(code)
      console.log(keyMap[code])
      if (keyMap[code]) {
        console.log("ciao")
          const note = keyMap[code];
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

// createChord prende in ingresso un "livello" in base alla quale restituira un determinato array di lunghezza 3 o 4
// i livelli sono "easy", "medium" e "hard"
// createChord verrà chiamato 10 volte per ogni livello con il seguente criterio:

// genera un accordo con la funzione createChord
// -> confrontalo con currentPressedNotes (un array di lunghezza 3 o 4)
// -> se i contenuti dei due array corrispondono genera un altro accordo con createChord
// -> finche i due array non corrispondono non chiamare createChord
// -> dopo 10 volte che è stato chiamato arrayChord devi chiamare arrayChord con il livello successivo

function playGame(currentPressedNotes) {
    const levels = ['easy', 'medium', 'hard'];
    let currentLevelIndex = 0;
    let chordCount = 0;
  
    while (currentLevelIndex < levels.length) {
      const currentLevel = levels[currentLevelIndex];
  
      while (chordCount < 10) {
        // Simula la generazione di un accordo (sostituisci con la tua implementazione di createChord)
        const generatedChord = createChord(currentLevel);
  
        // Confronta gli array
        if (arraysEqual(generatedChord, currentPressedNotes)) {
          chordCount++;
          console.log('Accordo indovinato');
        }
        else {
            console.log('Accordo non indovinato');
          }
      }
  
      chordCount = 0;
      currentLevelIndex++;
      console.log('Nuovo livello: ',levels[currentLevelIndex]);
    }
  }
  
  // Funzione ausiliaria per confrontare due array
  function arraysEqual(arr1, arr2) {
    return JSON.stringify(arr1) === JSON.stringify(arr2);
  }
  

  playGame(currentPressedNotes);