import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Sizning Firebase sozlamalaringiz
const firebaseConfig = {
  apiKey: "AIzaSyBUkCUhNzMGSBc7q23QVOAh0yK0OOl80uM",
  authDomain: "kazino-b83b8.firebaseapp.com",
  databaseURL: "https://kazino-b83b8-default-rtdb.firebaseio.com",
  projectId: "kazino-b83b8",
  storageBucket: "kazino-b83b8.firebasestorage.app",
  messagingSenderId: "46554087265",
  appId: "1:46554087265:web:86786370a056be4a448f20"
};

// Firebase-ni ishga tushirish
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const emailInp = document.getElementById('email');
const passInp = document.getElementById('password');
const msg = document.getElementById('message');

// RO'YXATDAN O'TISH
document.getElementById('registerBtn').onclick = () => {
    createUserWithEmailAndPassword(auth, emailInp.value, passInp.value)
    .then((userCredential) => {
        alert("Ro'yxatdan o'tdingiz!");
        window.location.href = "home.html";
    })
    .catch((error) => { msg.innerText = "Xato: " + error.message; });
};

// TIZIMGA KIRISH
document.getElementById('loginBtn').onclick = () => {
    signInWithEmailAndPassword(auth, emailInp.value, passInp.value)
    .then((userCredential) => {
        window.location.href = "home.html";
    })
    .catch((error) => { msg.innerText = "Email yoki parol xato!"; });
};
