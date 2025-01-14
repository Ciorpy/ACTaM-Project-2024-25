import {
  getAuth,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// IMport functions to allow DB interaction
import {
  getDatabase,
  ref,
  get,
  set,
  remove,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

import { app } from "../../../firebase.js";

const auth = getAuth(app); // If the user is not yet logged in, does it again (should be useless)
const db = getDatabase(app); // DB reference

// Reference to the various game pages
let minigamePages = {
  chords_GM: "../KeyBoard/keyBoardInput.html",
  harmony_GM: "../KeyBoard/keyBoardInput.html",
  grooves_GM: "../DrumMachine/drumMachineInput.html",
  fills_GM: "../DrumMachine/drumMachineInput.html",
};

// Retrieves data from local storage
const lobbyName = localStorage.getItem("lobbyName");
const lobbyPW = localStorage.getItem("lobbyPW");

// Gets reference of the UI element and shows the lobby name
let lobbyNameLabel = document.getElementById("lobbyName");
lobbyNameLabel.innerHTML = lobbyName;

let startGameButton = document.getElementById("startGame");
let hostMenu = document.getElementById("hostMenu");

// If the user is not a host, the start game button and the host menu are hidden
if (localStorage.getItem("isHost") == "false") {
  startGameButton.style.display = "none";
  hostMenu.style.display = "none";
}

let updateLobbyInterval = null;
let playersArray = null;

const playersDivs = document.getElementsByClassName("playerTag");
let flagClosed = false;

// Async function that updates the lobby UI
let updateLobby = async function () {
  const dbRef = ref(db, `lobbies/${lobbyName}`);
  const snapshot = await get(dbRef);

  // If lobby was closed all other players are sent back to main menu
  if (!snapshot.exists()) {
    flagClosed = true;
    alert("Lobby was closed by host. Click ok to return to Main Menu");
    window.location.href = "../../gameTitleScreen.html";
  }
  
  // reference to the players data in the DB
  playersArray = ref(db, `lobbies/${lobbyName}/players`);

  // Gets the data of lal players that joined
  const playersSnapshot = await get(playersArray);

  let playersCount = 0;
  let players = null;
  let playerKeys;

  let matchStructRef = ref(db, `lobbies/${lobbyName}/matchStruct`);
  const matchStructSnapshot = await get(matchStructRef);

  // If the match struc has been correctly loaded, the users load it in their clients
  if (matchStructSnapshot.exists() && !flagClosed) {
    localStorage.setItem("Difficulty", matchStructSnapshot.val().difficulty); // DIfficulty selected by host
    localStorage.setItem("Gamemode", matchStructSnapshot.val().gamemode); // Gamemode selected by host
    localStorage.setItem(
      "numberRoundsMP",
      matchStructSnapshot.val().numberRounds
    ); // Number of rounds to play
    localStorage.setItem("Practice", false); // NOT PRACTICE (SAFETY)

    // Loads correct minigame
    window.location.href = minigamePages[matchStructSnapshot.val().gamemode];
  }

  if (playersSnapshot.exists() && !flagClosed) {
    players = playersSnapshot.val();
    let playerEntries = Object.entries(players); // Convert to [key, value] pairs
    playersCount = playerEntries.length;

    // Orders players based on join time
    playerEntries.sort((a, b) => a[1].joinedAt - b[1].joinedAt);

    playerKeys = playerEntries.map((entry) => entry[0]); // Extract sorted keys
    playersArray = playerEntries.map((entry) => entry[1]); // Extract sorted values

    // If there are 2 or more players in the lobby, the game can be started
    if (playersCount > 1) {
      startGameButton.classList.toggle("disabled", false);
      startGameButton.innerHTML = "START GAME";
    } else {
      startGameButton.classList.toggle("disabled", true);
      startGameButton.innerHTML = "Waiting for other players";
    }

    // Updates UI to show the names of the players that joined the lobby
    Array.from(playersDivs).forEach((item, index) => {
      if (playersArray[index]) {
        item.classList.toggle("emptySlot", false);
        item.innerHTML = playersArray[index].playerName;
      } else {
        item.classList.toggle("emptySlot", true);
        item.innerHTML = "";
      }
    });
  }
};

// Sets update lobby interval that calls function every 100 ms
updateLobbyInterval = setInterval(updateLobby, 100);

// Adds event listener to the start game button
startGameButton.addEventListener("click", async () => {

  //creates match structure
  
  let matchDict = {
    difficulty: document.getElementById("difficulty").value,
    gamemode: document.getElementById("gamemode").value,
    numberRounds: document.getElementById("numberRounds").value,
  };

  await set(ref(db, `lobbies/${lobbyName}/matchStruct`), matchDict); // Loads match structure in the DB
  await set(ref(db, `lobbies/${lobbyName}/status`), "start"); // Sets lobby status to "start"
});

let backToMainMenuButton = document.getElementById("exitMP");


backToMainMenuButton.addEventListener("click", async () => {
  // Reference to the USER in the DB
  const playerRef = ref(
    db,
    `lobbies/${lobbyName}/players/${localStorage.getItem("userID")}`
  );

  await remove(playerRef);

  // IF user is host and goes back to main menu, the lobby is closed
  if (localStorage.getItem("isHost") == "true")
    await remove(ref(db, `lobbies/${lobbyName}`));

  // Loads game title screen
  window.location.href = "../../gameTitleScreen.html";
});

// AUDIO LOBBY
const audio = document.getElementById("background-music");
let defaultVolume = 0.5;
let loadedVolume = parseFloat(localStorage.getItem("mainVolume"));
let vol = !isNaN(loadedVolume) ? loadedVolume : defaultVolume;
vol = Math.min(Math.max(vol, 0), 1); // Clamp tra 0 e 1
audio.volume = vol;
