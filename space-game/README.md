# 🚀 Space Shooter

Game tembak-tembakan berbasis browser, dimana alien menyerang dan mengikuti pergerakan player. Dibuat murni dengan **HTML5 Canvas**, **CSS**, dan **JavaScript** — tanpa framework, tanpa library eksternal.

## 🎮 Demo

Buka file `index.html` langsung di browser, atau deploy ke GitHub Pages.

## 📸 Screenshot

> _(tambahkan screenshot game di sini)_

## ✨ Fitur

- 🛸 **3 tipe alien** — Drone (cepat), Hunter (tembak balik), Boss (HP tebal)
- 🎯 **AI homing** — alien aktif mengejar posisi player
- 💥 **Efek ledakan partikel**
- 🌟 **Background bintang** bergerak
- ❤️ **Sistem nyawa** — +1 nyawa setiap 1100 score
- 🏆 **High score** tersimpan di localStorage
- 🔊 **Sound effect** via Web Audio API (tanpa file audio)
- 📱 **Mobile-friendly** — tombol kontrol layar sentuh
- ⌨️ **Keyboard support** — bisa dimainkan di desktop

## 🕹️ Cara Main

| Aksi            | Keyboard             | Tombol Layar     |
| --------------- | -------------------- | ---------------- |
| Gerak kiri      | `←` atau `A`         | ◀                |
| Gerak kanan     | `→` atau `D`         | ▶                |
| Tembak          | `SPACE` (tahan)      | 🔥               |
| Mulai / Restart | `SPACE` atau `ENTER` | Tap tombol MULAI |

## 👾 Musuh

| Tipe   | Warna | HP  | Kemampuan                         |
| ------ | ----- | --- | --------------------------------- |
| Drone  | Hijau | 1   | Mengejar cepat                    |
| Hunter | Ungu  | 3   | Mengejar + tembak balik           |
| Boss   | Merah | 7   | Lambat tapi kuat, muncul level 4+ |

## 📊 Sistem Skor

| Kill   | Poin |
| ------ | ---- |
| Drone  | +10  |
| Hunter | +20  |
| Boss   | +50  |

- Level naik setiap **150 poin**
- +1 nyawa setiap **1100 poin**
- High score disimpan otomatis di browser

## 📁 Struktur File

```
space-game/
├── index.html   # Struktur HTML
├── style.css    # Tampilan & layout
├── game.js      # Logika game
└── README.md    # Dokumentasi ini
```

## 🚀 Cara Deploy ke GitHub Pages

1. Push ke repository GitHub
2. Buka **Settings** → **Pages**
3. Source: pilih branch `main`, folder `/ (root)`
4. Klik **Save** — game bisa diakses di `https://username.github.io/nama-repo`

## 🛠️ Teknologi

- HTML5 Canvas API
- Web Audio API
- Vanilla JavaScript (ES6+)
- CSS3

## 📄 Lisensi

MIT License — bebas digunakan dan dimodifikasi.
