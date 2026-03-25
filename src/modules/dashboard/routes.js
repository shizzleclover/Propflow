import { Router } from 'express';
import { Roles } from '../../lib/roles.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';
import { getKpis } from './service.js';

export function dashboardRoutes() {
  const router = Router();

  router.use(requireAuth, requireRole([Roles.ADMIN]));

  router.get('/kpis', async (_req, res) => {
    const kpis = await getKpis();
    res.json({ kpis });
  });

  return router;
}

