import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBUkCUhNzMGSBc7q23QVOAh0yK0OOl80uM",
  authDomain: "kazino-b83b8.firebaseapp.com",
  databaseURL: "https://kazino-b83b8-default-rtdb.firebaseio.com",
  projectId: "kazino-b83b8",
  storageBucket: "kazino-b83b8.firebasestorage.app",
  messagingSenderId: "46554087265",
  appId: "1:46554087265:web:86786370a056be4a448f20"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// 1. Foydalanuvchi holatini tekshirish
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('userEmailText').innerText = user.email;
        document.getElementById('userName').innerText = user.email.split('@')[0];
        
        // Realtime balansni yuklash
        const balanceRef = ref(db, 'users/' + user.uid + '/balance');
        onValue(balanceRef, (snapshot) => {
            const data = snapshot.val();
            document.getElementById('balanceValue').innerText = data || "0.00";
        });
    } else {
        // Ro'yxatdan o'tmagan bo'lsa login sahifasiga qaytarish
        window.location.href = "login.html";
    }
});

// 2. UI logikasi (Menyu)
const menuBtn = document.getElementById('menuBtn');
const sideMenu = document.getElementById('sideMenu');

menuBtn.onclick = () => sideMenu.classList.toggle('active');

// API Key tugmasi bosilganda
document.getElementById('apiKeyBtn').onclick = () => {
    window.location.href = "tinybase-key.html";
};

// Chiqish tugmasi
document.getElementById('logoutBtn').onclick = () => {
    signOut(auth).then(() => {
        window.location.href = "login.html";
    });
};