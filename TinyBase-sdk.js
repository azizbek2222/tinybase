import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, update, get, push, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    signOut,
    sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
        if (!this.apiKey) {
            throw new Error("TinyBase: API Key kiritilmagan!");
        }
        
        // API kalitni bazadan tekshirish (To'g'rilangan mantiq)
        const keyRef = ref(this.db, `api_keys/${this.apiKey}`);
        const snap = await get(keyRef);
        
        if (!snap.exists()) {
            throw new Error("TinyBase: API Key noto'g'ri yoki faol emas!");
        }
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

    async logOut() {
        return signOut(this.auth);
    }

    onAuthChange(callback) {
        onAuthStateChanged(this.auth, (user) => callback(user));
    }

    // --- DATABASE CORE METHODS ---
    async dbSave(path, data) {
        await this._validate();
        const newRef = push(ref(this.db, path));
        return set(newRef, { 
            ...data, 
            id: newRef.key, 
            createdAt: Date.now() 
        });
    }

    async dbUpdate(path, data) {
        await this._validate();
        return update(ref(this.db, path), data);
    }

    async dbDelete(path) {
        await this._validate();
        return set(ref(this.db, path), null);
    }

    async dbWatch(path, callback) {
        await this._validate();
        onValue(ref(this.db, path), (snap) => callback(snap.val()));
    }

    // --- SPECIALIZED METHODS ---
    async watchBalance(userId, callback) {
        await this._validate();
        onValue(ref(this.db, `users/${userId}/balance`), (snap) => callback(snap.val() || 0));
    }

    async setBalance(userId, amount) {
        await this._validate();
        if (typeof amount !== 'number') {
            throw new Error("TinyBase: Miqdor raqam bo'lishi kerak!");
        }
        return update(ref(this.db, `users/${userId}`), { balance: amount });
    }
}
