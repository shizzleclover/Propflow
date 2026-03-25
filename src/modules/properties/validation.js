import { z } from 'zod';

export const propertyIdParams = z.object({
  id: z.string().min(1),
});

export const createPropertyBody = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(5000).optional(),
  assignedAgentId: z.string().min(1),
  address: z.object({
    line1: z.string().min(1).max(200),
    line2: z.string().max(200).optional(),
    city: z.string().min(1).max(120),
    state: z.string().max(120).optional(),
    postalCode: z.string().max(40).optional(),
    country: z.string().max(120).optional(),
  }),
  price: z.number().nonnegative(),
  attributes: z
    .object({
      beds: z.number().int().nonnegative().optional(),
      baths: z.number().int().nonnegative().optional(),
      areaSqft: z.number().int().nonnegative().optional(),
      propertyType: z.string().max(120).optional(),
    })
    .optional(),
});

export const updatePropertyBodyAdmin = z
  .object({
    title: z.string().min(1).max(160).optional(),
    description: z.string().max(5000).optional(),
    status: z.enum(['AVAILABLE', 'UNDER_OFFER', 'UNAVAILABLE']).optional(),
    assignedAgentId: z.string().min(1).optional(),
    address: z
      .object({
        line1: z.string().min(1).max(200).optional(),
        line2: z.string().max(200).optional(),
        city: z.string().min(1).max(120).optional(),
        state: z.string().max(120).optional(),
        postalCode: z.string().max(40).optional(),
        country: z.string().max(120).optional(),
      })
      .optional(),
    price: z.number().nonnegative().optional(),
    attributes: z
      .object({
        beds: z.number().int().nonnegative().optional(),
        baths: z.number().int().nonnegative().optional(),
        areaSqft: z.number().int().nonnegative().optional(),
        propertyType: z.string().max(120).optional(),
      })
      .optional(),
  })
  .strict();

export const updatePropertyBodyAgent = z
  .object({
    status: z.enum(['AVAILABLE', 'UNDER_OFFER', 'UNAVAILABLE']),
  })
  .strict();

export const listPropertiesQuery = z
  .object({
    q: z.string().max(200).optional(),
    city: z.string().max(120).optional(),
    status: z.enum(['AVAILABLE', 'UNDER_OFFER', 'UNAVAILABLE']).optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    beds: z.coerce.number().int().nonnegative().optional(),
    baths: z.coerce.number().int().nonnegative().optional(),
    propertyType: z.string().max(120).optional(),
    assignedAgentId: z.string().min(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(20),
    offset: z.coerce.number().int().nonnegative().default(0),
  })
  .strict();

