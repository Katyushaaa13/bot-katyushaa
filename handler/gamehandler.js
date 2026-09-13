import db from '../utils/database.js';

const games = {
  tebakgambar: { soal: 'Hewan apa yang memiliki belalai?', jawaban: 'gajah' },
  tebakkata: { soal: 'Hewan yang bisa terbang dan suka makan pisang?', jawaban: 'kelelawar' },
  tebakbendera: { soal: 'Bendera merah putih dengan bintang?', jawaban: 'vietnam' },
};

export default async function (sock, msg, command, args, sender, isGroup, pushName) {
  const userId = sender;

  if (['tebakgambar', 'tebakkata', 'tebakbendera'].includes(command)) {
    const game = games[command];
    if (!game) return sock.sendMessage(sender, { text: 'Game tidak ditemukan.' });

    const question = game.soal;
    const answer = game.jawaban;

    db.data.games[userId] = { command, answer, timestamp: Date.now() };
    db.write(); // ← tanpa await

    await sock.sendMessage(sender, { text: `🎮 ${question}\nKetik jawaban dalam 30 detik.` });
  } else if (command === 'leaderboard') {
    await sock.sendMessage(sender, { text: 'Leaderboard belum diimplementasikan.' });
  } else {
    await sock.sendMessage(sender, { text: `Game ${command} belum diimplementasikan.` });
  }
}