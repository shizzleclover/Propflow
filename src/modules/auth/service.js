import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { badRequest, unauthorized } from '../../lib/errors.js';
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

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || user.status !== 'ACTIVE') throw unauthorized('Invalid credentials');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw unauthorized('Invalid credentials');

  const accessToken = jwt.sign(
    { sub: user._id.toString(), role: user.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_TTL }
  );

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

