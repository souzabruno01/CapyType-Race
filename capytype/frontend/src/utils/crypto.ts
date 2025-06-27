import CryptoJS from 'crypto-js';

const SECRET = 'capytype-shared-secret'; // Replace with a strong secret and sync with backend

export function encryptRoomId(roomId: string) {
  return CryptoJS.AES.encrypt(roomId, SECRET).toString();
}

export function decryptRoomId(cipher: string) {
  const bytes = CryptoJS.AES.decrypt(cipher, SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
}
