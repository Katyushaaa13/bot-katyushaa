import fetch from 'node-fetch';

export default async function funHandler(sock, msg, command, args, sender, isGroup, pushName) {
  const reply = (text) => sock.sendMessage(sender, { text }, { quoted: msg });

  try {
    switch (command) {
      case 'dadu': {
        const dadu = Math.floor(Math.random() * 6) + 1;
        await reply(`🎲 Hasil dadu: ${dadu}`);
        break;
      }
      case 'koin': {
        const koin = Math.random() < 0.5 ? 'Kepala' : 'Ekor';
        await reply(`🪙 Hasil lempar koin: ${koin}`);
        break;
      }
      case 'meme': {
        const res = await fetch('https://meme-api.com/gimme');
        const data = await res.json();
        await sock.sendMessage(sender, { image: { url: data.url }, caption: `${data.title}\n👍 ${data.ups}` }, { quoted: msg });
        break;
      }
      case 'reaction': {
        const reactions = ['😂', '😍', '🔥', '🥶', '🤯', '👏', '💀', '🗿'];
        const react = reactions[Math.floor(Math.random() * reactions.length)];
        await reply(`Reaction: ${react}`);
        break;
      }
      case 'roast': {
        const roasts = [
          'Kamu seperti WiFi di kamar mandi – sinyal lemah dan tidak berguna.',
          'Otakmu seperti Google Chrome – 80% penuh dengan sampah.',
          'Kamu adalah alasan kenapa shampoo ada petunjuk pemakaian.',
        ];
        const roast = roasts[Math.floor(Math.random() * roasts.length)];
        await reply(roast);
        break;
      }
      case 'ship': {
        if (!args) return reply('Masukkan dua nama (contoh: .ship Bakekok Cukurukuk)');
        const names = args.split(' ');
        if (names.length < 2) return reply('Masukkan dua nama.');
        const shipPercent = Math.floor(Math.random() * 101);
        await reply(`💕 ${names[0]} + ${names[1]} = ${shipPercent}% cocok!`);
        break;
      }
      case 'suit': {
        if (!args) return reply('Pilih: batu, kertas, gunting');
        const pilihan = args.toLowerCase();
        const valid = ['batu', 'kertas', 'gunting'];
        if (!valid.includes(pilihan)) return reply('Pilih batu/kertas/gunting.');
        const botChoice = valid[Math.floor(Math.random() * 3)];
        let result = '';
        if (pilihan === botChoice) result = 'Seri!';
        else if ((pilihan === 'batu' && botChoice === 'gunting') || (pilihan === 'kertas' && botChoice === 'batu') || (pilihan === 'gunting' && botChoice === 'kertas')) result = 'Kamu menang!';
        else result = 'Bot menang!';
        await reply(`Kamu: ${pilihan}\nBot: ${botChoice}\nHasil: ${result}`);
        break;
      }
      default:
        await reply(`Fitur fun .${command} belum diimplementasikan.`);
    }
  } catch (error) {
    await reply(`Error: ${error.message}`);
  }
}
