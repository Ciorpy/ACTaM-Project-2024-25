// -------------------------------------------------------------------------------------------------------------------------------------------------
//          PIANO CONTROLLER JAVASCRIPT
// -------------------------------------------------------------------------------------------------------------------------------------------------

// IMPORTS -----------------------------------------------------------------------------------------------------------------------------------------

// Model & View
import { PianoModel } from "./model.js";
import { PianoView  } from "./view.js";

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------

// Volume
const defaultVolume = 0.5;
const loadedVolume  = parseFloat(localStorage.getItem("gameVolume"));
const linearVolume  = !isNaN(loadedVolume) ? loadedVolume : defaultVolume;

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

// PianoController class: handles the logic for managing the piano keyboard in the game.
// It connects the piano model and the piano view to allow interaction between the user and the virtual keyboard.
export class PianoController {

  // Constructor for the PianoController class.
  // Responsible for initializing the virtual piano system by creating the model and view, and setting up key state tracking and input handling.
  constructor(containerId, numberOfKeys, startMidiNote, isInputDisabledFn) {
    this.model  = new PianoModel();
    this.view   = new PianoView(containerId, numberOfKeys, startMidiNote);

    this.isInputDisabledFn  = isInputDisabledFn;
    this.allKeysReleased    = true;

    this.init();
  }

  // Initializes the virtual piano by rendering the keyboard and binding user interaction events.
  init() {
    this.view.renderKeyboard();
    this.view.bindNoteEvents(this.playNote.bind(this), this.stopNote.bind(this));
  }

  // Retrieves the list of currently pressed notes from the model.
  getPressedNotes() {
    return this.model.getPressedNotes();
  }

  // Handles the logic for playing a note on the virtual piano.
  // This method triggers the audio for the note, updates the visual feedback, and keeps track of the currently pressed notes in the model.
  // If the note is being played as part of a chord (`forPlayChord`), it plays the note without further state changes or visual feedback.
  playNote(note, forPlayChord = false) {
    if (forPlayChord) {
      pianoSampler.triggerAttackRelease(Tone.Frequency(note, "midi"), "2n");
      return;
    }

    if (this.isInputDisabledFn()) return;

    if (this.allKeysReleased) {
      this.model.setPressedNotes([]);
      this.allKeysReleased = false;
    }

    const pressedNotes = this.model.getPressedNotes();

    if (!pressedNotes.includes(note)) {
      this.view.setActiveKey(note, true);
      pianoSampler.triggerAttackRelease(Tone.Frequency(note, "midi"), "2n");
      pressedNotes.push(note);
      this.model.setPressedNotes(pressedNotes);
    }
  }
  
  // Handles the logic for stopping a note on the virtual piano.
  // This method resets the visual feedback for the key and removes the note from the list of currently pressed notes in the model.
  // If no notes are left pressed, it updates the state to reflect that all keys are released.
  stopNote(note) {
    this.view.setActiveKey(note, false);
    this.view.resetKeyColor(note);

    const pressedNotes = this.model.getPressedNotes();
    const index = pressedNotes.indexOf(note);

    if (index > -1) {
      pressedNotes.splice(index, 1);
      this.model.setPressedNotes(pressedNotes);
    }

    if (pressedNotes.length === 0) this.allKeysReleased = true;
  }

}

// -------------------------------------------------------------------------------------------------------------------------------------------------
//          GAME CONTROLLER JAVASCRIPT
// -------------------------------------------------------------------------------------------------------------------------------------------------

// IMPORTS -----------------------------------------------------------------------------------------------------------------------------------------

// Model & View
import { GameModel} from "./model.js";
import { GameView } from "./view.js";

// Games functions
import { generateRandomChord, generateRandomCadence, recognizeChord } from "./chord&harmony.js";

// Multiplayer
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { app } from "../../../firebase.js";

// CLASS DEFINITION --------------------------------------------------------------------------------------------------------------------------------

// GameController class: Manages the overall game logic and interaction.
// Responsible for coordinating the game model, view, and piano controller, as well as managing game state, effects, and the timer.
export class GameController {

  // Constructor for the GameController class.
  // Initializes the game model, view, and the PianoController for handling the interactive keyboard.
  // Also prepares preloaded sound effects and a timer mechanism for gameplay.
  constructor() {
    this.model  = new GameModel(); 
    this.view   = new GameView();  

    const checkDisabledFn = () => this.model.isInputDisabled;

    this.pianoController = new PianoController("piano", this.model.keysNumber, this.model.firstNote, checkDisabledFn);

    this.preloadedEffects = []; 
    this.timerInterval    = null; 
  }

