import db from '../utils/database.js';

export default async function groupHandler(sock, msg, command, args, sender, isGroup, pushName) {
  if (!isGroup) return sock.sendMessage(sender, { text: 'Command ini hanya untuk grup.' });

  try {
    const groupId = sender;
    const metadata = await sock.groupMetadata(groupId);

    const senderIds = new Set();
    senderIds.add(sender);
    if (msg.key.participant) senderIds.add(msg.key.participant);
    if (msg.key.participantPn) senderIds.add(msg.key.participantPn);

    const participant = metadata.participants.find(p => {
      const ids = [p.id, p.lid, p.phoneNumber, p.participantPn].filter(Boolean);
      return ids.some(id => senderIds.has(id));
    });

    const isAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');

    if (!db.data.groups) db.data.groups = {};
    if (!db.data.groups[groupId]) db.data.groups[groupId] = {};
    const groupData = db.data.groups[groupId];

    // === TARGET: dari mention, reply, atau nomor ===
    const getTarget = () => {
      const ctx = msg.message.extendedTextMessage?.contextInfo;
      if (ctx?.mentionedJid?.[0]) return ctx.mentionedJid[0];
      if (ctx?.participant) return ctx.participant;
      if (args) {
        const nomor = args.replace(/[^0-9]/g, '');
        if (nomor.length >= 10) return nomor + '@s.whatsapp.net';
      }
      return null;
    };

    switch (command) {
      case 'tagall':
      case 'ta': {
        if (!isAdmin) return sock.sendMessage(groupId, { text: 'Hanya admin.' });
        const mentions = metadata.participants.map(p => p.id);
        const pesanTambahan = args ? `\n\nPesan: ${args}` : '';
        let text = `📢 *TAG ALL*${pesanTambahan}\n\n`;
        metadata.participants.forEach((p, i) => { text += `${i + 1}. @${p.id.split('@')[0]}\n`; });
        await sock.sendMessage(groupId, { text, mentions });
        break;
      }

      case 'hidetag':
      case 'ht': {
        if (!isAdmin) return sock.sendMessage(groupId, { text: 'Hanya admin.' });
        if (!args) return sock.sendMessage(groupId, { text: 'Masukkan pesan.' });
        const mentions = metadata.participants.map(p => p.id);
        await sock.sendMessage(groupId, { text: args, mentions });
        break;
      }

      case 'promote':
      case 'prom': {
        if (!isAdmin) return sock.sendMessage(groupId, { text: 'Hanya admin.' });
        const target = getTarget();
        if (!target) return sock.sendMessage(groupId, { text: 'Tag, reply, atau masukkan nomor target.' });
        await sock.groupParticipantsUpdate(groupId, [target], 'promote');
        await sock.sendMessage(groupId, { text: `✅ @${target.split('@')[0]} dipromote.`, mentions: [target] });
        break;
      }

      case 'demote':
      case 'dem': {
        if (!isAdmin) return sock.sendMessage(groupId, { text: 'Hanya admin.' });
        const target = getTarget();
        if (!target) return sock.sendMessage(groupId, { text: 'Tag, reply, atau masukkan nomor target.' });
        await sock.groupParticipantsUpdate(groupId, [target], 'demote');
        await sock.sendMessage(groupId, { text: `⬇️ @${target.split('@')[0]} didemote.`, mentions: [target] });
        break;
      }

      case 'kick':
      case 'k':
      case 'remove': {
        if (!isAdmin) return sock.sendMessage(groupId, { text: 'Hanya admin.' });
        const target = getTarget();
        if (!target) return sock.sendMessage(groupId, { text: 'Tag, reply, atau masukkan nomor target.' });
        if (target === sender || target === msg.key.participant) {
          return sock.sendMessage(groupId, { text: 'Tidak bisa kick diri sendiri.' });
        }
        await sock.groupParticipantsUpdate(groupId, [target], 'remove');
        await sock.sendMessage(groupId, { text: `❌ @${target.split('@')[0]} telah di-kick.`, mentions: [target] });
        break;
      }

      case 'add': {
        if (!isAdmin) return sock.sendMessage(groupId, { text: 'Hanya admin.' });
        if (!args) return sock.sendMessage(groupId, { text: 'Masukkan nomor.' });
        const target = args.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        await sock.groupParticipantsUpdate(groupId, [target], 'add');
        await sock.sendMessage(groupId, { text: `✅ @${target.split('@')[0]} ditambahkan.`, mentions: [target] });
        break;
      }

      case 'linkgc': {
        if (!isAdmin) return sock.sendMessage(groupId, { text: 'Hanya admin.' });
        const code = await sock.groupInviteCode(groupId);
        await sock.sendMessage(groupId, { text: `🔗 Link grup:\nhttps://chat.whatsapp.com/${code}` });
        break;
      }

      case 'revoke': {
        if (!isAdmin) return sock.sendMessage(groupId, { text: 'Hanya admin.' });
        await sock.groupRevokeInvite(groupId);
        await sock.sendMessage(groupId, { text: '🔁 Link grup di-reset.' });
        break;
      }

      case 'open': {
        if (!isAdmin) return sock.sendMessage(groupId, { text: 'Hanya admin.' });
        await sock.groupSettingUpdate(groupId, 'unlock');
        await sock.sendMessage(groupId, { text: '🔓 Grup dibuka.' });
        break;
      }

      case 'close': {
        if (!isAdmin) return sock.sendMessage(groupId, { text: 'Hanya admin.' });
        await sock.groupSettingUpdate(groupId, 'lock');
        await sock.sendMessage(groupId, { text: '🔒 Grup ditutup.' });
        break;
      }

      case 'antilink': {
        if (!isAdmin) return sock.sendMessage(groupId, { text: 'Hanya admin.' });
        if (args !== 'on' && args !== 'off') return sock.sendMessage(groupId, { text: 'Gunakan: .antilink on/off' });
        groupData.antiLink = (args === 'on');
        db.save();
        await sock.sendMessage(groupId, { text: `Anti-link ${args === 'on' ? 'aktif' : 'nonaktif'}.` });
        break;
      }

      case 'welcome': {
        if (!isAdmin) return sock.sendMessage(groupId, { text: 'Hanya admin.' });
        if (args !== 'on' && args !== 'off') return sock.sendMessage(groupId, { text: 'Gunakan: .welcome on/off' });
        groupData.welcomeEnabled = (args === 'on');
        db.save();
        await sock.sendMessage(groupId, { text: `Welcome ${args === 'on' ? 'aktif' : 'nonaktif'}.` });
        break;
      }

      case 'set-welcome': {
        if (!isAdmin) return sock.sendMessage(groupId, { text: 'Hanya admin.' });
        if (!args) return sock.sendMessage(groupId, { text: 'Masukkan pesan. Gunakan @user dan @grup.' });
        groupData.welcome = args;
        db.save();
        await sock.sendMessage(groupId, { text: `✅ Welcome message diset:\n\n${args}` });
        break;
      }

      case 'set-goodbye': {
        if (!isAdmin) return sock.sendMessage(groupId, { text: 'Hanya admin.' });
        if (!args) return sock.sendMessage(groupId, { text: 'Masukkan pesan.' });
        groupData.goodbye = args;
        db.save();
        await sock.sendMessage(groupId, { text: `✅ Goodbye message diset:\n\n${args}` });
        break;
      }

      case 'groupinfo':
      case 'gi': {
        const info = await sock.groupMetadata(groupId);
        let text = `📋 *Info Grup*\n`;
        text += `Nama: ${info.subject}\n`;
        text += `ID: ${info.id}\n`;
        text += `Anggota: ${info.participants.length}\n`;
        text += `Dibuat: ${new Date(info.creation * 1000).toLocaleDateString('id-ID')}\n`;
        const admins = info.participants.filter(p => p.admin).map(p => '@' + p.id.split('@')[0]);
        text += `Admin: ${admins.join(', ') || 'Tidak ada'}`;
        await sock.sendMessage(groupId, { text, mentions: info.participants.filter(p => p.admin).map(p => p.id) });
        break;
      }

      case 'setsubject': {
        if (!isAdmin) return sock.sendMessage(groupId, { text: 'Hanya admin.' });
        if (!args) return sock.sendMessage(groupId, { text: 'Masukkan nama grup baru.' });
        await sock.groupUpdateSubject(groupId, args);
        await sock.sendMessage(groupId, { text: `📛 Nama grup diubah: ${args}` });
        break;
      }

      case 'setdesc': {
        if (!isAdmin) return sock.sendMessage(groupId, { text: 'Hanya admin.' });
        if (!args) return sock.sendMessage(groupId, { text: 'Masukkan deskripsi baru.' });
        await sock.groupUpdateDescription(groupId, args);
        await sock.sendMessage(groupId, { text: '📝 Deskripsi grup diubah.' });
        break;
      }

      case 'leave-group': {
        if (!isAdmin) return sock.sendMessage(groupId, { text: 'Hanya admin.' });
        await sock.sendMessage(groupId, { text: '👋 Bot keluar dari grup.' });
        await sock.groupLeave(groupId);
        break;
      }

      default:
        await sock.sendMessage(groupId, { text: `Fitur grup .${command} belum diimplementasikan.` });
    }
  } catch (error) {
    console.error('Error grouphandler:', error);
    await sock.sendMessage(sender, { text: `❌ Error: ${error.message}` });
  }
}
