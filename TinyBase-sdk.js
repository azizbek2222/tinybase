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

    async _checkKey() {
        const keyRef = ref(this.db, `api_keys/${this.apiKey}`);
        const snapshot = await get(keyRef);
        if (!snapshot.exists()) {
            throw new Error("TinyBase: API kaliti noto'g'ri!");
        }
        return true;
    }

    async watchBalance(userId, callback) {
        await this._checkKey();
        const balanceRef = ref(this.db, `users/${userId}/balance`);
        onValue(balanceRef, (snap) => callback(snap.val() || 0));
    }

    async setBalance(userId, amount) {
        await this._checkKey();
        return update(ref(this.db, `users/${userId}`), {
            balance: amount,
            lastUpdate: Date.now()
        });
    }
}