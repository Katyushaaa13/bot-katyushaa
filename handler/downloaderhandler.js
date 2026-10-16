import ytdl from '@distube/ytdl-core';
import fetch from 'node-fetch';

export default async function downloaderHandler(sock, msg, command, args, sender, isGroup, pushName) {
  const reply = (text) => sock.sendMessage(sender, { text }, { quoted: msg });
  if (!args) return reply('Masukkan URL.');

  try {
    switch (command) {
      case 'tiktok':
      case 'tt': {
        const res = await fetch(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(args)}`);
        const data = await res.json();
        if (!data.video) throw new Error('Gagal ambil video');
        await sock.sendMessage(sender, { video: { url: data.video }, caption: `TikTok by ${data.author?.nickname || 'Unknown'}` }, { quoted: msg });
        break;
      }
      case 'ytmp3': {
        const info = await ytdl.getInfo(args);
        const audioStream = ytdl(args, { filter: 'audioonly', quality: 'highestaudio' });
        await sock.sendMessage(sender, { audio: audioStream, mimetype: 'audio/mp4', fileName: `${info.videoDetails.title}.mp3` }, { quoted: msg });
        break;
      }
      case 'ytmp4': {
        const info = await ytdl.getInfo(args);
        const videoStream = ytdl(args, { filter: 'videoandaudio', quality: 'highest' });
        await sock.sendMessage(sender, { video: videoStream, caption: info.videoDetails.title }, { quoted: msg });
        break;
      }
      default:
        await reply(`Downloader .${command} belum diimplementasikan.`);
    }
  } catch (error) {
    await reply(`Error: ${error.message}`);
  }
}
