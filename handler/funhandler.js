import fetch from 'node-fetch';

export default async function (sock, msg, command, args, sender, isGroup, pushName) {
  switch (command) {
    case 'dadu': {
      const dadu = Math.floor(Math.random() * 6) + 1;
      await sock.sendMessage(sender, { text: `🎲 Hasil dadu: ${dadu}` });
      break;
    }

    case 'koin': {
      const koin = Math.random() < 0.5 ? 'Kepala' : 'Ekor';
      await sock.sendMessage(sender, { text: `🪙 Hasil lempar koin: ${koin}` });
      break;
    }

    case 'meme': {
      try {
        const res = await fetch('https://meme-api.com/gimme');
        const data = await res.json();
        await sock.sendMessage(sender, { image: { url: data.url }, caption: `${data.title}\n👍 ${data.ups}` });
      } catch {
        await sock.sendMessage(sender, { text: 'Gagal mengambil meme.' });
      }
      break;
    }

    case 'reaction': {
      const reactions = ['😂', '😍', '🔥', '🥶', '🤯', '👏', '💀', '🗿'];
      const react = reactions[Math.floor(Math.random() * reactions.length)];
      await sock.sendMessage(sender, { text: `Reaction: ${react}` });
      break;
    }

    case 'roast': {
      const roasts = [
        'Kamu seperti WiFi di kamar mandi – sinyal lemah dan tidak berguna.',
        'Otakmu seperti Google Chrome – 80% penuh dengan sampah.',
        'Kamu adalah alasan kenapa shampoo ada petunjuk pemakaian.',
      ];
      const roast = roasts[Math.floor(Math.random() * roasts.length)];
      await sock.sendMessage(sender, { text: roast });
      break;
    }

    case 'ship': {
      if (!args) return sock.sendMessage(sender, { text: 'Masukkan dua nama (contoh: .ship A B)' });
      const names = args.split(' ');
      if (names.length < 2) return sock.sendMessage(sender, { text: 'Masukkan dua nama.' });
      const shipPercent = Math.floor(Math.random() * 101);
      await sock.sendMessage(sender, { text: `💕 ${names[0]} + ${names[1]} = ${shipPercent}% cocok!` });
      break;
    }

    case 'suit': {
      if (!args) return sock.sendMessage(sender, { text: 'Pilih: batu, kertas, gunting' });
      const pilihan = args.toLowerCase();
      const valid = ['batu', 'kertas', 'gunting'];
      if (!valid.includes(pilihan)) return sock.sendMessage(sender, { text: 'Pilih batu/kertas/gunting.' });
      const botChoice = valid[Math.floor(Math.random() * 3)];
      let result = '';
      if (pilihan === botChoice) result = 'Seri!';
      else if (
        (pilihan === 'batu' && botChoice === 'gunting') ||
        (pilihan === 'kertas' && botChoice === 'batu') ||
        (pilihan === 'gunting' && botChoice === 'kertas')
      ) result = 'Kamu menang!';
      else result = 'Bot menang!';
      await sock.sendMessage(sender, { text: `Kamu: ${pilihan}\nBot: ${botChoice}\nHasil: ${result}` });
      break;
    }

    default: {
      await sock.sendMessage(sender, { text: `Fungsi fun untuk command .${command} belum diimplementasikan.` });
    }
  }
}