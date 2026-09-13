import ytSearch from 'yt-search';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pastikan folder 'temp' untuk menyimpan lagu sementara sudah ada
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

export default async function youtubeHandler(sock, msg, command, args, sender, isGroup, pushName) {
  if (!args) return sock.sendMessage(sender, { text: 'Masukkan judul atau URL YouTube.' });

  try {
    // 1. Cari video di YouTube
    let videoUrl = args;
    let title = 'Audio';

    if (!args.startsWith('http')) {
      const searchResult = await ytSearch(args);
      if (!searchResult.videos.length) return sock.sendMessage(sender, { text: 'Lagu tidak ditemukan.' });
      videoUrl = searchResult.videos[0].url;
      title = searchResult.videos[0].title;
    }

    await sock.sendMessage(sender, { text: `Sedang memproses: *${title}*...` });

    // 2. Ambil link audio dari beberapa API (cadangan jika satu mati)
    let audioUrl = null;
    const apis = [
      `https://api.zenkey.my.id/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
      `https://api.ryzendesu.vip/api/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}`,
      `https://api.akuari.my.id/downloader/youtube?link=${encodeURIComponent(videoUrl)}`
    ];

    for (const api of apis) {
      try {
        const res = await fetch(api);
        const data = await res.json();
        // Cek berbagai kemungkinan format respons dari API
        audioUrl = data?.result?.download || data?.url || data?.result?.audio || data?.result?.link;
        if (audioUrl) {
            console.log(`Berhasil mendapatkan link dari: ${api}`);
            break;
        }
      } catch (e) {
        console.log(`API gagal: ${e.message}`);
      }
    }

    if (!audioUrl) throw new Error('Semua server API gagal memberikan link lagu');

    // 3. Download lagu ke laptop (buffer)
    const audioRes = await fetch(audioUrl);
    const arrayBuffer = await audioRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Simpan sebagai file sementara
    const filePath = path.join(tempDir, `${Date.now()}.mp3`);
    fs.writeFileSync(filePath, buffer);

    // 5. Kirim file lokal ke WhatsApp (jauh lebih stabil)
    await sock.sendMessage(sender, {
      audio: fs.readFileSync(filePath),
      mimetype: 'audio/mp4',
      fileName: `${title}.mp3`
    });

    // 6. Hapus file setelah berhasil dikirim
    fs.unlinkSync(filePath);
    console.log(`Berhasil mengirim lagu: ${title}`);

  } catch (error) {
    console.error('Error YouTube:', error.message);
    await sock.sendMessage(sender, { text: `Gagal memproses lagu. Server download sedang sibuk atau lagu diproteksi YouTube. Coba lagu lain.` });
  }
}