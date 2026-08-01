# 🤖 Asisten Riset & Konten Kreator (Gemini Flash API)

Sebuah **chatbot asisten riset dan konten kreator** berbasis web yang dibangun di atas **Google Gemini API** (model `gemma-4-26b-a4b-it`). Aplikasi ini membantu pengguna dalam **dua tahap utama**:

1. **Riset** — merangkum dokumen, mentranskrip audio wawancara/ide, dan menganalisis gambar referensi.
2. **Produksi Konten** — menyusun caption, script, atau draf konten berdasarkan hasil riset, dengan gaya bahasa yang bisa disesuaikan (casual/profesional/lucu) dan platform target (IG/TikTok/YouTube).

Riwayat percakapan dijaga per sesi sehingga konteks dari riset hingga konten jadi tetap utuh dalam satu alur.

---

## Demo
**https://bot-xi-five-61.vercel.app/**

---

## 🎯 Target Pengguna

**Kreator konten, content writer, dan social media manager Indonesia** yang melakukan riset terlebih dahulu sebelum memproduksi konten — misalnya:

- Merangkum artikel/dokumen sebagai referensi
- Menganalisis gambar untuk inspirasi visual
- Menyusun caption/script berdasarkan hasil riset

---

## ✨ Fitur Utama

| Fitur | Keterangan |
| --- | --- |
| 💬 Chat percakapan berkonteks | Mengirim seluruh riwayat pesan ke model agar jawaban tetap kontekstual |
| 🖼️ Analisis gambar | Upload gambar referensi sebagai inspirasi visual |
| 📄 Ringkasan dokumen | Upload dokumen (PDF/DOC/DOCX/TXT) untuk dirangkum |
| 🎙️ Transkrip audio | Upload audio rekaman wawancara/ide untuk ditranskrip |
| 🧠 System instructions khusus | Bot selalu merespons dalam Bahasa Indonesia dan berperan sebagai asisten riset & konten kreator |
| 🎨 Gaya & platform fleksibel | Gaya bahasa (casual/profesional/lucu) dan platform target (IG/TikTok/YouTube) bisa diminta langsung di chat |
| 📝 Render Markdown | Jawaban bot dirender sebagai Markdown (heading, list, tabel, kode, dll.) dan disanitasi dengan DOMPurify |
| 💾 Multi-sesi & riwayat lokal | Membuat, berpindah, dan menghapus sesi; tersimpan di `localStorage` browser |
| 🌗 Tema terang/gelap | Mode light & dark theme dengan preferensi tersimpan |
| 🧊 UI Neumorphism | Desain antarmuka bergaya **neumorphic** — elemen seperti "tertanam" di latar dengan kombinasi shadow terang & gelap |
| 📱 Responsif | Layout menyesuaikan untuk desktop dan mobile (sidebar menjadi drawer) |

---

## 🏗️ Arsitektur Sistem

```
┌───────────────────────┐       HTTP/JSON        ┌──────────────────────────┐
│      FRONTEND         │  ───────────────────►  │        BACKEND           │
│   (public/)           │   POST /api/chat,      │        (index.js)         │
│   HTML + CSS + JS     │   /generate-*          │   Express.js + multer     │
│                       │                        │            │              │
│  • UI Neumorphic      │                        │            ▼              │
│  • Chat interface     │                        │   GoogleGenAI SDK         │
│  • Upload gambar/     │                        │   (@google/genai)         │
│    dokumen/audio      │                        │            │              │
│  • localStorage       │                        │            ▼              │
│    (sesi, tema)       │                        │   Gemini 2.5 Flash        │
│  • marked + DOMPurify │                        │   (generateContent)       │
└───────────────────────┘                        └──────────────────────────┘
```

### Alur Kerja

1. **Client** (browser) mengirim pesan teks dan/atau file (gambar/dokumen/audio) ke **server Express**.
2. **Server** memvalidasi input, lalu (untuk file) mengubahnya menjadi **base64** dan menyusun payload multimodal.
3. **Server** memanggil **Gemini API** (`ai.models.generateContent`) dengan konfigurasi model, riwayat percakapan, dan system instructions.
4. **Gemini** mengembalikan respons teks, diteruskan ke client sebagai JSON `{ result }`.
5. **Client** me-render respons sebagai Markdown yang sudah disanitasi dan menyimpan riwayat ke `localStorage`.

### Penanganan File Multimodal

- File dikirim via **FormData** (`multer` di sisi server menangkapnya di memory storage).
- File di-*encode* menjadi **base64** lalu dikirim sebagai `inlineData` bersama prompt teks dalam satu request ke Gemini — memungkinkan model untuk "melihat" gambar, membaca dokumen, atau mendengarkan audio.

---

## 📁 Struktur Direktori

