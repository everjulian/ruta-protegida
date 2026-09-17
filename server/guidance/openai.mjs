// -----------------------------------------------------------------------------
// Servicio OpenAI (SOLO server-side).
// - Lee la clave de process.env; nunca se importa desde el cliente.
// - Sin tool calling, sin navegación. Structured outputs + temperatura baja.
// - Timeout con AbortController. `fetchImpl` es inyectable para pruebas.
// -----------------------------------------------------------------------------
import { OUTPUT_JSON_SCHEMA } from './schema.mjs';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Llama al modelo y devuelve el objeto JSON generado (sin validar aún).
 * Lanza si hay error de red, timeout o respuesta no parseable.
 * @param {object} opts
 * @param {Array} opts.messages
 * @param {string} opts.apiKey
 * @param {string} [opts.model]
 * @param {number} [opts.timeoutMs]
 * @param {typeof fetch} [opts.fetchImpl]
 */
export async function callModel({
  messages,
  apiKey,
  model = 'gpt-4o-mini',
  timeoutMs = 8000,
  fetchImpl = fetch,
}) {
  if (!apiKey) throw new Error('missing_api_key');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(OPENAI_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 700,
        // Sin herramientas ni funciones: el modelo no puede actuar.
        response_format: { type: 'json_schema', json_schema: OUTPUT_JSON_SCHEMA },
        messages,
      }),
    });

    if (!res.ok) throw new Error(`openai_status_${res.status}`);
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') throw new Error('empty_completion');
    return JSON.parse(content);
  } finally {
    clearTimeout(timer);
  }
}
