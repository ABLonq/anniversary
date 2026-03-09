# 💕 Yıl Dönümü Anı Sitesi

Romantik bir anı galerisi. NFC kart ile şifresiz açılır, dışarıdan girişte şifre istenir.

## Kurulum

```bash
npm install
npm run dev
```

## Yapılandırma

### 1. Cloudinary Cloud Name
`components/CreateCardModal.tsx` dosyasında şu satırı bul:
```ts
const CLOUDINARY_CLOUD_NAME = 'YOUR_CLOUD_NAME'
```
Cloudinary dashboard'ından Cloud Name'ini gir.

### 2. NFC Kart
NFC kartını şu URL'e programla:
```
https://SITEADRESIN.vercel.app/?nfc=nfc_anniversary_love
```
Bu URL ile site şifresiz açılır.

### 3. Şifre
Şifre: `23.04.2025`

Değiştirmek istersen `app/page.tsx` içinde:
```ts
const CORRECT_PASSWORD = '23.04.2025'
```

## Deploy (Vercel)

```bash
npm i -g vercel
vercel
```

## NFC Kart Nasıl Programlanır?

1. NFC Tools (iOS/Android) uygulamasını indir
2. "Write" > "Add a record" > "URL" seç
3. URL: `https://siteadresin.com/?nfc=nfc_anniversary_love`
4. NFC kartına yaz

## Özellikler

- 🔐 Şifre koruması (23.04.2025)
- 📱 NFC ile otomatik şifresiz giriş
- 📸 Cloudinary ile fotoğraf yükleme
- 🌸 Romantik soft tasarım
- ➕ Anı ekleme/silme
- 💫 Animasyonlar & petal efektleri
