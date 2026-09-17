// -----------------------------------------------------------------------------
// Sanitización y minimización de datos.
// - Redacta datos identificables (PII) antes de cualquier envío al modelo.
// - Neutraliza intentos de inyección de instrucciones (se tratan como DATO).
// - Impone límites de tamaño.
// Nada de esto se registra ni se persiste con contenido del usuario.
// -----------------------------------------------------------------------------

export const LIMITS = {
  maxBodyBytes: 4096, // tamaño máximo del cuerpo de la petición
  maxUserText: 500, // longitud máxima de texto libre (si algún día se usa)
  maxAnswers: 12, // número máximo de respuestas
};

// Patrones de PII (correo, teléfono, cédula/pasaporte, tarjetas). Conservadores.
// Orden importante: correo y web primero; documento (dígitos contiguos) antes
// que teléfono (que admite espacios/símbolos), para no confundir una cédula.
const PII_PATTERNS = [
  { tag: '[web]', re: /\bhttps?:\/\/\S+/gi },
  { tag: '[correo]', re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  { tag: '[documento]', re: /\b\d{9,13}\b/g },
  { tag: '[telefono]', re: /(?:\+?\d[\d\s().-]{6,}\d)/g },
];

// Frases que intentan cambiar el rol / extraer secretos: se neutralizan como texto.
const INJECTION_HINTS = [
  /ignora[a-z]*\s+(las\s+)?(anteriores\s+)?instruccion/i,
  /ignore\s+(all\s+)?previous/i,
  /system\s*prompt/i,
  /revela|revelar|muestra\s+tus\s+instrucciones/i,
  /api[_\s-]?key|clave\s+de\s+api|secreto/i,
  /act[uú]a\s+como|pretend\s+to\s+be|you\s+are\s+now/i,
];

/** Redacta PII de un texto libre, devolviendo el texto y qué se redactó. */
export function redactPII(text) {
  if (typeof text !== 'string') return { text: '', redacted: [] };
  let out = text;
  const redacted = [];
  for (const { tag, re } of PII_PATTERNS) {
    out = out.replace(re, () => {
      redacted.push(tag);
      return tag;
    });
  }
  return { text: out, redacted };
}

/** ¿El texto contiene un intento evidente de inyección de instrucciones? */
export function looksLikeInjection(text) {
  if (typeof text !== 'string') return false;
  return INJECTION_HINTS.some((re) => re.test(text));
}

/**
 * Limpia un texto libre para envío: recorta, redacta PII y lo marca como dato.
 * Aunque contenga "instrucciones", el prompt lo trata siempre como contenido
 * no confiable (ver prompt.mjs). No se ejecuta nunca.
 */
export function cleanUserText(text) {
  if (typeof text !== 'string') return { text: '', redacted: [], injection: false };
  const trimmed = text.slice(0, LIMITS.maxUserText);
  const { text: safe, redacted } = redactPII(trimmed);
  return { text: safe, redacted, injection: looksLikeInjection(trimmed) };
}

/** Verifica el tamaño del cuerpo crudo. */
export function withinSizeLimit(rawBody) {
  const bytes = typeof rawBody === 'string' ? Buffer.byteLength(rawBody, 'utf8') : rawBody?.length || 0;
  return bytes <= LIMITS.maxBodyBytes;
}
