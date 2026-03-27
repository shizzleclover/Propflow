import bcrypt from 'bcryptjs';
import { badRequest, notFound } from '../../lib/errors.js';
import { User } from './model.js';

export async function createUser({ role, name, email, password }) {
  const existing = await User.findOne({ email }).lean();
  if (existing) throw badRequest('Email already in use');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    role,
    status: 'ACTIVE',
    name,
    email,
    passwordHash,
  });

  return user;
}

export async function listUsers({ role, status }) {
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;

  const users = await User.find(filter).lean();
  return users.map((u) => ({
    id: u._id.toString(),
    role: u.role,
    status: u.status,
    name: u.name,
    email: u.email,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }));
}

export async function updateUser({ id, patch }) {
  const user = await User.findById(id);
  if (!user) throw notFound('User not found');

  if (patch.name !== undefined) user.name = patch.name;
  if (patch.status !== undefined) user.status = patch.status;

  await user.save();

  return {
    id: user._id.toString(),
    role: user.role,
    status: user.status,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function deleteUser({ id, actorId }) {
  if (id === actorId) throw badRequest('You cannot delete your own account');
  const user = await User.findByIdAndDelete(id);
  if (!user) throw notFound('User not found');
  return { ok: true };
}

