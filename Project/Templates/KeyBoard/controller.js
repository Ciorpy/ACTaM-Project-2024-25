// -------------------------------------------------------------------------------------------------------------------------------------------------
//          CONTROLLER JAVASCRIPT
// -------------------------------------------------------------------------------------------------------------------------------------------------

// IMPORTS -----------------------------------------------------------------------------------------------------------------------------------------

import { PianoModel } from "./model.js";
import { PianoView } from "./view.js";

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------

// Volume
const defaultVolume = 0.5;
const loadedVolume = parseFloat(localStorage.getItem("gameVolume"));
const linearVolume = !isNaN(loadedVolume) ? loadedVolume : defaultVolume;
const vol = linearVolume > 0 ? 20 * Math.log10(linearVolume) : -Infinity;

// Piano Samples
const pianoSampler = new Tone.Sampler({
    urls: {
        "A0": "A0.mp3",
        "C1": "C1.mp3",
        "D#1": "Ds1.mp3",
        "F#1": "Fs1.mp3",
        "A1": "A1.mp3",
        "C2": "C2.mp3",
        "D#2": "Ds2.mp3",
        "F#2": "Fs2.mp3",
        "A2": "A2.mp3",
        "C3": "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        "A3": "A3.mp3",
        "C4": "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        "A4": "A4.mp3",
        "C5": "C5.mp3",
        "D#5": "Ds5.mp3",
        "F#5": "Fs5.mp3",
        "A5": "A5.mp3",
        "C6": "C6.mp3",
        "D#6": "Ds6.mp3",
        "F#6": "Fs6.mp3",
        "A6": "A6.mp3",
        "C7": "C7.mp3",
        "D#7": "Ds7.mp3",
        "F#7": "Fs7.mp3",
        "A7": "A7.mp3",
        "C8": "C8.mp3"
    },
    release: 1.5,
    volume: vol,
    baseUrl: "../../Sounds/Piano Samples/"
}).toDestination();

// CLASS DEFINITION --------------------------------------------------------------------------------------------------------------------------------
export class PianoController {

    constructor(containerId, numberOfKeys, startMidiNote, isInputDisabledFn) {
        this.model = new PianoModel();
        this.view = new PianoView(containerId, numberOfKeys, startMidiNote);
        this.isInputDisabledFn = isInputDisabledFn;
        this.allKeysReleased = true;

        this.init();
    }

    init() {
        this.view.renderKeyboard();
        this.view.bindNoteEvents(this.playNote.bind(this), this.stopNote.bind(this));
    }

    playNote(note) {
        if (this.isInputDisabledFn()) return;

        if (this.allKeysReleased) {
            this.model.setPressedNotes([]);
            this.allKeysReleased = false;
        }
        const pressedNotes = this.model.getPressedNotes();
        if (!pressedNotes.includes(note)) {
            this.view.setActiveKey(note, true);
            pianoSampler.triggerAttackRelease(Tone.Frequency(note, "midi"), "4n");
            pressedNotes.push(note);
            this.model.setPressedNotes(pressedNotes);
        }
    }
    
    stopNote(note) {
        this.view.setActiveKey(note, false);
        this.view.resetKeyColor(note);
        const pressedNotes = this.model.getPressedNotes();
        const index = pressedNotes.indexOf(note);
        if (index > -1) {
            pressedNotes.splice(index, 1);
            this.model.setPressedNotes(pressedNotes);
        }
        if (pressedNotes.length === 0) {
            this.allKeysReleased = true;
        }
    }

    delayedUpdatePressedNotes(newNote) {
        const updatedNotes = this.model.getPressedNotes();
        if (!updatedNotes.includes(newNote)) {
            updatedNotes.push(newNote);
        }
        this.model.setPressedNotes(updatedNotes);
    }

    getPressedNotes() {
        return this.model.getPressedNotes();
    }

    playChord(chord) {
        chord.forEach(note => {
            pianoSampler.triggerAttackRelease(Tone.Frequency(note, "midi"), "2n");
        });
    }

}






