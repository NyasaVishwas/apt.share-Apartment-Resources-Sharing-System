const bcrypt = require('bcryptjs');

const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const hashOtp = async (code) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(code, salt);
};

const verifyOtpHash = async (code, hash) => {
  return await bcrypt.compare(code, hash);
};

module.exports = {
  generateOtpCode,
  hashOtp,
  verifyOtpHash
};
