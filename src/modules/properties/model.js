import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['AVAILABLE', 'UNDER_OFFER', 'UNAVAILABLE'], default: 'AVAILABLE' },
    assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    address: {
      line1: { type: String, trim: true, required: true },
      line2: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, required: true },
      state: { type: String, trim: true, default: '' },
      postalCode: { type: String, trim: true, default: '' },
      country: { type: String, trim: true, default: '' },
    },
    price: { type: Number, min: 0, required: true, index: true },
    attributes: {
      beds: { type: Number, min: 0, default: 0 },
      baths: { type: Number, min: 0, default: 0 },
      areaSqft: { type: Number, min: 0, default: 0 },
      propertyType: { type: String, trim: true, default: '' },
    },
  },
  { timestamps: true }
);

propertySchema.index({ status: 1, price: 1 });
propertySchema.index({ 'address.city': 1 });

export const Property = mongoose.model('Property', propertySchema);