import { GameModel}  from "./model.js";
import { GameView } from "./view.js";
import { 
  generateRandomChord, 
  generateRandomCadence, 
  recognizeChord 
} from "./chord&harmony.js";

// Multiplayer
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { app } from "../../../firebase.js";

export class GameController {
    
  constructor() {
    
    this.model = new GameModel();
    this.view  = new GameView();
    const checkDisabledFn = () => this.model.isInputDisabled;
    // Pianoforte (parametri come in kb.js: containerId, numberOfKeys, startMidiNote)
    this.pianoController = new PianoController("piano", 25, 48, checkDisabledFn);

    this.preloadedEffects = [];
    this.timerInterval    = null;
  }

  init() {
    // Inizializza Pianoforte
    this.pianoController.init();

    // 1) bindUIEvents => i pulsanti della UI (start, nextRound, etc.)
    this.view.bindUIEvents({
      onStart:            () => this.onStartGame(),
      onNextRound:        () => this.onNextRound(),
      onShowSolution:     () => this.onShowSolution(),
      onHideSolution:     () => this.onHideSolution(),
      onPlaySolution:     () => this.onPlaySolution(),
      onHint:             () => this.onHint(),
      onToggleAssistant:  () => this.onToggleAssistant(),
      onMainMenu:         () => this.onMainMenu()
    });

    // 2) bindGlobalListeners => eventi globali (keydown, mousedown, etc.)
    this.view.bindGlobalListeners(this.model, {
      // Forniamo un “mapper” che converte event -> midiNote 
      // consultando la `pianoController.view.keyMap`
      getMidiFromKeyCode: (ev) => {
        return this.pianoController.view.keyMap[ev.code];
      },

      onCheckChord:       () => this.checkChord(),
      onIdentifyChord:    () => this.identifyChord(),

      // Questi metodi servono per capire in che condizione siamo
      getIsSelectedChords:   () => (this.model.selectedGameMode === "chords_GM"),
      getIsSelectedHarmony:  () => (this.model.selectedGameMode === "harmony_GM"),
      getIsAssistantModeOn:  () => this.model.isAssistantModeOn,

      getChordData:    () => this.model.generatedChordData,
      getCadenceData:  () => this.model.generatedCadenceData,

      // Per colorare un tasto
      colorKey: (midiNote, color, keepActive) => {
        // Pianoforte: this.pianoController.view.setKeyColor
        this.pianoController.view.setKeyColor(midiNote, color, keepActive);
      }
    });

    // Carichiamo dati da localStorage
    this.setupFromLocalStorage();

    // Se non è Practice Mode => overlay startGame
    if (!this.model.isPracticeMode) {
      this.view.handleOverlayDisplay("startGame", this.model);
      this.setupEffects();

      // Aggiorna UI
      this.view.updateScoreDisplay(this.model);
      this.view.updateTimerDisplay(this.model);
      this.view.updateLevelDisplay(this.model);
      this.view.updateModeDisplay(this.model);
      this.view.updateRoundDisplay(this.model);

      // suono in posizione 0 => "game-start"
      if (this.preloadedEffects[0]) {
        this.preloadedEffects[0].play();
      }
    } else {
      // Practice Mode
      this.view.handleOverlayDisplay("hide", this.model);
      this.view.enableInput(this.model);
      // Esempio di nascondere pulsanti non necessari
      this.view.startGameButton.style.display    = "none";
      this.view.playSolutionButton.style.display = "none";
      this.view.hintButton.style.display         = "none";
      this.view.roundDisplay.style.display       = "none";
      this.view.assistantModeButton.style.display= "none";
      this.view.mainMenuButton.style.display     = "block";
      this.view.mainMenuButton.style.textAlign   = "center";
      this.view.scoreDisplay.style.display       = "none";
      this.view.timerDisplay.style.display       = "none";
      this.view.hintDisplay.style.padding        = "0px";
      this.view.hintDisplay.style.fontSize       = "4vh";
      this.view.difficultyDisplay.style.fontSize = "4vh";
      this.view.difficultyDisplay.style.marginBottom = "0px";
      this.view.difficultyDisplay.innerHTML      = "JUST HAVE FUN! CHORDS PLAYED WILL BE RECOGNIZED";
    }
  }

