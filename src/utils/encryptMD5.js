import CryptoJS from 'crypto-js';
export const encryptMD5 = (content) => {
  return CryptoJS.MD5(content).toString();
};
