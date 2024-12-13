import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCQ80_P6wHcfcOzyZjwh4fnAXnvo_n9WIs",
  authDomain: "musicmind-76c18.firebaseapp.com",
  databaseURL:
    "https://musicmind-76c18-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "musicmind-76c18",
  storageBucket: "musicmind-76c18.firebasestorage.app",
  messagingSenderId: "714424349218",
  appId: "1:714424349218:web:d09166e841aa36da91907b",
  measurementId: "G-2NZDZE71EV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };
