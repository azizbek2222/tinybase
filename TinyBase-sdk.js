import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, update, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
        this.auth = getAuth(this.app);
        this.apiKey = config.apiKey;
    }

    async _validate() {
        if (!this.apiKey || this.apiKey.includes("...")) throw new Error("TinyBase: API Key xato!");
        const snap = await get(ref(this.db, `api_keys/${this.apiKey}`));
        if (!snap.exists()) throw new Error("TinyBase: API Key ruxsat etilmagan!");
        return true;
    }

    // --- AUTHENTICATION ---
    async signUp(email, password) {
        await this._validate();
        return createUserWithEmailAndPassword(this.auth, email, password);
    }

    async signIn(email, password) {
        await this._validate();
        return signInWithEmailAndPassword(this.auth, email, password);
    }

    onAuthChange(callback) {
        onAuthStateChanged(this.auth, (user) => callback(user));
    }

    // --- DATABASE (BALANCE) ---
    async watchBalance(userId, callback) {
        await this._validate();
        const balanceRef = ref(this.db, `users/${userId}/balance`);
        onValue(balanceRef, (snap) => callback(snap.val() || 0));
    }

    async setBalance(userId, amount) {
        await this._validate();
        return update(ref(this.db, `users/${userId}`), {
            balance: amount,
            lastUpdate: Date.now()
        });
    }
}
