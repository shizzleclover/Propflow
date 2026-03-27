import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { badRequest, unauthorized } from '../../lib/errors.js';
import { logInfo, logWarn, maskEmail } from '../../lib/logger.js';
import { Roles } from '../../lib/roles.js';
import { User } from '../users/model.js';

export async function registerClient({ name, email, password }) {
  const existing = await User.findOne({ email }).lean();
  if (existing) throw badRequest('Email already in use');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    role: Roles.CLIENT,
    status: 'ACTIVE',
    name,
    email,
    passwordHash,
  });

  return user;
}

export async function login({ email, password, meta }) {
  const emailMasked = maskEmail(email);
  const ip = meta?.ip ?? 'unknown';
  const userAgent = meta?.userAgent ?? 'unknown';

  logInfo('auth.login', 'Login attempt', {
    requestCode: 'AUTH_LOGIN_REQUEST',
    email: emailMasked,
    ip,
    userAgent,
  });

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    logWarn('auth.login', 'Login failed: user_not_found', {
      requestCode: 'AUTH_LOGIN_REQUEST',
      responseCode: 'AUTH_LOGIN_FAILED_USER_NOT_FOUND',
      httpStatus: 401,
      email: emailMasked,
      ip,
    });
    throw unauthorized('Invalid credentials');
  }
  if (user.status !== 'ACTIVE') {
    logWarn('auth.login', 'Login failed: user_inactive', {
      requestCode: 'AUTH_LOGIN_REQUEST',
      responseCode: 'AUTH_LOGIN_FAILED_USER_INACTIVE',
      httpStatus: 401,
      email: emailMasked,
      userId: user._id.toString(),
      role: user.role,
      status: user.status,
      ip,
    });
    throw unauthorized('Invalid credentials');
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    logWarn('auth.login', 'Login failed: password_mismatch', {
      requestCode: 'AUTH_LOGIN_REQUEST',
      responseCode: 'AUTH_LOGIN_FAILED_PASSWORD_MISMATCH',
      httpStatus: 401,
      email: emailMasked,
      userId: user._id.toString(),
      role: user.role,
      ip,
    });
    throw unauthorized('Invalid credentials');
  }

  const accessToken = jwt.sign(
    { sub: user._id.toString(), role: user.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_TTL }
  );

  logInfo('auth.login', 'Login success', {
    requestCode: 'AUTH_LOGIN_REQUEST',
    responseCode: 'AUTH_LOGIN_SUCCESS',
    httpStatus: 200,
    email: emailMasked,
    userId: user._id.toString(),
    role: user.role,
    ip,
  });

  return {
    accessToken,
    user: {
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    },
  };
}

