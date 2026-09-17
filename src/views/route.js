import { icon } from '../data/icons.js';
import { phases, phaseOrder } from '../data/phases.js';
import { cases } from '../data/cases.js';
import { questionsForCase, findOption } from '../data/questions.js';
import { protections } from '../data/protections.js';
import { state, currentCase, phaseIndex, requiredAnswered } from '../lib/state.js';
import { button, hint, legalNote } from '../lib/ui.js';

// =============================================================================
// Vista de la ruta: navegación por 4 fases (Entender→Preparar→Conocer→Actuar).
// Todo el contenido dinámico proviene de state.guidance (getGuidance).
// =============================================================================
export function route() {
  const g = state.guidance;
  return `<div class="route">
    ${phaseNav()}
    <section class="phase-body">${phaseContent(g)}</section>
    ${ctaBar(g)}
    ${legalNote()}
  </div>`;
}

// --- Navegación visual de fases ---------------------------------------------
function phaseNav() {
  const cur = phaseIndex(state.phase);
  const max = phaseIndex(state.maxPhase);
  return `<nav class="phasenav" aria-label="Fases del recorrido">${phases
    .map((p, i) => {
      const status = i < cur ? 'done' : i === cur ? 'current' : '';
      const reachable = i <= max;
      return `<button class="phase ${status}" data-action="phase" data-phase="${p.id}" ${reachable ? '' : 'disabled'} ${i === cur ? 'aria-current="step"' : ''}>
        <span class="phase-dot">${i < cur ? icon('check') : icon(p.icon)}</span>
        <span class="phase-text"><span class="phase-label">${p.label}</span></span>
      </button>${i < phases.length - 1 ? '<span class="phase-sep" aria-hidden="true"></span>' : ''}`;
    })
    .join('')}</nav>`;
}

function phaseContent(g) {
  switch (state.phase) {
    case 'entender':
      return entender(g);
    case 'preparar':
      return preparar(g);
    case 'conocer':
      return conocer(g);
    case 'actuar':
      return actuar(g);
  }
}

function heading(k, title, desc) {
  return `<span class="eyebrow">${k}</span><h1>${title}</h1><p class="subtitle">${desc}</p>`;
}

function navRow(nextLabel, disabled = false) {
  return `<div class="bottom-actions">${button(icon('back') + ' Atrás', 'back', 'secondary')}${button(
    nextLabel + ' ' + icon('arrow'),
    'next',
    'primary',
    disabled ? 'disabled' : '',
  )}</div>`;
}

// --- FASE 1 · ENTENDER -------------------------------------------------------
function entender(g) {
  // Sin situación elegida: mostrar el selector.
  if (!state.caseId) {
    return (
      heading(
        'ENTENDER',
        '¿Qué está pasando?',
        'Elige la situación que más se parece a la tuya. No necesitas estar seguro para comenzar.',
      ) +
      `<div class="choice-grid">${cases
        .map(
          (c) =>
            `<button class="choice" data-action="choose" data-id="${c.id}"><span class="icon-box">${icon(c.icon)}</span><span>${c.title}</span><span class="chevron">${icon('arrow')}</span></button>`,
        )
        .join('')}</div>`
    );
  }

  const c = currentCase();
  const micro = Object.fromEntries((g?.micro || []).map((m) => [m.questionId, m.text]));

  const questionsHtml = questionsForCase(state.caseId)
    .map((q) => {
      const chosen = state.answers[q.id];
      const opts = q.options
        .map(
          (o) =>
            `<label class="option"><input type="radio" name="${q.id}" value="${o.value}" ${chosen === o.value ? 'checked' : ''}>${o.value}</label>`,
        )
        .join('');
      const feedback =
        chosen && micro[q.id]
          ? `<p class="micro-feedback">${icon('shield')}<span>${micro[q.id]}</span></p>`
          : '';
      return `<fieldset class="question"><legend>${q.prompt}</legend><div class="options">${opts}</div>${feedback}</fieldset>`;
    })
    .join('');

  return (
    heading(
      'ENTENDER',
      'Ordenemos lo que pasó',
      'Cada respuesta te muestra por qué ese dato puede ser relevante. No sacamos conclusiones.',
    ) +
    `<div class="case-chip"><span class="icon-box">${icon(c.icon)}</span><div><strong>${c.short}</strong><p>${c.title}</p></div><button class="link-button" data-action="change-case">Cambiar</button></div>` +
    questionsHtml +
    summaryBlock(g) +
    actionsBlock(g, true) +
    navRow('Preparar evidencia', !requiredAnswered())
  );
}

// "Lo que identificamos hasta ahora" (aparece tras ≥2 respuestas)
function summaryBlock(g) {
  if (!g?.summary) return '';
  const { facts, review } = g.summary;
  return `<div class="identify-card"><span class="eyebrow">LO QUE IDENTIFICAMOS HASTA AHORA</span>
    <div class="identify-cols">
      <div><h3>Hechos que señalaste</h3><ul class="tick-list">${facts.map((f) => `<li>${icon('check')}<span>${f}</span></li>`).join('')}</ul></div>
      ${review.length ? `<div><h3>Qué conviene revisar</h3><ul class="tick-list soft">${review.map((r) => `<li>${icon('search')}<span>${r}</span></li>`).join('')}</ul></div>` : ''}
    </div>
    <p class="micro">Esto no determina si hubo discriminación: es un punto de partida para conversar con orientación.</p>
  </div>`;
}

