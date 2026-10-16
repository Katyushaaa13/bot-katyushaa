import ytdl from '@distube/ytdl-core';
import ytSearch from 'yt-search';

export default async function youtubeHandler(sock, msg, command, args, sender, isGroup, pushName) {
  const reply = (text) => sock.sendMessage(sender, { text }, { quoted: msg });
  if (!args) return reply('Masukkan judul atau URL YouTube.');

  try {
    let videoUrl = args;
    let title = '';

    if (!ytdl.validateURL(args)) {
      const searchResult = await ytSearch(args);
      if (!searchResult.videos.length) throw new Error('Video tidak ditemukan');
      videoUrl = searchResult.videos[0].url;
      title = searchResult.videos[0].title;
    } else {
      const info = await ytdl.getInfo(videoUrl);
      title = info.videoDetails.title;
    }

    await reply(`⏳ Memproses: *${title}*...`);

    switch (command) {
      case 'play':
      case 'pl':
      case 'play2':
      case 'ytmp3': {
        const audioStream = ytdl(videoUrl, { filter: 'audioonly', quality: 'highestaudio' });
        await sock.sendMessage(sender, { audio: audioStream, mimetype: 'audio/mp4', fileName: `${title}.mp3` }, { quoted: msg });
        break;
      }
      case 'ytmp4': {
        const videoStream = ytdl(videoUrl, { filter: 'videoandaudio', quality: 'highest' });
        await sock.sendMessage(sender, { video: videoStream, caption: title }, { quoted: msg });
        break;
      }
      case 'album': {
        const info = await ytdl.getInfo(videoUrl);
        const thumbnail = info.videoDetails.thumbnails.pop().url;
        await sock.sendMessage(sender, { image: { url: thumbnail }, caption: `🎵 ${title}` }, { quoted: msg });
        break;
      }
      case 'yt': {
        await reply(`📹 ${title}\n🔗 ${videoUrl}`);
        break;
      }
      default:
        await reply(`Fitur YouTube .${command} belum diimplementasikan.`);
    }
  } catch (error) {
    await reply(`Error: ${error.message}`);
  }
}
