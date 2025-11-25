import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, runTransaction } 
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDm5joBc7dicQrPvrmtH_v-RMhkQrIPcxY",
  authDomain: "nexalum-1.firebaseapp.com",
  projectId: "nexalum-1",
  storageBucket: "nexalum-1.firebasestorage.app",
  messagingSenderId: "418037039727",
  appId: "1:418037039727:web:8f0d8ed7c00cdf613f039a",
  measurementId: "G-F848CDBJ7W"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

let device = localStorage.getItem("device_id");
if (!device) {
    device = "dev_" + Math.random().toString(36).substring(2, 10);
    localStorage.setItem("device_id", device);
}

export function addBalance(amount) {
    return runTransaction(ref(db, "users/" + device + "/balance"), bal => {
        return (bal || 0) + amount;
    });
}

set(ref(db, "users/" + device + "/balance"), 0.0);

export { device };
