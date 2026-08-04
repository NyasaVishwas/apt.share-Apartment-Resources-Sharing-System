const AuthService = require('./auth.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

class AuthController {
  static register = asyncHandler(async (req, res) => {
    const result = await AuthService.register(req.body);
    res.status(201).json(new ApiResponse(201, result, 'Registration successful. OTP sent.'));
  });

  static verifyOtp = asyncHandler(async (req, res) => {
    const userAgent = req.headers['user-agent'] || '';
    const { user, accessToken, refreshToken } = await AuthService.verifyOtp(req.body.email, req.body.code, userAgent);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json(new ApiResponse(200, { user, accessToken }, 'Email verified successfully.'));
  });

  static resendOtp = asyncHandler(async (req, res) => {
    const result = await AuthService.resendOtp(req.body.email);
    res.status(200).json(new ApiResponse(200, result, 'OTP resent successfully.'));
  });

  static login = asyncHandler(async (req, res) => {
    const userAgent = req.headers['user-agent'] || '';
    const { user, accessToken, refreshToken } = await AuthService.login(req.body.email, req.body.password, userAgent);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json(new ApiResponse(200, { user, accessToken }, 'Login successful.'));
  });

  static refresh = asyncHandler(async (req, res) => {
    const rawRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const userAgent = req.headers['user-agent'] || '';
    const { accessToken, refreshToken } = await AuthService.refresh(rawRefreshToken, userAgent);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json(new ApiResponse(200, { accessToken }, 'Access token refreshed.'));
  });

  static logout = asyncHandler(async (req, res) => {
    const rawRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    await AuthService.logout(req.user, rawRefreshToken);
    res.clearCookie('refreshToken');
    res.status(200).json(new ApiResponse(200, null, 'Logged out successfully.'));
  });

  static forgotPassword = asyncHandler(async (req, res) => {
    const result = await AuthService.forgotPassword(req.body.email);
    res.status(200).json(new ApiResponse(200, result, 'Password reset request processed.'));
  });

  static resetPassword = asyncHandler(async (req, res) => {
    const result = await AuthService.resetPassword(req.body.email, req.body.code, req.body.newPassword);
    res.status(200).json(new ApiResponse(200, result, 'Password reset successful.'));
  });

  static getMe = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, req.user, 'Current user profile fetched.'));
  });
}

module.exports = AuthController;
