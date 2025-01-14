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

1. **Templates**: Contains subdirectories for game modules:
   - **DrumMachine**: Drum practice and games.
   - **KeyBoard**: Chord and harmony training.
   - **Multiplayer**: Multiplayer game and lobby setup.

2. **Sounds**: Includes audio files for:
   - **Drum Samples**
   - **Piano Samples**
   - **Background Music**
   - **Effects**

3. **Images**: Contains images and icons used in the UI.

4. **Root Files**:
   - `gameTitleScreen.html`: Entry point for the game.
   - `gt.css`: Styles for the title screen.
   - `gt.js`: Logic for handling title screen interactions.
   - `login.js`: Firebase login integration.


---

## Modules and Files

### **DrumMachine**
- **Files**:
  - `dm.js`, `dm.css`, `drumMachineInput.html`
  - Grooves and Fills directories
  - `presetsLoad_debug.js`
- **Features**:

    - **Grooves and Fills Game Modes**: Develop skills in recognizing and playing drum grooves and fills using a virtual drum machine.  

    - **Progressive Difficulty Levels**:
      - **Grooves**: Basic beats with straightforward patterns (easy); intermediate grooves incorporating syncopated rhythms (medium); advanced grooves with intricate timing and sticking (hard).
      - **Fills**: Simple fills that smoothly transition between grooves (easy); more elaborate fills, introducing syncopation and poly-rhythms (medium); fast-paced, complex fills requiring precision (hard).

    - **Interactive Drum Machine Feedback**: Each row of the drum machine corresponds to a specific part of the drum set, with a legend explaining their short names. Pressing an icon triggers the corresponding sampled sound, while selected buttons are visually highlighted with color for clear feedback.


    - **Game Status Display**: The interface provides continuous updates on critical game metrics, such as: current round number, total score, current difficulty level and remaining time to complete the current round.

    - **BPM Selector**: Slide from which the bpm can be changed. 

    - **Checking System**: When the solution is being reproduced the right selected buttons are highlighted as correct and are not interactable anymore.

    - **Reset Button**: Reset the drum machine display.
      
    - **Scoring System**: Each round starts with a base score of 100 points. Points are deducted based on the time elapsed during the round.

    - **Practice Mode**: In this mode players can play freely with the drum machine and try to create new drum grooves or fills.

### **KeyBoard**

- **Files**:
  - `controller.js`, `model.js`, `view.js`
  - `keyBoardInput.html`, `kb.js`, `kb.css`
  - `chord&harmony.js`

- **Features**:

    - **Chord and Harmony Game Modes**: Develop skills in recognizing and playing musical chords and harmonic cadences using a virtual piano interface.  

    - **Practice Mode**: In this mode, players can play any chord on the keyboard, and the system will recognize and display the name and type of the chord being played, providing immediate feedback and enhancing learning.    

    - **Progressive Difficulty Levels**:
      - **Chords**: Major and minor chords (easy), augmented and diminished (medium), seventh chords (hard).  
      - **Harmony**: Cadences progress through three difficulty levels, increasing in harmonic complexity.

    - **Interactive Keyboard Feedback**: Each pressed key produces its corresponding sampled sound from a Yamaha C3 piano, while visually appearing to depress with realistic shadows and animations. Players can play chords using the computer keyboard or individual notes by clicking on the keys with the mouse.  

    - **Game Status Display**: The interface provides continuous updates on critical game metrics, such as: current round number, total score, current difficulty level and remaining time to complete the current round.

    - **Assistant Mode**: Offers real-time visual guidance by highlighting notes: correct notes turn green, incorrect notes turn red.  

    - **Hint System**: Provides optional guidance tailored to the selected game mode:
      - **Chords**: Reveals the name (note root, chord type, inversion) of the chord being played. 
      - **Harmony**: Displays the chords of the cadence to resolve.  

    - **Scoring System**: Each round starts with a base score of 100 points. Points are deducted based on: the time elapsed during the round, the number of hints used to reach the solution, whether the "Assistant Mode" is enabled.

    - **Show Solution**: At the end of each round, players have the option to hear the chord that was guessed (or missed), see which keys needed to be pressed to solve it, and view the name of the chord.


### **Multiplayer**

- **Files**:
  - `lobby.js`, `lobby.html`, `lobby.css`

- **Features**:  

  - **Create and Join Lobbies**: Players can set a nickname for multiplayer mode. To create or join a lobby, users need to enter the lobby name and a password, ensuring a secure and personalized experience.  

  - **Real-Time Multiplayer Gameplay with Score Tracking**: During the game, players can see their current position in real-time. At the end of each round, a leaderboard is displayed, showing the overall rankings and scores of all participants.  

### **Customization (Settings)**

- **Configure Number of Rounds**: Players can select the number of rounds to play, ranging from 1 to 5.  
- **Music Volume**: Adjust the volume of the background music, which plays in the main menu but is not active during mini-games.  
- **Effect Volume**: Control the volume of sound effects triggered by in-game events, such as correct answers, time over, or game over.  
- **In-Game Volume**: Customize the volume of sounds produced by the keyboard and drum machine.  

---

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript
- **Audio**: Tone.js
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

- **MIDI Protocol Support**: Enable the use of physical instruments as controllers for playing the mini-games.  
- **New Instrument Interfaces**: Introduce additional virtual instruments tailored for games focused on harmony and chord recognition.  
- **Musical Notation Integration**: Add a staff view to visually represent chords and drum grooves, enhancing the educational experience.  
- **Expanded Multiplayer Features**: Introduce a "Jam Mode" where players can use the implemented virtual instruments to play together in real-time.  
- **User-Created Content**: Allow players to create and integrate custom grooves and fills into the gameplay.  