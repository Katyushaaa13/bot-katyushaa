import aihandler from './aihandler.js';
import downloaderhandler from './downloaderhandler.js';
import funhandler from './funhandler.js';
import gamehandler from './gamehandler.js';
import grouphandler from './grouphandler.js';
import menuhandler from './menuHandler.js';
import ownerhandler from './ownerhandler.js';
import profilehandler from './profilehandler.js';
import searchhandler from './searchhandler.js';
import toolshandler from './toolshandler.js';
import youtubehandler from './youtubehandler.js';
import db from '../utils/database.js';
import { config } from '../config.js';

const { prefix, owner, skipImageCommands } = config;

export default async function commandHandler(sock, msg, command, args, sender, isGroup, pushName) {
  // Cek ban
  if (db.data.bans && db.data.bans.includes(sender)) {
    return sock.sendMessage(sender, { text: 'Kamu di-ban dari bot ini.' });
  }

  // Owner-only commands
  const ownerOnly = ['banlist', 'reset-ai', 'reset-ai-group', 'setbotname', 'setbotowner', 'setpp', 'jadibot', 'scanbot', 'broadcast'];
  if (ownerOnly.includes(command) && !owner.includes(sender)) {
    return sock.sendMessage(sender, { text: 'Command ini khusus owner.' });
  }

  const commandMap = {
    'menu': menuhandler,
    'help': menuhandler,
    'ai': aihandler,
    'aichara': aihandler,
    'deepseek': aihandler,
    'gemini': aihandler,
    'gemma': aihandler,
    'gpt': aihandler,
    'llm': aihandler,
    'qwen': aihandler,
    'reset-ai': aihandler,
    'reset-ai-group': aihandler,
    'tiktok': downloaderhandler,
    'ytmp3': downloaderhandler,
    'ytmp4': downloaderhandler,
    'instagram': downloaderhandler,
    'facebook': downloaderhandler,
    'dadu': funhandler,
    'koin': funhandler,
    'meme': funhandler,
    'reaction': funhandler,
    'roast': funhandler,
    'ship': funhandler,
    'suit': funhandler,
    'tebakgambar': gamehandler,
    'tebakkata': gamehandler,
    'tebakbendera': gamehandler,
    'leaderboard': gamehandler,
    'tagall': grouphandler,
    'hidetag': grouphandler,
    'promote': grouphandler,
    'demote': grouphandler,
    'add': grouphandler,
    'remove': grouphandler,
    'linkgc': grouphandler,
    'revoke': grouphandler,
    'open': grouphandler,
    'close': grouphandler,
    'antilink': grouphandler,
    'welcome': grouphandler,
    'set-welcome': grouphandler,
    'set-goodbye': grouphandler,
    'groupinfo': grouphandler,
    'banlist': ownerhandler,
    'profile': profilehandler,
    'setname': profilehandler,
    'setbio': profilehandler,
    'setage': profilehandler,
    'setgender': profilehandler,
    'afk': profilehandler,
    'level': profilehandler,
    'getpp': profilehandler,
    'google': searchhandler,
    'jadwalsholat': searchhandler,
    'lyric': searchhandler,
    'wallhaven': searchhandler,
    'yts': searchhandler,
    'sticker': toolshandler,
    'qr': toolshandler,
    'translate': toolshandler,
    'base64': toolshandler,
    'upper': toolshandler,
    'lower': toolshandler,
    'ssweb': toolshandler,
    'tts': toolshandler,
    'emojimix': toolshandler,
    'calculator': toolshandler,
    'play': youtubehandler,
    'play2': youtubehandler,
    'yt': youtubehandler,
    'album': youtubehandler,
  };

  const handler = commandMap[command];
  if (handler) {
    try {
      // Eksekusi handler
      await handler(sock, msg, command, args, sender, isGroup, pushName);

      // === KIRIM FOTO PROFIL USER SEBAGAI KONFIRMASI (jika command tidak ada di skip list) ===
      if (!skipImageCommands.includes(command)) {
        try {
          // Ambil foto profil user
          const ppUrl = await sock.profilePictureUrl(sender, 'image');
          
          // Tunggu 1 detik agar tidak spam
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          await sock.sendMessage(sender, {
            image: { url: ppUrl },
            caption: `✅ Command .${command} berhasil dijalankan!`
          });
          console.log(`✅ Gambar konfirmasi dikirim untuk .${command} (${pushName})`);
        } catch (ppError) {
          // Jika user tidak punya foto profil atau error, kirim teks biasa
          console.log(`⚠️ Gagal ambil foto profil untuk ${pushName}: ${ppError.message}`);
          await sock.sendMessage(sender, { 
            text: `✅ Command .${command} berhasil dijalankan!` 
          });
        }
      }
    } catch (error) {
      console.error('Error executing command:', error);
      await sock.sendMessage(sender, { text: `❌ Terjadi error: ${error.message}` });
    }
  }
}