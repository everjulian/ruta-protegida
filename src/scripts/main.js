// -----------------------------------------------------------------------------
// Punto de entrada de la aplicación (SPA sin framework).
// Orquesta estado, orientación (getGuidance) y render. Vistas y datos viven en
// módulos separados (src/views, src/data, src/lib) para facilitar el trabajo
// en equipo y el reemplazo futuro del "cerebro" por IA.
// -----------------------------------------------------------------------------
import { icon } from '../data/icons.js';
import { cases } from '../data/cases.js';
import { phaseOrder } from '../data/phases.js';
import { state, phaseIndex, requiredAnswered, guidanceContext } from '../lib/state.js';
import { getGuidance } from '../lib/guidance/index.js';
import { buildGuidance } from '../lib/guidance/rules.js';
import { welcome } from '../views/welcome.js';
import { route } from '../views/route.js';
import { library } from '../views/library.js';
import { contact } from '../views/contact.js';
import { track } from '../lib/analytics.js';

// --- Cálculo de orientación + render ----------------------------------------
// Clave de caché: la orientación solo depende del caso y las respuestas.
function guidanceKey() {
  return JSON.stringify({ c: state.caseId, a: state.answers });
}

async function commit(focus = true, animate = true) {
  const key = guidanceKey();

  // Si las respuestas no cambiaron (p. ej. navegar entre fases o marcar
  // evidencia), reutiliza la orientación cacheada → instantáneo, sin llamar IA.
  if (key === state._gkey && state.guidance) {
    render(focus, animate);
    return;
  }
  state._gkey = key;

  // Render optimista e inmediato con el motor local (0 ms).
  state.guidance = buildGuidance(guidanceContext());
  render(focus, animate);

  // Enriquecimiento con IA (si está configurada) sin bloquear la interfaz.
  try {
    const g = await getGuidance(guidanceContext());
    if (guidanceKey() === key) {
      state.guidance = g;
      render(false, false);
    }
  } catch {
    /* se mantiene el resultado local */
  }
}

function render(focus = true, animate = true) {
  document.getElementById('main').innerHTML = `<div class="${animate ? 'view-enter' : ''}">${
    state.view === 'home'
      ? welcome()
      : state.view === 'route'
        ? route()
        : state.view === 'library'
          ? library()
          : contact()
  }</div>`;
  document
    .getElementById('nav-route')
    .classList.toggle('active', state.view === 'route' || state.view === 'home');
  document.getElementById('nav-library').classList.toggle('active', state.view === 'library');
  document.querySelectorAll('[data-icon]').forEach((el) => (el.innerHTML = icon(el.dataset.icon)));
  syncFeedbackBanner();
  if (focus) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.getElementById('main').focus({ preventScroll: true });
  }
}

// --- Transiciones ------------------------------------------------------------
function selectCase(id) {
  if (!cases.some((c) => c.id === id)) throw Error('Situación no válida');
  if (state.caseId !== id) {
    state.caseId = id;
    state.answers = {};
    state.evidence.clear();
  }
  state.phase = 'entender';
  state.maxPhase = 'entender';
  state.view = 'route';
  commit();
}

function changeCase() {
  state.caseId = null;
  state.answers = {};
  state.evidence.clear();
  state.phase = 'entender';
  state.maxPhase = 'entender';
  commit();
}

function goPhase(id) {
  if (phaseIndex(id) < 0 || phaseIndex(id) > phaseIndex(state.maxPhase)) return;
  state.phase = id;
  state.view = 'route';
  commit();
}

function advance() {
  const i = phaseOrder.indexOf(state.phase);
  if (state.phase === 'entender' && !requiredAnswered()) return;
  if (i < phaseOrder.length - 1) {
    state.phase = phaseOrder[i + 1];
    if (phaseIndex(state.phase) > phaseIndex(state.maxPhase)) state.maxPhase = state.phase;
    commit();
  }
}

function back() {
  const i = phaseOrder.indexOf(state.phase);
  if (i > 0) {
    state.phase = phaseOrder[i - 1];
    commit();
  } else {
    state.view = 'home';
    commit();
  }
}

// --- Eventos -----------------------------------------------------------------
// --- Analítica: eventos de una sola vez y control del banner de opinión ------
function trackOnce(name) {
  if (state.tracked[name]) return;
  state.tracked[name] = true;
  track(name);
}

