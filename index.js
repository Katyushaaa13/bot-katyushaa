import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import commandHandler from './handler/commandhandler.js';
import db from './utils/database.js';
import { config } from './config.js';

const { prefix, autoRead } = config;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false, // Kita tangani manual QR-nya
    browser: ['WormBot', 'Chrome', '120.0.0.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  // ================== CONNECTION & QR ==================
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    // Tampilkan QR di terminal jika belum login
    if (qr) {
      console.log('\n=======================================');
      console.log('   SCAN QR CODE DI WHATSAPP');
      console.log('=======================================');
      qrcode.generate(qr, { small: true });
      console.log('Cara pakai:');
      console.log('1. Buka WhatsApp di HP');
      console.log('2. Settings > Perangkat Tertaut > Tautkan Perangkat');
      console.log('3. Scan QR di atas');
      console.log('=======================================\n');
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        console.log('🔄 Koneksi terputus, mencoba reconnect...');
        startBot();
      } else {
        console.log('🚪 Logout. Hapus folder auth_info dan jalankan ulang.');
      }
    } else if (connection === 'open') {
      console.log('✅ Bot connected!');
    }
  });

  // ================== WELCOME & GOODBYE ==================
  sock.ev.on('group-participants.update', async (anu) => {
    try {
      const { id, participants, action } = anu;
      const metadata = await sock.groupMetadata(id);

      if (!db.data.groups) db.data.groups = {};
      const groupData = db.data.groups[id] || {};

      for (const participant of participants) {
        const userName = participant.split('@')[0];
        const groupName = metadata.subject;

        if (action === 'add' && groupData.welcomeEnabled) {
          let welcomeMsg = groupData.welcome || 'Selamat datang @user di grup @grup!';
          welcomeMsg = welcomeMsg.replace(/@user/g, `@${userName}`).replace(/@grup/g, groupName);
          await sock.sendMessage(id, { text: `👋 ${welcomeMsg}`, mentions: [participant] });
        }

        if (action === 'remove' && groupData.goodbyeEnabled !== false) {
          let goodbyeMsg = groupData.goodbye || 'Selamat tinggal @user 👋';
          goodbyeMsg = goodbyeMsg.replace(/@user/g, `@${userName}`).replace(/@grup/g, groupName);
          await sock.sendMessage(id, { text: `👋 ${goodbyeMsg}`, mentions: [participant] });
        }
      }
    } catch (error) {
      console.error('Error welcome/goodbye:', error.message);
    }
  });

  // ================== MESSAGES ==================
  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const msg = messages[0];
      if (!msg.message || msg.key.fromMe) return;

      const sender = msg.key.remoteJid;
      const isGroup = sender.endsWith('@g.us');
      const pushName = msg.pushName || 'User';

      // === SELF MODE CHECK ===
      if (config.selfMode) {
        const userJid = isGroup ? msg.key.participant : sender;
        if (!config.owner.includes(userJid)) {
          return; // abaikan pesan dari non-owner
        }
      }

      if (autoRead) await sock.readMessages([msg.key]);

      let body = '';
      if (msg.message.conversation) body = msg.message.conversation;
      else if (msg.message.extendedTextMessage?.text) body = msg.message.extendedTextMessage.text;
      else if (msg.message.imageMessage?.caption) body = msg.message.imageMessage.caption;
      else if (msg.message.videoMessage?.caption) body = msg.message.videoMessage.caption;
      else return;

      if (!body.startsWith(prefix)) return;

      const args = body.slice(prefix.length).trim().split(' ');
      const command = args.shift().toLowerCase();
      const fullArgs = args.join(' ');

      // === TOGGLE SELF MODE ===
      if (command === 'self') {
        const userJid = isGroup ? msg.key.participant : sender;
        if (!config.owner.includes(userJid)) return;
        config.selfMode = !config.selfMode;
        return sock.sendMessage(sender, {
          text: `Self mode ${config.selfMode ? 'AKTIF ✅ (hanya owner)' : 'NONAKTIF ❌ (semua orang)'}`
        }, { quoted: msg });
      }

      await commandHandler(sock, msg, command, fullArgs, sender, isGroup, pushName);
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  });
}

// ========== MAIN ==========
startBot();
