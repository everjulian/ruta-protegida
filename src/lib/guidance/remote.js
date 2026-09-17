// -----------------------------------------------------------------------------
// Proveedor remoto: llama al endpoint server-side /api/guidance.
// - La URL base se configura con PUBLIC_GUIDANCE_API (no es secreto).
// - Envía SOLO contexto estructurado (sin PII, sin texto libre).
// - Ante cualquier fallo (red, timeout, respuesta inválida) cae al motor local.
// La clave de OpenAI vive únicamente en el servidor; aquí nunca se toca.
// -----------------------------------------------------------------------------
import { buildGuidance } from './rules.js';

const API_BASE = (import.meta.env.PUBLIC_GUIDANCE_API || '').replace(/\/$/, '');
const TIMEOUT_MS = 9000;

function isGuidanceShape(d) {
  return d && typeof d === 'object' && Array.isArray(d.actions) && Array.isArray(d.evidence);
}

export const remoteProvider = {
  async getGuidance(context) {
    const local = () => buildGuidance(context);
    if (!API_BASE) return local();

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
      if (!isGuidanceShape(data)) throw new Error('bad_shape');
      return data;
    } catch {
      return local(); // fallback determinístico local
    } finally {
      clearTimeout(timer);
    }
  },
};
