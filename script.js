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

// Yuklangan fayllarning tarkibini saqlash uchun xarita
let loadedFileContents = {}; 

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

// --- 3. URL manzilidagi kodni o'qish va yuklash funksiyasi ---
async function loadCodeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const snippetId = urlParams.get('id');
    const isRunMode = urlParams.get('run') === 'true';

    if (snippetId) {
        try {
            const snapshot = await database.ref(`snippets/${snippetId}`).once('value');

            if (snapshot.exists()) {
                const loadedCode = snapshot.val().code;
                
                if (isRunMode) {
                    if (header) header.style.display = 'none';
                    if (container) container.style.display = 'none';
                    
                    let fullScreenIframe = document.getElementById('full-result-iframe');
                    
                    if (!fullScreenIframe) {
                        fullScreenIframe = document.createElement('iframe');
                        fullScreenIframe.id = 'full-result-iframe';
                        fullScreenIframe.setAttribute('sandbox', 'allow-scripts allow-forms allow-same-origin');
                        
                        fullScreenIframe.style.cssText = `
                            width: 100vw; 
                            height: 100vh;
                            position: fixed;
                            top: 0;
                            left: 0;
                            margin: 0;
                            padding: 0;
                            border: none;
                            z-index: 9999; 
                        `;
                        document.body.appendChild(fullScreenIframe);
                    }
                    
                    fullScreenIframe.srcdoc = loadedCode;
                    document.body.style.overflow = 'hidden'; 
                    
                    console.log(`Toza natija Firebase'dan yuklandi (ID: ${snippetId}).`);
                    return; 
                } else {
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
    
    if (!editor.value) {
        editor.value = `<h1>Salom, Bu mening Firebase Snip Loyiham!</h1>
<p>Kodni o'zgartiring va "Save & Get Link"ni bosing.</p>
<style>
  h1 { color: green; }
</style>`;
        runCode(); 
    }
}

// --- 4. Telefon/Kompyuter faylidan kodni yuklash funksiyasi (Tuzatildi: Birlashtirish olib tashlandi) ---
function loadFile(event) {
    const files = event.target.files;
    if (files.length === 0) {
        return;
    }

    let filesLoaded = 0;
    const totalFiles = files.length;
    let fileNames = [];
    
    // Har safar yuklashda avvalgi fayl tarkibini tozalash
    loadedFileContents = {}; 

    // Barcha fayllarni o'qish uchun tsikl
    for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        fileNames.push(file.name);
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const fileContent = e.target.result;
            
            // 1. Fayl tarkibini global xaritaga saqlash
            loadedFileContents[file.name] = fileContent; 
            filesLoaded++;
            
            // Barcha fayllar o'qib bo'lingach, ishga tushirish
            if (filesLoaded === totalFiles) {
                
                // Muharrirga va Natija maydoniga faqat BIRINCHI fayl tarkibini yuklash
                const initialFileName = files[0].name; 
                switchIframeContent(initialFileName); 
                
                shareLinkOutput.style.display = 'none';
                
                alert(`✅ Quyidagi ${totalFiles} ta fayl muvaffaqiyatli yuklandi: ${fileNames.join(', ')}. 
                
Natija maydonida hozircha "${initialFileName}" fayli ishlamoqda.
                
MUHIM: Fayllar o'rtasida o'tish uchun kodingizdagi \n<a href="chat.html">...</a> kabi havolani quyidagi kabi JavaScript funksiyasiga almashtiring (Masalan, index.html ichida): \n\n<button onclick="window.parent.switchIframeContent('chat.html')">Chatga o'tish</button>`);
            }
        };

        reader.readAsText(file);
    }
}

// Natijalar maydoni (`<iframe>`) tarkibini almashtirish (Tuzatildi: Editorni ham yangilaydi)
function switchIframeContent(fileName) {
    const content = loadedFileContents[fileName];
    if (content) {
        // Kontentni to'g'ridan-to'g'ri iframe'ga yozish (Natijani ko'rsatish)
        resultIframe.srcdoc = content;
        
        // Muharrir maydonini ham joriy fayl tarkibi bilan yangilash (Tahrirlash uchun)
        editor.value = content; 
    } else {
        alert('Xatolik: "' + fileName + '" fayli topilmadi. Avval uni yuklaganingizga ishonch hosil qiling.');
    }
}


// Sahifa yuklanganda kodni yuklash
window.onload = loadCodeFromUrl;
