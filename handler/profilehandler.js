import db from '../utils/database.js';

export default async function profileHandler(sock, msg, command, args, sender, isGroup, pushName) {
  // Ambil ID user asli (jika di grup, pakai participant; jika private, pakai sender)
  const userJid = isGroup ? msg.key.participant : sender;
  
  // Inisialisasi data user
  if (!db.data.users) db.data.users = {};
  if (!db.data.users[userJid]) db.data.users[userJid] = {};
  const userData = db.data.users[userJid];

  switch (command) {
    case 'profile': {
      // === BUAT TEKS PROFIL ===
      let text = `👤 Profil : ${pushName}\n`;
      text += `📱 Nomor : ${userJid.split('@')[0]}\n`;
      text += `📛 Nama : ${userData.name || pushName}\n`;
      text += `🎂 Umur : ${userData.age || 'Belum diisi'}\n`;
      text += `⚧ Gender : ${userData.gender || 'Belum diisi'}\n`;
      text += `📝 Bio : ${userData.bio || 'Kosong'}\n`;
      text += `⭐ Level : ${userData.level || 1}\n`;
      text += `🎯 Limit : ${userData.limit || 20}`;

      // === COBA KIRIM GAMBAR PROFIL + TEKS ===
      try {
        const ppUrl = await sock.profilePictureUrl(userJid, 'image');
        await sock.sendMessage(sender, {
          image: { url: ppUrl },
          caption: text
        });
        console.log(`✅ Profil dikirim dengan gambar untuk ${pushName} (${isGroup ? 'grup' : 'private'})`);
      } catch {
        // Jika gagal ambil foto, kirim teks saja
        await sock.sendMessage(sender, { text });
        console.log(`⚠️ Profil dikirim tanpa gambar (${pushName})`);
      }
      break;
    }

    case 'setname': {
      if (!args) return sock.sendMessage(sender, { text: 'Masukkan nama baru.' });
      userData.name = args;
      db.data.users[userJid] = userData;
      db.save();
      await sock.sendMessage(sender, { text: `Nama diubah menjadi: ${args}` });
      break;
    }

    case 'setage': {
      if (!args || isNaN(args)) return sock.sendMessage(sender, { text: 'Masukkan umur (angka).' });
      userData.age = parseInt(args);
      db.data.users[userJid] = userData;
      db.save();
      await sock.sendMessage(sender, { text: `Umur diset: ${args}` });
      break;
    }

    case 'setgender': {
      const gender = args.toLowerCase();
      if (!['laki-laki', 'perempuan', 'non-binary'].includes(gender)) {
        return sock.sendMessage(sender, { text: 'Pilih: laki-laki, perempuan, non-binary' });
      }
      userData.gender = gender;
      db.data.users[userJid] = userData;
      db.save();
      await sock.sendMessage(sender, { text: `Gender diset: ${gender}` });
      break;
    }

    case 'setbio': {
      if (!args) return sock.sendMessage(sender, { text: 'Masukkan bio baru.' });
      userData.bio = args;
      db.data.users[userJid] = userData;
      db.save();
      await sock.sendMessage(sender, { text: `Bio diset: ${args}` });
      break;
    }

    case 'afk': {
      const reason = args || 'Sedang AFK';
      db.data.afk[userJid] = { reason, time: Date.now() };
      db.save();
      await sock.sendMessage(sender, { text: `✅ Kamu AFK: ${reason}` });
      break;
    }

    case 'level': {
      const level = userData.level || 1;
      const exp = userData.exp || 0;
      const nextExp = level * 100;
      await sock.sendMessage(sender, { text: `Level: ${level}\nExp: ${exp}/${nextExp}` });
      break;
    }

    case 'getpp': {
      try {
        const pp = await sock.profilePictureUrl(userJid, 'image');
        await sock.sendMessage(sender, { image: { url: pp }, caption: 'Foto profil kamu.' });
      } catch {
        await sock.sendMessage(sender, { text: 'Tidak dapat mengambil foto profil.' });
      }
      break;
    }

    default: {
      await sock.sendMessage(sender, { text: `Fitur profil .${command} belum diimplementasikan.` });
    }
  }
}