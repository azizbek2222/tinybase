import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, update, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export class TinyBase {
    constructor(config) {
        const firebaseConfig = {
            apiKey: "AIzaSyBUkCUhNzMGSBc7q23QVOAh0yK0OOl80uM",
            authDomain: "kazino-b83b8.firebaseapp.com",
            databaseURL: "https://kazino-b83b8-default-rtdb.firebaseio.com",
            projectId: "kazino-b83b8",
            appId: "1:46554087265:web:86786370a056be4a448f20"
        };
        this.app = initializeApp(firebaseConfig);
        this.db = getDatabase(this.app);
        this.apiKey = config.apiKey;
    }

    // API kalitni bazadan tekshirish
    async _validate() {
        if (!this.apiKey || this.apiKey.includes("...")) {
            throw new Error("TinyBase: API Key kiritilmagan!");
        }
        const checkRef = ref(this.db, `api_keys/${this.apiKey}`);
        const snap = await get(checkRef);
        if (!snap.exists()) {
            throw new Error("TinyBase: API Key noto'g'ri!");
        }
        return true;
    }

    async watchBalance(userId, callback) {
        try {
            await this._validate();
            const balanceRef = ref(this.db, `users/${userId}/balance`);
            onValue(balanceRef, (snap) => callback(snap.val() || 0));
        } catch (e) { console.error(e.message); }
    }

    async setBalance(userId, amount) {
        await this._validate();
        return update(ref(this.db, `users/${userId}`), {
            balance: amount,
            lastUpdate: Date.now()
        });
    }
}