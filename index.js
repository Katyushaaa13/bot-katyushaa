import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import commandHandler from './handler/commandhandler.js';
import { config } from './config.js';

const { prefix, autoRead } = config;

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'info' }),
    printQRInTerminal: true, // biar QR muncul otomatis
    browser: ['WormBot', 'Chrome', '120.0.0.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('📱 Scan QR Code:');
      qrcode.generate(qr, { small: true });
      reconnectAttempts = 0; // reset jika QR baru
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const isLoggedOut = statusCode === DisconnectReason.loggedOut;

      if (isLoggedOut) {
        console.log('🚪 Logout permanen. Hapus auth_info dan scan ulang.');
        return;
      }

      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`🔄 Reconnect attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}...`);
        setTimeout(startBot, 3000);
      } else {
        console.log('❌ Gagal reconnect setelah beberapa kali. Restart manual.');
        process.exit(1);
      }
    } else if (connection === 'open') {
      console.log('✅ Bot connected!');
      reconnectAttempts = 0;
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const msg = messages[0];
      if (!msg.message || msg.key.fromMe) return;

      const sender = msg.key.remoteJid;
      const isGroup = sender.endsWith('@g.us');
      const pushName = msg.pushName || 'User';

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

      await commandHandler(sock, msg, command, fullArgs, sender, isGroup, pushName);
    } catch (error) {
      console.error('❌ Error:', error);
    }
  });
}

startBot();