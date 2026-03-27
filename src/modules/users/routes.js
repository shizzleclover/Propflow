import { Router } from 'express';
import { validate } from '../../lib/validate.js';
import { Roles } from '../../lib/roles.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';
import { createUser, deleteUser, listUsers, updateUser } from './service.js';
import { createUserBody, listUsersQuery, updateUserBody, updateUserParams } from './validation.js';

export function usersRoutes() {
  const router = Router();

  router.use(requireAuth, requireRole([Roles.ADMIN]));

  router.post('/', validate({ body: createUserBody }), async (req, res) => {
    const user = await createUser(req.body);
    res.status(201).json({
      user: { id: user._id.toString(), role: user.role, status: user.status, name: user.name, email: user.email },
    });
  });

  router.get('/', validate({ query: listUsersQuery }), async (req, res) => {
    const users = await listUsers(req.query);
    res.json({ users });
  });

  router.patch('/:id', validate({ params: updateUserParams, body: updateUserBody }), async (req, res) => {
    const user = await updateUser({ id: req.params.id, patch: req.body });
    res.json({ user });
  });

  router.delete('/:id', validate({ params: updateUserParams }), async (req, res) => {
    await deleteUser({ id: req.params.id, actorId: req.auth.sub });
    res.status(204).send();
  });

  return router;
}

