import sticker from 'wa-sticker-formatter';
import QRCode from 'qrcode';
import translate from 'translate-google';

export default async function (sock, msg, command, args, sender, isGroup, pushName) {
  switch (command) {
    case 'sticker': {
      if (msg.message.imageMessage || msg.message.videoMessage) {
        const media = await sock.downloadMediaMessage(msg);
        const stk = await sticker(media, { pack: 'Katyushaa', author: 'X1Katyushaa' });
        await sock.sendMessage(sender, { sticker: stk });
      } else {
        await sock.sendMessage(sender, { text: 'Kirim gambar/video dengan caption .sticker' });
      }
      break;
    }

    case 'qr': {
      if (!args) return sock.sendMessage(sender, { text: 'Masukkan teks untuk QR.' });
      const qrBuffer = await QRCode.toBuffer(args);
      await sock.sendMessage(sender, { image: qrBuffer, caption: `QR: ${args}` });
      break;
    }

    case 'translate': {
      if (!args) return sock.sendMessage(sender, { text: 'Masukkan teks + kode bahasa (id/en/ja)' });
      const parts = args.split(' ');
      const lang = parts[0];
      const text = parts.slice(1).join(' ');
      if (!text) return sock.sendMessage(sender, { text: 'Masukkan teks yang akan diterjemahkan.' });
      try {
        const translated = await translate(text, { to: lang });
        await sock.sendMessage(sender, { text: `Terjemahan (${lang}):\n${translated}` });
      } catch {
        await sock.sendMessage(sender, { text: 'Gagal menerjemahkan. Periksa kode bahasa.' });
      }
      break;
    }

    case 'base64': {
      if (!args) return sock.sendMessage(sender, { text: 'Masukkan teks.' });
      const encoded = Buffer.from(args).toString('base64');
      await sock.sendMessage(sender, { text: `Base64: ${encoded}` });
      break;
    }

    case 'upper': {
      if (!args) return sock.sendMessage(sender, { text: 'Masukkan teks.' });
      await sock.sendMessage(sender, { text: args.toUpperCase() });
      break;
    }

    case 'lower': {
      if (!args) return sock.sendMessage(sender, { text: 'Masukkan teks.' });
      await sock.sendMessage(sender, { text: args.toLowerCase() });
      break;
    }

    case 'ssweb': {
      if (!args) return sock.sendMessage(sender, { text: 'Masukkan URL website.' });
      const screenshotUrl = `https://api.apiflash.com/v1/urltoimage?url=${encodeURIComponent(args)}&width=1920&height=1080`;
      await sock.sendMessage(sender, { image: { url: screenshotUrl }, caption: `Screenshot: ${args}` });
      break;
    }

    case 'tts': {
      if (!args) return sock.sendMessage(sender, { text: 'Masukkan teks.' });
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(args)}&tl=id&client=tw-ob`;
      await sock.sendMessage(sender, { audio: { url: audioUrl }, mimetype: 'audio/mp4' });
      break;
    }

    case 'emojimix': {
      if (!args || args.length < 2) return sock.sendMessage(sender, { text: 'Masukkan dua emoji (contoh: 😂😍)' });
      const emojis = args.trim();
      const mixUrl = `https://www.emojimix.com/api/emojis/${encodeURIComponent(emojis[0])}/${encodeURIComponent(emojis[1])}`;
      await sock.sendMessage(sender, { image: { url: mixUrl }, caption: `Emoji mix: ${emojis}` });
      break;
    }

    case 'calculator': {
      if (!args) return sock.sendMessage(sender, { text: 'Masukkan operasi (contoh: 5+3*2)' });
      try {
        const result = Function(`"use strict"; return (${args})`)();
        await sock.sendMessage(sender, { text: `Hasil: ${result}` });
      } catch {
        await sock.sendMessage(sender, { text: 'Operasi tidak valid.' });
      }
      break;
    }

    default: {
      await sock.sendMessage(sender, { text: `Fitur tools .${command} belum diimplementasikan.` });
    }
  }
}