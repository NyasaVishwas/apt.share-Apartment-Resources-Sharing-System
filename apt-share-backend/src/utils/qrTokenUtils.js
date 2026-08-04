const crypto = require('crypto');
const env = require('../config/env');

const generateQrToken = (bookingId, tokenType) => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto
    .createHash('sha256')
    .update(rawToken + env.JWT_ACCESS_SECRET)
    .digest('hex');

  // Token expires in 15 minutes
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const payload = {
    bookingId: bookingId.toString(),
    type: tokenType, // 'pickup' | 'return'
    rawToken,
    expiresAt
  };

  return {
    rawToken,
    tokenHash,
    expiresAt,
    qrPayloadString: JSON.stringify(payload)
  };
};

const verifyQrToken = (rawToken, tokenHash, expiresAt) => {
  if (new Date() > new Date(expiresAt)) {
    return { valid: false, reason: 'QR_TOKEN_EXPIRED' };
  }

  const computedHash = crypto
    .createHash('sha256')
    .update(rawToken + env.JWT_ACCESS_SECRET)
    .digest('hex');

  if (computedHash !== tokenHash) {
    return { valid: false, reason: 'INVALID_QR_TOKEN' };
  }

  return { valid: true };
};

module.exports = {
  generateQrToken,
  verifyQrToken
};
