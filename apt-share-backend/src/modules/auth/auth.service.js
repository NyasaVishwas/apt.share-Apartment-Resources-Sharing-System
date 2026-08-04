const bcrypt = require('bcryptjs');
const User = require('../../models/User.model');
const ApiError = require('../../utils/ApiError');
const { generateAccessToken, generateRefreshToken, hashToken } = require('../../utils/tokenUtils');
const { generateOtpCode, hashOtp, verifyOtpHash } = require('../../utils/otpUtils');
const { sendOtpEmail } = require('../../emails/mailer');

class AuthService {
  static async register(userData) {
    const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists', 'USER_EXISTS');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    const otpCode = generateOtpCode();
    const otpHash = await hashOtp(otpCode);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name: userData.name,
      email: userData.email.toLowerCase(),
      passwordHash,
      phone: userData.phone || '',
      emailVerified: false,
      otp: {
        codeHash: otpHash,
        purpose: 'email_verification',
        expiresAt,
        attempts: 0
      }
    });

    await sendOtpEmail(user.email, otpCode, 'Email Verification');

    return {
      userId: user._id,
      email: user.email,
      message: 'Registration successful. Verification OTP sent to email.'
    };
  }

  static async verifyOtp(email, code, userAgent = '') {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND');
    }

    if (!user.otp || !user.otp.codeHash || user.otp.purpose !== 'email_verification') {
      throw new ApiError(400, 'No pending OTP verification found', 'INVALID_OTP');
    }

    if (new Date() > new Date(user.otp.expiresAt)) {
      throw new ApiError(400, 'OTP code has expired', 'OTP_EXPIRED');
    }

    if (user.otp.attempts >= 5) {
      throw new ApiError(400, 'Maximum OTP attempts exceeded. Please request a new code.', 'OTP_ATTEMPTS_EXCEEDED');
    }

    const isValid = await verifyOtpHash(code, user.otp.codeHash);
    if (!isValid) {
      user.otp.attempts += 1;
      await user.save();
      throw new ApiError(400, 'Invalid OTP code', 'INVALID_OTP');
    }

    user.emailVerified = true;
    user.otp = undefined;

    const rawRefreshToken = generateRefreshToken();
    const tokenHash = hashToken(rawRefreshToken);
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    user.refreshTokens.push({
      tokenHash,
      expiresAt: refreshExpiresAt,
      userAgent
    });

    await user.save();

    const accessToken = generateAccessToken(user);

    return {
      user,
      accessToken,
      refreshToken: rawRefreshToken
    };
  }

  static async resendOtp(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND');
    }

    const otpCode = generateOtpCode();
    const otpHash = await hashOtp(otpCode);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = {
      codeHash: otpHash,
      purpose: 'email_verification',
      expiresAt,
      attempts: 0
    };

    await user.save();
    await sendOtpEmail(user.email, otpCode, 'Email Verification');

    return { message: 'New OTP code sent to your email.' };
  }

  static async login(email, password, userAgent = '') {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (user.lockoutUntil && new Date() < new Date(user.lockoutUntil)) {
      throw new ApiError(429, 'Account locked due to multiple failed logins. Try again later.', 'ACCOUNT_LOCKED');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 10) {
        user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }
      await user.save();
      throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;

    const rawRefreshToken = generateRefreshToken();
    const tokenHash = hashToken(rawRefreshToken);
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    user.refreshTokens.push({
      tokenHash,
      expiresAt: refreshExpiresAt,
      userAgent
    });

    await user.save();

    const accessToken = generateAccessToken(user);

    return {
      user,
      accessToken,
      refreshToken: rawRefreshToken
    };
  }

  static async refresh(rawRefreshToken, userAgent = '') {
    if (!rawRefreshToken) {
      throw new ApiError(401, 'Refresh token missing', 'UNAUTHORIZED');
    }

    const incomingHash = hashToken(rawRefreshToken);
    const user = await User.findOne({ 'refreshTokens.tokenHash': incomingHash });

    if (!user) {
      throw new ApiError(401, 'Invalid refresh token', 'UNAUTHORIZED');
    }

    const tokenDoc = user.refreshTokens.find((t) => t.tokenHash === incomingHash);
    if (!tokenDoc || new Date() > new Date(tokenDoc.expiresAt)) {
      // Invalidate expired token
      user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== incomingHash);
      await user.save();
      throw new ApiError(401, 'Refresh token expired', 'TOKEN_EXPIRED');
    }

    // Token Rotation: Remove old refresh token & insert new one
    user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== incomingHash);
    const newRawRefreshToken = generateRefreshToken();
    const newHash = hashToken(newRawRefreshToken);
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    user.refreshTokens.push({
      tokenHash: newHash,
      expiresAt: refreshExpiresAt,
      userAgent
    });

    await user.save();

    const accessToken = generateAccessToken(user);

    return {
      accessToken,
      refreshToken: newRawRefreshToken
    };
  }

  static async logout(user, rawRefreshToken) {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== tokenHash);
      await user.save();
    }
    return true;
  }

  static async forgotPassword(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return success without revealing user existence
      return { message: 'If the email exists, a password reset code has been sent.' };
    }

    const otpCode = generateOtpCode();
    const otpHash = await hashOtp(otpCode);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = {
      codeHash: otpHash,
      purpose: 'password_reset',
      expiresAt,
      attempts: 0
    };

    await user.save();
    await sendOtpEmail(user.email, otpCode, 'Password Reset');

    return { message: 'If the email exists, a password reset code has been sent.' };
  }

  static async resetPassword(email, code, newPassword) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.otp || user.otp.purpose !== 'password_reset') {
      throw new ApiError(400, 'Invalid or expired password reset request', 'INVALID_OTP');
    }

    if (new Date() > new Date(user.otp.expiresAt)) {
      throw new ApiError(400, 'Reset code has expired', 'OTP_EXPIRED');
    }

    const isValid = await verifyOtpHash(code, user.otp.codeHash);
    if (!isValid) {
      throw new ApiError(400, 'Invalid reset code', 'INVALID_OTP');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.otp = undefined;
    user.refreshTokens = []; // Force logout everywhere on password reset
    await user.save();

    return { message: 'Password has been reset successfully. Please login with your new password.' };
  }
}

module.exports = AuthService;
