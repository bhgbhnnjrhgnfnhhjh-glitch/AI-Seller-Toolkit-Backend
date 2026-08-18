
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCRFKO2RT8cyoKoNR3wWdEaQHZIezQf1Ns",
    authDomain: "ai-seller-toolkit.firebaseapp.com",
    projectId: "ai-seller-toolkit",
    storageBucket: "ai-seller-toolkit.firebasestorage.app",
    messagingSenderId: "49741472114",
    appId: "1:49741472114:web:95c5b95d79d0f023a3bdeb"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export {
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
};
