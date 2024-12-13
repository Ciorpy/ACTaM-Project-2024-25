import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

import { app } from "../../../firebase.js";
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is already logged in:", user.uid);
  } else {
    console.log("YOU SHOULDN'T BE HERE");
  }
});
