// 修改后前端SM4Utils.js
import SM4 from 'sm-crypto/src/sm4';
const crypto = require('crypto');

const aesKey = process.env.VUE_APP_ENCRYPT_KEY;  

export const encryptSM4 = (data) => {
  const iv = crypto.randomBytes(16).toString('hex'); // 生成16字节随机IV
  return iv + SM4.encrypt(data, aesKey, { mode: 'cbc', iv }); // IV拼接到密文前
};

export const decryptSM4 = (encryptedData) => {
  const iv = encryptedData.substr(0, 32); // 提取前32位hex字符串（16字节）
  const ciphertext = encryptedData.substr(32);
  return SM4.decrypt(ciphertext, aesKey, { mode: 'cbc', iv: iv });
};
