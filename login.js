import {
  getAuth,
  signInAnonymously,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

import { app } from "./firebase.js";
const auth = getAuth(app);

let usernameField = document.getElementById("username");
let hostButton = document.getElementById("host");
let partecipateButton = document.getElementById("partecipate");

hostButton.style.pointerEvents = "none";
partecipateButton.style.pointerEvents = "none";

let userCredential = await signInAnonymously(auth);
let user = userCredential.user;

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
    lobbyTitle.innerHTML = "JOIN LOBBY";
    createButton.style.display = "none";
    joinButton.style.display = "block";
  } else if (role == "host") {
    lobbyTitle.innerHTML = "CREATE LOBBY";
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

async function joinLobby(lobbyName, password, playerId, playerName) {
  const dbRef = ref(db, `lobbies/${lobbyName}`);
  const snapshot = await get(dbRef);

  if (!snapshot.exists()) {
    throw new Error("Lobby does not exist.");
  }

  /*const lobbyData = snapshot.val();
  if (!checkPassword(password, lobbyData.password)) {
    throw new Error("Incorrect password.");
  }*/

  // Reference to the players node in the lobby
  const playersRef = ref(db, `lobbies/${lobbyName}/players`);

  // Fetch the players data to count how many players are in the lobby
  const playersSnapshot = await get(playersRef);

  console.log(typeof playersSnapshot);

  let playersCount = 0;

  // If players exist, count how many keys there are in the players object
  if (playersSnapshot.exists()) {
    playersCount = Object.keys(playersSnapshot.val()).length;
  }

  // Log the number of players in the lobby
  console.log(`There are ${playersCount} players in the lobby.`);

  // Add the player data
  await set(playersRef, {
    playerId: playerId,
    playerName: playerName,
    score: 0,
  });

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
    window.location.href = "./Templates/Multiplayer/lobby.html";
  } catch (error) {
    console.error("Error joining lobby:", error);
    alert(error.message);
  }
});
