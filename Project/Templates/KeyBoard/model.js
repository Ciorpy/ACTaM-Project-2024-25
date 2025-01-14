// -------------------------------------------------------------------------------------------------------------------------------------------------
//          PIANO MODEL JAVASCRIPT
// -------------------------------------------------------------------------------------------------------------------------------------------------

// CLASS DEFINITION --------------------------------------------------------------------------------------------------------------------------------
export class PianoModel {

  constructor() {
    this.currentPressedNotes = [];
  }

  getPressedNotes() {
    return [...this.currentPressedNotes]; 
  }

  setPressedNotes(notes) {
    this.currentPressedNotes = notes;
  }

  addPressedNote(note) {
    if (!this.currentPressedNotes.includes(note)) this.currentPressedNotes.push(note);
  }

  removePressedNote(note) {
    this.currentPressedNotes = this.currentPressedNotes.filter(n => n !== note);
  }

}

// -------------------------------------------------------------------------------------------------------------------------------------------------
//          GAME MODEL JAVASCRIPT
// -------------------------------------------------------------------------------------------------------------------------------------------------

// CLASS DEFINITION --------------------------------------------------------------------------------------------------------------------------------
export class GameModel {

  // Variables
  constructor() {
    this.firstNote  = 48;
    this.keysNumber = 25;
    this.lastNote   = this.firstNote + this.keysNumber;

    this.defaultRounds        = 3;
    this.defaultEffectsVolume = 0.5;

    this.deductionInterval  = 30;
    this.hintInterval       = 30;
    this.assistantInterval  = 60;

    this.pointsTime     = 25;
    this.pointsHint     = [4, 8, 12];
    this.percAssistant  = 30;
  
      
    this.totalScore   = 0;
    this.currentScore = 0;

    this.timeLeft             = 120;
    this.hintTimer            = 0;
    this.playingCadenceTimer  = 0;

    this.activeRound = 0;
    this.maxRounds   = this.defaultRounds;
    
    this.effectsvol = this.defaultEffectsVolume;
  
    this.isAssistantModeOn    = false;
    this.isAvailableAssistant = false;
    this.assistantPoint       = false;
    this.isInputDisabled      = false;
    this.isAvailableHints     = [false, false, false]; 
    this.hintsPoint           = [false, false, false];
    this.isShowedTimeOver     = false;
    this.isShowedGoodGuess    = false;
    this.isPracticeMode       = false;
    this.isMultiplayer        = false;
    this.isHost               = false;

    this.selectedDifficulty = "easyDiff";
    this.selectedGameMode   = "chords_GM";
  
    this.previousPressedNotes = [];
    this.generatedChordData   = {};
    this.generatedCadenceData = {};
    this.recognizedChordData  = {};
  
    this.generatedChordsData   = [];
    this.generatedCadencesData = [];
  
    this.userID     = null;
    this.lobbyName  = null;
    this.isHost     = false;
    this.ranking;
    this.placement;
  }

  // Get & Set
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
  
  // Utility
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
  
  resetMultiplayerData() {
    this.generatedChordsData   = [];
    this.generatedCadencesData = [];
  }
  
  applyPenalties() {
    if (this.assistantPoint) this.currentScore *= (1 - this.percAssistant / 100);

    if (this.hintsPoint[2]) this.currentScore -= this.pointsHint[2];
    if (this.hintsPoint[1]) this.currentScore -= this.pointsHint[1];
    if (this.hintsPoint[0]) this.currentScore -= this.pointsHint[0];

    this.currentScore = Math.max(0, Math.floor(this.currentScore));
  }
  
  checkAssistantAvailability() {
    return (!this.isAvailableAssistant && this.timeLeft <= this.assistantInterval);
  }
  
  decrementTimeLeft() {
    return this.timeLeft--;
  }
  
  incrementTotalScoreAfterPenalties() {
    this.totalScore += this.currentScore;
  }

}

// -------------------------------------------------------------------------------------------------------------------------------------------------