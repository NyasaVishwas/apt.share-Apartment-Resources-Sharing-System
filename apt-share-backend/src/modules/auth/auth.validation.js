const { z } = require('zod');

const registerSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional()
  })
};

const verifyOtpSchema = {
  body: z.object({
    email: z.string().email('Invalid email address'),
    code: z.string().length(6, 'OTP must be 6 digits')
  })
};

const loginSchema = {
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  })
};

const forgotPasswordSchema = {
  body: z.object({
    email: z.string().email('Invalid email address')
  })
};

const resetPasswordSchema = {
  body: z.object({
    email: z.string().email('Invalid email address'),
    code: z.string().length(6, 'OTP code must be 6 digits'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters')
  })
};

module.exports = {
  registerSchema,
  verifyOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
