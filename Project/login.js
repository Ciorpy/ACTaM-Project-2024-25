import {
  getAuth,
  signInAnonymously,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

import { app } from "../firebase.js";
const auth = getAuth(app);

let usernameField = document.getElementById("username");
let hostButton = document.getElementById("host");
let partecipateButton = document.getElementById("partecipate");

hostButton.style.pointerEvents = "none";
partecipateButton.style.pointerEvents = "none";

let userCredential = await signInAnonymously(auth);
let user = userCredential.user;
localStorage.setItem("userID", user.uid);

let maxPlayers = 6;

const signInAnonymouslyUser = async () => {
  try {
    userCredential = await signInAnonymously(auth);
    user = userCredential.user;
    console.log("Signed in anonymously:", user.uid);

    localStorage.setItem("userNickname", usernameField.value);
  } catch (error) {
    console.error("Error during anonymous sign-in:", error);
  }
};

usernameField.addEventListener("input", () => {
  if (usernameField.value.trim() != "") {
    hostButton.classList.toggle("notSelectable", false);
    partecipateButton.classList.toggle("notSelectable", false);

    hostButton.style.pointerEvents = "auto";
    partecipateButton.style.pointerEvents = "auto";
  } else {
    hostButton.classList.toggle("notSelectable", true);
    partecipateButton.classList.toggle("notSelectable", true);

    hostButton.style.pointerEvents = "none";
    partecipateButton.style.pointerEvents = "none";
  }
});

hostButton.addEventListener("click", () => {
  signInAnonymouslyUser();
  handleLobbyMenuLayout("host");
});

partecipateButton.addEventListener("click", () => {
  signInAnonymouslyUser();
  handleLobbyMenuLayout("player");
});

/** CODICE DA SPOSTARE (GESTIONE LOBBY) ---------------------------------------------------------------------------------------------------------------- */
let multiPlayerMenu = document.getElementById("multiPlayerMenu");
let lobbyMenu = document.getElementById("lobbySelector");
let lobbyTitle = document.getElementById("lobbyTitle");

let createButton = document.getElementById("CREATE");
let joinButton = document.getElementById("JOIN");

let handleLobbyMenuLayout = function (role) {
  multiPlayerMenu.style.display = "none";
  lobbyMenu.style.display = "block";
  if (role == "player") {
    lobbyTitle.innerHTML = "Join Lobby";
    createButton.style.display = "none";
    joinButton.style.display = "block";
  } else if (role == "host") {
    lobbyTitle.innerHTML = "Create Lobby";
    createButton.style.display = "block";
    joinButton.style.display = "none";
  }
};

let backToMP_MenuButton = document.getElementById("backLS");

backToMP_MenuButton.addEventListener("click", () => {
  multiPlayerMenu.style.display = "block";
  lobbyMenu.style.display = "none";
});

let nameField = document.getElementById("lobbyName");
let pwField = document.getElementById("lobbyPW");

nameField.addEventListener("input", () => {
  if (nameField.value.trim() != "" && pwField.value.trim() != "") {
    createButton.classList.toggle("notSelectable", false);
    joinButton.classList.toggle("notSelectable", false);

    createButton.style.pointerEvents = "auto";
    joinButton.style.pointerEvents = "auto";
  } else {
    createButton.classList.toggle("notSelectable", true);
    joinButton.classList.toggle("notSelectable", true);

    createButton.style.pointerEvents = "none";
    joinButton.style.pointerEvents = "none";
  }
});

pwField.addEventListener("input", () => {
  if (nameField.value.trim() != "" && pwField.value.trim() != "") {
    createButton.classList.toggle("notSelectable", false);
    joinButton.classList.toggle("notSelectable", false);

    createButton.style.pointerEvents = "auto";
    joinButton.style.pointerEvents = "auto";
  } else {
    createButton.classList.toggle("notSelectable", true);
    joinButton.classList.toggle("notSelectable", true);

    createButton.style.pointerEvents = "none";
    joinButton.style.pointerEvents = "none";
  }
});

import {
  getDatabase,
  ref,
  get,
  set,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const db = getDatabase(app);

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
}

let minigamePages = {
  chords_GM: "./Templates/KeyBoard/keyBoardInput.html",
  harmony_GM: "./Templates/KeyBoard/keyBoardInput.html",
  grooves_GM: "./Templates/DrumMachine/drumMachineInput.html",
  fills_GM: "./Templates/DrumMachine/drumMachineInput.html",
};

let gameModes = ["chords_GM", "harmony_GM", "grooves_GM", "fills_GM"];
let difficulties = ["easyDiff", "mediumDiff", "hardDiff"];
let numRounds = 2 * 4;

let createMinigamesOrder = function () {
  let gameModeOrder = shuffleArray(gameModes);

  let levels = [];

  for (let i = 0; i < numRounds; i++) {}

  return levels;
};

async function createLobby(lobbyName, password, playerId, playerName) {
  const hashedPassword = btoa(password); // Simple base64 encoding (use bcrypt for production)

  // Reference to the lobby
  const lobbyRef = ref(db, `lobbies/${lobbyName}`);

  // Check if the lobby already exists
  const snapshot = await get(lobbyRef);
  if (snapshot.exists()) {
    error("Lobby with this name already exists!");
    return;
  }
  // Create the player data
  const playerData = {
    playerName: playerName,
    score: 0,
    joinedAt: Date.now(), // Store the timestamp when the player joins
  };

  const lobbyData = {
    password: hashedPassword,
    players: {
      [playerId]: playerData, // Set playerName as the key for the player
    },
    status: "open",
    minigamesOrder: createMinigamesOrder(),
  };

  // Create the lobby
  await set(lobbyRef, lobbyData);
}

async function joinLobby(lobbyName, password, playerId, playerName) {
  // Get a reference to the lobby
  const lobbyRef = ref(db, `lobbies/${lobbyName}`);
  const snapshot = await get(lobbyRef);

  if (!snapshot.exists()) {
    throw new Error("Lobby does not exist.");
  }

  // Validate the password
  const lobbyData = snapshot.val();
  if (lobbyData.password !== btoa(password)) {
    throw new Error("Incorrect password.");
  }

  // Get a reference to the players node
  const playersRef = ref(db, `lobbies/${lobbyName}/players`);
  const playersSnapshot = await get(playersRef);

  // Initialize players object
  let players = {};
  if (playersSnapshot.exists()) {
    players = playersSnapshot.val();
  }

  // Debug: Log existing players
  console.log("Existing players:", players);

  let playersArray = Object.values(players); // Convert the object to an array

  if (playersArray.length >= maxPlayers) throw new Error("Lobby is full.");

  // Check if the player already exists
  if (players[playerId]) {
    throw new Error("Player already exists in the lobby.");
  }

  // Add the new player to the players object
  players[playerId] = {
    playerName: playerName,
    score: 0,
    joinedAt: Date.now(), // Store the timestamp when the player joins
  };

  // Debug: Log updated players
  console.log("Updated players object:", players);

  // Update the players node with the new player
  await set(playersRef, players);

  console.log("Joined the lobby successfully.");
}

createButton.addEventListener("click", async () => {
  try {
    await createLobby(
      nameField.value,
      pwField.value,
      user.uid,
      localStorage.getItem("userNickname")
    );
    alert("Lobby created successfully!");
    localStorage.setItem("lobbyName", nameField.value);
    localStorage.setItem("lobbyPw", pwField.value);
    localStorage.setItem("isHost", true);
    window.location.href = "./Templates/Multiplayer/lobby.html";
  } catch (error) {
    console.error("Error creating lobby:", error);
    alert(error.message);
  }
});

joinButton.addEventListener("click", async () => {
  try {
    await joinLobby(
      nameField.value,
      pwField.value,
      user.uid,
      localStorage.getItem("userNickname")
    );
    alert("Successfully joined the lobby!");
    localStorage.setItem("lobbyName", nameField.value);
    localStorage.setItem("lobbyPw", pwField.value);
    localStorage.setItem("isHost", false);
    window.location.href = "./Templates/Multiplayer/lobby.html";
  } catch (error) {
    console.error("Error joining lobby:", error);
    alert(error.message);
  }
});
