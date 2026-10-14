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
    return sock.sendMessage(sender, { text: 'Kamu di-ban dari bot ini.' });
  }

  // Owner-only commands
  const ownerOnly = ['banlist', 'reset-ai', 'reset-ai-group', 'setbotname', 'setbotowner', 'setpp', 'jadibot', 'scanbot', 'broadcast'];
  if (ownerOnly.includes(command) && !owner.includes(sender)) {
    return sock.sendMessage(sender, { text: 'Command ini khusus owner.' });
  }

  const commandMap = {
    // Menu
    'menu': menuhandler,
    'help': menuhandler,

    // AI
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

    // Downloader
    'tiktok': downloaderhandler,
    'ytmp3': downloaderhandler,
    'ytmp4': downloaderhandler,
    'instagram': downloaderhandler,
    'facebook': downloaderhandler,
    'spotify': downloaderhandler,
    'twitter': downloaderhandler,

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
    'math': gamehandler,
    'leaderboard': gamehandler,

    // Group
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
    'setsubject': grouphandler,
    'setdesc': grouphandler,
    'leave-group': grouphandler,

    // Owner
    'banlist': ownerhandler,
    'setbotname': ownerhandler,

    // Profile
    'profile': profilehandler,
    'setname': profilehandler,
    'setbio': profilehandler,
    'setage': profilehandler,
    'setgender': profilehandler,
    'afk': profilehandler,
    'level': profilehandler,
    'getpp': profilehandler,

    // Search
    'google': searchhandler,
    'jadwalsholat': searchhandler,
    'lyric': searchhandler,
    'wallhaven': searchhandler,
    'yts': searchhandler,
    'ytms': searchhandler,

    // Tools
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

    // YouTube
    'play': youtubehandler,
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
      await sock.sendMessage(sender, { text: `❌ Error: ${error.message}` });
    }
  }
}