  // Initializes the game environment and sets up necessary event bindings and displays.
  // Handles different game modes (normal gameplay vs. practice mode) and prepares overlays, UI, and effects.
  init() {
    // Initialize the piano keyboard controller (render the keyboard and bind input events).
    this.pianoController.init();

    // Bind user interface events to their respective handlers in the GameController.
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

    // Bind global listeners for keyboard inputs and game-specific logic.
    this.view.bindGlobalListeners(this.model, {
      getMidiFromKeyCode: (event) => this.pianoController.view.keyMap[event.code], // Map key press to MIDI note.

      onCheckChord:       () => this.checkChord(),        // Check if the pressed chord matches the target.
      onIdentifyChord:    () => this.identifyChord(),     // Identify the chord played in practice mode.

      // Check the selected game mode.
      getIsSelectedChords:   () => (this.model.selectedGameMode === "chords_GM"),
      getIsSelectedHarmony:  () => (this.model.selectedGameMode === "harmony_GM"),
      getIsAssistantModeOn:  () => this.model.isAssistantModeOn,

      // Fetch the generated chord and cadence data for verification.
      getChordData:    () => this.model.generatedChordData,
      getCadenceData:  () => this.model.generatedCadenceData,

      // Highlight keys with the given color for feedback.
      colorKey: (midiNote, color, keepActive) => this.pianoController.view.setKeyColor(midiNote, color, keepActive)
    });

    // Set up configurations based on local storage (e.g., user preferences, previous settings).
    this.setupFromLocalStorage();

    // Handle UI and gameplay setup for non-practice mode.
    if (!this.model.isPracticeMode) {
      this.view.handleOverlayDisplay("startGame", this.model); // Show the start game overlay.
      this.setupEffects(); // Load and prepare sound effects.

      // Update various UI components with initial game state.
      this.view.updateScoreDisplay(this.model);
      this.view.updateTimerDisplay(this.model);
      this.view.updateLevelDisplay(this.model);
      this.view.updateModeDisplay(this.model);
      this.view.updateRoundDisplay(this.model);

      // Play the starting sound effect if available.
      if (this.preloadedEffects[0]) this.preloadedEffects[0].play();

      // Show ranking and placement displays if in multiplayer mode.
      if (this.model.isMultiplayer) {
        this.view.updatePlacement(this.model);
        this.view.placementDisplay.style.display = "flex";
      }
    } else {
      // Setup for practice mode: enable free play without overlays or restrictions.
      this.view.handleOverlayDisplay("hide", this.model);
      this.view.enableInput(this.model);

      // Hide unnecessary UI components.
      this.view.startGameButton.style.display = "none";
      this.view.playSolutionButton.style.display = "none";
      this.view.hintButton.style.display = "none";
      this.view.assistantModeButton.style.display = "none";
      this.view.roundDisplay.style.display = "none";
      this.view.scoreDisplay.style.display = "none";
      this.view.timerDisplay.style.display = "none";
      this.view.placementDisplay.style.display = "none";

      // Show a "Back to Menu" button for exiting practice mode.
      this.view.backMenuButton.style.display = "block";
      this.view.backMenuButton.style.textAlign = "center";

      // Adjust the hint display for free-play practice.
      this.view.hintDisplay.style.padding = "0px";
      this.view.hintDisplay.style.fontSize = "4vh";

      // Update the difficulty display with a practice-specific message.
      this.view.difficultyDisplay.style.fontSize = "4vh";
      this.view.difficultyDisplay.style.marginBottom = "0px";
      this.view.difficultyDisplay.innerHTML = "JUST HAVE FUN! CHORDS PLAYED WILL BE RECOGNIZED";
    }
  }

