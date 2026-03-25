import { forbidden } from '../lib/errors.js';

export function requireRole(allowedRoles) {
  const allowed = new Set(allowedRoles);

  return (req, _res, next) => {
    const role = req.auth?.role;
    if (!role || !allowed.has(role)) return next(forbidden());
    return next();
  };
}

