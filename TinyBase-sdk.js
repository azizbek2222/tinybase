import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, update, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export class TinyBase {
    constructor(config) {
        const firebaseConfig = {
            apiKey: "AIzaSyBUkCUhNzMGSBc7q23QVOAh0yK0OOl80uM",
            authDomain: "kazino-b83b8.firebaseapp.com",
            databaseURL: "https://kazino-b83b8-default-rtdb.firebaseio.com",
            projectId: "kazino-b83b8",
            storageBucket: "kazino-b83b8.firebasestorage.app",
            messagingSenderId: "46554087265",
            appId: "1:46554087265:web:86786370a056be4a448f20"
        };

        this.app = initializeApp(firebaseConfig);
        this.db = getDatabase(this.app);
        this.apiKey = config.apiKey;
    }

    // API Keyni bazadan tekshirish mantiqi
    async _checkAuth() {
        const keyRef = ref(this.db, `api_keys/${this.apiKey}`);
        const snapshot = await get(keyRef);
        if (!snapshot.exists()) {
            throw new Error("TinyBase: Noto'g'ri API Key! Balans bilan ishlash taqiqlanadi.");
        }
        return true;
    }

    // Real vaqtda balansni kuzatish
    async watchBalance(userId, callback) {
        try {
            await this._checkAuth();
            const balanceRef = ref(this.db, `users/${userId}/balance`);
            onValue(balanceRef, (snapshot) => {
                callback(snapshot.val() || 0);
            });
        } catch (e) {
            console.error(e.message);
        }
    }

    // Balansni yangilash
    async setBalance(userId, newAmount) {
        await this._checkAuth();
        const userRef = ref(this.db, `users/${userId}`);
        return update(userRef, {
            balance: newAmount,
            lastUpdate: Date.now(),
            modifiedBy: this.apiKey
        });
    }

    // Bir martalik balansni olish
    async getBalance(userId) {
        await this._checkAuth();
        const balanceRef = ref(this.db, `users/${userId}/balance`);
        const snapshot = await get(balanceRef);
        return snapshot.val() || 0;
    }
}