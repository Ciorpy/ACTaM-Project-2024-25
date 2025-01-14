// -------------------------------------------------------------------------------------------------------------------------------------------------
//          PIANO VIEW JAVASCRIPT
// -------------------------------------------------------------------------------------------------------------------------------------------------

// CLASS DEFINITION --------------------------------------------------------------------------------------------------------------------------------

// PianoView class: Manages the rendering and user interaction for the virtual piano keyboard.
// This class handles creating the keyboard, visual updates for key presses, and binding user events to interact with the keyboard.
export class PianoView {

  // Constructor for the PianoView class.
  // Sets up the configuration for the keyboard, including the container ID, number of keys, starting MIDI note, and key mappings.
  constructor(containerId, numberOfKeys, startMidiNote) {
    this.containerId    = containerId;
    this.numberOfKeys   = numberOfKeys;
    this.startMidiNote  = startMidiNote;

    this.blackKeys = [1, 3, 6, 8, 10];

    this.keyboardKeys = [
      "KeyW", "Digit3", "KeyE", "Digit4", "KeyR", "KeyT", "Digit6", "KeyY", "Digit7", "KeyU", "Digit8", "KeyI",
      "KeyZ", "KeyS", "KeyX", "KeyD", "KeyC", "KeyV", "KeyG", "KeyB", "KeyH", "KeyN", "KeyJ", "KeyM", "Comma"
    ];

    this.keyMap = {};
  }

