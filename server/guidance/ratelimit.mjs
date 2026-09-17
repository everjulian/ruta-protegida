// -----------------------------------------------------------------------------
// Rate limiting sencillo por clave (IP/sesión), en memoria (token bucket).
// NOTA: en despliegues serverless con varias instancias, sustituir el Map por
// un almacén compartido (KV/Redis). Para dev/instancia única es suficiente.
// -----------------------------------------------------------------------------

export function createRateLimiter({ capacity = 8, refillPerMinute = 8 } = {}) {
  const buckets = new Map(); // key -> { tokens, updated }
  const refillRate = refillPerMinute / 60000; // tokens por ms

  return {
    /** Devuelve { allowed, retryAfter } para una clave. */
    check(key, now = Date.now()) {
      const b = buckets.get(key) || { tokens: capacity, updated: now };
      // Rellena según el tiempo transcurrido.
      const delta = Math.max(0, now - b.updated);
      b.tokens = Math.min(capacity, b.tokens + delta * refillRate);
      b.updated = now;

      if (b.tokens >= 1) {
        b.tokens -= 1;
        buckets.set(key, b);
        return { allowed: true, retryAfter: 0 };
      }
      buckets.set(key, b);
      const retryAfter = Math.ceil((1 - b.tokens) / refillRate / 1000);
      return { allowed: false, retryAfter };
    },
    _buckets: buckets, // expuesto para pruebas
  };
}

/** Extrae una clave de cliente a partir de las cabeceras (IP) o sesión. */
export function clientKey(headers, sessionId) {
  const xff = headers.get?.('x-forwarded-for') || headers['x-forwarded-for'];
  const ip = (xff ? String(xff).split(',')[0] : '').trim() || 'local';
  return sessionId ? `${ip}:${sessionId}` : ip;
}
