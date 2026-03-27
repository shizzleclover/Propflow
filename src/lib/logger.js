function nowIso() {
  return new Date().toISOString();
}

function safeString(input, fallback = '') {
  return typeof input === 'string' ? input : fallback;
}

export function maskEmail(email) {
  const value = safeString(email).trim().toLowerCase();
  const at = value.indexOf('@');
  if (at <= 1) return value || '[empty]';
  return `${value[0]}***${value.slice(at)}`;
}

export function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

export function safeUserAgent(req) {
  const ua = req.headers['user-agent'];
  return safeString(ua, 'unknown').slice(0, 300);
}

export function logInfo(scope, message, meta = {}) {
  // eslint-disable-next-line no-console
  console.log(`[${nowIso()}] [${scope}] ${message}`, meta);
}

export function logWarn(scope, message, meta = {}) {
  // eslint-disable-next-line no-console
  console.warn(`[${nowIso()}] [${scope}] ${message}`, meta);
}

export function logError(scope, message, meta = {}) {
  // eslint-disable-next-line no-console
  console.error(`[${nowIso()}] [${scope}] ${message}`, meta);
}

