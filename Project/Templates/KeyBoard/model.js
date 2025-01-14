// -------------------------------------------------------------------------------------------------------------------------------------------------
//          PIANO MODEL JAVASCRIPT
// -------------------------------------------------------------------------------------------------------------------------------------------------

// CLASS DEFINITION --------------------------------------------------------------------------------------------------------------------------------

// PianoModel class: Represents the state of the virtual piano.
// Manages the notes that are currently pressed and provides methods to access and modify them.
export class PianoModel {

  // Constructor: Initializes the model with an empty array for pressed notes.
  constructor() {
    this.currentPressedNotes = [];
  }

  // Retrieves the list of currently pressed notes.
  // Returns a copy of the array to ensure the internal state is not directly modified.
  getPressedNotes() {
    return [...this.currentPressedNotes]; 
  }

  // Retrieves the list of currently pressed notes.
  // Returns a copy of the array to ensure the internal state is not directly modified.
  setPressedNotes(notes) {
    this.currentPressedNotes = notes;
  }

  // Adds a note to the list of pressed notes if it is not already present.
  // Ensures no duplicate notes are added.
  addPressedNote(note) {
    if (!this.currentPressedNotes.includes(note)) this.currentPressedNotes.push(note);
  }

  // Adds a note to the list of pressed notes if it is not already present.
  // Ensures no duplicate notes are added.
  removePressedNote(note) {
    this.currentPressedNotes = this.currentPressedNotes.filter(n => n !== note);
  }

}

// -------------------------------------------------------------------------------------------------------------------------------------------------
//          GAME MODEL JAVASCRIPT
// -------------------------------------------------------------------------------------------------------------------------------------------------

// CLASS DEFINITION --------------------------------------------------------------------------------------------------------------------------------

// GameModel class: Represents the state and configuration of the game.
// Manages gameplay variables, player statistics, and state for single-player and multiplayer modes.
export class GameModel {

  // Constructor: Initializes all game-related variables, including defaults for gameplay configuration.
  constructor() {
    // Piano-related configuration
    this.firstNote  = 48;
    this.keysNumber = 25;
    this.lastNote   = this.firstNote + this.keysNumber;

    // Default game setting
    this.defaultRounds        = 3;
    this.defaultEffectsVolume = 0.5;

    // Timers and intervals for various game mechanics
    this.deductionInterval  = 30;
    this.hintInterval       = 30;
    this.assistantInterval  = 60;

    // Scoring parameters
    this.pointsTime     = 25;
    this.pointsHint     = [4, 8, 12];
    this.percAssistant  = 30;
  
    // Score tracking  
    this.totalScore   = 0;
    this.currentScore = 0;

    // Timer variables
    this.timeLeft             = 120;
    this.hintTimer            = 0;
    this.playingCadenceTimer  = 0;

    // Game state variables
    this.activeRound = 0;
    this.maxRounds   = this.defaultRounds;
    this.effectsvol = this.defaultEffectsVolume;
  
    // Mode toggles and tracking
    this.isAssistantModeOn    = false;
    this.isAvailableAssistant = false;
    this.assistantPoint       = false;
    this.isInputDisabled      = false;
    this.isAvailableHints     = [false, false, false]; 
    this.hintsPoint           = [false, false, false];
    this.isShowedTimeOver     = false;
    this.isShowedGoodGuess    = false;
    this.isShowedWait         = false;
    this.isPracticeMode       = false;
    this.isMultiplayer        = false;
    this.isHost               = false;

    // Selected game options
    this.selectedDifficulty = "easyDiff";
    this.selectedGameMode   = "chords_GM";
  
    // Gameplay data
    this.previousPressedNotes = [];
    this.generatedChordData   = {};
    this.generatedCadenceData = {};
    this.recognizedChordData  = {};
  
    // Multiplayer data
    this.generatedChordsData   = [];
    this.generatedCadencesData = [];
    this.userID     = null;
    this.lobbyName  = null;
    this.isHost     = false;
    this.ranking;
    this.placement;
  }

  // GETTER & SETTER

  getTotalScore()        { return this.totalScore; }
  setTotalScore(value)   { this.totalScore = value; }
  
  getCurrentScore()      { return this.currentScore; }
  setCurrentScore(value) { this.currentScore = value; }
  
  getTimeLeft()          { return this.timeLeft; }
  setTimeLeft(value)     { this.timeLeft = value; }
  
  getActiveRound()       { return this.activeRound; }
  setActiveRound(value)  { this.activeRound = value; }
  incrementRound()       { this.activeRound++; }
  
  getMaxRounds()         { return this.maxRounds; }
  setMaxRounds(value)    { this.maxRounds = value; }
  
  getHintTimer()         { return this.hintTimer; }
  setHintTimer(value)    { this.hintTimer = value; }
  incrementHintTimer()   { this.hintTimer++; }
  
  isInputDisabledFunc()  { return this.isInputDisabled; }
  setInputDisabled(flag) { this.isInputDisabled = flag; }

  getRanking()          { return this.ranking; }
  setRanking(value)     { this.ranking = value; }

  getPlacement()          { return this.placement; }
  setPlacement(value)     { this.placement = value; }

  // UTILITIES
  
  // Resets variables specific to each round.
  // Prepares the game state for the start of a new round.
   resetRoundVariables() {
    this.currentScore = 100;

    this.playingCadenceTimer = 0;

    this.isAvailableAssistant = false;
    this.assistantPoint       = false;
    this.isAssistantModeOn    = false;
    this.hintsPoint           = [false, false, false];
    this.isAvailableHints     = [false, false, false];
    this.isShowedTimeOver     = false;
    this.isShowedGoodGuess    = false;

    this.previousPressedNotes = [];
    this.generatedChordData   = {};
    this.generatedCadenceData = {};
  }
  
   // Applies penalties to the current score for hints and assistant mode usage.
  applyPenalties() {
    if (this.assistantPoint) this.currentScore *= (1 - this.percAssistant / 100);

    if (this.hintsPoint[2]) this.currentScore -= this.pointsHint[2];
    if (this.hintsPoint[1]) this.currentScore -= this.pointsHint[1];
    if (this.hintsPoint[0]) this.currentScore -= this.pointsHint[0];

    this.currentScore = Math.max(0, Math.floor(this.currentScore));
  }
  
  // Checks if assistant mode should become available based on the remaining time.
  checkAssistantAvailability() {
    return (!this.isAvailableAssistant && this.timeLeft <= this.assistantInterval);
  }
  
  // Decrements the remaining time for the current round.
  decrementTimeLeft() {
    return this.timeLeft--;
  }
  
  // Increments the total score by adding the score from the current round.
  incrementTotalScore() {
    this.totalScore += this.currentScore;
  }

}

// -------------------------------------------------------------------------------------------------------------------------------------------------