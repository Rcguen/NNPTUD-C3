const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Sinh cặp RSA key 2048 bit
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Lưu private key vào file
fs.writeFileSync(path.join(__dirname, 'private.pem'), privateKey);
console.log('✓ private.pem đã được tạo');

// Lưu public key vào file
fs.writeFileSync(path.join(__dirname, 'public.pem'), publicKey);
console.log('✓ public.pem đã được tạo');

console.log('\n✓ Đã sinh thành công cặp RSA 2048-bit keys cho JWT RS256');
