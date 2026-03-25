import mongoose from 'mongoose';
import { Roles } from '../../lib/roles.js';

const userSchema = new mongoose.Schema(
  {
    role: { type: String, enum: Object.values(Roles), required: true },
    status: { type: String, enum: ['ACTIVE', 'DEACTIVATED'], default: 'ACTIVE' },
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, required: true },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, status: 1 });

export const User = mongoose.model('User', userSchema);

