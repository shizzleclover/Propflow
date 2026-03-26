import { AppError } from '../lib/errors.js';
import { logRequestError } from '../lib/request-error-log.js';

export function errorHandler(err, req, res, _next) {
  const normalized = AppError.fromUnknown(err);

  logRequestError(req, normalized, err);

  res.status(normalized.status).json({
    error: {
      code: normalized.code,
      message: normalized.message,
      details: normalized.details,
    },
  });
}

