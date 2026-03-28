import { Router } from 'express';
import { Roles } from '../../lib/roles.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';
import { validate } from '../../lib/validate.js';
import { chatAssistant } from './service.js';
import { assistantChatBody } from './validation.js';

export function assistantRoutes() {
  const router = Router();

  router.post(
    '/chat',
    requireAuth,
    requireRole([Roles.CLIENT, Roles.ADMIN, Roles.AGENT]),
    validate({ body: assistantChatBody }),
    async (req, res) => {
      const result = await chatAssistant({ messages: req.body.messages });
      res.json(result);
    }
  );

  return router;
}
