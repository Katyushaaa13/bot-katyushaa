import QRCode from 'qrcode';
import translate from 'translate-google';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function toolsHandler(sock, msg, command, args, sender, isGroup, pushName) {
  const reply = (text) => sock.sendMessage(sender, { text }, { quoted: msg });

  try {
    switch (command) {
      // ============ STICKER ============
      case 'sticker':
      case 's': {
        const isImage = msg.message.imageMessage;
        const isVideo = msg.message.videoMessage;

        if (!isImage && !isVideo) {
          return reply('Kirim gambar/video dengan caption .sticker');
        }

        const media = await downloadMediaMessage(
          msg,
          'buffer',
          {},
          {
            logger: console,
            reuploadRequest: sock.updateMediaMessage,
          }
        );

        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const ext = isImage ? 'jpg' : 'mp4';
        const tempFile = path.join(tempDir, `sticker_${Date.now()}.${ext}`);
        fs.writeFileSync(tempFile, media);

        try {
          await sock.sendMessage(sender, { sticker: media }, { quoted: msg });
        } catch (err) {
          if (isImage) {
            await sock.sendMessage(sender, { image: media, caption: 'Sticker gagal, ini gambarnya.' }, { quoted: msg });
          } else {
            await sock.sendMessage(sender, { video: media, caption: 'Sticker gagal, ini videonya.' }, { quoted: msg });
          }
        }

        try { fs.unlinkSync(tempFile); } catch {}
        break;
      }

      // ============ QR ============
      case 'qr': {
        if (!args) return reply('Masukkan teks untuk QR.');
        const qrBuffer = await QRCode.toBuffer(args);
        await sock.sendMessage(sender, { image: qrBuffer, caption: `QR: ${args}` }, { quoted: msg });
        break;
      }

      // ============ TRANSLATE ============
      case 'translate':
      case 'tr': {
        if (!args) return reply('Format: .translate [kode_bahasa] [teks]');
        const parts = args.split(' ');
        const lang = parts[0];
        const text = parts.slice(1).join(' ');
        if (!text) return reply('Masukkan teks.');
        try {
          const translated = await translate(text, { to: lang });
          await reply(`Terjemahan (${lang}):\n${translated}`);
        } catch {
          await reply('Gagal menerjemahkan. Periksa kode bahasa.');
        }
        break;
      }

      // ============ BASE64 ============
      case 'base64':
      case 'b64': {
        if (!args) return reply('Masukkan teks.');
        const encoded = Buffer.from(args).toString('base64');
        await reply(`Base64: ${encoded}`);
        break;
      }

      // ============ UPPER ============
      case 'upper': {
        if (!args) return reply('Masukkan teks.');
        await reply(args.toUpperCase());
        break;
      }

      // ============ LOWER ============
      case 'lower': {
        if (!args) return reply('Masukkan teks.');
        await reply(args.toLowerCase());
        break;
      }

      // ============ SSWEB ============
      case 'ssweb':
      case 'ss': {
        if (!args) return reply('Masukkan URL.');
        const ssUrl = `https://api.apiflash.com/v1/urltoimage?access_key=demo&url=${encodeURIComponent(args)}&width=1280`;
        await sock.sendMessage(sender, { image: { url: ssUrl }, caption: `Screenshot: ${args}` }, { quoted: msg });
        break;
      }

      // ============ TTS ============
      case 'tts': {
        if (!args) return reply('Masukkan teks.');
        const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(args)}&tl=id&client=tw-ob`;
        await sock.sendMessage(sender, { audio: { url: audioUrl }, mimetype: 'audio/mp4' }, { quoted: msg });
        break;
      }

      // ============ EMOJIMIX ============
      case 'emojimix':
      case 'emix': {
        if (!args || args.length < 2) return reply('Masukkan dua emoji.');
        await reply(`Emoji mix: ${args}`);
        break;
      }

      // ============ CALCULATOR ============
      case 'calculator':
      case 'calc': {
        if (!args) return reply('Masukkan operasi (contoh: 5+3*2)');
        try {
          const result = Function(`"use strict"; return (${args})`)();
          await reply(`Hasil: ${result}`);
        } catch {
          await reply('Operasi tidak valid.');
        }
        break;
      }

      // ============ DELETE PESAN ============
      case 'delete':
      case 'del': {
        const contextInfo = msg.message.extendedTextMessage?.contextInfo;
        if (!contextInfo || !contextInfo.stanzaId) {
          return reply('Reply pesan yang mau dihapus, lalu ketik .del');
        }

        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const targetKey = {
          remoteJid: sender,
          fromMe: contextInfo.participant === botNumber,
          id: contextInfo.stanzaId,
          participant: contextInfo.participant,
        };

        try {
          await sock.sendMessage(sender, { delete: targetKey });
          await reply('✅ Pesan dihapus.');
        } catch (err) {
          await reply(`❌ Gagal hapus: ${err.message}`);
        }
        break;
      }

      default:
        await reply(`Fitur tools .${command} belum diimplementasikan.`);
    }
  } catch (error) {
    console.error('Error toolshandler:', error);
    await reply(`❌ Error: ${error.message}`);
  }
}
