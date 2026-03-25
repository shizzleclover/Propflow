import { z } from 'zod';

const slot = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
});

export const createBookingBody = z.object({
  propertyId: z.string().min(1),
  preferredSlots: z.array(slot).min(1).max(10),
  clientNote: z.string().max(2000).optional(),
});

export const bookingIdParams = z.object({
  id: z.string().min(1),
});

export const listBookingsQuery = z
  .object({
    mine: z.coerce.boolean().optional(),
    status: z.enum(['PENDING', 'PROPOSED', 'APPROVED', 'DECLINED', 'CANCELLED']).optional(),
    limit: z.coerce.number().int().positive().max(100).default(20),
    offset: z.coerce.number().int().nonnegative().default(0),
  })
  .strict();

export const approveBody = z.object({
  confirmedSlot: slot,
  agentNote: z.string().max(2000).optional(),
});

export const proposeBody = z.object({
  proposedSlot: slot,
  agentNote: z.string().max(2000).optional(),
});

export const declineBody = z
  .object({
    agentNote: z.string().max(2000).optional(),
  })
  .strict();

export const cancelBody = z
  .object({
    clientNote: z.string().max(2000).optional(),
  })
  .strict();