  // Load configuration and settings from LocalStorage to initialize the game model.
  setupFromLocalStorage() {
    // Load and set practice mode and multiplayer flags from stored preferences.
    this.model.isPracticeMode = (localStorage.getItem("Practice") === "true");
    this.model.isMultiplayer  = (localStorage.getItem("multiplayerFlag") === "true");

    // Retrieve user and lobby information for multiplayer mode.
    this.model.userID         = localStorage.getItem("userID") || null;
    this.model.lobbyName      = localStorage.getItem("lobbyName") || null;
    this.model.isHost         = (localStorage.getItem("isHost") === "true");

    // Set the number of rounds based on the game mode (single-player or multiplayer).
    const loadedRoundsMP = parseInt(localStorage.getItem("numberRoundsMP")) || 3;
    const loadedRoundsSP = parseInt(localStorage.getItem("numberOfRounds")) || 3;
    if (this.model.isMultiplayer) this.model.maxRounds = loadedRoundsMP;
    else this.model.maxRounds = loadedRoundsSP;

    // Load game mode and difficulty level settings.
    this.model.selectedGameMode   = localStorage.getItem("Gamemode") || "chords_GM";
    this.model.selectedDifficulty = localStorage.getItem("Difficulty") || "easyDiff";

    // Load and clamp the effects volume to a valid range (0 to 1).
    const loadedEffectsVolume = parseFloat(localStorage.getItem("effectsVolume")) || 0.5;
    this.model.effectsvol = Math.min(Math.max(loadedEffectsVolume, 0), 1);

    // If in multiplayer mode, set up real-time ranking updates.
    if (this.model.isMultiplayer) {
      getAuth(app); 
      setInterval(() => this.updateRanking(), 100); 
    }
  };

  // Preload sound effects for various game events (e.g., game start, success, failure).
  setupEffects() {
    const effectsFiles = [
      "/Project/Sounds/Effects/game-start.mp3",  
      "/Project/Sounds/Effects/game-bonus.mp3", 
      "/Project/Sounds/Effects/game-over.mp3",  
      "/Project/Sounds/Effects/fail.mp3",       
      "/Project/Sounds/Effects/game-finished.mp3" 
    ];

    // Load each sound effect and adjust its volume based on user settings.
    effectsFiles.forEach((file, index) => {
      const effect = new Audio(file);
      effect.volume = this.model.effectsvol;
      this.preloadedEffects[index] = effect;
    });
  };


  // UI EVENTS

  // Handles the start of a game round. 
  // Displays a "wait" overlay if the player is in multiplayer mode and game data isn't yet available. 
  // Otherwise, hides overlays and starts the round.
  onStartGame() {
    if (
      this.model.isMultiplayer && !this.model.isHost && 
      (!this.model.generatedChordsData.length || !this.model.generatedCadencesData.length)
    )     this.view.handleOverlayDisplay("wait", this.model);
    else  this.view.handleOverlayDisplay("hide", this.model);

    this.startRound();
  }

  // Handles the transition to the next round. 
  // If the last round is reached, displays the "game over" overlay and plays the game-finished sound effect. 
  // Otherwise, hides overlays and starts the next round.
  onNextRound() {
    if (this.model.activeRound == this.model.maxRounds) { 
      this.view.handleOverlayDisplay("gameOver", this.model);
      if (this.preloadedEffects[4]) this.preloadedEffects[4].play();
    } 
    else { 
      this.view.handleOverlayDisplay("hide", this.model);
      this.startRound();
    }
  }

  // Displays the solution for the current round. 
  // Shows the correct chord or cadence, highlights the required keys, and plays the corresponding sound
  onShowSolution() {
    this.view.handleOverlayDisplay("hide", this.model);
    this.view.handleOverlayDisplay("showSolution", this.model);

    if (this.model.selectedGameMode === "chords_GM") {
      const chordData = this.model.generatedChordData;
      this.playChord(chordData.midiNotes);
      chordData.midiNotes.forEach(note => {
        this.pianoController.view.setKeyColor(note, "green");
      });
    } 
    else if (this.model.selectedGameMode === "harmony_GM") {
      const cadenceData = this.model.generatedCadenceData;
      this.playCadence(cadenceData, cadenceData.missingChordData.midiNotes);
      setTimeout(() => {
        cadenceData.missingChordData.midiNotes.forEach(note => {
          this.pianoController.view.setKeyColor(note, "green");
        });
      }, this.model.playingCadenceTimer);
    } 
    else console.error("GameMode not recognized.");
  }

