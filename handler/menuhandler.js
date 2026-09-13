export default async function menuHandler(sock, msg, command, args, sender, isGroup, pushName) {
  const userJid = isGroup ? msg.key.participant : sender;

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
│ .remove
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
> Bot by X1Katyushaa | Katyushaa - bot
  `;

  try {
    const ppUrl = await sock.profilePictureUrl(userJid, 'image');
    await sock.sendMessage(sender, {
      image: { url: ppUrl },
      caption: menuText
    });
    console.log(`✅ Menu dikirim dengan foto profil ${pushName}`);
  } catch {
    await sock.sendMessage(sender, { text: menuText });
  }
}