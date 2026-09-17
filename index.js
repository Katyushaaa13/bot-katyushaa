import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import readline from 'readline';
import commandHandler from './handler/commandhandler.js';
import { config } from './config.js';

const { prefix, autoRead } = config;

let isPairing = false;

// Fungsi untuk tanya nomor di terminal
function tanyaNomor() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    console.log('\n=======================================');
    console.log('   MASUKKAN NOMOR WHATSAPP BOT');
    console.log('=======================================');
    console.log('Format: kode negara tanpa + dan tanpa 0 di depan');
    console.log('Contoh: 6281234567890');
    console.log('=======================================\n');

    rl.question('Nomor Bot: ', (jawaban) => {
      rl.close();
      const nomor = jawaban.replace(/[^0-9]/g, '');
      resolve(nomor);
    });
  });
}

async function startBot(nomorBot) {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['WormBot', 'Chrome', '120.0.0.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  // Request pairing code jika belum login
  if (!sock.authState.creds.registered) {
    isPairing = true;
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(nomorBot);
        console.log('\n=======================================');
        console.log('   PAIRING CODE KAMU: ' + code);
        console.log('=======================================');
        console.log('Cara pakai:');
        console.log('1. Buka WhatsApp di HP');
        console.log('2. Settings > Perangkat Tertaut > Tautkan Perangkat');
        console.log('3. Pilih "Tautkan dengan nomor telepon"');
        console.log('4. Masukkan kode di atas');
        console.log('=======================================\n');
      } catch (err) {
        console.error('Gagal request pairing code:', err.message);
      }
    }, 5000);
  }

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      if (isPairing) {
        console.log('⚠️ Koneksi terputus saat pairing. Jalankan ulang bot.');
        return;
      }
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        console.log('🔄 Reconnect...');
        startBot(nomorBot);
      } else {
        console.log('🚪 Logout.');
      }
    } else if (connection === 'open') {
      console.log('✅ Bot connected!');
      isPairing = false;
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
      console.error('❌ Error:', error.message);
    }
  });
}

// ========== MAIN ==========
(async () => {
  const nomorBot = await tanyaNomor();
  if (!nomorBot || nomorBot.length < 10) {
    console.log('❌ Nomor tidak valid. Jalankan ulang bot.');
    process.exit(1);
  }
  console.log(`\n✅ Nomor bot: ${nomorBot}`);
  console.log('⏳ Menghubungkan ke WhatsApp...\n');
  startBot(nomorBot);
})();
