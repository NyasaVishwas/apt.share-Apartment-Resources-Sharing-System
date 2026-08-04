const { z } = require('zod');
const dotenv = require('dotenv');

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().default('mongodb://localhost:27017/apt_share'),
  JWT_ACCESS_SECRET: z.string().default('super-secret-access-key-apt-share-2026'),
  JWT_REFRESH_SECRET: z.string().default('super-secret-refresh-key-apt-share-2026'),
  CLIENT_URL: z.string().default('http://localhost:3000')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

module.exports = parsed.data;