  // Renders the virtual piano keyboard in the specified container.
  // Dynamically creates DOM elements for each key, calculates their positions, and sets their attributes.
  renderKeyboard() {
    const pianoContainer = document.getElementById(this.containerId);

    pianoContainer.innerHTML = ""; 

    const totalWhiteKeys = Array.from(
      { length: this.numberOfKeys }, 
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
        key.style.left = `${(currentWhiteKeyIndex - 1) * whiteKeyWidthPercentage + whiteKeyWidthPercentage * 0.7}%`;
        key.style.width = `${whiteKeyWidthPercentage * 0.7}%`;
      } 
      else currentWhiteKeyIndex++;

      pianoContainer.appendChild(key);
    }
  } 
  
  // Highlights a specific key as active (pressed) or resets its active state.
  // Provides visual feedback for key presses/releases.
  setActiveKey(note, isActive) {
    const keyElement = document.querySelector(`.key[data-midi-note="${note}"]`);
    if (!keyElement) return;

    if (isActive) keyElement.classList.add("active");
    else keyElement.classList.remove("active");
  }

  // Binds user events (mouse and keyboard) to play and stop notes on the virtual keyboard.
  // Handles mouse interactions and maps computer keyboard keys to MIDI notes.
  bindNoteEvents(playCallback, stopCallback) {
    const keys = document.querySelectorAll(".key");
    const activeKeys = new Set();
    keys.forEach(key => {
      key.addEventListener("mousedown", () => {
        const midiNote = parseInt(key.dataset.midiNote);
        playCallback(midiNote);
        activeKeys.add(midiNote);
      });

      key.addEventListener("mouseup", () => {
        const midiNote = parseInt(key.dataset.midiNote);
        stopCallback(midiNote);
        activeKeys.delete(midiNote);
      });

      key.addEventListener("mouseleave", () => {
        const midiNote = parseInt(key.dataset.midiNote);
        if (activeKeys.has(midiNote)) {
          stopCallback(midiNote);
          activeKeys.delete(midiNote);
        }
      });
    });

    document.addEventListener("keydown", (event) => {
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
    
  // Sets the color of a key to provide visual feedback (e.g., for assistant mode).
  setKeyColor(note, color, keepActive = false) {
    const keyElement = document.querySelector(`.key[data-midi-note="${note}"]`);
    if (keyElement) {
      keyElement.style.backgroundColor = color;
      if (keepActive) keyElement.dataset.color = color;
    }
  }
    
  // Resets the color of a specific key to its default state.
  resetKeyColor(note) {
    const keyElement = document.querySelector(`.key[data-midi-note="${note}"]`);
    if (keyElement) {
      keyElement.style.backgroundColor = "";
      delete keyElement.dataset.color;
    }
  }
        
}

// -------------------------------------------------------------------------------------------------------------------------------------------------
//          GAME VIEW JAVASCRIPT
// -------------------------------------------------------------------------------------------------------------------------------------------------

// CLASS DEFINITION --------------------------------------------------------------------------------------------------------------------------------

// GameView class: Manages the rendering and user interaction for the game UI.
// This class handles binding UI events, updating game displays, and interacting with overlays for various game states.
export class GameView {

  // Constructor for the GameView class.
  // Initializes references to all key UI elements used in the game, such as overlays, buttons, and game displays.
  constructor() {
    // Overlay Info: Elements displayed in overlay screens
    this.overlayPanel             = document.getElementById("overlayDiv");
    this.overlayTitle             = document.getElementById("overlayTitle");
    this.overlaySubtitle          = document.getElementById("overlaySubtitle");
    this.overlayScoreDisplay      = document.getElementById("overlayScoreDisplay");
    this.overlaySolutionPanel     = document.getElementById("overlaySolutionDiv");
    this.overlayTitleSolution     = document.getElementById("overlayTitleSolution");
    this.overlaySubtitleSolution  = document.getElementById("overlaySubtitleSolution");

    // Overlay Buttons: Buttons displayed in overlays for navigating or interacting with the game.
    this.startGameButton      = document.getElementById("startGame");
    this.nextRoundButton      = document.getElementById("nextRound");
    this.mainMenuButton       = document.getElementById("mainMenu");
    this.showSolutionButton   = document.getElementById("showSolution");
    this.hideSolutionButton   = document.getElementById("hideSolution");

    // Game Info: UI elements that display dynamic game information such as mode, difficulty, score, etc.
    this.gameModeDisplay      = document.getElementById("gameMode");
    this.difficultyDisplay    = document.getElementById("difficultyDisplay");
    this.roundDisplay         = document.getElementById("roundDisplay");
    this.timerDisplay         = document.getElementById("timerDisplay");
    this.scoreDisplay         = document.getElementById("scoreDisplay");
    this.hintDisplay          = document.getElementById("hintDisplay");

    // Game Buttons: Buttons used during gameplay for actions like hints or assistant toggles.
    this.playSolutionButton   = document.getElementById("playSolutionButton");
    this.assistantModeButton  = document.getElementById("assistantModeButton");
    this.hintButton           = document.getElementById("hintButton");
    this.backMenuButton       = document.getElementById("backMenuButton");

    // Multiplayer: Elements specific to multiplayer mode for displaying rankings and placement.
    this.rankingTable     = document.getElementById("overlayMultiplayerRanking");
    this.placementDisplay = document.getElementById("currentPlacement");
  }

  // BINDING EVENTS 

  // Binds UI buttons to their respective event callbacks.
  // Links UI actions (e.g., starting a game, showing hints) to the corresponding methods in the controller.
  bindUIEvents(callbacks) {
    if (this.startGameButton) this.startGameButton.addEventListener("click", () => {
      if (callbacks.onStart) callbacks.onStart();
    });

    if (this.nextRoundButton) this.nextRoundButton.addEventListener("click", () => {
      if (callbacks.onNextRound) callbacks.onNextRound();
    });

    if (this.showSolutionButton) this.showSolutionButton.addEventListener("click", () => {
      if (callbacks.onShowSolution) callbacks.onShowSolution();
    });

    if (this.hideSolutionButton) this.hideSolutionButton.addEventListener("click", () => {
      if (callbacks.onHideSolution) callbacks.onHideSolution();
    });

    if (this.playSolutionButton) this.playSolutionButton.addEventListener("click", () => {
      if (callbacks.onPlaySolution) callbacks.onPlaySolution();
    });
    
    if (this.hintButton) this.hintButton.addEventListener("click", () => {
      if (callbacks.onHint) callbacks.onHint();
    });
    
    if (this.assistantModeButton) this.assistantModeButton.addEventListener("click", () => {
      if (callbacks.onToggleAssistant) callbacks.onToggleAssistant();
    });
    
    if (this.backMenuButton) this.backMenuButton.addEventListener("click", () => {
      if (callbacks.onMainMenu) callbacks.onMainMenu();
    });

    if (this.mainMenuButton) this.mainMenuButton.addEventListener("click", () => {
      if (callbacks.onMainMenu) callbacks.onMainMenu();
    });
  }
  
  // Binds global event listeners for keyboard and mouse inputs.
  // Handles real-time interaction with the game elements, such as key presses for playing notes.
  bindGlobalListeners(model, callbacks) {
    document.addEventListener("keydown", (event) => {
      if (model.isInputDisabled) return;

      const note = callbacks.getMidiFromKeyCode(event);
      if (note === undefined) return;

      if (!model.isPracticeMode) callbacks.onCheckChord();
      else callbacks.onIdentifyChord();
    });

    document.addEventListener("keyup", () => {
      if (model.isPracticeMode) this.hintDisplayText("");
    });

    document.addEventListener("mousedown", (event) => {
      if (model.isInputDisabled) return;

      const keyElement = event.target.closest(".key");
      if (!keyElement) return;

      const midiNote = parseInt(keyElement.dataset.midiNote);
      if (callbacks.getIsSelectedChords() && callbacks.getIsAssistantModeOn()) {
        if (callbacks.getChordData().midiNotes.includes(midiNote)) callbacks.colorKey(midiNote, "green", true);
        else callbacks.colorKey(midiNote, "red", true);
      }
      else if (callbacks.getIsSelectedHarmony() && callbacks.getIsAssistantModeOn()) {
        if (callbacks.getCadenceData().missingChordData.midiNotes.includes(midiNote)) callbacks.colorKey(midiNote, "green", true);
        else callbacks.colorKey(midiNote, "red", true);
      }
    });
  }

  // OVERLAY

  // Handles the display of overlay panels in the game based on the game state or specific events.
  // Depending on the `overlayType`, it adjusts visibility and content for various game states (e.g., start, time over, good guess, game over).
  handleOverlayDisplay(overlayType, model) {
    this.overlayPanel.style.display        = "none";
    this.overlayScoreDisplay.style.display = "none";
    this.startGameButton.style.display     = "none";
    this.showSolutionButton.style.display  = "none";
    this.nextRoundButton.style.display     = "none";

    switch(overlayType) {
      case "startGame":
        this._disableInput(model);
        this.overlayPanel.style.display         = "flex";
        this.overlayTitle.style.display         = "flex";
        this.overlaySubtitle.style.display      = "flex";
        this.overlayScoreDisplay.style.display  = "none";

        if (model.selectedGameMode === "chords_GM") this.overlayTitle.innerHTML = "RECOGNIZE CHORD AND PLAY IT";
        else if (model.selectedGameMode === "harmony_GM") this.overlayTitle.innerHTML = "RESOLVE CHORD CADENCES PLAYING MUTED LAST CHORD";
        else console.error("GameMode not recognized.");

        this.overlaySubtitle.innerHTML = "PRESS START";

        this.startGameButton.style.display = "block";
        break;
      case "timeOver":
        model.isShowedTimeOver = true;

        this._disableInput(model);

        this.overlayPanel.style.display         = "flex";
        this.overlayTitle.style.display         = "flex";
        this.overlayScoreDisplay.style.display  = "none";

        this.overlayTitle.innerHTML     = "TIME OVER";
        if (model.isMultiplayer) {
          this.overlaySubtitle.style.display = "flex";
          this.overlaySubtitle.innerHTML  = "YOU DIDN'T MAKE IT!";
        }

        this.showSolutionButton.style.display = "block";
        this.nextRoundButton.style.display    = "block";

        if (model.isMultiplayer) this.rankingTable.style.display = "flex";
        else this.rankingTable.style.display = "none";
        break;
      case "goodGuess":
        model.isShowedGoodGuess = true;

        this._disableInput(model);

        this.overlayPanel.style.display         = "flex";
        this.overlayTitle.style.display         = "flex";
        this.overlayScoreDisplay.style.display  = "none";

        this.overlayTitle.innerHTML     = "GOOD GUESS";
        if (!model.isMultiplayer) {
          this.overlaySubtitle.style.display = "flex";
          this.overlaySubtitle.innerHTML  = "YOU ARE A BOSS!";
        }

        this.showSolutionButton.style.display = "block";
        this.nextRoundButton.style.display    = "block";

        if (model.isMultiplayer) this.rankingTable.style.display = "flex";
        else this.rankingTable.style.display = "none";
        break;
      case "gameOver":
        this._disableInput(model);

        this.overlayPanel.style.display     = "flex";
        this.overlayTitle.style.display     = "flex";
        this.overlaySubtitle.style.display  = "none";

        this.overlayTitle.innerHTML          = "GAME OVER";

        if (!model.isMultiplayer) this.overlayScoreDisplay.innerHTML   = "TOTAL SCORE: " + model.totalScore;
        else this.rankingTable.style.display     = "flex";

        this.mainMenuButton.style.display   = "block";
        break;
      case "wait":
        model.isShowedWait = true;

        this._disableInput(model);
        this.overlayPanel.style.display         = "flex";
        this.overlayTitle.style.display         = "flex";
        this.overlaySubtitle.style.display      = "none";
        this.overlayScoreDisplay.style.display  = "none";

        this.overlayTitle.innerHTML = "WAIT YOUR HOST!";

        this.showSolutionButton.style.display = "none";
        this.nextRoundButton.style.display    = "none";
        break;
      case "showSolution":
        this._disableInput(model);

        this.overlaySolutionPanel.style.display = "flex";

        if (model.selectedGameMode === "chords_GM") {
          const chordData = model.generatedChordData;
          this.overlayTitleSolution.innerHTML = `IT'S A ${chordData.noteRoot}${chordData.chordType} IN ${chordData.inversion}`;
          this.overlaySubtitleSolution.innerHTML = "";
        } 
        else if (model.selectedGameMode === "harmony_GM") {
          const cadenceData = model.generatedCadenceData;
          const missing = cadenceData.missingChordData;
          this.overlayTitleSolution.innerHTML = `IT'S A ${cadenceData.name} IN ${missing.noteRoot}${missing.chordType}`;
          this.overlaySubtitleSolution.innerHTML = `${cadenceData.cadenceName} - ${missing.noteRoot}${missing.chordType}`;
        } 
        else console.error("GameMode not recognized.");
        break;
      case "hide":
        model.isShowedWait = false;

        this.enableInput(model);

        this.overlayPanel.style.display         = "none";
        this.overlayTitle.style.display         = "none";
        this.overlaySubtitle.style.display      = "none";
        this.overlayScoreDisplay.style.display  = "none";
        break;
      default: console.log("Error: overlayType '" + overlayType + "' does not exist."); 
        break;
    }
  }

  // UI METHODS

  // Updates the score display with the current total score.
  updateScoreDisplay(model) {
    this.scoreDisplay.innerHTML = "CURRENT SCORE: " + model.totalScore;
  }

  // Updates the timer display with the remaining time in seconds.
  updateTimerDisplay(model) {
    this.timerDisplay.innerHTML = "REMAINING TIME: " + model.timeLeft + "s";
  }

  // Updates the game mode display based on the selected game mode.
  // Maps internal game mode identifiers to user-friendly labels.
  updateModeDisplay(model) {
    const gameModeLegend = {
      chords_GM: "CHORDS",
      harmony_GM: "HARMONY",
    };
    this.gameModeDisplay.innerHTML = gameModeLegend[model.selectedGameMode];
  }

  // Updates the level display with the current difficulty level.
  // Maps internal difficulty identifiers to user-friendly labels
  updateLevelDisplay(model) {
    const difficultyLegend = {
      easyDiff: "EASY",
      mediumDiff: "MEDIUM",
      hardDiff: "HARD"
    };
    this.difficultyDisplay.innerHTML = "DIFFICULTY " + difficultyLegend[model.selectedDifficulty];
  }

  // Updates the round display with the current active round number.
  updateRoundDisplay(model) {
    this.roundDisplay.innerHTML = "ROUND " + model.activeRound;
  }

  // Displays a custom hint text in the hint display area.
  hintDisplayText(text) {
    this.hintDisplay.textContent = text;
  }

  // Disables user input by setting the corresponding model flag.
  _disableInput(model) {
    model.isInputDisabled = true;
  }
  
  // Enables user input by clearing the corresponding model flag.
  enableInput(model) {
    model.isInputDisabled = false;
  }

  // Updates the placement display with the player's current position in multiplayer mode.
  updatePlacement(model) {
    this.placementDisplay.innerHTML = "PLACEMENT: " + model.placement;
  }

  // Updates the ranking table with the current multiplayer ranking data.
  // If the model is `null`, displays an error message instead.
  updateRankingDisplay(model) {
    if (model == null) {
      this.rankingTable.innerHTML = "Error on Ranking";
      return;
    }
    this.rankingTable.innerHTML = model.ranking.map((item, index) => 
      `<div class="overlayRanking" style="display: flex">${index + 1}°: ${item.playerName} - ${item.score} points</div>`
    ).join("");
  }
}

// -------------------------------------------------------------------------------------------------------------------------------------------------