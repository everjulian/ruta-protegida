// -----------------------------------------------------------------------------
// Proveedor remoto: llama al endpoint server-side /api/guidance.
// - URL base en PUBLIC_GUIDANCE_API (no es secreto).
// - Solo llama a la IA cuando ya hay suficientes respuestas (ahorra costo y
//   latencia); antes usa el motor local, que responde al instante.
// - Ante cualquier fallo (red, timeout, respuesta inválida) cae al motor local.
// La clave de OpenAI vive únicamente en el servidor; aquí nunca se toca.
// -----------------------------------------------------------------------------
import { buildGuidance } from './rules.js';

const API_BASE = (import.meta.env.PUBLIC_GUIDANCE_API || '').replace(/\/$/, '');
const TIMEOUT_MS = 9000;
// Nº de preguntas requeridas: por debajo de esto no vale la pena llamar a la IA.
const MIN_ANSWERS = 4;

function isGuidanceV2(d) {
  return d && typeof d === 'object' && Array.isArray(d.signals) && Array.isArray(d.actions);
}

export const remoteProvider = {
  async getGuidance(context) {
    const local = () => buildGuidance(context);
    const answers = context?.answers || {};
    if (!API_BASE || Object.keys(answers).length < MIN_ANSWERS) return local();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${API_BASE}/api/guidance`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          caseId: context.caseId,
          phase: context.phase,
          answers: context.answers,
        }),
      });
      if (!res.ok) throw new Error('bad_status');
      const data = await res.json();
      if (!isGuidanceV2(data)) throw new Error('bad_shape');
      return data;
    } catch {
      return local();
    } finally {
      clearTimeout(timer);
    }
  },
};
