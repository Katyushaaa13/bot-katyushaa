import db from '../utils/database.js';
import { config } from '../config.js';

export default async function ownerHandler(sock, msg, command, args, sender, isGroup, pushName) {
  const reply = (text) => sock.sendMessage(sender, { text }, { quoted: msg });

  try {
    switch (command) {
      case 'owner': {
        const ownerJid = config.owner[0]; // contoh: 6281373489155@s.whatsapp.net
        const ownerNumber = ownerJid.split('@')[0];

        // Kirim kartu kontak
        await sock.sendMessage(sender, {
          contacts: {
            displayName: 'Ktyshaa Bot Owner',
            contacts: [
              { vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Ktyshaa bot owner\nTEL;type=CELL;type=VOICE;waid=${ownerNumber}:+${ownerNumber}\nEND:VCARD` }
            ]
          }
        }, { quoted: msg });
        break;
      }

      case 'banlist': {
        const banned = db.data.bans || [];
        if (banned.length === 0) return reply('Tidak ada user yang di-ban.');
        const list = banned.map((id, i) => `${i + 1}. ${id.split('@')[0]}`).join('\n');
        await reply(`📋 Daftar Ban:\n${list}`);
        break;
      }

      case 'setbotname': {
        if (!args) return reply('Masukkan nama bot baru.');
        db.data.settings.botName = args;
        db.save();
        await reply(`Nama bot diubah menjadi: ${args}`);
        break;
      }

      default:
        await reply(`Command owner .${command} belum diimplementasikan.`);
    }
  } catch (error) {
    await reply(`Error: ${error.message}`);
  }
}
