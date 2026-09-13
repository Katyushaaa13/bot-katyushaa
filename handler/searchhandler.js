import fetch from 'node-fetch';
import googleIt from 'google-it';
import { search as ytSearch } from 'yt-search';

export default async function searchHandler(sock, msg, command, args, sender, isGroup, pushName) {
  if (!args) return sock.sendMessage(sender, { text: 'Masukkan kata kunci.' });

  switch (command) {
    case 'google': {
      const results = await googleIt({ query: args, limit: 5 });
      let text = `🔍 Hasil Google untuk: ${args}\n\n`;
      results.forEach((r, i) => {
        text += `${i+1}. ${r.title}\n${r.link}\n${r.snippet}\n\n`;
      });
      await sock.sendMessage(sender, { text });
      break;
    }

    case 'jadwalsholat': {
      const city = args || 'jakarta';
      try {
        const res = await fetch(`https://api.pray.zone/v2/times/today.json?city=${encodeURIComponent(city)}`);
        const data = await res.json();
        const times = data.results?.datetime?.[0]?.times;
        if (!times) return sock.sendMessage(sender, { text: 'Kota tidak ditemukan.' });
        const text = `🕌 Jadwal Sholat ${city}\nImsak: ${times.Imsak}\nSubuh: ${times.Fajr}\nDzuhur: ${times.Dhuhr}\nAshar: ${times.Asr}\nMaghrib: ${times.Maghrib}\nIsya: ${times.Isha}`;
        await sock.sendMessage(sender, { text });
      } catch {
        await sock.sendMessage(sender, { text: 'Gagal mengambil jadwal sholat.' });
      }
      break;
    }

    case 'lyric': {
      try {
        const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(args)}`);
        const data = await res.json();
        if (data.error) return sock.sendMessage(sender, { text: 'Lirik tidak ditemukan.' });
        await sock.sendMessage(sender, { text: `🎵 Lirik ${args}:\n${data.lyrics}` });
      } catch {
        await sock.sendMessage(sender, { text: 'Gagal mengambil lirik.' });
      }
      break;
    }

    case 'wallhaven': {
      try {
        const res = await fetch(`https://wallhaven.cc/api/v1/search?q=${encodeURIComponent(args)}`);
        const data = await res.json();
        if (!data.data || data.data.length === 0) return sock.sendMessage(sender, { text: 'Tidak ditemukan.' });
        const wall = data.data[0];
        await sock.sendMessage(sender, { image: { url: wall.path }, caption: `Wallpaper: ${wall.resolution}` });
      } catch {
        await sock.sendMessage(sender, { text: 'Gagal mengambil wallpaper.' });
      }
      break;
    }

    case 'yts':
    case 'ytms': {
      const searchResults = await ytSearch(args);
      if (!searchResults.videos.length) return sock.sendMessage(sender, { text: 'Tidak ditemukan.' });
      const list = searchResults.videos.slice(0, 5).map((v, i) => {
        return `${i+1}. ${v.title}\n⏱ ${v.duration} | 👁 ${v.views}\n🔗 ${v.url}`;
      }).join('\n\n');
      await sock.sendMessage(sender, { text: `📺 Hasil YouTube:\n${list}` });
      break;
    }

    default: {
      await sock.sendMessage(sender, { text: `Fitur search .${command} belum diimplementasikan.` });
    }
  }
}