  /**
   * setupFromLocalStorage
   * Carica le impostazioni dalla localStorage (multiplayerFlag, Difficulty, ecc.)
   */
  setupFromLocalStorage() {
    // Example:
    this.model.isPracticeMode = (localStorage.getItem("Practice") === "true");
    this.model.isMultiplayer  = (localStorage.getItem("multiplayerFlag") === "true");
    this.model.userID         = localStorage.getItem("userID") || null;
    this.model.lobbyName      = localStorage.getItem("lobbyName") || null;
    this.model.isHost         = (localStorage.getItem("isHost") === "true");

    const loadedRoundsMP = parseInt(localStorage.getItem("numberRoundsMP")) || 3;
    const loadedRoundsSP = parseInt(localStorage.getItem("numberOfRounds"))  || 3;

    if (this.model.isMultiplayer) {
      this.model.maxRounds = loadedRoundsMP;
    } else {
      this.model.maxRounds = loadedRoundsSP;
    }

    this.model.selectedGameMode   = localStorage.getItem("Gamemode")   || "chords_GM";
    this.model.selectedDifficulty = localStorage.getItem("Difficulty") || "easyDiff";

    const loadedEffectsVolume = parseFloat(localStorage.getItem("effectsVolume")) || 0.5;
    this.model.effectsvol = Math.min(Math.max(loadedEffectsVolume, 0), 1);

    // Se multiplayer => potresti avviare getAuth, setInterval ecc.
    if (this.model.isMultiplayer) {
      getAuth(app);
      // Esempio di update ranking
      setInterval(() => this.updateRanking(), 100);
    }
  }

  /**
   * setupEffects
   * Carica i file audio e li salva in preloadedEffects
   */
  setupEffects() {
    const effectsFiles = [
      "/Project/Sounds/Effects/game-start.mp3",
      "/Project/Sounds/Effects/game-bonus.mp3",
      "/Project/Sounds/Effects/game-over.mp3",
      "/Project/Sounds/Effects/fail.mp3",
      "/Project/Sounds/Effects/game-finished.mp3"
    ];
    effectsFiles.forEach((file, index) => {
      const effect = new Audio(file);
      effect.volume = this.model.effectsvol;
      this.preloadedEffects[index] = effect;
    });
  }

  // ===============================
  // ========== EVENTI UI ==========
  // ===============================
  onStartGame() {
    if (this.model.isMultiplayer && !this.model.isHost && 
        (!this.model.generatedChordsData.length || !this.model.generatedCadencesData.length)) {
      this.view.handleOverlayDisplay("wait", this.model);
    } else {
      this.view.handleOverlayDisplay("hide", this.model);
    }
    this.startRound();
  }

  onNextRound() {
    if (this.model.activeRound < this.model.maxRounds) {
      this.view.handleOverlayDisplay("hide", this.model);
      this.startRound();
    } else {
      window.location.href = "../../gameTitleScreen.html";
    }
  }

  onShowSolution() {
    this.view.handleOverlayDisplay("hide", this.model);
    this.view.handleOverlayDisplay("showSolution", this.model);

    if (this.model.selectedGameMode === "chords_GM") {
      const chordData = this.model.generatedChordData;
      this.pianoController.playChord(chordData.midiNotes);
      chordData.midiNotes.forEach(note => {
        this.pianoController.view.setKeyColor(note, "green");
      });
    } else {
      const cadenceData = this.model.generatedCadenceData;
      this.playCadence(cadenceData, cadenceData.missingChordData.midiNotes);
      setTimeout(() => {
        cadenceData.missingChordData.midiNotes.forEach(note => {
          this.pianoController.view.setKeyColor(note, "green");
        });
      }, this.model.playingCadenceTimer);
    }
  }

