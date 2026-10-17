require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ limit: "18mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/analyze", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "PASTE_API_KEY_HERE") {
      return res.status(503).json({
        error: "API key belum dipasang. Isi OPENAI_API_KEY di file .env pada server."
      });
    }
    const { frames, caption = "", count = 100 } = req.body || {};
    if (!Array.isArray(frames) || frames.length < 1 || frames.length > 8) {
      return res.status(400).json({ error: "Kirim 1 sampai 8 cuplikan gambar dari video." });
    }
    if (frames.some(f => typeof f !== "string" || !/^data:image\/(jpeg|png|webp);base64,/.test(f))) {
      return res.status(400).json({ error: "Format cuplikan gambar tidak valid." });
    }
    const safeCount = Math.max(20, Math.min(100, Number(count) || 100));
    const content = [
      {
        type: "input_text",
        text: `Analisis cuplikan video berikut. Caption pengguna: ${String(caption).slice(0, 500)}.
Buat laporan dalam bahasa Indonesia, jujur dan spesifik pada hal yang benar-benar terlihat. Jangan mengarang kejadian yang tidak terlihat.
Keluarkan JSON valid saja dengan struktur:
{
 "judul": "ringkasan singkat",
 "ringkasan": "apa yang terlihat dalam video",
 "skor_daya_tarik": 1,
 "yang_menarik": ["..."],
 "yang_perlu_diperbaiki": ["..."],
 "saran": ["..."],
 "komentar": [{"kategori":"Reaksi","teks":"..." }]
}
Buat tepat ${safeCount} komentar yang bervariasi dan relevan. Sebarkan kategori antara Reaksi, Pujian, Kritik, Saran, dan Pertanyaan. Komentar adalah simulasi calon reaksi penonton, bukan komentar asli. Hindari komentar duplikat atau klaim spesifik yang tidak didukung cuplikan. Skor daya tarik perkiraan AI dari 1 sampai 10, bukan prediksi viral.`
      },
      ...frames.map((image_url) => ({
        type: "input_image",
        image_url,
        detail: "low"
      }))
    ];

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [{ role: "user", content }],
        max_output_tokens: 6500
      })
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("AI API error:", data);
      return res.status(response.status).json({
        error: data?.error?.message || "Layanan AI gagal memproses video."
      });
    }
    const output = (data.output || [])
      .filter(item => item.type === "message")
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n");
    if (!output) return res.status(502).json({ error: "AI tidak mengembalikan hasil teks." });
    let result;
    try {
      const cleaned = output.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "");
      result = JSON.parse(cleaned);
    } catch {
      return res.status(502).json({ error: "Hasil AI belum berupa JSON yang bisa dibaca. Coba lagi." });
    }
    res.json({ result, disclaimer: "Komentar adalah simulasi AI, bukan komentar atau engagement asli." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan server. Coba lagi nanti." });
  }
});

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log(`SkyTok AI Pro berjalan di http://localhost:${PORT}`));
