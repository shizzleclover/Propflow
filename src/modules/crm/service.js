import { forbidden } from '../../lib/errors.js';
import { Roles } from '../../lib/roles.js';
import { CrmNote } from './model.js';

export async function createNote({ auth, input }) {
  if (auth.role !== Roles.AGENT) throw forbidden();

  const note = await CrmNote.create({
    clientId: input.clientId,
    agentId: auth.sub,
    propertyId: input.propertyId ?? null,
    bookingId: input.bookingId ?? null,
    text: input.text,
  });

  return note;
}

export async function listClientNotes({ auth, clientId, query }) {
  const filter = { clientId };

  if (auth.role === Roles.AGENT) filter.agentId = auth.sub;
  else if (auth.role !== Roles.ADMIN) throw forbidden();

  const notes = await CrmNote.find(filter)
    .sort({ createdAt: -1 })
    .skip(query.offset)
    .limit(query.limit)
    .lean();

  return notes;
}

