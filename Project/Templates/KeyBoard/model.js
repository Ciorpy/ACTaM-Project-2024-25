// -------------------------------------------------------------------------------------------------------------------------------------------------
//          MODEL JAVASCRIPT
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
        if (!this.currentPressedNotes.includes(note)) {
            this.currentPressedNotes.push(note);
        }
    }

    removePressedNote(note) {
        this.currentPressedNotes = this.currentPressedNotes.filter(n => n !== note);
    }

}




export class GameModel {
    constructor() {


  

      // Impostazioni e costanti di default
      this.firstNote  = 48;
      this.keysNumber = 25;
      this.lastNote   = this.firstNote + this.keysNumber;
      this.defaultRounds         = 3;
      this.defaultEffectsVolume  = 0.5;
      this.deductionInterval     = 30;
      this.hintInterval          = 30;
      this.assistantInterval     = 60;
      this.pointsTime            = 25;
      this.pointsHint            = [4, 8, 12];
      this.percAssistant         = 30;
  
      // === VARIABILI DI "GIOCO" ===
  
      // Principali
      this.totalScore      = 0;
      this.currentScore    = 0;
      this.timeLeft        = 120;
      this.activeRound     = 0;
      this.maxRounds       = this.defaultRounds;  // Caricabile dall'esterno
      this.hintTimer       = 0;
      this.playingCadenceTimer = 0;
      this.effectsvol      = this.defaultEffectsVolume;
  
      // Flag e stati particolari
      this.isAssistantModeOn     = false;
      this.isAvailableAssistant  = false;
      this.assistantPoint        = false;
      this.isInputDisabled       = false;
      this.isAvailableHints      = [false, false, false]; 
      this.hintsPoint            = [false, false, false];
      this.isShowedTimeOver      = false;
      this.isShowedGoodGuess     = false;
  
      // Modalità (Practice / Multiplayer / Host / Difficulty / Gamemode)
      this.isPracticeMode     = false;
      this.isMultiplayer      = false;
      this.isHost             = false;
      this.selectedDifficulty = "easyDiff";    // es. "easyDiff" / "mediumDiff" / "hardDiff"
      this.selectedGameMode   = "chords_GM";   // es. "chords_GM" / "harmony_GM"
  
      // Dati di "chords" o "cadences"
      this.previousPressedNotes = [];
      this.generatedChordData   = {};
      this.generatedCadenceData = {};
      this.recognizedChordData  = {};
  
      // Round multipli in Multiplayer
      this.generatedChordsData   = [];
      this.generatedCadencesData = [];
  
      // === Sezione per Multiplayer (ID utente, Lobby, ecc.)
      this.userID     = null;
      this.lobbyName  = null;
      this.isHost     = false;
    }
  
    // ============================
    // ======= GET / SET =========
    // ============================
  
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
  
    // ...eventuali altri getter/setter se servono per le altre variabili...
  
    // ============================
    // ===== METODI DI SUPPORT ====
    // ============================
  
    /**
     * resetRoundVariables
     * Richiamalo a inizio round, per riportare i valori tipici a default
     */
    resetRoundVariables() {
      this.currentScore = 100;
      this.playingCadenceTimer = 0;
      this.isAvailableAssistant = false;
      this.assistantPoint = false;
      this.isAssistantModeOn = false;
      this.hintsPoint = [false, false, false];
      this.isAvailableHints = [false, false, false];
      this.isShowedTimeOver = false;
      this.isShowedGoodGuess = false;
      this.previousPressedNotes = [];
      this.generatedChordData = {};
      this.generatedCadenceData = {};
    }
  
    resetMultiplayerData() {
      this.generatedChordsData   = [];
      this.generatedCadencesData = [];
    }
  
    /**
     * applyPenalties
     * Logica di riduzione punteggio a seconda di assistente/hint 
     */
    applyPenalties() {
      if (this.assistantPoint) {
        this.currentScore *= (1 - this.percAssistant / 100);
      }
      if (this.hintsPoint[2]) this.currentScore -= this.pointsHint[2];
      if (this.hintsPoint[1]) this.currentScore -= this.pointsHint[1];
      if (this.hintsPoint[0]) this.currentScore -= this.pointsHint[0];
  
      this.currentScore = Math.max(0, Math.floor(this.currentScore));
    }
  
    /**
     * checkAssistantAvailability
     * Ritorna true se è tempo di abilitare l'assistente
     */
    checkAssistantAvailability() {
      return (!this.isAvailableAssistant && this.timeLeft <= this.assistantInterval);
    }
  
    /**
     * decrementTimeLeft 
     * Riduce di 1 il timer e ritorna il nuovo valore
     */
    decrementTimeLeft() {
      this.timeLeft--;
      return this.timeLeft;
    }
    
    /**
     * incrementTotalScoreAfterPenalties
     * Aggiunge currentScore a totalScore, dopo aver applicato le penalità
     */
    incrementTotalScoreAfterPenalties() {
      this.totalScore += this.currentScore;
    }
  }
  


