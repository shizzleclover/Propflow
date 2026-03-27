import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { clientIp, safeUserAgent } from '../../lib/logger.js';
import { requireAuth } from '../../middleware/auth.js';
import { loginBody, registerClientBody } from './validation.js';
import { login, registerClient } from './service.js';
import { User } from '../users/model.js';

export function authRoutes() {
  const router = Router();

  router.post('/register-client', validate({ body: registerClientBody }), async (req, res) => {
    const user = await registerClient(req.body);
    res.status(201).json({
      user: { id: user._id.toString(), role: user.role, name: user.name, email: user.email },
    });
  });

  router.post('/login', validate({ body: loginBody }), async (req, res) => {
    const result = await login({
      ...req.body,
      meta: {
        ip: clientIp(req),
        userAgent: safeUserAgent(req),
      },
    });
    res.json(result);
  });

  router.get('/me', requireAuth, async (req, res) => {
    const user = await User.findById(req.auth.sub).lean();
    res.json({
      user: user
        ? { id: user._id.toString(), role: user.role, name: user.name, email: user.email, status: user.status }
        : null,
    });
  });

  return router;
}