  onHideSolution() {
    this.view.handleOverlayDisplay("hide", this.model);

    if (this.model.isShowedTimeOver) {
      this.view.handleOverlayDisplay("timeOver", this.model);
    }
    if (this.model.isShowedGoodGuess) {
      this.view.handleOverlayDisplay("goodGuess", this.model);
    }
    this.view.overlaySolutionPanel.style.display = "none";

    if (this.model.selectedGameMode === "chords_GM") {
      const chordData = this.model.generatedChordData;
      chordData.midiNotes.forEach(note => {
        this.pianoController.view.resetKeyColor(note);
      });
    } else {
      const cadenceData = this.model.generatedCadenceData;
      cadenceData.missingChordData.midiNotes.forEach(note => {
        this.pianoController.view.resetKeyColor(note);
      });
    }
  }

  onPlaySolution() {
    if (this.model.selectedGameMode === "chords_GM") {
      this.pianoController.playChord(this.model.generatedChordData.midiNotes);
    } else {
      this.playCadence(this.model.generatedCadenceData);
    }
  }

  onHint() {
    if (this.model.hintTimer >= this.model.hintInterval) {
      this.updateHints();
    }
  }

  onToggleAssistant() {
    if (this.model.isAvailableAssistant) {
      this.model.assistantPoint = true;
      this.model.isAssistantModeOn = !this.model.isAssistantModeOn;
      this.view.assistantModeButton.textContent = 
        !this.model.isAssistantModeOn ? "ASSISTANT MODE OFF" : "ASSISTANT MODE ON";
    }
  }

  onMainMenu() {
    window.location.href = "../../gameTitleScreen.html";
  }

  // ===============================
  // ========== LOGICA DI GIOCO ====
  // ===============================
  startRound() {
    this.model.incrementRound();
    this.view.updateRoundDisplay(this.model);
    this.view.updateScoreDisplay(this.model);

    this.model.resetRoundVariables();
    this.resetButtons();

    this.startTimer();
    this.view.enableInput(this.model);

    // Genera chord/cadenza
    if (this.model.selectedGameMode === "chords_GM") {
      if (this.model.isMultiplayer) {
        if (this.model.isHost && !this.model.generatedChordsData.length) {
          this.generateChordsForRounds();
        }
        this.startMultiplayerRound();
      } else {
        this.generateNewChord();
      }
    } else {
      // harmony
      if (this.model.isMultiplayer) {
        if (this.model.isHost && !this.model.generatedCadencesData.length) {
          this.generateCadencesForRounds();
        }
        this.startMultiplayerRound();
      } else {
        this.generateNewCadence();
      }
    }
  }

  resetButtons() {
    this.view.hintDisplayText("");
    this.view.hintButton.textContent = "HINT BLOCKED";
    this.view.hintButton.classList.add("no-hover", "notSelectable");

    this.view.assistantModeButton.textContent = "ASSISTANT BLOCKED";
    this.view.assistantModeButton.classList.add("no-hover", "notSelectable");
  }

  handleCorrectGuess() {
    this.model.applyPenalties();
    this.model.incrementTotalScoreAfterPenalties();

    if (this.model.isMultiplayer) {
      this.updateScoreInDatabase();
    }

    if (this.preloadedEffects[1]) {
      this.preloadedEffects[1].play();
    }

    if (this.model.activeRound < this.model.maxRounds) {
      this.view.handleOverlayDisplay("goodGuess", this.model);
    } else {
      this.view.handleOverlayDisplay("gameOver", this.model);
    }
  }

