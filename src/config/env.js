import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const emptyToUndefined = (v) => (v === '' || v === undefined ? undefined : v);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(20),
  JWT_ACCESS_TTL: z.string().min(1).default('12h'),
  CORS_ORIGIN: z.string().default('*'),
  LOG_FORMAT: z.string().default('dev'),
  OPENAI_API_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  OPENAI_CHAT_MODEL: z.string().default('gpt-4o-mini'),
  OPENAI_EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
});

export const env = envSchema.parse(process.env);

