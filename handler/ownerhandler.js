import db from '../utils/database.js';

export default async function ownerHandler(sock, msg, command, args, sender, isGroup, pushName) {
  switch (command) {
    case 'banlist': {
      const banned = db.data.bans || [];
      if (banned.length === 0) return sock.sendMessage(sender, { text: 'Tidak ada user yang di-ban.' });
      const list = banned.map((id, i) => `${i+1}. ${id.split('@')[0]}`).join('\n');
      await sock.sendMessage(sender, { text: `📋 Daftar Ban:\n${list}` });
      break;
    }
    default: {
      await sock.sendMessage(sender, { text: `Command owner .${command} belum diimplementasikan.` });
    }
  }
}