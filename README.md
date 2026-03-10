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

### 2. Şifre
Şifre: `************`

Değiştirmek istersen `app/page.tsx` içinde:
```ts
const CORRECT_PASSWORD = '*************'
```

## Deploy (Vercel)

```bash
npm i -g vercel
vercel
```
## Özellikler

- 🔐 Şifre koruması (************)
- 📸 Cloudinary ile fotoğraf yükleme
- 🌸 Romantik soft tasarım
- ➕ Anı ekleme/silme
- 💫 Animasyonlar & petal efektleri
