import db from '../utils/database.js';

export default async function groupHandler(sock, msg, command, args, sender, isGroup, pushName) {
  if (!isGroup) return sock.sendMessage(sender, { text: 'Command ini hanya untuk grup.' });

  try {
    const groupId = sender;
    const metadata = await sock.groupMetadata(groupId);
    const isAdmin = metadata.participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));

    if (!db.data.groups) db.data.groups = {};
    if (!db.data.groups[groupId]) db.data.groups[groupId] = {};

    const groupData = db.data.groups[groupId];

    switch (command) {
      case 'antilink': {
        if (!isAdmin) return sock.sendMessage(groupId, { text: 'Hanya admin.' });
        if (args !== 'on' && args !== 'off') return sock.sendMessage(groupId, { text: 'Gunakan: .antilink on/off' });
        groupData.antiLink = (args === 'on');
        db.write(); // ← tanpa await
        await sock.sendMessage(groupId, { text: `Anti-link ${args === 'on' ? 'aktif' : 'nonaktif'}.` });
        break;
      }
      case 'set-welcome': {
        if (!isAdmin) return sock.sendMessage(groupId, { text: 'Hanya admin.' });
        if (!args) return sock.sendMessage(groupId, { text: 'Masukkan pesan welcome.' });
        groupData.welcome = args;
        db.write();
        await sock.sendMessage(groupId, { text: 'Welcome message diset.' });
        break;
      }
      case 'welcome': {
        if (!isAdmin) return sock.sendMessage(groupId, { text: 'Hanya admin.' });
        if (args !== 'on' && args !== 'off') return sock.sendMessage(groupId, { text: 'Gunakan: .welcome on/off' });
        groupData.welcomeEnabled = (args === 'on');
        db.write();
        await sock.sendMessage(groupId, { text: `Welcome ${args === 'on' ? 'aktif' : 'nonaktif'}.` });
        break;
      }
      // Semua case lain yang menggunakan db.write() juga diubah
      // ... (saya singkat, tapi semua db.write() tanpa await)
      default: {
        await sock.sendMessage(groupId, { text: `Fitur grup untuk command .${command} belum diimplementasikan.` });
      }
    }
  } catch (error) {
    console.error('Error di groupHandler:', error);
    await sock.sendMessage(sender, { text: `Terjadi error: ${error.message}` });
  }
}