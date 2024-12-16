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

import {generateRandomChord} from "../KeyBoard/chord&harmony.js"

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

let startGameButton = document.getElementById("startGame")
let updateLobbyInterval = null;
let playersArray = null;

const playersDivs = document.getElementsByClassName("playerTag");

let updateLobby = async function () {
  const dbRef = ref(db, `lobbies/${lobbyName}`);
  const snapshot = await get(dbRef);

  if (!snapshot.exists()) {
    alert("Lobby was closed by host. Click ok to return to Main Menu")
    window.location.href = "../../gameTitleScreen.html";
  }

  // Reference to the players node in the lobby
  playersArray = ref(db, `lobbies/${lobbyName}/players`);

  // Fetch the players data to count how many players are in the lobby
  const playersSnapshot = await get(playersArray);

  let playersCount = 0;
  let players = null;

  let matchStructRef = ref(db, `lobbies/${lobbyName}/matchStruct`)
  const matchStructSnapshot = await get(matchStructRef)

  if(matchStructSnapshot.exists()){
   localStorage.setItem("difficulty", matchStructSnapshot.val().difficulty)
   localStorage.setItem("gamemode", matchStructSnapshot.val().gamemode)
   localStorage.setItem("Practice", false)

   window.location.href = minigamePages[matchStructSnapshot.val().gamemode]
  }

  console.log(matchStructSnapshot)

  if (playersSnapshot.exists()) {
    players = playersSnapshot.val();
    playersArray = Object.values(players);
    playersCount = playersArray.length;

    if(playersCount > 1)
      startGameButton.classList.toggle("disabled", false)
    else
      startGameButton.classList.toggle("disabled", true)

    playersArray.sort((a, b) => a.joinedAt - b.joinedAt);

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

updateLobbyInterval = setInterval(updateLobby, 100);

startGameButton.addEventListener("click", async () => {
  let matchDict = {
    difficulty: document.getElementById("difficulty").value,
    gamemode: document.getElementById("gamemode").value
  }
  
  await set(ref(db, `lobbies/${lobbyName}/matchStruct`), matchDict)
  await set(ref(db, `lobbies/${lobbyName}/status`), "start")
})



let backToMainMenuButton = document.getElementById("exitMP")

backToMainMenuButton.addEventListener("click", async () => {
  const playerRef = ref(db, `lobbies/${lobbyName}/players/${localStorage.getItem("userID")}`);

  await remove(playerRef)

  if(localStorage.getItem("isHost") == "true")
    await remove (ref(db, `lobbies/${lobbyName}`))

 window.location.href = "../../gameTitleScreen.html";
})
