export const config = {
  prefix: '.',
  owner: ['6281263690163@s.whatsapp.net'],
  autoRead: true,
  botName: 'Katyushaa',

  // Command yang TIDAK dikirimi gambar konfirmasi
  skipImageCommands: [
    'sticker', 'qr', 'ssweb', 'tiktok', 'ytmp3', 'ytmp4',
    'play', 'play2', 'meme', 'wallhaven', 'getpp', 'emojimix',
    'instagram', 'facebook', 'spotify', 'twitter', 'album',
    'menu',
    'profile' // ← tambahkan ini agar tidak double
  ]
};