// ===============================================
// === ⚠️ 1. FIREBASE CONFIGURATION (SIZNING KONFIGURATSIYANGIZ) ===
// ===============================================

// Sizning web app konfiguratsiyangiz
const firebaseConfig = {
  apiKey: "AIzaSyBrMKJ4MPilQg6gZsaE-Hlqlgo5F4Q8IsM",
  authDomain: "xabar-tizimi.firebaseapp.com",
  databaseURL: "https://xabar-tizimi-default-rtdb.firebaseio.com", // RTDB uchun
  projectId: "xabar-tizimi",
  storageBucket: "xabar-tizimi.firebasestorage.app",
  messagingSenderId: "3947028451",
  appId: "1:3947028451:web:a064cb657fcf28f6520ad6",
  measurementId: "G-RCMHD7ZPNJ"
};

// Firebase va Database'ni ishga tushirish
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();


// ===============================================
// === 2. ASOSIY ELEMENTLAR ===
// ===============================================
const editor = document.getElementById('code-editor');
const resultIframe = document.getElementById('result-iframe');
const shareLinkOutput = document.getElementById('share-link-output');
const header = document.querySelector('header');
const container = document.querySelector('.container');
const editorPanel = document.querySelector('.panel.editor');
const resultPanel = document.querySelector('.panel.result'); 


// --- 1. Kodni ishga tushirish funksiyasi ---
function runCode() {
    const code = editor.value;
    resultIframe.srcdoc = code;
}

// --- 2. FIREBASE ORQALI KODNI SAQLASH VA HAVOLA OLISH FUNKSIYASI ---
async function saveAndGetFirebaseLink() {
    const code = editor.value;

    if (code.trim() === '') {
        alert("Saqlash uchun kod maydoni bo'sh bo'lmasligi kerak.");
        return;
    }

    try {
        const newRef = database.ref('snippets').push();
        
        await newRef.set({
            code: code,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        });

        const snippetId = newRef.key;
        
        // Havolani ?id=[ID]&run=true deb o'rnatamiz
        const newUrl = `${window.location.origin}${window.location.pathname}?id=${snippetId}&run=true`; // Run rejimini majburlash

        // UI'ni yangilash
        shareLinkOutput.value = newUrl;
        shareLinkOutput.style.display = 'block'; 
        shareLinkOutput.select();
        shareLinkOutput.setSelectionRange(0, 99999);

        // Nusxalash logikasi
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(newUrl).then(() => {
                alert(`✅ Kod Firebase'ga saqlandi! Havola nusxalandi (ID: ${snippetId}). Endi u faqat natijani ko'rsatadi.`);
            }).catch(() => {
                alert(`🔗 Kod saqlandi (ID: ${snippetId}). Iltimos, pastdagi maydondan havolani qo'lda nusxalang.`);
            });
        } else {
             alert(`🔗 Kod saqlandi (ID: ${snippetId}). Iltimos, pastdagi maydondan havolani qo'lda nusxalang.`);
        }

    } catch (e) {
        console.error("Firebase'ga saqlashda xatolik:", e);
        alert("❌ Kodingizni saqlashda xatolik yuz berdi. (Firebase qoidalarini tekshiring!)");
    }
}

// --- 3. URL manzilidagi kodni o'qish va yuklash funksiyasi (TO'G'RILANDI) ---
async function loadCodeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const snippetId = urlParams.get('id');
    const isRunMode = urlParams.get('run') === 'true';

    // Agar ID topilsa, Firebase'dan yuklashga harakat qilamiz
    if (snippetId) {
        try {
            // Firebase'dan ma'lumotni olish
            const snapshot = await database.ref(`snippets/${snippetId}`).once('value');

            if (snapshot.exists()) {
                const loadedCode = snapshot.val().code;
                
                if (isRunMode) {
                    // *** TOZA NATIJA REJIMI ***
                    
                    // Asosiy interfeys elementlarini butunlay yashirish
                    if (header) header.style.display = 'none';
                    if (container) container.style.display = 'none';
                    
                    // Sahifaga to'liq ekranli IFRAME yaratish/topish
                    let fullScreenIframe = document.getElementById('full-result-iframe');
                    
                    if (!fullScreenIframe) {
                        fullScreenIframe = document.createElement('iframe');
                        fullScreenIframe.id = 'full-result-iframe';
                        fullScreenIframe.setAttribute('sandbox', 'allow-scripts allow-forms allow-same-origin');
                        
                        // To'liq ekranli uslublarni qo'llash (sahifaning barcha elementlarini qoplash uchun)
                        fullScreenIframe.style.cssText = `
                            width: 100vw; 
                            height: 100vh;
                            position: fixed;
                            top: 0;
                            left: 0;
                            margin: 0;
                            padding: 0;
                            border: none;
                            z-index: 9999; /* Boshqa hamma narsadan ustun bo'lishi uchun */
                        `;
                        document.body.appendChild(fullScreenIframe);
                    }
                    
                    // Kodni iframe ichiga yuklash
                    fullScreenIframe.srcdoc = loadedCode;
                    document.body.style.overflow = 'hidden'; // Asosiy sahifaning scroll-barini o'chirish
                    
                    console.log(`Toza natija Firebase'dan yuklandi (ID: ${snippetId}).`);
                    return; 
                } else {
                    // Tahrirlash Rejimi
                    editor.value = loadedCode;
                    runCode();
                }

            } else {
                alert("Kod topilmadi yoki yaroqsiz ID. Tahrirlash rejimiga qaytildi.");
            }
        } catch (e) {
            console.error("Firebase'dan kodni yuklashda xatolik:", e);
            alert("❌ Kodni yuklashda xatolik yuz berdi. (Konsolni tekshiring.)");
        }
    } 
    
    // Agar ID bo'lmasa yoki yuklashda xato bo'lsa, Tahrirlash rejimida namuna kodni yuklash
    if (!editor.value) {
        editor.value = `<h1>Salom, Bu mening Firebase Snip Loyiham!</h1>
<p>Kodni o'zgartiring va "Save & Get Link"ni bosing.</p>
<style>
  h1 { color: green; }
</style>`;
        runCode(); 
    }
}

// --- 4. Telefon/Kompyuter faylidan kodni yuklash funksiyasi (O'zgarishsiz) ---
function loadFile(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
        editor.value = e.target.result;
        runCode(); 
        shareLinkOutput.style.display = 'none';
        alert(`"${file.name}" fayli muvaffaqiyatli yuklandi.`);
    };

    reader.readAsText(file);
}

// Sahifa yuklanganda kodni yuklash
window.onload = loadCodeFromUrl;
