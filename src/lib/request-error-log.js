import { AppError } from './errors.js';

/**
 * Logs API errors to the console with status, code, route, and optional details.
 * @param {import('express').Request} req
 * @param {import('./errors.js').AppError} normalized
 * @param {unknown} [originalErr] - Raw error before normalization (for 5xx stacks)
 */
export function logRequestError(req, normalized, originalErr) {
  const parts = [
    `[PropFlow API]`,
    `${normalized.status}`,
    normalized.code,
    `${req.method} ${req.originalUrl}`,
    `— ${normalized.message}`,
  ];

  const line = parts.join(' ');

  if (normalized.status >= 500) {
    console.error(line);
    if (originalErr && !(originalErr instanceof AppError) && originalErr.stack) {
      console.error(originalErr.stack);
    } else if (originalErr instanceof Error && originalErr.stack) {
      console.error(originalErr.stack);
    }
  } else if (normalized.status >= 400) {
    console.warn(line);
  } else {
    console.log(line);
  }

  if (normalized.details !== undefined && normalized.details !== null) {
    try {
      const detailsStr =
        typeof normalized.details === 'string'
          ? normalized.details
          : JSON.stringify(normalized.details, null, 2);
      const preview = detailsStr.length > 2000 ? `${detailsStr.slice(0, 2000)}…` : detailsStr;
      console.warn(`  details: ${preview}`);
    } catch {
      console.warn('  details: [unserializable]');
    }
  }
}