```
gemini-flash-api/
├── index.js                 # Server Express + endpoint API Gemini
├── package.json             # Manifest & dependensi proyek
├── .env                     # Variabel lingkungan (GEMINI_API_KEY, GEMINI_MODEL) — tidak di-commit
├── .gitignore               # Mengabaikan node_modules, .env, package-lock.json
└── public/                  # Frontend statis
    ├── index.html           # Struktur halaman chat & sidebar sesi
    ├── style.css            # Styling neumorphic + responsive + dark/light theme
    └── script.js            # Logika chat, upload file, sesi, render markdown
```

---

## 🛠️ Teknologi & Dependensi

| Teknologi | Peran |
| --- | --- |
| **Node.js + Express 5** | Server & REST API |
| **@google/genai** (GoogleGenAI SDK) | Klien resmi Google Gemini API |
| **gemma-4-26b-a4b-it** | Model AI multimodal (teks, gambar, dan dokumen) |
| **multer** | Middleware upload file (multipart/form-data) |
| **dotenv** | Membaca konfigurasi dari `.env` |
| **cors** | Mengizinkan permintaan lintas origin |
| **nodemon** | Auto-restart server saat development |
| **Vanilla JS** | Frontend tanpa framework |
| **marked** | Render Markdown di sisi client |
| **DOMPurify** | Sanitasi HTML hasil render (keamanan XSS) |
| **localStorage** | Persistensi sesi chat & preferensi tema |

---

## 🚀 Instalasi & Menjalankan

### Prasyarat
- Node.js (versi yang mendukung ESM / `import`)
- API key Google Gemini ([Google AI Studio](https://aistudio.google.com/))

### Langkah

1. **Clone / masuk ke direktori proyek**
   ```bash
   cd gemini-flash-api
   ```

2. **Install dependensi**
   ```bash
   npm install
   ```

3. **Buat file `.env`** di root proyek:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemma-4-26b-a4b-it
   ```
   > `GEMINI_MODEL` bersifat opsional — jika tidak diisi, default ke `gemini-2.5-flash`.

4. **Jalankan server**
   ```bash
   npm run dev        # development (nodemon)
   # atau
   node index.js      # production
   ```

5. **Buka aplikasi**
   ```
   http://localhost:3000
   ```

---

## 📡 Dokumentasi Endpoint API

### `GET /`
Menampilkan pesan sederhana (`Hello World`) sebagai pengecekan server berjalan.

### `POST /api/chat`
Chat percakapan berkonteks. Mengirimkan seluruh riwayat percakapan agar model memahami konteks dari riset hingga produksi konten.

**Body (JSON):**
```json
{
  "conversation": [
    { "role": "user", "text": "Rangkum dokumen tentang tren skincare 2025" },
    { "role": "model", "text": "Berikut ringkasannya..." }
  ]
}
```

**Respons:**
```json
{ "result": "Jawaban model..." }
```

### `POST /generate-text`
Menghasilkan teks dari satu prompt bebas.

**Body (JSON):**
```json
{ "prompt": "Buatkan caption IG casual tentang kopi" }
```

### `POST /generate-from-image`
Menganalisis gambar yang di-upload.

**Body (FormData):**
| Field | Tipe | Keterangan |
| --- | --- | --- |
| `image` | file | Gambar referensi |
| `prompt` | teks (opsional) | Instruksi analisis |

### `POST /generate-from-document`
Merangkum/memproses dokumen yang di-upload.

**Body (FormData):**
| Field | Tipe | Keterangan |
| --- | --- | --- |
| `document` | file | Dokumen (PDF/DOC/DOCX/TXT) |
| `prompt` | teks (opsional) | Default: *"tolong buat ringkasan dari dokumen ini"* |

### `POST /generate-from-audio`
Mentranskrip/memproses audio yang di-upload.

**Body (FormData):**
| Field | Tipe | Keterangan |
| --- | --- | --- |
| `audio` | file | Rekaman audio |
| `prompt` | teks (opsional) | Default: *"tolong buat transkrip dari rekaman berikut"* |

> Semua endpoint mengembalikan `{ "result": "..." }` pada sukses (200) dan `{ "message": "..." }` pada error (500).

---

## 💡 Contoh Alur Penggunaan

1. **Riset:** Upload dokumen artikel → bot membuat ringkasan poin-poin penting.
2. **Eksplorasi visual:** Upload gambar referensi → bot menganalisis gaya/tema visual.
3. **Produksi:** Minta bot menyusun caption dengan perintah:
   > *"Buatkan caption Instagram casual dari ringkasan dan gambar di atas, target audiens usia 18–25."*
4. Bot menghasilkan caption yang bisa langsung dipakai, dengan konteks riset yang tetap terjaga.

---

## ⚠️ Catatan

- `.env` dan `node_modules` tidak di-commit (terdaftar di `.gitignore`).
- Konfigurasi bot (bahasa, peran, gaya) didefinisikan pada **system instructions** di `index.js` dan dapat disesuaikan.
- Sesuai dengan kebutuhan awal, UI menggunakan **gaya neumorphism** yang diterapkan melalui kombinasi `box-shadow` terang & gelap pada elemen-elemen seperti chat bubble, tombol, dan panel.

