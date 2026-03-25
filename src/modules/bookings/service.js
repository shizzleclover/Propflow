import { conflict, forbidden, notFound } from '../../lib/errors.js';
import { Roles } from '../../lib/roles.js';
import { Property } from '../properties/model.js';
import { Booking } from './model.js';

function toSlot(slot) {
  const start = new Date(slot.start);
  const end = new Date(slot.end);
  if (!(start instanceof Date) || Number.isNaN(start.getTime())) throw conflict('Invalid start datetime');
  if (!(end instanceof Date) || Number.isNaN(end.getTime())) throw conflict('Invalid end datetime');
  if (end <= start) throw conflict('Slot end must be after start');
  return { start, end };
}

async function assertNoConflicts({ propertyId, agentId, slot, ignoreBookingId }) {
  const overlapFilter = {
    status: 'APPROVED',
    confirmedSlot: { $ne: null },
    'confirmedSlot.start': { $lt: slot.end },
    'confirmedSlot.end': { $gt: slot.start },
    ...(ignoreBookingId ? { _id: { $ne: ignoreBookingId } } : {}),
    $or: [{ propertyId }, { agentId }],
  };

  const existing = await Booking.findOne(overlapFilter).lean();
  if (existing) {
    throw conflict('Booking conflict detected', {
      conflictBookingId: existing._id.toString(),
      propertyId: existing.propertyId.toString(),
      agentId: existing.agentId.toString(),
      confirmedSlot: existing.confirmedSlot,
    });
  }
}

export async function createBookingRequest({ auth, input }) {
  if (auth.role !== Roles.CLIENT) throw forbidden();

  const property = await Property.findById(input.propertyId).lean();
  if (!property || property.status !== 'AVAILABLE') throw notFound('Property not found');

  const preferredSlots = input.preferredSlots.map(toSlot);

  const booking = await Booking.create({
    propertyId: property._id,
    agentId: property.assignedAgentId,
    clientId: auth.sub,
    status: 'PENDING',
    preferredSlots,
    clientNote: input.clientNote ?? '',
  });

  return booking;
}

export async function listBookings({ auth, query }) {
  const filter = {};

  if (auth.role === Roles.CLIENT) filter.clientId = auth.sub;
  if (auth.role === Roles.AGENT) filter.agentId = auth.sub;
  if (auth.role === Roles.ADMIN && query.mine) filter.agentId = auth.sub;

  if (query.status) filter.status = query.status;

  const bookings = await Booking.find(filter)
    .sort({ updatedAt: -1 })
    .skip(query.offset)
    .limit(query.limit)
    .lean();

  return bookings;
}

export async function approveBooking({ auth, bookingId, confirmedSlot, agentNote }) {
  if (auth.role !== Roles.AGENT) throw forbidden();

  const booking = await Booking.findById(bookingId);
  if (!booking) throw notFound('Booking not found');
  if (booking.agentId.toString() !== auth.sub) throw notFound('Booking not found');

  const slot = toSlot(confirmedSlot);
  await assertNoConflicts({
    propertyId: booking.propertyId,
    agentId: booking.agentId,
    slot,
    ignoreBookingId: booking._id,
  });

  booking.status = 'APPROVED';
  booking.confirmedSlot = slot;
  booking.proposedSlot = null;
  if (agentNote !== undefined) booking.agentNote = agentNote;
  await booking.save();

  return booking;
}

export async function proposeBooking({ auth, bookingId, proposedSlot, agentNote }) {
  if (auth.role !== Roles.AGENT) throw forbidden();

  const booking = await Booking.findById(bookingId);
  if (!booking) throw notFound('Booking not found');
  if (booking.agentId.toString() !== auth.sub) throw notFound('Booking not found');

  const slot = toSlot(proposedSlot);

  booking.status = 'PROPOSED';
  booking.proposedSlot = slot;
  booking.confirmedSlot = null;
  if (agentNote !== undefined) booking.agentNote = agentNote;
  await booking.save();

  return booking;
}

export async function declineBooking({ auth, bookingId, agentNote }) {
  if (auth.role !== Roles.AGENT) throw forbidden();

  const booking = await Booking.findById(bookingId);
  if (!booking) throw notFound('Booking not found');
  if (booking.agentId.toString() !== auth.sub) throw notFound('Booking not found');

  booking.status = 'DECLINED';
  booking.proposedSlot = null;
  booking.confirmedSlot = null;
  if (agentNote !== undefined) booking.agentNote = agentNote;
  await booking.save();

  return booking;
}

export async function cancelBooking({ auth, bookingId, clientNote }) {
  if (auth.role !== Roles.CLIENT) throw forbidden();

  const booking = await Booking.findById(bookingId);
  if (!booking) throw notFound('Booking not found');
  if (booking.clientId.toString() !== auth.sub) throw notFound('Booking not found');

  booking.status = 'CANCELLED';
  booking.proposedSlot = null;
  booking.confirmedSlot = null;
  if (clientNote !== undefined) booking.clientNote = clientNote;
  await booking.save();

  return booking;
}

