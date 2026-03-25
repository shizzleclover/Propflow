export class AppError extends Error {
  /**
   * @param {object} args
   * @param {string} args.code
   * @param {string} args.message
   * @param {number} args.status
   * @param {unknown} [args.details]
   */
  constructor({ code, message, status, details }) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  static fromUnknown(err) {
    if (err instanceof AppError) return err;

    // Zod validation errors often show up with name "ZodError"
    if (err && typeof err === 'object' && err.name === 'ZodError') {
      return new AppError({
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        status: 400,
        details: err.errors,
      });
    }

    return new AppError({
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong',
      status: 500,
      details: undefined,
    });
  }
}

export function badRequest(message, details) {
  return new AppError({ code: 'BAD_REQUEST', message, status: 400, details });
}

export function unauthorized(message = 'Unauthorized') {
  return new AppError({ code: 'UNAUTHORIZED', message, status: 401 });
}

export function forbidden(message = 'Forbidden') {
  return new AppError({ code: 'FORBIDDEN', message, status: 403 });
}

export function notFound(message = 'Not found') {
  return new AppError({ code: 'NOT_FOUND', message, status: 404 });
}

export function conflict(message = 'Conflict', details) {
  return new AppError({ code: 'CONFLICT', message, status: 409, details });
}

