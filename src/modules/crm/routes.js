import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { clientIdParams, createNoteBody, listNotesQuery } from './validation.js';
import { createNote, listClientNotes } from './service.js';

export function crmRoutes() {
  const router = Router();

  router.use(requireAuth);

  router.post('/notes', validate({ body: createNoteBody }), async (req, res) => {
    const note = await createNote({ auth: req.auth, input: req.body });
    res.status(201).json({ note });
  });

  router.get(
    '/clients/:clientId/notes',
    validate({ params: clientIdParams, query: listNotesQuery }),
    async (req, res) => {
      const notes = await listClientNotes({
        auth: req.auth,
        clientId: req.params.clientId,
        query: req.query,
      });
      res.json({ notes });
    }
  );

  return router;
}

