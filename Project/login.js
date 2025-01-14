import {
  getAuth,
  signInAnonymously,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

import { app } from "../firebase.js";
const auth = getAuth(app);

let usernameField = document.getElementById("username");
let hostButton = document.getElementById("host");
let partecipateButton = document.getElementById("partecipate");

// Hides host button and participate button
hostButton.style.pointerEvents = "none";
partecipateButton.style.pointerEvents = "none";

let userCredential = await signInAnonymously(auth);
let user = userCredential.user;
localStorage.setItem("userID", user.uid);

let maxPlayers = 6; // When a lobby reaches 6 players is considered full

// Anonymous login function
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

// Adds event listener to the usernameField
usernameField.addEventListener("input", () => {
  // If the username field has been filled, the interaction with the buttons is possible
  if (usernameField.value.trim() != "") {
    // Updates CSS
    hostButton.classList.toggle("notSelectable", false);
    partecipateButton.classList.toggle("notSelectable", false);

    // Enables user interaction
    hostButton.style.pointerEvents = "auto";
    partecipateButton.style.pointerEvents = "auto";
  } else {
    // Updates CSS
    hostButton.classList.toggle("notSelectable", true);
    partecipateButton.classList.toggle("notSelectable", true);

    // Disable user interaction
    hostButton.style.pointerEvents = "none";
    partecipateButton.style.pointerEvents = "none";
  }
});

// Adds event listener to the host Button
hostButton.addEventListener("click", () => {
  signInAnonymouslyUser(); // LOGIN
  handleLobbyMenuLayout("host"); // UI update
});

// Adds event listener to the partecipate Button
partecipateButton.addEventListener("click", () => {
  signInAnonymouslyUser(); // LOGIN
  handleLobbyMenuLayout("player"); // UI update
});

let multiPlayerMenu = document.getElementById("multiPlayerMenu");
let lobbyMenu = document.getElementById("lobbySelector");
let lobbyTitle = document.getElementById("lobbyTitle");

let createButton = document.getElementById("CREATE");
let joinButton = document.getElementById("JOIN");

// Function that handles the lobby menu layout based on the role
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

// Adds an event listener that let's user go back to the MultiPlayer menu
backToMP_MenuButton.addEventListener("click", () => {
  multiPlayerMenu.style.display = "block";
  lobbyMenu.style.display = "none";
});

let nameField = document.getElementById("lobbyName");
let pwField = document.getElementById("lobbyPW");

// Adds event listener to the name field
nameField.addEventListener("input", () => {
  // If both name field and password field have been filled allows interaction
  if (nameField.value.trim() != "" && pwField.value.trim() != "") {
    createButton.classList.toggle("notSelectable", false);
    joinButton.classList.toggle("notSelectable", false);

    // Enables user interaction
    createButton.style.pointerEvents = "auto";
    joinButton.style.pointerEvents = "auto";
  } else {
    createButton.classList.toggle("notSelectable", true);
    joinButton.classList.toggle("notSelectable", true);

    // Disables user interaction
    createButton.style.pointerEvents = "none";
    joinButton.style.pointerEvents = "none";
  }
});

// Adds event listener to the password field
pwField.addEventListener("input", () => {
  // If both name field and password field have been filled allows interaction
  if (nameField.value.trim() != "" && pwField.value.trim() != "") {
    createButton.classList.toggle("notSelectable", false);
    joinButton.classList.toggle("notSelectable", false);

    // Enables user interaction
    createButton.style.pointerEvents = "auto";
    joinButton.style.pointerEvents = "auto";
  } else {
    createButton.classList.toggle("notSelectable", true);
    joinButton.classList.toggle("notSelectable", true);

    // Disables user interaction
    createButton.style.pointerEvents = "none";
    joinButton.style.pointerEvents = "none";
  }
});

// Import firebase DB functions in order to allow interaction
import {
  getDatabase,
  ref,
  get,
  set,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const db = getDatabase(app); // DB reference

/**
 *  Function that let users create a new lobby
 *  */
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
  };

  // Create the lobby
  await set(lobbyRef, lobbyData);
}

/**
 *  Function that let users join an existing lobby
 *  */
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

  // Cannot join a full lobby
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

// Adds event listener to create button (async function)
createButton.addEventListener("click", async () => {
  try {
    // Tries to create lobby with specific function
    await createLobby(
      nameField.value, // Gets value in the lobby name field
      pwField.value, // Gets value in the lobby password field
      user.uid, // Gets user ID value
      localStorage.getItem("userNickname") // Gets user nickname from local storage
    );
    alert("Lobby created successfully!");

    // Saves in local storage important data so that they can be retrieved in the next page
    localStorage.setItem("lobbyName", nameField.value);
    localStorage.setItem("lobbyPw", pwField.value);
    localStorage.setItem("isHost", true);

    // Loads lobby HTML template
    window.location.href = "./Templates/Multiplayer/lobby.html";
  } catch (error) {
    // In case of error, this code is executed
    console.error("Error creating lobby:", error);
    alert(error.message);
  }
});

// Adds event listener to join button (async function)
joinButton.addEventListener("click", async () => {
  try {
    // Tries to join lobby with specific function
    await joinLobby(
      nameField.value, // Gets value in the lobby name field
      pwField.value, // Gets value in the lobby password field
      user.uid, // Gets user ID value
      localStorage.getItem("userNickname") // Gets user nickname from local storage
    );
    alert("Successfully joined the lobby!");

    // Saves in local storage important data so that they can be retrieved in the next page
    localStorage.setItem("lobbyName", nameField.value);
    localStorage.setItem("lobbyPw", pwField.value);
    localStorage.setItem("isHost", false); // User that joins a lobby is not a host

    // Loads lobby HTML template
    window.location.href = "./Templates/Multiplayer/lobby.html";
  } catch (error) {
    // In case of error, this code is executed
    console.error("Error joining lobby:", error);
    alert(error.message);
  }
});
