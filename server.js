const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    message: "SkyTok AI PRO siap digunakan"
  });
});

app.post("/api/analyze", (req, res) => {
  const {
    caption = "",
    jumlahKomentar = 20,
    frames = []
  } = req.body || {};

  if (!Array.isArray(frames) || frames.length === 0) {
    return res.status(400).json({
      error: "Frame video tidak ditemukan. Coba upload video lain."
    });
  }

  const jumlah = Math.max(
    1,
    Math.min(100, Number(jumlahKomentar) || 20)
  );

  const commentsBank = [
    { type: "Reaksi", text: "Wah, bagian ini menarik banget! 🔥" },
    { type: "Pujian", text: "Editing-nya keren, lanjut berkarya!" },
    { type: "Pertanyaan", text: "Ini dibuat pakai aplikasi apa?" },
    { type: "Kritik", text: "Transisinya bisa dibuat lebih halus." },
    { type: "Saran", text: "Coba tambahkan teks agar lebih mudah dipahami." },
    { type: "Reaksi", text: "Awalnya biasa aja, ternyata seru juga 👀" },
    { type: "Pujian", text: "Semangat terus bikin kontennya! 🚀" },
    { type: "Saran", text: "Buat pembukaan yang menarik sejak detik pertama." },
    { type: "Pertanyaan", text: "Bakal ada part berikutnya nggak?" },
    { type: "Kritik", text: "Coba seimbangkan volume suara dan musik." }
  ];

  const comments = Array.from({ length: jumlah }, (_, i) => {
    const item = commentsBank[i % commentsBank.length];

    return {
      type: item.type,
      text: item.text
    };
  });

  res.json({
    mode: "demo",
    analysis: {
      summary: caption.trim()
        ? `Caption kamu: "${String(caption).trim()}". Sebanyak ${frames.length} cuplikan video berhasil dikirim.`
        : `${frames.length} cuplikan video berhasil dikirim.`,
      strengths: [
        "Video berhasil dipilih dan cuplikannya berhasil dikirim."
      ],
      weaknesses: [
        "Mode demo belum benar-benar memahami isi gambar atau audio video."
      ],
      suggestions: [
        "Buat pembukaan yang menarik sejak detik pertama.",
        "Gunakan teks yang mudah dibaca.",
        "Sesuaikan musik dengan suasana video.",
        "Gunakan komentar simulasi sebagai inspirasi, bukan komentar asli."
      ]
    },
    comments
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SkyTok AI PRO berjalan pada port ${PORT}`);
});
