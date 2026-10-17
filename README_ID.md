# SkyTok AI Pro — versi online

Ini starter project untuk web analisis video. Frontend mengambil maksimal 5 cuplikan gambar dari video di browser lalu mengirimkannya ke backend Node.js. Backend memanggil OpenAI Responses API. API key disimpan di server melalui `.env`, jangan taruh API key di `public/script.js` atau `index.html`.

## Penting sebelum mulai
- Ini **belum langsung online**. Harus dijalankan di komputer/server Node.js atau hosting yang mendukung Node.js.
- Perlu API key dan akun API dengan billing/kuota yang aktif. Penggunaan API bisa berbayar; cek harga dan batas sebelum dipakai.
- Analisis hanya memakai maksimal 5 cuplikan gambar dan caption, jadi AI bisa melewatkan kejadian di antara cuplikan. Audio video tidak dianalisis pada versi ini.
- Komentar adalah simulasi kemungkinan reaksi, bukan komentar asli atau prediksi viral.
- Jangan unggah video sensitif atau video orang lain tanpa izin.

## Cara menjalankan di komputer/server
1. Pasang Node.js versi LTS.
2. Ekstrak folder proyek.
3. Di folder proyek, jalankan `npm install`.
4. Salin `.env.example` menjadi `.env`.
5. Buka `.env`, isi `OPENAI_API_KEY=...` dengan API key milikmu. Jangan bagikan file `.env`.
6. Jalankan `npm start`.
7. Buka `http://localhost:3000`.

## Deploy online
Deploy folder ini ke hosting yang mendukung aplikasi Node.js (bukan static hosting saja). Atur start command `npm start`, lalu tambahkan environment variable `OPENAI_API_KEY` di pengaturan hosting. Jangan upload `.env` ke GitHub. Setelah deploy, buka alamat web yang diberikan hosting.

## Batasan teknis
- Model di server disetel ke `gpt-4.1-mini`; jika akun/API tidak mendukung model tersebut, ubah `model` di `server.js` ke model vision yang tersedia di akun.
- File video tidak diunggah utuh ke API; browser mengekstrak cuplikan gambar dan mengirimkannya.
- Backend membatasi permintaan JSON hingga 18 MB dan maksimal 8 gambar; frontend saat ini mengirim hingga 5.
- Ini demo pribadi, belum punya login, penyimpanan histori, rate limiting, atau perlindungan penyalahgunaan untuk penggunaan publik.
