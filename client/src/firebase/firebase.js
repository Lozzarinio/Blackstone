// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDeVB4POjuXw7uJb2flym9Wcj3BthuDeYM",
    authDomain: "blackstone-3eb77.firebaseapp.com",
    projectId: "blackstone-3eb77",
    storageBucket: "blackstone-3eb77.firebasestorage.app",
    messagingSenderId: "238214027253",
    appId: "1:238214027253:web:c3b0a2768185e0063332bc"
  };


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };