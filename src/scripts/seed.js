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
    { role: Roles.ADMIN, status: 'ACTIVE', name: 'Nexa Admin', email: 'admin@nexahomes.dev', passwordHash },
    { role: Roles.STAFF, status: 'ACTIVE', name: 'Nexa Staff', email: 'staff1@nexahomes.dev', passwordHash },
    { role: Roles.AGENT, status: 'ACTIVE', name: 'Nexa Agent', email: 'agent1@nexahomes.dev', passwordHash },
    { role: Roles.AGENT, status: 'ACTIVE', name: 'Nexa Agent Two', email: 'agent2@nexahomes.dev', passwordHash },
    { role: Roles.CLIENT, status: 'ACTIVE', name: 'Nexa Client', email: 'client1@nexahomes.dev', passwordHash },
    { role: Roles.CLIENT, status: 'ACTIVE', name: 'Nexa Client Two', email: 'client2@nexahomes.dev', passwordHash },
  ]);

  const u = (path) => `${path}?auto=format&fit=crop&w=1400&q=80`;

  const [propertyA, propertyB, propertyC] = await Property.create([
    {
      title: 'Modern 2-Bed Apartment',
      description: 'Close to transport and shopping.',
      listingCategory: 'RENT',
      bookingEnabled: true,
      status: 'AVAILABLE',
      assignedAgentId: agentA._id,
      address: { line1: '12 River St', city: 'Sydney', country: 'Australia' },
      price: 120000,
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
      listingCategory: 'RENT',
      bookingEnabled: true,
      status: 'UNDER_OFFER',
      assignedAgentId: agentA._id,
      address: { line1: '88 Pine Ave', city: 'Sydney', country: 'Australia' },
      price: 180000,
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
      price: 95000,
      imageUrls: [
        u('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'),
        u('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'),
      ],
      attributes: { beds: 1, baths: 1, areaSqft: 420, propertyType: 'Studio' },
    },
    {
      title: 'Lekki Beachfront Villa',
      description: 'Premium 5-bedroom villa near the waterfront.',
      listingCategory: 'SALE',
      bookingEnabled: true,
      status: 'AVAILABLE',
      assignedAgentId: agentA._id,
      address: { line1: '21 Admiralty Way', city: 'Lagos', country: 'Nigeria' },
      price: 750000000,
      imageUrls: [
        u('https://images.unsplash.com/photo-1613977257365-aaae5a9817ff'),
        u('https://images.unsplash.com/photo-1617098474202-0d0d7f60f0b1'),
      ],
      attributes: { beds: 5, baths: 5, areaSqft: 4300, propertyType: 'Villa' },
    },
    {
      title: 'Ikeja 3-Bed Apartment',
      description: 'Serviced apartment in a secure estate.',
      listingCategory: 'RENT',
      bookingEnabled: true,
      status: 'AVAILABLE',
      assignedAgentId: agentA._id,
      address: { line1: '15 Allen Avenue', city: 'Lagos', country: 'Nigeria' },
      price: 180000,
      imageUrls: [
        u('https://images.unsplash.com/photo-1494526585095-c41746248156'),
        u('https://images.unsplash.com/photo-1484154218962-a197022b5858'),
      ],
      attributes: { beds: 3, baths: 3, areaSqft: 1600, propertyType: 'Apartment' },
    },
    {
      title: 'Abuja Duplex in Gwarinpa',
      description: 'Modern duplex suitable for family living.',
      listingCategory: 'SALE',
      bookingEnabled: true,
      status: 'AVAILABLE',
      assignedAgentId: agentB._id,
      address: { line1: '7 Crescent Road', city: 'Abuja', country: 'Nigeria' },
      price: 420000000,
      imageUrls: [
        u('https://images.unsplash.com/photo-1512917774080-9991f1c4c750'),
        u('https://images.unsplash.com/photo-1600607688969-a5bfcd646154'),
      ],
      attributes: { beds: 4, baths: 4, areaSqft: 3100, propertyType: 'Duplex' },
    },
    {
      title: 'Yaba Loft Apartment',
      description: 'Open-plan loft close to major business districts.',
      listingCategory: 'RENT',
      bookingEnabled: true,
      status: 'AVAILABLE',
      assignedAgentId: agentB._id,
      address: { line1: '42 Herbert Macaulay Way', city: 'Lagos', country: 'Nigeria' },
      price: 135000,
      imageUrls: [
        u('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85'),
        u('https://images.unsplash.com/photo-1600566752227-8f3b2f2aab96'),
      ],
      attributes: { beds: 2, baths: 2, areaSqft: 980, propertyType: 'Loft' },
    },
    {
      title: 'Asokoro Executive Residence',
      description: 'Luxury residence in a high-demand neighborhood.',
      listingCategory: 'SALE',
      bookingEnabled: true,
      status: 'AVAILABLE',
      assignedAgentId: agentA._id,
      address: { line1: '11 Diplomatic Drive', city: 'Abuja', country: 'Nigeria' },
      price: 980000000,
      imageUrls: [
        u('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d'),
        u('https://images.unsplash.com/photo-1600607687644-c94bf1b91dfc'),
      ],
      attributes: { beds: 6, baths: 6, areaSqft: 5200, propertyType: 'Mansion' },
    },
    {
      title: 'Port Harcourt Terrace',
      description: 'Well-finished terrace home in a gated estate.',
      listingCategory: 'SALE',
      bookingEnabled: true,
      status: 'AVAILABLE',
      assignedAgentId: agentB._id,
      address: { line1: '5 New GRA Lane', city: 'Port Harcourt', country: 'Nigeria' },
      price: 265000000,
      imageUrls: [
        u('https://images.unsplash.com/photo-1572120360610-d971b9d7767c'),
        u('https://images.unsplash.com/photo-1600585152915-d208bec867a1'),
      ],
      attributes: { beds: 4, baths: 3, areaSqft: 2500, propertyType: 'Terrace' },
    },
    {
      title: 'Enugu Smart Studio',
      description: 'Affordable smart studio with modern fixtures.',
      listingCategory: 'RENT',
      bookingEnabled: true,
      status: 'AVAILABLE',
      assignedAgentId: agentA._id,
      address: { line1: '9 Independence Layout', city: 'Enugu', country: 'Nigeria' },
      price: 90000,
      imageUrls: [
        u('https://images.unsplash.com/photo-1600607686527-6fb886090705'),
        u('https://images.unsplash.com/photo-1600607688962-a5bfcd646154'),
      ],
      attributes: { beds: 1, baths: 1, areaSqft: 510, propertyType: 'Studio' },
    },
    {
      title: 'Ibadan Family Bungalow',
      description: 'Spacious bungalow in a serene neighborhood.',
      listingCategory: 'SALE',
      bookingEnabled: true,
      status: 'AVAILABLE',
      assignedAgentId: agentB._id,
      address: { line1: '28 Ring Road', city: 'Ibadan', country: 'Nigeria' },
      price: 150000000,
      imageUrls: [
        u('https://images.unsplash.com/photo-1600573472550-8090b5e0745e'),
        u('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c'),
      ],
      attributes: { beds: 3, baths: 2, areaSqft: 1900, propertyType: 'Bungalow' },
    },
    {
      title: 'Lekki Short-stay Penthouse',
      description: 'Top-floor penthouse ideal for premium short stays.',
      listingCategory: 'RENT',
      bookingEnabled: true,
      status: 'AVAILABLE',
      assignedAgentId: agentA._id,
      address: { line1: '4 Freedom Way', city: 'Lagos', country: 'Nigeria' },
      price: 320000,
      imageUrls: [
        u('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0'),
        u('https://images.unsplash.com/photo-1600585154526-990dced4db0d'),
      ],
      attributes: { beds: 4, baths: 4, areaSqft: 2800, propertyType: 'Penthouse' },
    },
    {
      title: 'Ajah Garden Apartment',
      description: 'Well-lit apartment close to major roads.',
      listingCategory: 'RENT',
      bookingEnabled: true,
      status: 'AVAILABLE',
      assignedAgentId: agentB._id,
      address: { line1: '67 Abraham Adesanya', city: 'Lagos', country: 'Nigeria' },
      price: 110000,
      imageUrls: [
        u('https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde'),
        u('https://images.unsplash.com/photo-1600607687644-c94bf1b91dfc'),
      ],
      attributes: { beds: 2, baths: 2, areaSqft: 1200, propertyType: 'Apartment' },
    },
    {
      title: 'Victoria Island Office Home',
      description: 'Mixed-use premium unit in a central district.',
      listingCategory: 'SALE',
      bookingEnabled: true,
      status: 'AVAILABLE',
      assignedAgentId: agentA._id,
      address: { line1: '103 Ahmadu Bello Way', city: 'Lagos', country: 'Nigeria' },
      price: 680000000,
      imageUrls: [
        u('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d'),
        u('https://images.unsplash.com/photo-1600566753151-384129cf4e3a'),
      ],
      attributes: { beds: 5, baths: 4, areaSqft: 3900, propertyType: 'Detached' },
    },
    {
      title: 'Maitama Premium Flat',
      description: 'Fully serviced flat in a quiet district.',
      listingCategory: 'RENT',
      bookingEnabled: true,
      status: 'AVAILABLE',
      assignedAgentId: agentB._id,
      address: { line1: '18 Euphrates Street', city: 'Abuja', country: 'Nigeria' },
      price: 240000,
      imageUrls: [
        u('https://images.unsplash.com/photo-1617104551722-3b2d513664f7'),
        u('https://images.unsplash.com/photo-1513694203232-719a280e022f'),
      ],
      attributes: { beds: 3, baths: 3, areaSqft: 1700, propertyType: 'Flat' },
    },
    {
      title: 'Kaduna Corner Duplex',
      description: 'Corner lot duplex with spacious parking.',
      listingCategory: 'SALE',
      bookingEnabled: true,
      status: 'AVAILABLE',
      assignedAgentId: agentA._id,
      address: { line1: '14 Yakowa Road', city: 'Kaduna', country: 'Nigeria' },
      price: 210000000,
      imageUrls: [
        u('https://images.unsplash.com/photo-1600585154526-990dced4db0d'),
        u('https://images.unsplash.com/photo-1600607688962-a5bfcd646154'),
      ],
      attributes: { beds: 4, baths: 3, areaSqft: 2300, propertyType: 'Duplex' },
    },
    {
      title: 'Owerri Executive Apartment',
      description: 'Modern apartment with good road access.',
      listingCategory: 'RENT',
      bookingEnabled: true,
      status: 'AVAILABLE',
      assignedAgentId: agentB._id,
      address: { line1: '31 Ikenegbu Layout', city: 'Owerri', country: 'Nigeria' },
      price: 98000,
      imageUrls: [
        u('https://images.unsplash.com/photo-1493666438817-866a91353ca9'),
        u('https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea'),
      ],
      attributes: { beds: 2, baths: 2, areaSqft: 1050, propertyType: 'Apartment' },
    },
    {
      title: 'Benin GRA Bungalow',
      description: 'Classic bungalow with renovated interiors.',
      listingCategory: 'SALE',
      bookingEnabled: true,
      status: 'AVAILABLE',
      assignedAgentId: agentA._id,
      address: { line1: '22 Golf Course Road', city: 'Benin City', country: 'Nigeria' },
      price: 175000000,
      imageUrls: [
        u('https://images.unsplash.com/photo-1568605114967-8130f3a36994'),
        u('https://images.unsplash.com/photo-1600047508788-786fbe3c9c52'),
      ],
      attributes: { beds: 3, baths: 2, areaSqft: 2000, propertyType: 'Bungalow' },
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
    'admin@nexahomes.dev, staff1@nexahomes.dev, agent1@nexahomes.dev, agent2@nexahomes.dev, client1@nexahomes.dev, client2@nexahomes.dev'
  );

  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed', err);
  process.exit(1);
});