  // Hides the solution display and resets the state for the next round. 
  // Restores the original key colors and ensures appropriate overlays (e.g., "time over", "good guess") are shown if applicable.
  onHideSolution() {
    this.view.handleOverlayDisplay("hide", this.model);

    if (this.model.isShowedTimeOver) this.view.handleOverlayDisplay("timeOver", this.model);
    if (this.model.isShowedGoodGuess) this.view.handleOverlayDisplay("goodGuess", this.model);

    this.view.overlaySolutionPanel.style.display = "none";

    if (this.model.selectedGameMode === "chords_GM") {
      const chordData = this.model.generatedChordData;
      chordData.midiNotes.forEach(note => {
        this.pianoController.view.resetKeyColor(note);
      });
    } 
    else if (this.model.selectedGameMode === "harmony_GM") {
      const cadenceData = this.model.generatedCadenceData;
      cadenceData.missingChordData.midiNotes.forEach(note => {
        this.pianoController.view.resetKeyColor(note);
      });
    } 
    else console.error("GameMode not recognized.");
  }

  // Plays the solution for the current round. Depending on the selected game mode, it plays the generated chord or cadence.
  onPlaySolution() {
    if (this.model.selectedGameMode === "chords_GM") {
      const chordData = this.model.generatedChordData;
      this.playChord(chordData.midiNotes);
    } 
    else if (this.model.selectedGameMode === "harmony_GM") {
      const cadenceData = this.model.generatedCadenceData;
      this.playCadence(cadenceData);
    } 
    else console.error("GameMode not recognized.");
  }

  // Displays a hint for the current round if the hint timer has reached the defined interval. 
  onHint() {
    if (this.model.hintTimer >= this.model.hintInterval) this.updateHints();
  }

  // Toggles the "Assistant Mode," which provides real-time feedback on correct and incorrect notes.
  // Updates the assistant button text to reflect the current mode.
  onToggleAssistant() {
    if (this.model.isAvailableAssistant) {
      this.model.assistantPoint                 = true;
      this.model.isAssistantModeOn              = !this.model.isAssistantModeOn;
      this.view.assistantModeButton.textContent = !this.model.isAssistantModeOn ? "ASSISTANT MODE OFF" : "ASSISTANT MODE ON";
    }
  }

  // Redirects the player to the main menu screen.
  onMainMenu() {
    window.location.href = "../../gameTitleScreen.html";
  }

  // GAME LOGIC

  // Starts a new round by resetting round variables, updating UI, and initiating the gameplay logic.
  // It handles single-player and multiplayer game modes for both "chords" and "harmony."
  startRound() {
    this.model.incrementRound();

    this.view.updateRoundDisplay(this.model);
    this.view.updateScoreDisplay(this.model);

    this.model.resetRoundVariables();
    this.resetButtons();

    this.startTimer();
    this.view.enableInput(this.model);

    if (this.model.selectedGameMode === "chords_GM") {
      if (this.model.isMultiplayer) {
        if (this.model.isHost && !this.model.generatedChordsData.length) this.generateChordsForRounds();
        this.startMultiplayerRound();
      } 
      else this.generateNewChord();
    } 
    else if (this.model.selectedGameMode === "harmony_GM") {
      if (this.model.isMultiplayer) {
        if (this.model.isHost && !this.model.generatedCadencesData.length) this.generateCadencesForRounds();
        this.startMultiplayerRound();
      } 
      else this.generateNewCadence();
    } 
    else console.error("GameMode not recognized.");
  }
  
  // Resets UI buttons for hints and assistant mode to a blocked state at the start of each round.
  resetButtons() {
    this.view.hintDisplayText("");

    this.view.hintButton.textContent          = "HINT BLOCKED";
    this.view.assistantModeButton.textContent = "ASSISTANT BLOCKED";

    this.view.hintButton.classList.add( "no-hover", "notSelectable");
    this.view.assistantModeButton.classList.add( "no-hover", "notSelectable");
  }

  // Handles the logic when a correct guess is made, including stopping the timer, applying penalties, updating the score, and displaying the correct feedback.
  handleCorrectGuess() {
    clearInterval(this.timerInterval);

    this.model.applyPenalties();
    this.model.incrementTotalScore();

    if (this.model.isMultiplayer) this.updateScoreInDatabase();

    this.view.handleOverlayDisplay("goodGuess", this.model);
    if (this.preloadedEffects[1]) this.preloadedEffects[1].play();
  }

