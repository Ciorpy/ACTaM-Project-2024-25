let usernameField = document.getElementById("username");
let hostButton = document.getElementById("host");
let partecipateButton = document.getElementById("partecipate");

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
