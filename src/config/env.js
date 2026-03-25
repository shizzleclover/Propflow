import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(20),
  JWT_ACCESS_TTL: z.string().min(1).default('12h'),
  CORS_ORIGIN: z.string().default('*'),
  LOG_FORMAT: z.string().default('dev'),
});

export const env = envSchema.parse(process.env);

