import { z } from 'zod';
import { Roles } from '../../lib/roles.js';

export const createUserBody = z.object({
  role: z.enum([Roles.ADMIN, Roles.AGENT]),
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

export const updateUserParams = z.object({
  id: z.string().min(1),
});

export const updateUserBody = z
  .object({
    name: z.string().min(1).max(120).optional(),
    status: z.enum(['ACTIVE', 'DEACTIVATED']).optional(),
  })
  .strict();

export const listUsersQuery = z
  .object({
    role: z.enum([Roles.ADMIN, Roles.AGENT, Roles.CLIENT]).optional(),
    status: z.enum(['ACTIVE', 'DEACTIVATED']).optional(),
  })
  .strict();

