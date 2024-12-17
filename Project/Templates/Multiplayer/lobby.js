import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  set,
  remove,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

import { app } from "../../../firebase.js";

import { generateRandomChord } from "../KeyBoard/chord&harmony.js";

const auth = getAuth(app);
const db = getDatabase(app);

let minigamePages = {
  chords_GM: "../KeyBoard/keyBoardInput.html",
  harmony_GM: "../KeyBoard/keyBoardInput.html",
  grooves_GM: "../DrumMachine/drumMachineInput.html",
  fills_GM: "../DrumMachine/drumMachineInput.html",
};

const lobbyName = localStorage.getItem("lobbyName");
const lobbyPW = localStorage.getItem("lobbyPW");

let lobbyNameLabel = document.getElementById("lobbyName");
lobbyNameLabel.innerHTML = lobbyName;

let startGameButton = document.getElementById("startGame");
let hostMenu = document.getElementById("hostMenu");

if (localStorage.getItem("isHost") == "false") {
  startGameButton.style.display = "none";
  hostMenu.style.display = "none";
}

let updateLobbyInterval = null;
let playersArray = null;

const playersDivs = document.getElementsByClassName("playerTag");
let flagClosed = false;

let updateLobby = async function () {
  const dbRef = ref(db, `lobbies/${lobbyName}`);
  const snapshot = await get(dbRef);

  if (!snapshot.exists()) {
    flagClosed = true;
    alert("Lobby was closed by host. Click ok to return to Main Menu");
    window.location.href = "../../gameTitleScreen.html";
  }

  playersArray = ref(db, `lobbies/${lobbyName}/players`);

  const playersSnapshot = await get(playersArray);

  let playersCount = 0;
  let players = null;
  let playerKeys;

  let matchStructRef = ref(db, `lobbies/${lobbyName}/matchStruct`);
  const matchStructSnapshot = await get(matchStructRef);

  if (matchStructSnapshot.exists() && !flagClosed) {
    localStorage.setItem("Difficulty", matchStructSnapshot.val().difficulty);
    localStorage.setItem("Gamemode", matchStructSnapshot.val().gamemode);
    localStorage.setItem(
      "numberRounds",
      matchStructSnapshot.val().numberRounds
    );
    localStorage.setItem("Practice", false);

    window.location.href = minigamePages[matchStructSnapshot.val().gamemode];
  }

  if (playersSnapshot.exists() && !flagClosed) {
    players = playersSnapshot.val();
    let playerEntries = Object.entries(players); // Convert to [key, value] pairs
    playersCount = playerEntries.length;

    playerEntries.sort((a, b) => a[1].joinedAt - b[1].joinedAt);

    playerKeys = playerEntries.map((entry) => entry[0]); // Extract sorted keys
    playersArray = playerEntries.map((entry) => entry[1]); // Extract sorted values

    if (playersCount > 1) {
      startGameButton.classList.toggle("disabled", false);
      startGameButton.innerHTML = "Start game";
    } else {
      startGameButton.classList.toggle("disabled", true);
      startGameButton.innerHTML = "Waiting for other players";
    }

    Array.from(playersDivs).forEach((item, index) => {
      if (playersArray[index]) {
        item.classList.toggle("emptySlot", false);
        item.innerHTML = playersArray[index].playerName;
      } else {
        item.classList.toggle("emptySlot", true);
        item.innerHTML = "";
      }
    });

    let currentPlayerRef = ref(
      db,
      `lobbies/${lobbyName}/players/${localStorage.getItem("userID")}/lastPing`
    );

    await set(currentPlayerRef, Date.now());

    if (localStorage.getItem("isHost") == "true") {
      for (let i = 1; i < playersCount; i++) {
        let iPlayerRef = ref(
          db,
          `lobbies/${lobbyName}/players/${playerKeys[i]}`
        );
        if (Date.now() - playersArray[i].lastPing > 10000) {
          await remove(iPlayerRef);
        }
      }
    } else {
      if (Date.now() - playersArray[0].lastPing > 10000) {
        await remove(dbRef);
      }
    }
  }
};

updateLobbyInterval = setInterval(updateLobby, 100);

startGameButton.addEventListener("click", async () => {
  let matchDict = {
    difficulty: document.getElementById("difficulty").value,
    gamemode: document.getElementById("gamemode").value,
    numberRounds: document.getElementById("numberRounds").value,
  };

  await set(ref(db, `lobbies/${lobbyName}/matchStruct`), matchDict);
  await set(ref(db, `lobbies/${lobbyName}/status`), "start");
});

let backToMainMenuButton = document.getElementById("exitMP");

backToMainMenuButton.addEventListener("click", async () => {
  const playerRef = ref(
    db,
    `lobbies/${lobbyName}/players/${localStorage.getItem("userID")}`
  );

  await remove(playerRef);

  if (localStorage.getItem("isHost") == "true")
    await remove(ref(db, `lobbies/${lobbyName}`));

  window.location.href = "../../gameTitleScreen.html";
});

// AUDIO LOBBY
const audio = document.getElementById("background-music");
let defaultVolume = 0.5;
let loadedVolume = parseFloat(localStorage.getItem("mainVolume"));
let vol = !isNaN(loadedVolume) ? loadedVolume : defaultVolume;
vol = Math.min(Math.max(vol, 0), 1); // Clamp tra 0 e 1
audio.volume = vol;
