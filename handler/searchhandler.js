import fetch from 'node-fetch';
import googleIt from 'google-it';
import { search as ytSearch } from 'yt-search';

export default async function searchHandler(sock, msg, command, args, sender, isGroup, pushName) {
  const reply = (text) => sock.sendMessage(sender, { text }, { quoted: msg });
  if (!args) return reply('Masukkan kata kunci.');

  try {
    switch (command) {
      case 'google':
      case 'gl': {
        const results = await googleIt({ query: args, limit: 5 });
        let text = `🔍 Hasil Google: ${args}\n\n`;
        results.forEach((r, i) => { text += `${i+1}. ${r.title}\n${r.link}\n${r.snippet}\n\n`; });
        await reply(text);
        break;
      }
      case 'jadwalsholat':
      case 'js': {
        const city = args || 'jakarta';
        const res = await fetch(`https://api.pray.zone/v2/times/today.json?city=${encodeURIComponent(city)}`);
        const data = await res.json();
        const times = data.results?.datetime?.[0]?.times;
        if (!times) throw new Error('Kota tidak ditemukan');
        const text = `🕌 Jadwal Sholat ${city}\nImsak: ${times.Imsak}\nSubuh: ${times.Fajr}\nDzuhur: ${times.Dhuhr}\nAshar: ${times.Asr}\nMaghrib: ${times.Maghrib}\nIsya: ${times.Isha}`;
        await reply(text);
        break;
      }
      case 'lyric':
      case 'ly': {
        const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(args)}`);
        const data = await res.json();
        if (data.error) throw new Error('Lirik tidak ditemukan');
        await reply(`🎵 Lirik ${args}:\n\n${data.lyrics}`);
        break;
      }
      case 'wallhaven':
      case 'wh': {
        const res = await fetch(`https://wallhaven.cc/api/v1/search?q=${encodeURIComponent(args)}`);
        const data = await res.json();
        if (!data.data || data.data.length === 0) throw new Error('Tidak ditemukan');
        const wall = data.data[0];
        await sock.sendMessage(sender, { image: { url: wall.path }, caption: `Wallpaper: ${wall.resolution}` }, { quoted: msg });
        break;
      }
      case 'yts':
      case 'ytms': {
        const results = await ytSearch(args);
        if (!results.videos.length) throw new Error('Video tidak ditemukan');
        const list = results.videos.slice(0, 5).map((v, i) => `${i+1}. ${v.title}\n⏱ ${v.duration} | 👁 ${v.views}\n🔗 ${v.url}`).join('\n\n');
        await reply(`📺 Hasil YouTube:\n\n${list}`);
        break;
      }
      default:
        await reply(`Fitur search .${command} belum diimplementasikan.`);
    }
  } catch (error) {
    await reply(`Error: ${error.message}`);
  }
}
