import aihandler from './aihandler.js';
import downloaderhandler from './downloaderhandler.js';
import funhandler from './funhandler.js';
import gamehandler from './gamehandler.js';
import grouphandler from './grouphandler.js';
import menuhandler from './menuhandler.js';
import ownerhandler from './ownerhandler.js';
import profilehandler from './profilehandler.js';
import searchhandler from './searchhandler.js';
import toolshandler from './toolshandler.js';
import youtubehandler from './youtubehandler.js';
import db from '../utils/database.js';
import { config } from '../config.js';

const { prefix, owner } = config;

export default async function commandHandler(sock, msg, command, args, sender, isGroup, pushName) {
  // Cek ban
  if (db.data.bans && db.data.bans.includes(sender)) {
    return sock.sendMessage(sender, { text: 'Kamu di-ban dari bot ini.' }, { quoted: msg });
  }

  // Owner-only commands
  const ownerOnly = ['banlist', 'reset-ai', 'reset-ai-group', 'setbotname', 'setbotowner', 'setpp', 'jadibot', 'scanbot', 'broadcast'];
  if (ownerOnly.includes(command) && !owner.includes(sender)) {
    return sock.sendMessage(sender, { text: 'Command ini khusus owner.' }, { quoted: msg });
  }

  const commandMap = {
    // Menu
    'menu': menuhandler,
    'm': menuhandler,
    'help': menuhandler,

    // AI
    'ai': aihandler,
    'a': aihandler,
    'aichara': aihandler,
    'deepseek': aihandler,
    'ds': aihandler,
    'gemini': aihandler,
    'gem': aihandler,
    'gemma': aihandler,
    'gpt': aihandler,
    'g': aihandler,
    'llm': aihandler,
    'qwen': aihandler,
    'reset-ai': aihandler,
    'reset-ai-group': aihandler,

    // Downloader
    'tiktok': downloaderhandler,
    'tt': downloaderhandler,
    'ytmp3': downloaderhandler,
    'ytmp4': downloaderhandler,
    'instagram': downloaderhandler,
    'ig': downloaderhandler,
    'facebook': downloaderhandler,
    'fb': downloaderhandler,
    'spotify': downloaderhandler,
    'sp': downloaderhandler,
    'twitter': downloaderhandler,
    'tw': downloaderhandler,

    // Fun
    'meme': funhandler,
    'dadu': funhandler,
    'koin': funhandler,
    'roast': funhandler,
    'ship': funhandler,
    'suit': funhandler,
    'reaction': funhandler,

    // Game
    'tebakgambar': gamehandler,
    'tebakkata': gamehandler,
    'tebakbendera': gamehandler,
    'tebaklirik': gamehandler,
    'asahotak': gamehandler,
    'caklontong': gamehandler,
    'susunkata': gamehandler,
    'tictactoe': gamehandler,
    'ttt': gamehandler,
    'math': gamehandler,
    'leaderboard': gamehandler,
    'lb': gamehandler,

    // Group
    'tagall': grouphandler,
    'ta': grouphandler,
    'hidetag': grouphandler,
    'ht': grouphandler,
    'promote': grouphandler,
    'prom': grouphandler,
    'demote': grouphandler,
    'dem': grouphandler,
    'add': grouphandler,
    'kick': grouphandler,
    'k': grouphandler,
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
    'gi': grouphandler,
    'setsubject': grouphandler,
    'setdesc': grouphandler,
    'leave-group': grouphandler,

    // Owner
    'banlist': ownerhandler,
    'setbotname': ownerhandler,
    'owner': ownerhandler,

    // Profile
    'profile': profilehandler,
    'p': profilehandler,
    'setname': profilehandler,
    'setbio': profilehandler,
    'setage': profilehandler,
    'setgender': profilehandler,
    'afk': profilehandler,
    'level': profilehandler,
    'getpp': profilehandler,

    // Search
    'google': searchhandler,
    'gl': searchhandler,
    'jadwalsholat': searchhandler,
    'js': searchhandler,
    'lyric': searchhandler,
    'ly': searchhandler,
    'wallhaven': searchhandler,
    'wh': searchhandler,
    'yts': searchhandler,
    'ytms': searchhandler,

    // Tools
    'sticker': toolshandler,
    's': toolshandler,
    'qr': toolshandler,
    'translate': toolshandler,
    'tr': toolshandler,
    'base64': toolshandler,
    'b64': toolshandler,
    'upper': toolshandler,
    'lower': toolshandler,
    'ssweb': toolshandler,
    'ss': toolshandler,
    'tts': toolshandler,
    'emojimix': toolshandler,
    'emix': toolshandler,
    'calculator': toolshandler,
    'calc': toolshandler,
    'delete': toolshandler,
    'del': toolshandler,

    // YouTube
    'play': youtubehandler,
    'pl': youtubehandler,
    'play2': youtubehandler,
    'yt': youtubehandler,
    'album': youtubehandler,
  };

  const handler = commandMap[command];
  if (handler) {
    try {
      await handler(sock, msg, command, args, sender, isGroup, pushName);
    } catch (error) {
      console.error('Error executing command:', error);
      await sock.sendMessage(sender, { text: `❌ Error: ${error.message}` }, { quoted: msg });
    }
  }
}
