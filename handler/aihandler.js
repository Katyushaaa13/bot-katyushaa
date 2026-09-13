import fetch from 'node-fetch';

export default async function (sock, msg, command, args, sender, isGroup, pushName) {
  if (!args) return sock.sendMessage(sender, { text: 'Masukkan pertanyaan.' });

  let response = '';

  switch (command) {
    case 'gpt':
    case 'ai':
      response = await fetchGPT(args);
      break;
    case 'gemini':
      response = await fetchGemini(args);
      break;
    case 'deepseek':
      response = await fetchDeepSeek(args);
      break;
    default:
      response = 'AI handler untuk command ' + command;
  }

  await sock.sendMessage(sender, { text: response });
}

async function fetchGPT(prompt) {
  // Ganti dengan API key Anda
  return `GPT: ${prompt}`;
}

async function fetchGemini(prompt) {
  return `Gemini: ${prompt}`;
}

async function fetchDeepSeek(prompt) {
  return `DeepSeek: ${prompt}`;
}