# ⚡ TinyBase - Realtime Balance SDK

**TinyBase** — bu frontend dasturchilar uchun mo'ljallangan, Firebase asosida qurilgan juda yengil va tezkor "Backend-as-a-Service" (BaaS) yechimidir. U loyihangizga bir qator kod bilan real vaqt rejimida (realtime) balans tizimini o'rnatish imkonini beradi.

---

## 🚀 Asosiy Imkoniyatlar

* **Realtime Monitoring:** Balans o'zgarishlarini millisoniyalarda kuzatish.
* **Simple Integration:** Murakkab backend kodlarisiz, tayyor SDK orqali integratsiya.
* **Security:** Har bir foydalanuvchi uchun alohida `TNB-` prefiksli API kalitlari va AES-256 himoyasi.
* **Telegram Support:** Barcha boshqaruv va yordam [@Tinybase_bot](https://t.me/Tinybase_bot) orqali.

---

## 🛠 O'rnatish va Foydalanish

Loyihangizga TinyBase-ni ulash uchun quyidagi koddan foydalaning:

```javascript
<script type="module">
  import { TinyBase } from "[https://azizbek2222.github.io/tinybase/TinyBase-sdk.js](https://azizbek2222.github.io/tinybase/TinyBase-sdk.js)";

  // TinyBase-ni faollashtirish
  const tBase = new TinyBase({
    apiKey: "SIZNING_API_KALITINGIZ" // @Tinybase_bot orqali olinadi
  });

  // Foydalanuvchi balansini kuzatish
  tBase.watchBalance("USER_ID", (newBalance) => {
    console.log("Joriy balans:", newBalance);
    document.getElementById('balance-display').innerText = newBalance;
  });
</script>
