const videoInput = document.getElementById("video");
const preview = document.getElementById("preview");
const captionInput = document.getElementById("caption");
const jumlahInput = document.getElementById("jumlah");
const tombol = document.getElementById("analisis");
const statusEl = document.getElementById("status");
const hasil = document.getElementById("hasil");
const ringkasan = document.getElementById("ringkasan");
const komentarEl = document.getElementById("komentar");

let videoURL = null;

videoInput.addEventListener("change", () => {
  const file = videoInput.files[0];

  if (videoURL) URL.revokeObjectURL(videoURL);

  if (!file) {
    preview.hidden = true;
    return;
  }

  videoURL = URL.createObjectURL(file);
  preview.src = videoURL;
  preview.hidden = false;
  statusEl.textContent = "Video siap diproses.";
});

tombol.addEventListener("click", async () => {
  const file = videoInput.files[0];

  if (!file) {
    statusEl.textContent = "Pilih video terlebih dahulu!";
    return;
  }

  tombol.disabled = true;
  hasil.hidden = true;
  statusEl.textContent = "Sedang menyiapkan video...";

  try {
    const frames = await ambilFrame(preview, 4);

    statusEl.textContent = "Menghubungi server AI...";

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caption: captionInput.value,
        jumlahKomentar: Number(jumlahInput.value),
        frames
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Analisis gagal.");
    }

    ringkasan.replaceChildren();

    const bagian = [
      ["Ringkasan", data.analysis?.summary],
      ["Kelebihan", data.analysis?.strengths],
      ["Kekurangan", data.analysis?.weaknesses],
      ["Saran", data.analysis?.suggestions]
    ];

    bagian.forEach(([judul, isi]) => {
      if (!isi) return;

      const box = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = judul + ": ";
      box.append(strong, document.createTextNode(
        Array.isArray(isi) ? isi.join(", ") : isi
      ));
      ringkasan.appendChild(box);
    });

    komentarEl.replaceChildren();

    (data.comments || []).forEach((item) => {
      const box = document.createElement("div");
      box.className = "comment";

      const nama = document.createElement("strong");
      nama.textContent = item.type || "Komentar simulasi";

      const isi = document.createElement("p");
      isi.textContent = item.text || "";

      box.append(nama, isi);
      komentarEl.appendChild(box);
    });

    hasil.hidden = false;
    statusEl.textContent = "Analisis selesai! 🚀";

  } catch (error) {
    statusEl.textContent =
      "Belum berhasil: " + error.message +
      " Pastikan server AI sudah aktif.";
  } finally {
    tombol.disabled = false;
  }
});

async function ambilFrame(video, maksimal) {
  if (video.readyState < 2) {
    await new Promise((resolve, reject) => {
      video.addEventListener("loadeddata", resolve, { once: true });
      video.addEventListener("error", reject, { once: true });
    });
  }

  const durasi = video.duration;

  if (!Number.isFinite(dur
