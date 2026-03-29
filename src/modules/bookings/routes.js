import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import {
  approveBody,
  bookingIdParams,
  addMessageBody,
  cancelBody,
  createBookingBody,
  declineBody,
  listBookingsQuery,
  proposeBody,
} from './validation.js';
import {
  addBookingMessage,
  approveBooking,
  cancelBooking,
  createBookingRequest,
  declineBooking,
  getBookingById,
  listBookings,
  proposeBooking,
} from './service.js';

export function bookingsRoutes() {
  const router = Router();

  router.use(requireAuth);

  router.post('/', validate({ body: createBookingBody }), async (req, res) => {
    const booking = await createBookingRequest({ auth: req.auth, input: req.body });
    res.status(201).json({ booking });
  });

  router.get('/', validate({ query: listBookingsQuery }), async (req, res) => {
    const bookings = await listBookings({ auth: req.auth, query: req.query });
    res.json({ bookings });
  });

  router.get('/:id', validate({ params: bookingIdParams }), async (req, res) => {
    const booking = await getBookingById({ auth: req.auth, bookingId: req.params.id });
    res.json({ booking });
  });

  router.patch('/:id/approve', validate({ params: bookingIdParams, body: approveBody }), async (req, res) => {
    const booking = await approveBooking({
      auth: req.auth,
      bookingId: req.params.id,
      confirmedSlot: req.body.confirmedSlot,
      agentNote: req.body.agentNote,
    });
    res.json({ booking });
  });

  router.patch('/:id/propose', validate({ params: bookingIdParams, body: proposeBody }), async (req, res) => {
    const booking = await proposeBooking({
      auth: req.auth,
      bookingId: req.params.id,
      proposedSlot: req.body.proposedSlot,
      agentNote: req.body.agentNote,
    });
    res.json({ booking });
  });

  router.patch('/:id/decline', validate({ params: bookingIdParams, body: declineBody }), async (req, res) => {
    const booking = await declineBooking({
      auth: req.auth,
      bookingId: req.params.id,
      agentNote: req.body.agentNote,
    });
    res.json({ booking });
  });

  router.patch('/:id/cancel', validate({ params: bookingIdParams, body: cancelBody }), async (req, res) => {
    const booking = await cancelBooking({
      auth: req.auth,
      bookingId: req.params.id,
      clientNote: req.body.clientNote,
    });
    res.json({ booking });
  });

  router.post('/:id/messages', validate({ params: bookingIdParams, body: addMessageBody }), async (req, res) => {
    const booking = await addBookingMessage({
      auth: req.auth,
      bookingId: req.params.id,
      text: req.body.text,
    });
    res.status(201).json({ booking });
  });

  return router;
}

