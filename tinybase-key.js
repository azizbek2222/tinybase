import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBUkCUhNzMGSBc7q23QVOAh0yK0OOl80uM",
    authDomain: "kazino-b83b8.firebaseapp.com",
    databaseURL: "https://kazino-b83b8-default-rtdb.firebaseio.com",
    projectId: "kazino-b83b8",
    appId: "1:46554087265:web:86786370a056be4a448f20"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById('userEmailText').innerText = user.email;
        document.getElementById('projID').innerText = user.uid.substring(0, 10).toUpperCase();
        
        // Foydalanuvchining kaliti saqlanadigan yo'l
        const userMappingRef = ref(db, `user_api_mappings/${user.uid}`);
        
        try {
            const snapshot = await get(userMappingRef);
            let userApiKey;

            if (snapshot.exists()) {
                // 1. Agar kalit avval yaratilgan bo'lsa, o'shani olamiz
                userApiKey = snapshot.val().apiKey;
            } else {
                // 2. Agar kalit bo'lmasa, yangi bitta yaratamiz
                userApiKey = "TNB-" + Math.random().toString(36).substring(2, 12).toUpperCase();
                
                // Kalitni ruxsat berilganlar ro'yxatiga qo'shamiz
                await set(ref(db, `api_keys/${userApiKey}`), {
                    owner: user.uid,
                    email: user.email,
                    createdAt: Date.now()
                });

                // Foydalanuvchi ID-siga ushbu kalitni biriktiramiz
                await set(userMappingRef, {
                    apiKey: userApiKey
                });
            }

            // UI elementlarini yangilaymiz
            const apiKeySpan = document.getElementById('apiKey');
            if (apiKeySpan) apiKeySpan.innerText = userApiKey;
            
            const sdkLinkSpan = document.getElementById('sdkUrlDisplay');
            if (sdkLinkSpan) sdkLinkSpan.innerText = "https://tinybase.vercel.app/TinyBase-sdk.js";

        } catch (error) {
            console.error("Firebase xatosi:", error);
            document.getElementById('apiKey').innerText = "ERROR_DB";
        }
    } else {
        window.location.href = "login.html";
    }
});

document.getElementById('copyBtn').onclick = () => {
    const code = document.getElementById('sdkCode').innerText;
    navigator.clipboard.writeText(code).then(() => {
        alert("SDK kodi nusxalandi!");
    });
};