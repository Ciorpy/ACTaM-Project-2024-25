import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  set,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

import { app } from "../../../firebase.js";
const auth = getAuth(app);
const db = getDatabase(app);

const lobbyName = localStorage.getItem("lobbyName");
const lobbyPW = localStorage.getItem("lobbyPW");

let lobbyNameLabel = document.getElementById("lobbyName");
lobbyNameLabel.innerHTML = lobbyName;

let updateLobbyInterval = null;
let playersArray = null;

let updateLobby = async function () {
  const dbRef = ref(db, `lobbies/${lobbyName}`);
  const snapshot = await get(dbRef);

  if (!snapshot.exists()) {
    throw new Error("Lobby does not exist.");
  }

  // Reference to the players node in the lobby
  playersArray = ref(db, `lobbies/${lobbyName}/players`);

  // Fetch the players data to count how many players are in the lobby
  const playersSnapshot = await get(playersArray);

  let playersCount = 0;

  // If players exist, count how many keys there are in the players object
  if (playersSnapshot.exists()) {
    playersCount = Object.keys(playersSnapshot.val()).length;
  }
};

updateLobbyInterval = setInterval(updateLobby, 500);