function syncFeedbackBanner() {
  const banner = document.getElementById('feedback-banner');
  if (!banner) return;
  const atEnd = state.view === 'route' && state.phase === 'actuar';
  if (atEnd) trackOnce('flow_complete');
  const showing = atEnd && !state.feedback.dismissed;
  banner.classList.toggle('show', showing);
  // Oculta la barra fija de contacto (móvil) mientras el banner está abierto.
  document.body.classList.toggle('fb-open', showing);
}

function markThanks() {
  document.getElementById('fb-thanks')?.classList.add('show');
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  switch (el.dataset.action) {
    case 'home':
      state.view = 'home';
      commit();
      break;
    case 'start':
      trackOnce('flow_start');
      state.view = 'route';
      commit();
      break;
    case 'route':
      state.view = state.caseId || phaseIndex(state.maxPhase) > 0 ? 'route' : 'home';
      commit();
      break;
    case 'choose':
      selectCase(el.dataset.id);
      break;
    case 'change-case':
      changeCase();
      break;
    case 'phase':
      goPhase(el.dataset.phase);
      break;
    case 'next':
      advance();
      break;
    case 'back':
      if (state.view !== 'route') {
        state.view = 'home';
        commit();
      } else back();
      break;
    case 'library':
      state.view = 'library';
      commit();
      break;
    case 'legal':
      state.view = 'library';
      commit();
      document.getElementById('sentencia-' + el.dataset.index)?.scrollIntoView({ block: 'center' });
      break;
    case 'contact':
      track('contact_click');
      state.returnView = state.view;
      state.view = 'contact';
      commit();
      break;
    case 'fb-help': {
      const v = el.dataset.value;
      state.feedback.help = v;
      track('helpfulness_response', { valor: v });
      document
        .querySelectorAll('[data-action="fb-help"]')
        .forEach((b) => b.classList.toggle('sel', b.dataset.value === v));
      markThanks();
      break;
    }
    case 'fb-rate': {
      const r = Number(el.dataset.value);
      state.feedback.rating = r;
      track('rating_submit', { rating: r });
      document
        .querySelectorAll('[data-action="fb-rate"]')
        .forEach((b) => b.classList.toggle('on', Number(b.dataset.value) <= r));
      markThanks();
      break;
    }
    case 'fb-close':
      state.feedback.dismissed = true;
      document.getElementById('feedback-banner')?.classList.remove('show');
      break;
    case 'return':
      state.view = state.returnView === 'contact' ? 'home' : state.returnView;
      commit();
      break;
    case 'notice':
      document.getElementById('notice').showModal();
      break;
    case 'close':
      document.getElementById('notice').close();
      break;
  }
});

document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.matches('input[type="radio"]') && el.name) {
    state.answers[el.name] = el.value;
    commit(false, false); // actualización en sitio: sin animación ni salto de scroll
  }
  if (el.dataset.evidence !== undefined) {
    const id = el.dataset.evidence;
    el.checked ? state.evidence.add(id) : state.evidence.delete(id);
    commit(false, false);
  }
});

// Render inicial (home no requiere orientación).
render(false);

// --- Integración opcional con herramientas del cliente (si existe) -----------
if (document.modelContext?.registerTool) {
  const controller = new AbortController();
  window.addEventListener('pagehide', () => controller.abort(), { once: true });
  const tools = [
    {
      name: 'start_guided_route',
      title: 'Comenzar Ruta Protegida',
      description:
        'Abre la ruta y selecciona una situación laboral. Cambiar la situación reinicia las respuestas; no envía información.',
      inputSchema: {
        type: 'object',
        properties: { case_id: { type: 'string', enum: cases.map((c) => c.id) } },
        required: ['case_id'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (
          !input ||
          typeof input.case_id !== 'string' ||
          Object.keys(input).some((k) => k !== 'case_id')
        )
          throw Error('Entrada no válida');
        selectCase(input.case_id);
        return { phase: state.phase, selected_case: state.caseId };
      },
    },
    {
      name: 'read_route_progress',
      title: 'Consultar progreso',
      description:
        'Devuelve la fase actual y el número de evidencias marcadas, sin abrir servicios externos.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute(input) {
        if (!input || Object.keys(input).length) throw Error('No se esperan parámetros');
        return {
          phase: state.phase,
          unlocked_phase: state.maxPhase,
          evidence_count: state.evidence.size,
        };
      },
    },
  ];
  for (const tool of tools) {
    try {
      Promise.resolve(
        document.modelContext.registerTool(tool, { signal: controller.signal }),
      ).catch(() => {});
    } catch {}
  }
}
