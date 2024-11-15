// src/utils/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCPNyI4vdRtBs4dCwVGlpqIbkWypRaOtDQ",
    authDomain: "vue-firebase-5ca33.firebaseapp.com",
    projectId: "vue-firebase-5ca33",
    storageBucket: "vue-firebase-5ca33.firebasestorage.app",
    messagingSenderId: "759883875848",
    appId: "1:759883875848:web:23201337b5e29ef7a073bd"
};

const firebase = initializeApp(firebaseConfig);
const auth = getAuth(firebase);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };