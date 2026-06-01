import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  corsOrigins: process.env.CORS_ORIGINS || '*',
  externalUserSystemUrl: process.env.EXTERNAL_USER_SYSTEM_URL,
}));