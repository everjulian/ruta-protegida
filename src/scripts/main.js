// -----------------------------------------------------------------------------
// Punto de entrada de la aplicación (SPA sin framework).
// Orquesta el estado, el render y los eventos. Las vistas y los datos viven
// en módulos separados (src/views, src/data, src/lib) para facilitar el
// mantenimiento y el trabajo en equipo.
// -----------------------------------------------------------------------------
import { icon } from '../data/icons.js';
import { cases } from '../data/cases.js';
import { state, currentCase, step2Complete } from '../lib/state.js';
import { welcome } from '../views/welcome.js';
import { route } from '../views/route.js';
import { library } from '../views/library.js';
import { contact } from '../views/contact.js';

// --- Render ------------------------------------------------------------------
function render(focus = true) {
  document.getElementById('main').innerHTML =
    `<div class="view-enter">${
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
  if (focus) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.getElementById('main').focus({ preventScroll: true });
  }
}

// --- Transiciones de estado --------------------------------------------------
function goStep(n) {
  if (!Number.isInteger(n) || n < 1 || n > state.max) throw Error('Etapa no disponible');
  state.step = n;
  state.view = 'route';
  render();
}

function selectCase(id) {
  if (!cases.some((c) => c.id === id)) throw Error('Situación no válida');
  if (state.caseId !== id) {
    state.caseId = id;
    state.max = 1;
    state.answers = {};
    state.tasks.clear();
    state.evidence.clear();
  }
  state.step = 1;
  state.view = 'route';
  render(false);
}

function next() {
  if (state.step === 1 && !currentCase()) return;
  if (state.step === 2 && !step2Complete()) return;
  if (state.step < 6) {
    state.step++;
    state.max = Math.max(state.max, state.step);
    render();
  }
}

// --- Eventos -----------------------------------------------------------------
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  switch (el.dataset.action) {
    case 'home':
      state.view = 'home';
      render();
      break;
    case 'start':
      state.view = 'route';
      render();
      break;
    case 'route':
      state.view = state.caseId || state.max > 1 ? 'route' : 'home';
      render();
      break;
    case 'choose':
      selectCase(el.dataset.id);
      break;
    case 'next':
      next();
      break;
    case 'back':
      if (state.step > 1) goStep(state.step - 1);
      else {
        state.view = 'home';
        render();
      }
      break;
    case 'step':
      goStep(Number(el.dataset.step));
      break;
    case 'library':
      state.view = 'library';
      render();
      break;
    case 'legal':
      state.view = 'library';
      render();
      document.getElementById('sentencia-' + el.dataset.index)?.scrollIntoView({ block: 'center' });
      break;
    case 'contact':
      state.returnView = state.view;
      state.view = 'contact';
      render();
      break;
    case 'return':
      state.view = state.returnView === 'contact' ? 'home' : state.returnView;
      render();
      break;
    case 'revisit':
      goStep(1);
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
  if (el.matches('input[type="radio"]')) {
    state.answers[el.name] = el.value;
    const nextButton = document.querySelector('[data-action="next"]');
    if (nextButton) nextButton.disabled = !step2Complete();
  }
  if (el.dataset.evidence !== undefined) {
    const n = Number(el.dataset.evidence);
    el.checked ? state.evidence.add(n) : state.evidence.delete(n);
    document.getElementById('evidence-count').textContent =
      `${state.evidence.size} de ${el.closest('.checklist').querySelectorAll('input').length} elementos marcados`;
  }
  if (el.dataset.task !== undefined) {
    const n = Number(el.dataset.task);
    el.checked ? state.tasks.add(n) : state.tasks.delete(n);
  }
});

// Render inicial.
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
        'Abre la ruta y selecciona una situación laboral. Cambiar la situación reinicia las respuestas de la ruta; no envía información.',
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
        return { step: state.step, selected_case: state.caseId };
      },
    },
    {
      name: 'read_route_progress',
      title: 'Consultar progreso',
      description:
        'Devuelve la etapa y el número de evidencias marcadas, sin abrir servicios externos.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute(input) {
        if (!input || Object.keys(input).length) throw Error('No se esperan parámetros');
        return { step: state.step, unlocked_step: state.max, evidence_count: state.evidence.size };
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
