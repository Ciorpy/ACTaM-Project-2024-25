  // Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCQ80_P6wHcfcOzyZjwh4fnAXnvo_n9WIs",
    authDomain: "musicmind-76c18.firebaseapp.com",
    projectId: "musicmind-76c18",
    storageBucket: "musicmind-76c18.firebasestorage.app",
    messagingSenderId: "714424349218",
    appId: "1:714424349218:web:d09166e841aa36da91907b",
    measurementId: "G-2NZDZE71EV"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

// Export services
export const auth = getAuth(app); // For Authentication
export const db = getDatabase(app); // For Realtime Database