// "Qué puedes hacer ahora" (acciones priorizadas). preview=true muestra versión compacta.
function actionsBlock(g, preview = false) {
  const list = g?.actions || [];
  if (!list.length) return '';
  const items = (preview ? list.slice(0, 3) : list)
    .map(
      (a) =>
        `<li class="action-item ${a.urgent ? 'urgent' : ''}">${icon(a.urgent ? 'alert' : 'check')}<div><strong>${a.label}</strong>${a.detail ? `<p>${a.detail}</p>` : ''}</div>${a.cta ? `<button class="button primary action-cta" data-action="contact">${icon('message')} Contactar</button>` : ''}</li>`,
    )
    .join('');
  return `<div class="actions-card"><h3>Qué puedes hacer ahora</h3><ul class="action-list">${items}</ul></div>`;
}

// --- FASE 2 · PREPARAR (evidencia adaptada) ---------------------------------
function preparar(g) {
  const ev = (g?.evidence || []).slice(0, 8);
  const checklist = ev
    .map(
      (e) =>
        `<label class="check-item"><input type="checkbox" data-evidence="${e.id}" ${state.evidence.has(e.id) ? 'checked' : ''}>${icon(e.icon)}<span><strong>${e.label}</strong><small>${e.help}</small></span></label>`,
    )
    .join('');
  return (
    heading(
      'PREPARAR',
      'Guarda lo importante',
      'Priorizamos la evidencia según tu situación. No necesitas tenerlo todo para pedir orientación.',
    ) +
    `<div class="checklist adaptive">${checklist}</div>
     <p class="counter">${state.evidence.size} marcados · sugerencias priorizadas para tu caso</p>` +
    hint(
      '<strong>No necesitas subir documentos.</strong><br>Guarda copias originales en un lugar al que solo tú o alguien de confianza tenga acceso. No alteres mensajes ni obtengas documentos sin autorización.',
    ) +
    navRow('Conocer mis protecciones')
  );
}

// --- FASE 3 · CONOCER (protecciones + respaldo jurídico) --------------------
function conocer(g) {
  const legal = g?.legal || [];
  const eduHtml = protections
    .map(
      ([i, t, d, w, a]) =>
        `<details><summary>${icon(i)}${t}</summary><p>${d}</p><p><b>Por qué es importante</b><br>${w}</p><p><b>Qué podrías hacer</b><br>${a}</p></details>`,
    )
    .join('');
  const legalHtml = legal.length
    ? `<h3 class="legal-title">¿Por qué importa esto? Respaldo jurídico de tu caso</h3><div class="legal-list">${legal
        .map(
          (l) =>
            `<details class="legal-item"><summary><span class="tag">${l.code}</span> ¿Por qué importa esto?</summary><p>${l.plainWhy}</p><a href="${l.url}" target="_blank" rel="noopener noreferrer">Leer fuente oficial ${icon('external')}</a></details>`,
        )
        .join('')}</div>`
    : '';
  return (
    heading(
      'CONOCER',
      'Conoce tus protecciones',
      'Abre cada tarjeta para entender qué podría aplicar. El alcance depende de los hechos de tu caso.',
    ) +
    `<div class="education">${eduHtml}</div>` +
    legalHtml +
    navRow('Ver mi siguiente paso')
  );
}

// --- FASE 4 · ACTUAR ---------------------------------------------------------
function actuar(g) {
  const c = currentCase();
  return (
    heading(
      'ACTUAR',
      'No tienes que atravesar esto solo',
      'CEPVVS puede orientarte gratuitamente para revisar tu situación y entender tus opciones.',
    ) +
    `<div class="finish-card"><h3>Tu punto de partida</h3>
       <div class="summary-row">${icon(c.icon)}<span>${c.title}</span></div>
       <div class="summary-row">${icon('folder')}<span>${state.evidence.size ? state.evidence.size + ' tipos de evidencia por conservar.' : 'Puedes consultar aunque todavía no tengas documentos.'}</span></div>
       <div class="summary-row">${icon('shield')}<span>Conociste protecciones que podrían aplicar.</span></div>
     </div>` +
    actionsBlock(g, false) +
    `<div class="actions">${button('Hablar con orientación jurídica ' + icon('arrow'), 'contact')}${button('Ver sentencias clave', 'library', 'secondary')}</div>`
  );
}

// --- CTA persistente en todo el recorrido -----------------------------------
function ctaBar(g) {
  const cta = g?.cta;
  if (!cta?.visible) return '';
  const high = cta.urgency === 'high';
  return `<aside class="cta-bar ${high ? 'high' : ''}" role="note">
    <div>${icon(high ? 'alert' : 'message')}<span>${high && cta.reason ? cta.reason : 'Puedes hablar con CEPVVS en cualquier momento del recorrido.'}</span></div>
    <button class="button ${high ? 'primary' : 'secondary'}" data-action="contact">${icon('message')} Hablar con CEPVVS</button>
  </aside>`;
}

// Exportado por compatibilidad (algunas vistas podrían referenciarlo).
export const phaseFlow = phaseOrder;
