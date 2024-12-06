import PianoController from "./controller.js";

const piano = new PianoController("piano", 24, 60);

// Funzione per ottenere le note correnti
function getPressedNotes() {
    return piano.getPressedNotes();
}

// Esempio di utilizzo
setInterval(() => {
    console.log("Current pressed notes:", getPressedNotes().sort());
}, 1000);

function playGame(currentPressedNotes) {
    const levels = ['easy', 'medium', 'hard'];
    let currentLevelIndex = 0;
    let chordCount = 0;
  
    while (currentLevelIndex < levels.length) {
      const currentLevel = levels[currentLevelIndex];
  
      while (chordCount < 10) {
        // Simula la generazione di un accordo (sostituisci con la tua implementazione di createChord)
        const generatedChord = createRandomChord(currentLevel);
  
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
    // Clona gli array per evitare di modificare gli originali
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();
  
    return JSON.stringify(sortedArr1) === JSON.stringify(sortedArr2);
  }
  

playGame(getPressedNotes());