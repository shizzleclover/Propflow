import { AppError } from '../lib/errors.js';

export function errorHandler(err, _req, res, _next) {
  const normalized = AppError.fromUnknown(err);

  res.status(normalized.status).json({
    error: {
      code: normalized.code,
      message: normalized.message,
      details: normalized.details,
    },
  });
}

