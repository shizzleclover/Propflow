import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { unauthorized } from '../lib/errors.js';

function readBearerToken(headerValue) {
  const header = headerValue || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

export function requireAuth(req, _res, next) {
  const token = readBearerToken(req.headers.authorization);
  if (!token) return next(unauthorized());

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.auth = payload;
    return next();
  } catch {
    return next(unauthorized());
  }
}

export function optionalAuth(req, _res, next) {
  const token = readBearerToken(req.headers.authorization);
  if (!token) return next();

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.auth = payload;
  } catch {
    // For optional auth, ignore invalid token and continue as guest.
  }

  return next();
}

