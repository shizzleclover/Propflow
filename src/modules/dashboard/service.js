import mongoose from 'mongoose';
import { Booking } from '../bookings/model.js';
import { Property } from '../properties/model.js';
import { User } from '../users/model.js';

export async function getKpis() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [bookingsLast7d, bookingStatusCounts, approvedByAgent, totalAgents, totalClients, totalProperties] =
    await Promise.all([
      Booking.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { _id: 0, status: '$_id', count: 1 } },
      ]),
      Booking.aggregate([
        { $match: { status: 'APPROVED' } },
        { $group: { _id: '$agentId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, agentId: { $toString: '$_id' }, approvedCount: '$count' } },
      ]),
      User.countDocuments({ role: 'AGENT', status: 'ACTIVE' }),
      User.countDocuments({ role: 'CLIENT', status: 'ACTIVE' }),
      Property.countDocuments({}),
    ]);

  const bookingStatus = Object.fromEntries(bookingStatusCounts.map((r) => [r.status, r.count]));

  return {
    period: { from: sevenDaysAgo.toISOString(), to: now.toISOString() },
    totals: {
      agentsActive: totalAgents,
      clientsActive: totalClients,
      properties: totalProperties,
      bookingRequestsLast7d: bookingsLast7d,
    },
    bookingStatus,
    topAgentsByApprovedBookings: approvedByAgent,
    generatedAt: now.toISOString(),
    serverTimeMs: mongoose.now(),
  };
}

