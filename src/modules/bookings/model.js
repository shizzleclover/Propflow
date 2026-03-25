import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema(
  {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['PENDING', 'PROPOSED', 'APPROVED', 'DECLINED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    preferredSlots: { type: [slotSchema], default: [] },
    proposedSlot: { type: slotSchema, default: null },
    confirmedSlot: { type: slotSchema, default: null },
    clientNote: { type: String, trim: true, default: '' },
    agentNote: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

bookingSchema.index({ propertyId: 1, status: 1 });
bookingSchema.index({ agentId: 1, status: 1 });
bookingSchema.index({ clientId: 1, status: 1 });
bookingSchema.index({ 'confirmedSlot.start': 1, 'confirmedSlot.end': 1 });

export const Booking = mongoose.model('Booking', bookingSchema);

