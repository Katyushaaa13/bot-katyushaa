export default async function aiHandler(sock, msg, command, args, sender, isGroup, pushName) {
  const reply = (text) => sock.sendMessage(sender, { text }, { quoted: msg });
  if (!args) return reply('Masukkan pertanyaan.');

  let response = '';

  try {
    switch (command) {
      case 'gpt':
      case 'g':
      case 'ai':
      case 'a':
        response = await fetchGPT(args);
        break;
      case 'gemini':
      case 'gem':
        response = await fetchGemini(args);
        break;
      case 'deepseek':
      case 'ds':
        response = await fetchDeepSeek(args);
        break;
      default:
        response = `AI handler untuk command ${command}`;
    }
    await reply(response);
  } catch (error) {
    await reply(`Error: ${error.message}`);
  }
}

async function fetchGPT(prompt) {
  return `GPT Response untuk: ${prompt}\n\n(Isi API key untuk mengaktifkan)`;
}
async function fetchGemini(prompt) {
  return `Gemini Response untuk: ${prompt}\n\n(Isi API key untuk mengaktifkan)`;
}
async function fetchDeepSeek(prompt) {
  return `DeepSeek Response untuk: ${prompt}\n\n(Isi API key untuk mengaktifkan)`;
}
