# 🚀 Space Shooter

Game tembak-tembakan berbasis browser dimana alien menyerang dan aktif mengejar player. Dibuat murni dengan **HTML5 Canvas**, **CSS**, dan **Vanilla JavaScript** — tanpa framework, tanpa library eksternal.

## 🎮 Live Demo

**▶ [Mainkan Sekarang](https://angello44.github.io/SpaceShooter)**

## 📸 Screenshot

![Space Shooter Gameplay](screenshot.png)

## ✨ Fitur

- 🛸 **3 tipe alien** — Drone (cepat), Hunter (tembak balik), Boss (HP tebal)
- 🎯 **AI homing** — alien aktif mengejar posisi player secara real-time
- 💥 **Efek ledakan partikel**
- 🌟 **Background bintang** bergerak
- ❤️ **Sistem nyawa** — +1 nyawa bonus setiap 1100 score
- 🏆 **High score** tersimpan otomatis di browser (localStorage)
- 🔊 **Sound effect** via Web Audio API — tanpa file audio eksternal
- 📱 **Mobile-friendly** — tombol kontrol layar sentuh
- ⌨️ **Keyboard support** — bisa dimainkan di desktop

## 🕹️ Cara Main

| Aksi            | Keyboard             | Tombol Layar     |
| --------------- | -------------------- | ---------------- |
| Gerak kiri      | `←` atau `A`         | ◀                |
| Gerak kanan     | `→` atau `D`         | ▶                |
| Tembak          | `SPACE` (tahan)      | 🔥               |
| Mulai / Restart | `SPACE` atau `ENTER` | Tap tombol MULAI |

## 👾 Tipe Musuh

| Tipe   | Warna    | HP  | Kemampuan               | Muncul   |
| ------ | -------- | --- | ----------------------- | -------- |
| Drone  | 🟢 Hijau | 1   | Mengejar cepat          | Level 1+ |
| Hunter | 🟣 Ungu  | 3   | Mengejar + tembak balik | Level 2+ |
| Boss   | 🔴 Merah | 7   | Lambat tapi sangat kuat | Level 4+ |

## 📊 Sistem Skor

| Kill   | Poin |
| ------ | ---- |
| Drone  | +10  |
| Hunter | +20  |
| Boss   | +50  |

- Level naik setiap **150 poin**
- Bonus **+1 nyawa** setiap **1100 poin**
- High score disimpan otomatis di browser

## 📁 Struktur File

```
SpaceShooter/
├── index.html      # Struktur HTML
├── style.css       # Tampilan & layout
├── game.js         # Logika game (canvas, AI, audio)
└── README.md       # Dokumentasi
```

## 🛠️ Teknologi

- HTML5 Canvas API
- Web Audio API
- Vanilla JavaScript (ES6+)
- CSS3

## 🚀 Jalankan Lokal

Tidak perlu install apapun. Cukup clone dan buka file HTML:

```bash
git clone https://github.com/Angello44/SpaceShooter.git
cd SpaceShooter
# Buka index.html di browser
```

## 📄 Lisensi

MIT License — bebas digunakan dan dimodifikasi.
