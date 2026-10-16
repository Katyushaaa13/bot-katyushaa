export default async function menuHandler(sock, msg, command, args, sender, isGroup, pushName) {
  const userJid = isGroup ? msg.key.participant : sender;

  const imageURL = 'https://i.postimg.cc/RZp3jhjs/c43e248d15b2e2be924132cd49c25217.jpg';

  const menuText = `
╭─〔 Katyusha BOT 〕
│ 👤 User: ${pushName}
│ ⏱ Runtime: Aktif
│ 📦 Total Cmd: 100+
╰────────────────────

╭─〔 *AI* 〕
│ .ai
│ .aichara
│ .deepseek
│ .gemini
│ .gemma
│ .gpt
│ .llm
│ .qwen
│ .reset-ai
│ .reset-ai-group
╰──────────────────

╭─〔 *DOWNLOADER* 〕
│ .tiktok
│ .ytmp3
│ .ytmp4
│ .instagram
│ .facebook
│ .spotify
│ .twitter
╰──────────────────

╭─〔 *FUN* 〕
│ .meme
│ .dadu
│ .koin
│ .roast
│ .ship
│ .suit
│ .reaction
╰──────────────────

╭─〔 *GAME* 〕
│ .tebakgambar
│ .tebakkata
│ .tebakbendera
│ .tebaklirik
│ .asahotak
│ .caklontong
│ .susunkata
│ .tictactoe
╰──────────────────

╭─〔 *GROUP* 〕
│ .tagall
│ .hidetag
│ .promote
│ .demote
│ .add
│ .kick
│ .linkgc
│ .revoke
│ .open
│ .close
│ .antilink
│ .welcome
│ .set-welcome
│ .set-goodbye
│ .groupinfo
╰──────────────────

╭─〔 *PROFILE* 〕
│ .profile
│ .setname
│ .setbio
│ .setage
│ .setgender
│ .afk
│ .level
│ .getpp
╰──────────────────

╭─〔 *TOOLS* 〕
│ .sticker
│ .qr
│ .translate
│ .base64
│ .upper
│ .lower
│ .ssweb
│ .tts
│ .emojimix
│ .calculator
╰──────────────────

╭─〔 *SEARCH* 〕
│ .google
│ .jadwalsholat
│ .lyric
│ .wallhaven
│ .yts
╰──────────────────

╭─〔 *YOUTUBE* 〕
│ .play
│ .ytmp3
│ .ytmp4
│ .yt
│ .album
╰──────────────────

╭─〔 *OWNER* 〕
│ .banlist
│ .reset-ai
│ .setbotname
│ .setpp
╰──────────────────

*ikuti kami di saluran*
https://whatsapp.com/channel/0029VbDC29560eBfBBT94d3L

> Gunakan .[command] untuk menjalankan
> Bot by X1Katyushaa | Katyusha - bot
  `;

  try {
    await sock.sendMessage(sender, {
      image: { url: imageURL },
      caption: menuText,
      mentions: [userJid]
    }, { quoted: msg });
    console.log(`✅ Menu dikirim ke ${pushName}`);
  } catch (err) {
    console.error(`❌ Gagal mengirim menu ke ${pushName}:`, err);
    await sock.sendMessage(sender, { text: menuText }, { quoted: msg });
  }
}
