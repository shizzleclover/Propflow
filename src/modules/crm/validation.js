import { z } from 'zod';

export const createNoteBody = z.object({
  clientId: z.string().min(1),
  propertyId: z.string().min(1).optional(),
  bookingId: z.string().min(1).optional(),
  text: z.string().min(1).max(5000),
});

export const clientIdParams = z.object({
  clientId: z.string().min(1),
});

export const listNotesQuery = z
  .object({
    limit: z.coerce.number().int().positive().max(100).default(20),
    offset: z.coerce.number().int().nonnegative().default(0),
  })
  .strict();

