import { notFound } from '../../lib/errors.js';
import { Property } from './model.js';

export async function createProperty(input) {
  const property = await Property.create({
    ...input,
    description: input.description ?? '',
    attributes: input.attributes ?? {},
    imageUrls: input.imageUrls ?? [],
  });
  return property;
}

export async function getPropertyById(id) {
  const property = await Property.findById(id).populate('assignedAgentId', 'name email').lean();
  if (!property) throw notFound('Property not found');
  return property;
}

export async function listProperties({ role, query }) {
  const filter = {};

  if (!role || role === 'CLIENT') filter.status = 'AVAILABLE';
  else if (query.status) filter.status = query.status;

  if (query.city) filter['address.city'] = query.city;
  if (query.listingCategory) filter.listingCategory = query.listingCategory;
  if (query.assignedAgentId) filter.assignedAgentId = query.assignedAgentId;
  if (query.propertyType) filter['attributes.propertyType'] = query.propertyType;
  if (query.beds !== undefined) filter['attributes.beds'] = query.beds;
  if (query.baths !== undefined) filter['attributes.baths'] = query.baths;

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
    if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
  }

  if (query.q) {
    filter.$or = [
      { title: { $regex: query.q, $options: 'i' } },
      { description: { $regex: query.q, $options: 'i' } },
      { 'address.line1': { $regex: query.q, $options: 'i' } },
      { 'address.city': { $regex: query.q, $options: 'i' } },
    ];
  }

  const properties = await Property.find(filter)
    .sort({ updatedAt: -1 })
    .skip(query.offset)
    .limit(query.limit)
    .lean();

  return properties;
}

export async function updatePropertyAdmin({ id, patch }) {
  const property = await Property.findById(id);
  if (!property) throw notFound('Property not found');

  Object.assign(property, patch);
  await property.save();

  return property;
}

export async function updatePropertyAgent({ id, agentId, status }) {
  const property = await Property.findById(id);
  if (!property) throw notFound('Property not found');

  if (property.assignedAgentId.toString() !== agentId) throw notFound('Property not found');

  property.status = status;
  await property.save();

  return property;
}