  // Checks if the currently pressed notes match the expected chord or cadence based on the game mode.
  // Triggers the assistant mode if enabled and handles duplicate checks to avoid redundant validations.
  checkChord() {
    const pressedNotes = this.pianoController.getPressedNotes();

    if (this.model.isAssistantModeOn) this.handleAssistantMode(pressedNotes);

    if (pressedNotes.length < 3) return;

    if (this.model.selectedGameMode === "chords_GM") {
      if (this.arraysEqual(pressedNotes, this.model.previousPressedNotes)) return;
      this.model.previousPressedNotes = [...pressedNotes];

      const chordData = this.model.generatedChordData;
      if (this.arraysEqual(chordData.midiNotes, pressedNotes)) this.handleCorrectGuess();
    } 
    else if (this.model.selectedGameMode === "harmony_GM") {
      if (this.arraysEqual(pressedNotes, this.model.previousPressedNotes)) return;
      this.model.previousPressedNotes = [...pressedNotes];

      const cadenceData = this.model.generatedCadenceData;
      if (this.arraysEqual(cadenceData.missingChordData.midiNotes, pressedNotes)) this.handleCorrectGuess();
    } 
    else console.error("GameMode not recognized.");
  }

  // Utility function to compare two arrays for equality, ignoring order.
  arraysEqual(arr1, arr2) {
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();
    return JSON.stringify(sortedArr1) === JSON.stringify(sortedArr2);
  }

  // TIMER

  // Starts the countdown timer for the current round.
  startTimer() {
    this.model.timeLeft  = 120;
    this.model.hintTimer = 0;

    if (this.model.isShowedWait) return;
    else this.timerInterval = setInterval(() => this.updateTimer(), 1000);
  }

  // Updates the timer every second, decrementing the remaining time and managing game state.
  // The timer also tracks when to decrement the score and reveal hints or assistant mode.
  updateTimer() {

    this.model.decrementTimeLeft();
    this.model.incrementHintTimer();

    this.view.updateTimerDisplay(this.model);

    if (
      this.model.timeLeft > 0 && this.model.timeLeft % this.model.deductionInterval === 0
    ) this.model.currentScore = Math.max(0, this.model.currentScore - this.model.pointsTime);

    this.hintsToShow();
    this.assistantToShow();

    if (this.model.timeLeft <= 0) {
      clearInterval(this.timerInterval);

      this.view.handleOverlayDisplay("timeOver", this.model);
      if (this.preloadedEffects[2]) this.preloadedEffects[2].play();
    }
  }

  // GAMES

  // Generates a new chord based on the game's difficulty and range, and plays it on the piano.
  generateNewChord() {
    const chordData = generateRandomChord(this.model.firstNote, this.model.lastNote, this.model.selectedDifficulty);
    this.model.generatedChordData = chordData;
    this.playChord(chordData.midiNotes);
  }
  
  // Generates a new cadence sequence based on the game's difficulty and range, and plays it step-by-step.
  generateNewCadence() {
    const cadenceData = generateRandomCadence(this.model.firstNote, this.model.lastNote, this.model.selectedDifficulty);
    this.model.generatedCadenceData = cadenceData;
    this.playCadence(cadenceData);
  }

  // Plays a chord by triggering all its notes simultaneously on the piano. 
  playChord(chord) {
    chord.forEach(note => {
      this.pianoController.playNote(note, true);
    });
  }

  // Plays a cadence (sequence of chords), with the missing chord at the end.
  playCadence(cadenceData, missingChord = null) {
    this.model.playingCadenceTimer = 0;

    cadenceData.cadenceDetails.forEach(chord => {
      if (chord) {
        setTimeout(() => {
          this.playChord(chord.midiNotes);
        }, this.model.playingCadenceTimer);
        this.model.playingCadenceTimer += 1000;
      }
    });

    if (missingChord) setTimeout(() => {
      this.playChord(missingChord);
    }, this.model.playingCadenceTimer);
  }

  // HINTS & ASSISTANT

