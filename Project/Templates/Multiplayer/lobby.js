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

const playersDivs = document.getElementsByClassName("playerTag");

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
  let players = null;

  // If players exist, count how many keys there are in the players object
  if (playersSnapshot.exists()) {
    players = playersSnapshot.val(); // This is the players object
    playersArray = Object.values(players); // Convert the object to an array
    playersCount = playersArray.length; // Count how many players are in the lobby
  }

  // Sort players by joinTime (ascending order)
  playersArray.sort((a, b) => a.joinedAt - b.joinedAt); // Sorting by joinTime

  Array.from(playersDivs).forEach((item, index) => {
    if (playersArray[index]) {
      item.classList.toggle("emptySlot", false);
      item.innerHTML = playersArray[index].playerName;
    } else {
      item.classList.toggle("emptySlot", true);
      item.innerHTML = "";
    }
  });

  console.log(playersArray);
  console.log(playersCount);
};

updateLobbyInterval = setInterval(updateLobby, 100);
