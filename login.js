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

const signInAnonymouslyUser = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
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
    createButton.style.display = "block";
    joinButton.style.display = "none";
  } else if (role == "host") {
    lobbyTitle.innerHTML = "CREATE LOBBY";
    createButton.style.display = "none";
    joinButton.style.display = "block";
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
