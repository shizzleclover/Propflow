import { logRequestError } from '../lib/request-error-log.js';

export function notFound(req, res) {
  const normalized = {
    status: 404,
    code: 'NOT_FOUND',
    message: `No route for ${req.method} ${req.originalUrl}`,
    details: undefined,
  };

  logRequestError(req, normalized, null);

  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: normalized.message,
    },
  });
}