  // Manages the availability and display of hints based on elapsed time.
  // Enables hints progressively and updates the hint button's state and text.
  hintsToShow() {
    for (let i = 0; i < this.model.isAvailableHints.length; i++) {
      if (this.model.hintTimer >= this.model.hintInterval*(i+1) && !this.model.isAvailableHints[i]) {
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

  // Updates and displays hints depending on the current game mode and user actions.
  // In practice mode, directly reveals the played chord; in game mode, shows progressive hints.
  updateHints() {
    if (this.model.isPracticeMode) {
      const chordData = this.model.recognizedChordData;
      if (chordData && chordData.noteRoot !== null) this.view.hintDisplayText(
        `${chordData.noteRoot}${chordData.chordType} IN ${chordData.inversion}`
      );
      return;
    }

    let currentHint = 0;

    if      (this.model.hintTimer >= this.model.hintInterval*3) currentHint = 3;
    else if (this.model.hintTimer >= this.model.hintInterval*2) currentHint = 2;
    else if (this.model.hintTimer >= this.model.hintInterval)   currentHint = 1;
    
    const isShowingHint = (this.view.hintButton.textContent === "SHOW HINT");

    if (isShowingHint) {
      this.model.hintsPoint[currentHint-1] = true;

      if      (this.model.selectedGameMode === "chords_GM") this.showChordHint(currentHint);
      else if (this.model.selectedGameMode === "harmony_GM") this.showHarmonyHint(currentHint);
      else console.error("GameMode not recognized.");

      this.view.hintButton.textContent = "HIDE HINT";
    } 
    else {
      switch(currentHint) {
        case 1: this.view.hintDisplayText("1st HINT HIDDEN"); break;
        case 2: this.view.hintDisplayText("2nd HINT HIDDEN"); break;
        case 3: this.view.hintDisplayText("3rd HINT HIDDEN"); break;
      }
      this.view.hintButton.textContent = "SHOW HINT";
    }
  }
  
  // Displays hints for chords in the Chords game mode based on the current hint level.
  showChordHint(currentHint) {
    const chordData = this.model.generatedChordData;
    switch(currentHint) {
      case 1: this.view.hintDisplayText(`ROOT: ${chordData.noteRoot}`); break;
      case 2: this.view.hintDisplayText(`${chordData.noteRoot}${chordData.chordType}`); break;
      case 3: this.view.hintDisplayText(`${chordData.noteRoot}${chordData.chordType} IN ${chordData.inversion}`); break;
    }
  }

  // Displays hints for cadences in the Harmony game mode based on the current hint level. 
  showHarmonyHint(currentHint) {
    const cadenceData = this.model.generatedCadenceData;
    switch(currentHint) {
      case 1: this.view.hintDisplayText(
        `FIRST CHORD: ${cadenceData.cadenceDetails[0].noteRoot}${cadenceData.cadenceDetails[0].chordType}`
      ); break;
      case 2: this.view.hintDisplayText(
        `CHORDS PLAYED: ${cadenceData.cadenceName}`
      ); break;
      case 3: this.view.hintDisplayText(
        `COMPLETE CADENCE: ${cadenceData.cadenceName} - ${cadenceData.missingChordData.noteRoot}${cadenceData.missingChordData.chordType}`
      ); break;
    }
  }

  // Activates the assistant mode. 
  assistantToShow() {
    if (this.model.checkAssistantAvailability()) {
      this.model.isAvailableAssistant = true;
      this.view.assistantModeButton.classList.remove("no-hover", "notSelectable");
      this.view.assistantModeButton.textContent = "ASSISTANT MODE OFF";
    }
  }

  // Provides real-time visual feedback in Assistant Mode by highlighting correct and incorrect notes. 
  handleAssistantMode(pressedNotes) {
    const currentColorNotes = new Set(pressedNotes);

    if (this.model.selectedGameMode === "chords_GM") {
      const chordData = this.model.generatedChordData;
      pressedNotes.forEach(note => {
        this.pianoController.view.setKeyColor(note, chordData.midiNotes.includes(note) ? "green" : "red");
      });
    } 
    else if (this.model.selectedGameMode === "harmony_GM") {
      const cadenceData = this.model.generatedCadenceData;
      pressedNotes.forEach(note => {
        this.pianoController.view.setKeyColor(
          note, cadenceData.missingChordData.midiNotes.includes(note) ? "green" : "red"
        );
      });
    } 
    else console.error("GameMode not recognized.");

    for (let midi = this.model.firstNote; midi <= this.model.lastNote; midi++) {
      if (!currentColorNotes.has(midi)) this.pianoController.view.resetKeyColor(midi);
    }
  }

  // PRACTICE MODE

  // Identifies and recognizes the chord played by the user in practice mode. 
  identifyChord() {
    const pressedNotes = this.pianoController.getPressedNotes().sort();

    if (pressedNotes.length >= 3) {
      this.model.recognizedChordData = recognizeChord(pressedNotes);
      this.updateHints();
    } 
    else this.view.hintDisplayText("");
  }

  // MULTIPLAYER

  // Generates random chord data for all rounds in multiplayer mode.
  // This data is saved to the multiplayer database so all players in the lobby share the same game structure. 
  async generateChordsForRounds() {
    this.model.generatedChordsData = [];

    for (let i = 0; i < this.model.maxRounds; i++) {
      const chordData = generateRandomChord(this.model.firstNote, this.model.lastNote, this.model.selectedDifficulty);
      this.model.generatedChordsData.push(chordData);
    }

    await set(
      ref(getDatabase(app), `lobbies/${this.model.lobbyName}/gameStructure`), 
      this.model.generatedChordsData
    );
  }

  // Generates random cadence data for all rounds in multiplayer mode.
  // Similar to chords, cadence data is stored in the multiplayer database for synchronization across players. 
  async generateCadencesForRounds() {
    this.model.generatedCadencesData = [];

    for (let i = 0; i < this.model.maxRounds; i++) {
      const cadenceData = generateRandomCadence(this.model.firstNote, this.model.lastNote, this.model.selectedDifficulty);
      this.model.generatedCadencesData.push(cadenceData);
    }

    await set(
      ref(getDatabase(app), `lobbies/${this.model.lobbyName}/gameStructure`),
      this.model.generatedCadencesData
    );
  }

  // Handles the start of a new round in multiplayer mode.
  // Synchronizes game data from the host to the database and retrieves it for all players.
  // Ensures consistent gameplay between host and participants.
  async startMultiplayerRound() {
    if (!this.model.isHost) {
      let snapshot;
      do {
        snapshot = await get(ref(getDatabase(app), `lobbies/${this.model.lobbyName}/gameStructure`));
        if (snapshot.exists()) {
          if (this.model.selectedGameMode === "chords_GM") this.model.generatedChordsData = snapshot.val();
          else if (this.model.selectedGameMode === "harmony_GM") this.model.generatedCadencesData = snapshot.val();
          else console.error("GameMode not recognized.");
        }
      } while (!snapshot.exists());

      this.view.handleOverlayDisplay("hide", this.model);

      clearInterval(this.timerInterval);
      this.startTimer();
    }

    if (this.model.selectedGameMode === "chords_GM") {
      if (!this.model.generatedChordsData.length) {
        console.error("Chords not found.");
        return;
      }

      const chordData = this.model.generatedChordsData[this.model.activeRound - 1];
      this.model.generatedChordData = chordData;
      this.playChord(chordData.midiNotes);
    } 
    else if (this.model.selectedGameMode === "harmony_GM") {
      if (!this.model.generatedCadencesData.length) {
        console.error("Cadences not found.");
        return;
      }

      const cadenceData = this.model.generatedCadencesData[this.model.activeRound - 1];
      this.model.generatedCadenceData = cadenceData;
      this.playCadence(cadenceData);
    } 
    else console.error("GameMode not recognized.");
  }

  // Updates the user's score in the multiplayer database.
  // This ensures all players can see the updated scores in real-time.
  async updateScoreInDatabase() {
    await set(
      ref(getDatabase(app), `lobbies/${this.model.lobbyName}/players/${this.model.userID}/score`),
      this.model.totalScore
    );
  }

  // Updates the multiplayer ranking and player placement in the game.
  // Retrieves the latest scores from the database, sorts players by score, and updates the model and view with the ranking and placement data.
  async updateRanking() {
    try {
      const snapshot = await get(ref(getDatabase(app), `lobbies/${this.model.lobbyName}/players`));

      const playersData = snapshot.val();
      if (!playersData) {
        console.warn("No data found.");

        this.model.setRanking(null);
        this.model.setPlacement(null);

        this.view.updateRankingDisplay(null);
        this.view.updatePlacement("N/A");
        return;
      }
      
      let playersArray = Object.entries(playersData).map(([id, data]) => ({
        id,
        score: data.score || 0,
        playerName: data.playerName || "Noname"
      }));
      playersArray.sort((a, b) => b.score - a.score);
      this.model.setRanking(playersArray);
      this.view.updateRankingDisplay(this.model);

      const playerIndex = playersArray.findIndex(p => p.id === this.model.userID);
      this.model.setPlacement(playerIndex + 1);
      this.view.updatePlacement(this.model);
    } catch (error) {
      console.error("Error updating ranking:", error);

      this.model.setRanking(null);
      this.model.setPlacement(null);

      this.view.updateRankingDisplay(null);
      this.view.updatePlacement("N/A");
    }
  }

}

// -------------------------------------------------------------------------------------------------------------------------------------------------