  // ===============================
  // ========== TIMER ==============
  // ===============================
  startTimer() {
    this.model.timeLeft  = 120;
    this.model.hintTimer = 0;
    clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => this.updateTimer(), 1000);
  }

  updateTimer() {
    this.model.decrementTimeLeft();
    this.model.incrementHintTimer();

    this.view.updateTimerDisplay(this.model);

    if (this.model.timeLeft > 0 && 
        this.model.timeLeft % this.model.deductionInterval === 0) {
      this.model.currentScore = Math.max(0, this.model.currentScore - this.model.pointsTime);
    }

    this.hintsToShow();
    this.assistantToShow();

    if (this.model.timeLeft <= 0) {
      clearInterval(this.timerInterval);
      if (this.model.activeRound < this.model.maxRounds) {
        this.view.handleOverlayDisplay("timeOver", this.model);
        if (this.preloadedEffects[2]) this.preloadedEffects[2].play();
      } else {
        this.view.handleOverlayDisplay("gameOver", this.model);
        if (this.preloadedEffects[4]) this.preloadedEffects[4].play();
      }
    }
  }

  // ===============================
  // ========== CHORD =============
  // ===============================
  generateNewChord() {
    const chordData = generateRandomChord(48, 48+25, this.model.selectedDifficulty);
    this.model.generatedChordData = chordData;
    this.pianoController.playChord(chordData.midiNotes);
  }

  checkChord() {
    const pressedNotes = this.pianoController.getPressedNotes();
    if (this.model.isAssistantModeOn) {
      this.handleAssistantMode(pressedNotes);
    }
    if (pressedNotes.length < 3) return;

    if (this.model.selectedGameMode === "chords_GM") {
      if (this.arraysEqual(pressedNotes, this.model.previousPressedNotes)) {
        return;
      }
      this.model.previousPressedNotes = [...pressedNotes];

      if (this.arraysEqual(this.model.generatedChordData.midiNotes, pressedNotes)) {
        this.handleCorrectGuess();
      }
    } else {
      const expectedNotes = this.model.generatedCadenceData.missingChordData.midiNotes;
      if (this.arraysEqual(pressedNotes, expectedNotes)) {
        this.handleCorrectGuess();
      }
    }
  }

  arraysEqual(arr1, arr2) {
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();
    return JSON.stringify(sortedArr1) === JSON.stringify(sortedArr2);
  }

  // ===============================
  // ========== HARMONY ============
  // ===============================
  generateNewCadence() {
    const cData = generateRandomCadence(48, 48+25, this.model.selectedDifficulty);
    this.model.generatedCadenceData = cData;
    this.playCadence(cData);
  }

  playCadence(cadenceData, missingChord = null) {
    this.model.playingCadenceTimer = 0;
    cadenceData.cadenceDetails.forEach(chord => {
      if (chord) {
        setTimeout(() => {
          this.pianoController.playChord(chord.midiNotes);
        }, this.model.playingCadenceTimer);
        this.model.playingCadenceTimer += 1000;
      }
    });
    if (missingChord) {
      setTimeout(() => {
        this.pianoController.playChord(missingChord);
      }, this.model.playingCadenceTimer);
    }
  }

  identifyChord() {
    const pressedNotes = this.pianoController.getPressedNotes().sort();
    if (pressedNotes.length >= 3) {
      this.model.recognizedChordData = recognizeChord(pressedNotes);
      this.updateHints();
    } else {
      this.view.hintDisplayText("");
    }
  }

  // ===============================
  // ========== HINTS & ASSISTANT ==
  // ===============================
  hintsToShow() {
    for (let i = 0; i < this.model.isAvailableHints.length; i++) {
      if (this.model.hintTimer >= this.model.hintInterval*(i+1) &&
          !this.model.isAvailableHints[i]) {
        this.model.isAvailableHints[i] = true;
        if (i === 0) {
          this.view.hintButton.classList.remove("no-hover", "notSelectable");
          this.view.hintDisplayText("1st HINT AVAILABLE");
        }
        if (i === 1) this.view.hintDisplayText("2nd HINT AVAILABLE");
        if (i === 2) this.view.hintDisplayText("3rd HINT AVAILABLE");
        this.view.hintButton.textContent = "SHOW HINT";
      }
    }
  }

  updateHints() {
    if (this.model.isPracticeMode) {
      const chordData = this.model.recognizedChordData;
      if (chordData && chordData.noteRoot !== null) {
        this.view.hintDisplayText(
          `${chordData.noteRoot}${chordData.chordType} IN ${chordData.inversion}`
        );
      }
      return;
    }

    let currentHint = 0;
    if (this.model.hintTimer >= this.model.hintInterval*3) currentHint = 3;
    else if (this.model.hintTimer >= this.model.hintInterval*2) currentHint = 2;
    else if (this.model.hintTimer >= this.model.hintInterval)    currentHint = 1;
    
    const isShowingHint = (this.view.hintButton.textContent === "SHOW HINT");

    if (isShowingHint) {
      this.model.hintsPoint[currentHint-1] = true;
      if (this.model.selectedGameMode === "chords_GM") {
        this.showChordHint(currentHint);
      } else {
        this.showHarmonyHint(currentHint);
      }
      this.view.hintButton.textContent = "HIDE HINT";
    } else {
      switch(currentHint) {
        case 1: this.view.hintDisplayText("1st HINT HIDDEN"); break;
        case 2: this.view.hintDisplayText("2nd HINT HIDDEN"); break;
        case 3: this.view.hintDisplayText("3rd HINT HIDDEN"); break;
      }
      this.view.hintButton.textContent = "SHOW HINT";
    }
  }

  showChordHint(currentHint) {
    const chordData = this.model.generatedChordData;
    switch(currentHint) {
      case 1:
        this.view.hintDisplayText(`ROOT ${chordData.noteRoot}`);
        break;
      case 2:
        this.view.hintDisplayText(`${chordData.noteRoot}${chordData.chordType}`);
        break;
      case 3:
        this.view.hintDisplayText(
          `${chordData.noteRoot}${chordData.chordType} IN ${chordData.inversion}`
        );
        break;
    }
  }

  showHarmonyHint(currentHint) {
    const cadData = this.model.generatedCadenceData;
    switch(currentHint) {
      case 1:
        this.view.hintDisplayText(
          `FIRST CHORD: ${cadData.cadenceDetails[0].noteRoot}${cadData.cadenceDetails[0].chordType}`
        );
        break;
      case 2:
        this.view.hintDisplayText(`CHORDS PLAYED: ${cadData.cadenceName}`);
        break;
      case 3: {
        const missing = cadData.missingChordData;
        this.view.hintDisplayText(
          `COMPLETE CADENCE: ${cadData.cadenceName} - ${missing.noteRoot}${missing.chordType}`
        );
        break;
      }
    }
  }

  assistantToShow() {
    if (this.model.checkAssistantAvailability()) {
      this.model.isAvailableAssistant = true;
      this.view.assistantModeButton.classList.remove("no-hover", "notSelectable");
      this.view.assistantModeButton.textContent = 
        !this.model.isAssistantModeOn ? "ASSISTANT MODE OFF" : "ASSISTANT MODE ON";
    }
  }

  handleAssistantMode(pressedNotes) {
    const currentColorNotes = new Set(pressedNotes);
    if (this.model.selectedGameMode === "chords_GM") {
      pressedNotes.forEach(note => {
        const chord = this.model.generatedChordData;
        this.pianoController.view.setKeyColor(
          note, chord.midiNotes.includes(note) ? "green" : "red"
        );
      });
    } else {
      // harmony
      const missing = this.model.generatedCadenceData.missingChordData.midiNotes;
      pressedNotes.forEach(note => {
        this.pianoController.view.setKeyColor(note, missing.includes(note) ? "green" : "red");
      });
    }
    // Resetta i tasti non più premuti
    for (let midi = 48; midi <= 48+25; midi++) {
      if (!currentColorNotes.has(midi)) {
        this.pianoController.view.resetKeyColor(midi);
      }
    }
  }

  // ===============================
  // ========== MULTIPLAYER ========
  // ===============================
  async generateChordsForRounds() {
    this.model.generatedChordsData = [];
    for (let i = 0; i < this.model.maxRounds; i++) {
      const chordData = generateRandomChord(48, 48+25, this.model.selectedDifficulty);
      this.model.generatedChordsData.push(chordData);
    }
    await set(ref(getDatabase(app), `lobbies/${this.model.lobbyName}/gameStructure`),
              this.model.generatedChordsData);
  }

  async generateCadencesForRounds() {
    this.model.generatedCadencesData = [];
    for (let i = 0; i < this.model.maxRounds; i++) {
      const cadData = generateRandomCadence(48, 48+25, this.model.selectedDifficulty);
      this.model.generatedCadencesData.push(cadData);
    }
    await set(ref(getDatabase(app), `lobbies/${this.model.lobbyName}/gameStructure`),
              this.model.generatedCadencesData);
  }

  async startMultiplayerRound() {
    if (!this.model.isHost) {
      let snapshot;
      do {
        snapshot = await get(ref(getDatabase(app), `lobbies/${this.model.lobbyName}/gameStructure`));
        if (snapshot.exists()) {
          if (this.model.selectedGameMode === "chords_GM") {
            this.model.generatedChordsData = snapshot.val();
          } else {
            this.model.generatedCadencesData = snapshot.val();
          }
        }
      } while (!snapshot.exists());
      this.view.handleOverlayDisplay("hide", this.model);
      this.startTimer();
    }

    if (this.model.selectedGameMode === "chords_GM") {
      if (!this.model.generatedChordsData.length) {
        console.error("Accordi non trovati per la modalità multiplayer!");
        return;
      }
      const chordData = this.model.generatedChordsData[this.model.activeRound - 1];
      this.model.generatedChordData = chordData;
      this.pianoController.playChord(chordData.midiNotes);
    } else {
      if (!this.model.generatedCadencesData.length) {
        console.error("Cadenze non trovate per la modalità multiplayer!");
        return;
      }
      const cadData = this.model.generatedCadencesData[this.model.activeRound - 1];
      this.model.generatedCadenceData = cadData;
      this.playCadence(cadData);
    }
  }

  async updateScoreInDatabase() {
    await set(
      ref(getDatabase(app), `lobbies/${this.model.lobbyName}/players/${this.model.userID}/score`),
      this.model.totalScore
    );
  }

  async updateRanking() {
    try {
      const snapshot = await get(
        ref(getDatabase(app), `lobbies/${this.model.lobbyName}/players`)
      );
      const playersData = snapshot.val();
      if (!playersData) {
        console.warn("Nessun dato trovato per i giocatori.");
        if (this.view.rankingTable) {
          this.view.rankingTable.innerHTML = "Nessun giocatore nella lobby.";
        }
        if (this.view.placementDisplay) {
          this.view.placementDisplay.innerHTML = "PLACEMENT: N/A";
        }
        return;
      }
      let playersArray = Object.entries(playersData).map(([id, data]) => ({
        id,
        score: data.score || 0,
        playerName: data.playerName || "Anonimo"
      }));
      playersArray.sort((a, b) => b.score - a.score);
      const playerIndex = playersArray.findIndex(p => p.id === this.model.userID);

      if (this.view.rankingTable) {
        this.view.rankingTable.innerHTML = "";
      }
      playersArray.forEach((item, index) => {
        const newPlayerRanking = document.createElement("div");
        newPlayerRanking.classList.add("overlayRanking");
        newPlayerRanking.innerHTML = `${index+1}°: ${item.playerName} - ${item.score} points`;
        if (this.view.rankingTable) {
          this.view.rankingTable.append(newPlayerRanking);
        }
      });
      if (this.view.placementDisplay) {
        this.view.placementDisplay.innerHTML = `PLACEMENT: ${playerIndex+1}°`;
      }
    } catch (error) {
      console.error("Errore durante l'aggiornamento del ranking:", error);
      if (this.view.rankingTable) {
        this.view.rankingTable.innerHTML = "Errore nel caricamento della classifica.";
      }
      if (this.view.placementDisplay) {
        this.view.placementDisplay.innerHTML = "PLACEMENT: N/A";
      }
    }
  }
}

