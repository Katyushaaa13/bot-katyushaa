// utils/helper.js
export function getImageForCommand(command) {
  const imageMap = {
    'menu': 'https://i.ibb.co/menu.jpg',
    'profile': 'https://d.uguu.se/ClXSTnSc.jpeg',
    'sticker': 'https://i.ibb.co/sticker.jpg',
    // Tambahkan sesuai kebutuhan
  };
  return imageMap[command] || 'https://i.ibb.co/default.jpg';
}