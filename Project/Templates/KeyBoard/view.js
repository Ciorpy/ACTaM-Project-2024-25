// -------------------------------------------------------------------------------------------------------------------------------------------------
//          PIANO VIEW JAVASCRIPT
// -------------------------------------------------------------------------------------------------------------------------------------------------

// CLASS DEFINITION
export class PianoView {

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

  setActiveKey(note, isActive) {
    const keyElement = document.querySelector(`.key[data-midi-note="${note}"]`);
    if (!keyElement) return;

    if (isActive) keyElement.classList.add("active");
    else keyElement.classList.remove("active");
  }

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
    
  setKeyColor(note, color, keepActive = false) {
    const keyElement = document.querySelector(`.key[data-midi-note="${note}"]`);
    if (keyElement) {
      keyElement.style.backgroundColor = color;
      if (keepActive) keyElement.dataset.color = color;
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

// -------------------------------------------------------------------------------------------------------------------------------------------------
//          GAME VIEW JAVASCRIPT
// -------------------------------------------------------------------------------------------------------------------------------------------------

// CLASS DEFINITION
export class GameView {

  // getElementById
  constructor() {
    // Overlay Info
    this.overlayPanel             = document.getElementById("overlayDiv");
    this.overlayTitle             = document.getElementById("overlayTitle");
    this.overlaySubtitle          = document.getElementById("overlaySubtitle");
    this.overlayScoreDisplay      = document.getElementById("overlayScoreDisplay");
    this.overlaySolutionPanel     = document.getElementById("overlaySolutionDiv");
    this.overlayTitleSolution     = document.getElementById("overlayTitleSolution");
    this.overlaySubtitleSolution  = document.getElementById("overlaySubtitleSolution");

    // Overlay Buttons
    this.startGameButton      = document.getElementById("startGame");
    this.nextRoundButton      = document.getElementById("nextRound");
    this.mainMenuButton       = document.getElementById("mainMenu");
    this.showSolutionButton   = document.getElementById("showSolution");
    this.hideSolutionButton   = document.getElementById("hideSolution");

    // Game Info
    this.gameModeDisplay      = document.getElementById("gameMode");
    this.difficultyDisplay    = document.getElementById("difficultyDisplay");
    this.roundDisplay         = document.getElementById("roundDisplay");
    this.timerDisplay         = document.getElementById("timerDisplay");
    this.scoreDisplay         = document.getElementById("scoreDisplay");
    this.hintDisplay          = document.getElementById("hintDisplay");

    // Game Button
    this.playSolutionButton   = document.getElementById("playSolutionButton");
    this.assistantModeButton  = document.getElementById("assistantModeButton");
    this.hintButton           = document.getElementById("hintButton");
    this.backMenuButton       = document.getElementById("backMenuButton");

    // Multiplayer
    this.rankingTable     = document.getElementById("overlayMultiplayerRanking");
    this.placementDisplay = document.getElementById("currentPlacement");
  }

  // Binding Events
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

  // Overlay
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
        this.overlaySubtitle.style.display      = "flex";
        this.overlayScoreDisplay.style.display  = "none";

        this.overlayTitle.innerHTML     = "TIME OVER";
        this.overlaySubtitle.innerHTML  = "YOU DIDN'T MAKE IT!";

        this.showSolutionButton.style.display = "block";
        this.nextRoundButton.style.display    = "block";

        if (model.isMultiplayer) {
          this.rankingTable.style.display = "flex";
        }
        else this.rankingTable.style.display = "none";
        break;
      case "goodGuess":
        model.isShowedGoodGuess = true;

        this._disableInput(model);

        this.overlayPanel.style.display         = "flex";
        this.overlayTitle.style.display         = "flex";
        this.overlayScoreDisplay.style.display  = "none";

        if (!model.isMultiplayer) this.overlaySubtitle.style.display = "flex";

        this.overlayTitle.innerHTML     = "GOOD GUESS";
        this.overlaySubtitle.innerHTML  = "YOU ARE A BOSS!";

        this.showSolutionButton.style.display = "block";
        this.nextRoundButton.style.display    = "block";

        if (model.isMultiplayer) {
          this.rankingTable.style.display = "flex";
        }
        else this.rankingTable.style.display = "none";
        break;
      case "gameOver":
        this._disableInput(model);

        this.overlayPanel.style.display     = "flex";
        this.overlayTitle.style.display     = "flex";
        this.overlaySubtitle.style.display  = "none";

        this.overlayTitle.innerHTML          = "GAME OVER";

        if (!model.isMultiplayer) {
          this.overlayScoreDisplay.innerHTML   = "TOTAL SCORE: " + model.totalScore;
          this.overlayScoreDisplay.style.display  = "flex";
        }
        else {
          this.rankingTable.style.display = "flex";
        }

        this.mainMenuButton.style.display   = "block";
        break;
      case "wait":
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

  // UI Methods
  updateScoreDisplay(model) {
    this.scoreDisplay.innerHTML = "CURRENT SCORE: " + model.totalScore;
  }

  updateTimerDisplay(model) {
    this.timerDisplay.innerHTML = "REMAINING TIME: " + model.timeLeft + "s";
  }

  updateModeDisplay(model) {
    const gameModeLegend = {
      chords_GM: "CHORDS",
      harmony_GM: "HARMONY",
    };
    this.gameModeDisplay.innerHTML = gameModeLegend[model.selectedGameMode];
  }

  updateLevelDisplay(model) {
    const difficultyLegend = {
      easyDiff: "EASY",
      mediumDiff: "MEDIUM",
      hardDiff: "HARD"
    };
    this.difficultyDisplay.innerHTML = "DIFFICULTY " + difficultyLegend[model.selectedDifficulty];
  }

  updateRoundDisplay(model) {
    this.roundDisplay.innerHTML = "ROUND " + model.activeRound;
  }

  hintDisplayText(text) {
    this.hintDisplay.textContent = text;
  }

  _disableInput(model) {
    model.isInputDisabled = true;
  }
  
  enableInput(model) {
    model.isInputDisabled = false;
  }

  updatePlacement(model) {
    this.placementDisplay.innerHTML = "PLACEMENT: " + model.placement;
  }

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