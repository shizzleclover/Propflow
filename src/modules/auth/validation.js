import { z } from 'zod';

export const registerClientBody = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

export const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

