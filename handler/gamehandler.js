import db from '../utils/database.js';

const games = {
  tebakgambar: { soal: 'Hewan apa yang memiliki belalai?', jawaban: 'gajah' },
  tebakkata: { soal: 'Hewan yang bisa terbang dan suka makan pisang?', jawaban: 'kelelawar' },
  tebakbendera: { soal: 'Bendera merah putih dengan bintang?', jawaban: 'vietnam' },
  tebaklirik: { soal: 'Lirik: "And I will always love..."?', jawaban: 'you' },
  asahotak: { soal: 'Benda apa yang bisa naik tapi tidak bisa turun?', jawaban: 'umur' },
  caklontong: { soal: 'Ayam apa yang bisa jalan sendiri?', jawaban: 'ayam jago' },
  susunkata: { soal: 'Susun: K-A-T-A-A', jawaban: 'kata' },
  siapakahaku: { soal: 'Aku punya banyak gigi tapi tidak bisa menggigit?', jawaban: 'sisir' },
};

export default async function gameHandler(sock, msg, command, args, sender, isGroup, pushName) {
  const reply = (text) => sock.sendMessage(sender, { text }, { quoted: msg });
  const userId = sender;

  try {
    if (games[command]) {
      const game = games[command];
      db.data.games[userId] = { command, answer: game.jawaban, timestamp: Date.now() };
      db.save();
      await reply(`🎮 ${game.soal}\n\nKetik jawaban dalam 30 detik.`);
    } else if (command === 'leaderboard' || command === 'lb') {
      await reply('Leaderboard belum tersedia.');
    } else if (command === 'tictactoe' || command === 'ttt') {
      await reply('TicTacToe: Fitur sedang dikembangkan.');
    } else if (command === 'math') {
      const a = Math.floor(Math.random() * 100);
      const b = Math.floor(Math.random() * 100);
      db.data.games[userId] = { command: 'math', answer: (a + b).toString(), timestamp: Date.now() };
      db.save();
      await reply(`🧮 ${a} + ${b} = ?`);
    } else {
      await reply(`Game .${command} belum diimplementasikan.`);
    }
  } catch (error) {
    await reply(`Error: ${error.message}`);
  }
}
