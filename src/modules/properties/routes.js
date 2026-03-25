import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { Roles } from '../../lib/roles.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';
import {
  createPropertyBody,
  listPropertiesQuery,
  propertyIdParams,
  updatePropertyBodyAdmin,
  updatePropertyBodyAgent,
} from './validation.js';
import {
  createProperty,
  getPropertyById,
  listProperties,
  updatePropertyAdmin,
  updatePropertyAgent,
} from './service.js';

export function propertiesRoutes() {
  const router = Router();

  // Public/client browsing is allowed, but clients only see AVAILABLE listings.
  router.get('/', validate({ query: listPropertiesQuery }), async (req, res) => {
    const isClient = req.auth?.role === Roles.CLIENT;
    const props = await listProperties({ isClient, query: req.query });
    res.json({ properties: props });
  });

  router.get('/:id', validate({ params: propertyIdParams }), async (req, res) => {
    const property = await getPropertyById(req.params.id);
    if (req.auth?.role === Roles.CLIENT && property.status !== 'AVAILABLE') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Property not found' } });
    }
    res.json({ property });
  });

  // Admin create/edit.
  router.post(
    '/',
    requireAuth,
    requireRole([Roles.ADMIN]),
    validate({ body: createPropertyBody }),
    async (req, res) => {
      const property = await createProperty(req.body);
      res.status(201).json({ property });
    }
  );

  router.patch(
    '/:id',
    requireAuth,
    validate({ params: propertyIdParams }),
    async (req, res, next) => {
      const role = req.auth.role;
      if (role === Roles.ADMIN) {
        return validate({ body: updatePropertyBodyAdmin })(req, res, async (err) => {
          if (err) return next(err);
          const property = await updatePropertyAdmin({ id: req.params.id, patch: req.body });
          res.json({ property });
        });
      }

      if (role === Roles.AGENT) {
        return validate({ body: updatePropertyBodyAgent })(req, res, async (err) => {
          if (err) return next(err);
          const property = await updatePropertyAgent({
            id: req.params.id,
            agentId: req.auth.sub,
            status: req.body.status,
          });
          res.json({ property });
        });
      }

      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Forbidden' } });
    }
  );

  return router;
}

