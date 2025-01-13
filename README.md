# MusicMind

## Overview
MusicMind is a web-based application that transforms music education into an entertaining experience, providing games and challenges that help players improve their skills in a fun and social way.

The game offers features such as:
- **Keyboard**: Recognize chords and cadences.
- **Drum Machine**: Recognize grooves and fills.
- **Multiplayer Mode**: Compete with other players in real-time.
- **Practice Mode**: Guided practice with visual and audio feedback.

---

## Project Structure

### Main Directories:

1. **Templates**
   - Contains subdirectories for game modules:
     - **DrumMachine**: Drum practice and games.
     - **KeyBoard**: Chord and harmony training.
     - **Multiplayer**: Multiplayer game and lobby setup.

2. **Sounds**
   - Includes audio files for:
     - **Drum Samples**
     - **Piano Samples**
     - **Background Music**
     - **Effects**

3. **Images**
   - Contains images and icons used in the UI.

4. **Root Files**
   - `gameTitleScreen.html`: Entry point for the game.
   - `gt.css`: Styles for the title screen.
   - `gt.js`: Logic for handling title screen interactions.
   - `login.js`: Firebase login integration.

---

## Modules and Files

### **DrumMachine**
- **Files**:
  - `dm.js`, `dm.css`, `drumMachineInput.html`
  - Grooves and Fills directories (e.g., `easyFills.js`, `mediumGrooves.js`)
  - `presetsLoad_debug.js`
- **Features**:
  - Practice drum grooves and fills at various difficulty levels.

### **KeyBoard**

- **Files**:
  - `controller.js`, `model.js`, `view.js`
  - `keyBoardInput.html`, `kb.js`, `kb.css`
  - `chord&harmony.js`

- **Features**:

    - **Chord and Cadence Game Modes**: Develop skills in recognizing and playing musical chords and harmonic cadences using a virtual piano interface.  

    - **Progressive Difficulty Levels**:
      - **Chords Mode**: Major and minor chords (easy), augmented and diminished (medium), seventh chords (hard).  
      - **Harmony Mode**: Cadences progress through three difficulty levels, increasing in harmonic complexity.

    - **Interactive Keyboard Feedback**:
      - **Audio Feedback**: Each pressed key produces its corresponding sampled sound from a Yamaha C3 piano.
      - **Visual Feedback**: Keys appear to depress when played, complete with shadows and animations.

    - **Game Status Display**:  
      The interface provides continuous updates on critical game metrics, such as: current round number, total score, current difficulty level and remaining time to complete the current round.

    - **Assistant Mode**:  
      Offers real-time visual guidance by highlighting notes: correct notes turn green, incorrect notes turn red.  

    - **Hint System**:  
      Provides optional guidance tailored to the selected game mode:
      - **Chords**: Reveals the name (note root, chord type, inversion) of the chord being played. 
      - **Harmony**: Displays the chords of the cadence to resolve.  

    - **Scoring System**:  
      Each round starts with a base score of 100 points. Points are deducted based on: the time elapsed during the round, the number of hints used to reach the solution, whether the "Assistant Mode" is enabled.

### **Multiplayer**
- **Files**:
  - `lobby.js`, `lobby.html`, `lobby.css`
- **Features**:
  - Create and join lobbies.
  - Real-time multiplayer gameplay with score tracking.

---

## Key Features

1. **Interactive Piano Keyboard**
   - Visual and audio feedback.
   - Practice chords and cadences.

2. **Drum Machine**
   - Learn and play drum grooves and fills.
   - Supports multiple difficulty levels.

3. **Multiplayer Mode**
   - Host or join lobbies to compete in real-time.
   - Score tracking and leaderboard.

4. **Customization**
   - Adjust difficulty levels.
   - Configure rounds and practice modes.

---

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript
- **Audio**: Web Audio API, Tone.js
- **Backend**: Firebase (Authentication, Realtime Database)

---

## Credits
- Marco Porcella marco.porcella@mail.polimi.it
- Filippo Longhi filippo1.longhi@mail.polimi.it
- Andrea Crisafulli andrea.crisafulli@mail.polimi.it
- Giacomo De Toni giacomo1.detoni@mail.polimi.it

This project was developed as part of the Advanced Coding Tools and Methodologies course at Politecnico di Milano (2024/2025).

---

## Future Enhancements
- Add new instruments and modules.
- Expand multiplayer functionalities.