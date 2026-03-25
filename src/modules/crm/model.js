import mongoose from 'mongoose';

const crmNoteSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', default: null, index: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null, index: true },
    text: { type: String, trim: true, required: true },
  },
  { timestamps: true }
);

crmNoteSchema.index({ clientId: 1, createdAt: -1 });

export const CrmNote = mongoose.model('CrmNote', crmNoteSchema);

