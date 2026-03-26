import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDb } from '../lib/db.js';
import { User } from '../modules/users/model.js';
import { Property } from '../modules/properties/model.js';
import { Booking } from '../modules/bookings/model.js';
import { CrmNote } from '../modules/crm/model.js';
import { Roles } from '../lib/roles.js';

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required to seed data');
  }

  await connectDb(mongoUri);

  await Promise.all([CrmNote.deleteMany({}), Booking.deleteMany({}), Property.deleteMany({}), User.deleteMany({})]);

  const defaultPassword = 'password123';
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  const [admin, , agentA, agentB, clientA, clientB] = await User.create([
    { role: Roles.ADMIN, status: 'ACTIVE', name: 'Admin One', email: 'admin@propflow.dev', passwordHash },
    { role: Roles.STAFF, status: 'ACTIVE', name: 'Sam Staff', email: 'staff1@propflow.dev', passwordHash },
    { role: Roles.AGENT, status: 'ACTIVE', name: 'Ava Agent', email: 'agent1@propflow.dev', passwordHash },
    { role: Roles.AGENT, status: 'ACTIVE', name: 'Noah Agent', email: 'agent2@propflow.dev', passwordHash },
    { role: Roles.CLIENT, status: 'ACTIVE', name: 'Liam Client', email: 'client1@propflow.dev', passwordHash },
    { role: Roles.CLIENT, status: 'ACTIVE', name: 'Emma Client', email: 'client2@propflow.dev', passwordHash },
  ]);

  const u = (path) => `${path}?auto=format&fit=crop&w=1400&q=80`;

  const [propertyA, propertyB, propertyC] = await Property.create([
    {
      title: 'Modern 2-Bed Apartment',
      description: 'Close to transport and shopping.',
      listingCategory: 'SALE',
      bookingEnabled: true,
      status: 'AVAILABLE',
      assignedAgentId: agentA._id,
      address: { line1: '12 River St', city: 'Sydney', country: 'Australia' },
      price: 930000,
      imageUrls: [
        u('https://images.unsplash.com/photo-1564013799919-ab600027ffc6'),
        u('https://images.unsplash.com/photo-1600585154340-be6161a56a0c'),
        u('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c'),
      ],
      attributes: { beds: 2, baths: 1, areaSqft: 860, propertyType: 'Apartment' },
    },
    {
      title: 'Family Home with Garden',
      description: 'Quiet suburb and large backyard.',
      listingCategory: 'SALE',
      bookingEnabled: true,
      status: 'UNDER_OFFER',
      assignedAgentId: agentA._id,
      address: { line1: '88 Pine Ave', city: 'Sydney', country: 'Australia' },
      price: 1450000,
      imageUrls: [
        u('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9'),
        u('https://images.unsplash.com/photo-1600585154526-990dced4db0d'),
      ],
      attributes: { beds: 4, baths: 2, areaSqft: 2100, propertyType: 'House' },
    },
    {
      title: 'City Studio',
      description: 'Compact studio for first-home buyers.',
      listingCategory: 'RENT',
      bookingEnabled: true,
      status: 'AVAILABLE',
      assignedAgentId: agentB._id,
      address: { line1: '2 Central Blvd', city: 'Melbourne', country: 'Australia' },
      price: 2450,
      imageUrls: [
        u('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'),
        u('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'),
      ],
      attributes: { beds: 1, baths: 1, areaSqft: 420, propertyType: 'Studio' },
    },
  ]);

  const now = Date.now();
  const hour = 60 * 60 * 1000;

  const [bookingApproved] = await Booking.create([
    {
      propertyId: propertyA._id,
      agentId: agentA._id,
      clientId: clientA._id,
      status: 'APPROVED',
      preferredSlots: [{ start: new Date(now + 24 * hour), end: new Date(now + 24.5 * hour) }],
      confirmedSlot: { start: new Date(now + 24 * hour), end: new Date(now + 24.5 * hour) },
      clientNote: 'Prefer morning slot.',
      agentNote: 'Confirmed.',
    },
  ]);

  await Booking.create([
    {
      propertyId: propertyC._id,
      agentId: agentB._id,
      clientId: clientB._id,
      status: 'PENDING',
      preferredSlots: [{ start: new Date(now + 48 * hour), end: new Date(now + 48.5 * hour) }],
      clientNote: 'Available after 10am.',
    },
  ]);

  await CrmNote.create([
    {
      clientId: clientA._id,
      agentId: agentA._id,
      propertyId: propertyA._id,
      bookingId: bookingApproved._id,
      text: 'Client likes properties near schools.',
    },
  ]);

  // eslint-disable-next-line no-console
  console.log('Seed complete');
  // eslint-disable-next-line no-console
  console.log('Users (password for all): password123');
  // eslint-disable-next-line no-console
  console.log(
    'admin@propflow.dev, staff1@propflow.dev, agent1@propflow.dev, agent2@propflow.dev, client1@propflow.dev, client2@propflow.dev'
  );

  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed', err);
  process.exit(1);
});

