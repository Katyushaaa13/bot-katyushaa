import db from '../utils/database.js';

export default async function profileHandler(sock, msg, command, args, sender, isGroup, pushName) {
  const reply = (text) => sock.sendMessage(sender, { text }, { quoted: msg });
  const userJid = isGroup ? msg.key.participant : sender;

  if (!db.data.users) db.data.users = {};
  if (!db.data.users[userJid]) db.data.users[userJid] = {};
  const userData = db.data.users[userJid];

  try {
    switch (command) {
      case 'profile':
      case 'p': {
        let text = `👤 Profil ${pushName}\n`;
        text += `📱 Nomor: ${userJid.split('@')[0]}\n`;
        text += `📛 Nama: ${userData.name || pushName}\n`;
        text += `🎂 Umur: ${userData.age || 'Belum diisi'}\n`;
        text += `⚧ Gender: ${userData.gender || 'Belum diisi'}\n`;
        text += `📝 Bio: ${userData.bio || 'Kosong'}\n`;
        text += `⭐ Level: ${userData.level || 1}\n`;
        text += `🎯 Limit: ${userData.limit || 20}`;
        try {
          const ppUrl = await sock.profilePictureUrl(userJid, 'image');
          await sock.sendMessage(sender, { image: { url: ppUrl }, caption: text }, { quoted: msg });
        } catch {
          await reply(text);
        }
        break;
      }
      case 'setname': {
        if (!args) return reply('Masukkan nama baru.');
        userData.name = args;
        db.data.users[userJid] = userData;
        db.save();
        await reply(`Nama diubah menjadi: ${args}`);
        break;
      }
      case 'setage': {
        if (!args || isNaN(args)) return reply('Masukkan umur (angka).');
        userData.age = parseInt(args);
        db.data.users[userJid] = userData;
        db.save();
        await reply(`Umur diset: ${args}`);
        break;
      }
      case 'setgender': {
        const gender = args.toLowerCase();
        if (!['laki-laki', 'perempuan', 'non-binary'].includes(gender)) return reply('Pilih: laki-laki, perempuan, non-binary');
        userData.gender = gender;
        db.data.users[userJid] = userData;
        db.save();
        await reply(`Gender diset: ${gender}`);
        break;
      }
      case 'setbio': {
        if (!args) return reply('Masukkan bio baru.');
        userData.bio = args;
        db.data.users[userJid] = userData;
        db.save();
        await reply(`Bio diset: ${args}`);
        break;
      }
      case 'afk': {
        const reason = args || 'Sedang AFK';
        db.data.afk[userJid] = { reason, time: Date.now() };
        db.save();
        await reply(`✅ Kamu AFK: ${reason}`);
        break;
      }
      case 'level': {
        const level = userData.level || 1;
        const exp = userData.exp || 0;
        await reply(`Level: ${level}\nExp: ${exp}/${level * 100}`);
        break;
      }
      case 'getpp': {
        try {
          const pp = await sock.profilePictureUrl(userJid, 'image');
          await sock.sendMessage(sender, { image: { url: pp }, caption: 'Foto profil kamu.' }, { quoted: msg });
        } catch {
          await reply('Tidak dapat mengambil foto profil.');
        }
        break;
      }
      default:
        await reply(`Fitur profil .${command} belum diimplementasikan.`);
    }
  } catch (error) {
    await reply(`Error: ${error.message}`);
  }
}
