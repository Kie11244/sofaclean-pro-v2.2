
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration - for CLIENT-side usage
const firebaseConfig = {
  apiKey: "AIzaSyB9YpDlMVlzAzhsOterC8IYuETWWVNUvFc",
  authDomain: "psychic-glider-453312-k0.firebaseapp.com",
  projectId: "psychic-glider-453312-k0",
  storageBucket: "psychic-glider-453312-k0.appspot.com",
  messagingSenderId: "318494311599",
  appId: "1:318494311599:web:1e862a3f03d818b592805a",
  measurementId: "G-LM2PXWDHFZ"
};


// Initialize Firebase for the CLIENT
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
