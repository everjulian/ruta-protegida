import { icon } from '../data/icons.js';
import { cases } from '../data/cases.js';
import { judgments } from '../data/judgments.js';
import { protections, evidence } from '../data/protections.js';
import { steps } from '../data/config.js';
import { state, currentCase, signalsSummary, step2Complete } from '../lib/state.js';
import { button, hint, legalNote, stepHeading, bottom, question } from '../lib/ui.js';

// Vista de la ruta guiada (sidebar de pasos + contenido del paso actual).
export function route() {
  return `<div class="workspace"><aside class="sidebar" aria-label="Etapas de tu ruta"><span class="sidebar-title">TU RUTA PROTEGIDA</span><ol>${steps
    .map(
      (s, i) =>
        `<li><button data-action="step" data-step="${i + 1}" ${i + 1 > state.max ? 'disabled' : ''} class="${i + 1 === state.step ? 'current' : i + 1 < state.max ? 'complete' : ''}" ${i + 1 === state.step ? 'aria-current="step"' : ''}><span class="step-dot">${i + 1 < state.max ? icon('check') : i + 1 > state.max ? icon('lock') : i + 1}</span>${s}</button></li>`,
    )
    .join(
      '',
    )}</ol><div class="side-note">${icon('heart')}<br><strong>No necesitas tener todas las respuestas.</strong><br>Puedes volver a un paso anterior en cualquier momento.</div></aside><section class="step-content"><div class="progress-meta"><span>PASO ${state.step} DE 6</span><span>${Math.round(((state.step - 1) / 5) * 100)}% del recorrido</span></div><div class="progress" role="progressbar" aria-label="Progreso del recorrido" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(((state.step - 1) / 5) * 100)}"><span style="width:${((state.step - 1) / 5) * 100}%"></span></div>${stepContent()}${legalNote()}</section></div>`;
}

// Contenido del paso activo (1 a 6).
export function stepContent() {
  const c = currentCase();
  switch (state.step) {
    case 1:
      return (
        stepHeading(
          '01 · EMPECEMOS POR TI',
          '¿Qué está pasando?',
          'Elige la situación que más se parece a la tuya. No necesitas estar seguro para comenzar.',
        ) +
        `<div class="choice-grid">${cases
          .map(
            (c) =>
              `<button class="choice ${state.caseId === c.id ? 'selected' : ''}" data-action="choose" data-id="${c.id}" aria-pressed="${state.caseId === c.id}"><span class="icon-box">${icon(c.icon)}</span><span>${c.title}</span><span class="chevron">${icon(state.caseId === c.id ? 'check' : 'arrow')}</span></button>`,
          )
          .join('')}</div>` +
        bottom('Identificar señales', !c)
      );
    case 2:
      return (
        stepHeading(
          '02 · PONLE CONTEXTO',
          'Identifica señales importantes',
          'Estas respuestas te ayudarán a ordenar lo ocurrido. Puedes elegir “No estoy seguro”.',
        ) +
        question('known', '¿La empresa conocía tu diagnóstico?', ['Sí', 'No', 'No estoy seguro']) +
        question('timing', '¿Cuándo empezó el problema respecto a que lo conocieran?', [
          'Antes',
          'Después',
          'Al mismo tiempo',
          'No lo conocían',
          'No estoy seguro',
        ]) +
        question('event', '¿Qué ocurrió concretamente?', [
          'Comentarios o presión',
          'Cambio de tareas o trato',
          'Aviso o despido',
          'Difusión o solicitud de datos',
          'Dificultad por salud',
          'Otro / no estoy seguro',
        ]) +
        question('changed', '¿Hubo cambios en funciones, trato, evaluaciones o estabilidad?', [
          'Sí',
          'No',
          'No estoy seguro',
        ]) +
        hint(
          'Tus respuestas no determinan si hubo discriminación. Son un punto de partida para conversar.',
        ) +
        bottom('Preparar evidencia', !step2Complete())
      );
    case 3:
      return (
        stepHeading(
          '03 · GUARDA LO QUE TENGAS',
          'Lo importante puede estar en los detalles.',
          'Marca lo que puedes conservar. No necesitas tenerlo todo para recibir orientación.',
        ) +
        `<div class="checklist">${evidence
          .map(
            ([i, t], n) =>
              `<label class="check-item"><input type="checkbox" data-evidence="${n}" ${state.evidence.has(n) ? 'checked' : ''}>${icon(i)}<span>${t}</span></label>`,
          )
          .join(
            '',
          )}</div><p class="counter" id="evidence-count">${state.evidence.size} de ${evidence.length} elementos marcados</p>` +
        hint(
          '<strong>No necesitas subir documentos para usar esta guía.</strong><br>Guarda copias originales en un lugar al que solo tú o alguien de tu confianza tenga acceso. No alteres mensajes ni obtengas documentos sin autorización.',
        ) +
        bottom('Conocer mis protecciones')
      );
    case 4:
      return (
        stepHeading(
          '04 · INFORMACIÓN QUE ACOMPAÑA',
          'Conoce tus protecciones',
          'Abre cada tarjeta para entender qué podría aplicar. El alcance depende de los hechos de tu caso.',
        ) +
        `<div class="education">${protections
          .map(
            ([i, t, d, w, a, j]) =>
              `<details><summary>${icon(i)}${t}</summary><p>${d}</p><p><b>Por qué es importante</b><br>${w}</p><p><b>Qué podrías hacer</b><br>${a}</p>${j >= 0 ? `<button class="link-button" data-action="legal" data-index="${j}">Ver respaldo jurídico</button>` : `<a href="https://cepvvs.odoo.com/" target="_blank" rel="noopener noreferrer" class="link-button">Ver servicio de CEPVVS ${icon('external')}</a>`}</details>`,
          )
          .join('')}</div>` +
        bottom('Ver mi siguiente paso')
      );
    case 5:
      return (
        stepHeading(
          '05 · TU RUTA ESPECÍFICA',
          c.short,
          'Unos pasos concretos para preparar tu consulta.',
        ) +
        `<div class="case-heading"><span class="icon-box">${icon(c.icon)}</span><p>${c.desc}</p></div><h3>Esto puede ser importante</h3>` +
        hint(signalsSummary()) +
        `<div class="specific-list">${c.list
          .map(
            (t, n) =>
              `<label class="check-item"><input type="checkbox" data-task="${n}" ${state.tasks.has(n) ? 'checked' : ''}><span>${t}</span></label>`,
          )
          .join(
            '',
          )}</div><div class="finish-card"><h3>Tu siguiente paso</h3><p>${c.next}</p>${button('Hablar con CEPVVS', 'contact', 'text')}</div><p class="micro">Respaldo para revisar: ${c.legal
          .map(
            (j) =>
              `<button class="link-button" data-action="legal" data-index="${j}">${judgments[j].code}</button>`,
          )
          .join(' · ')}</p>` +
        bottom('Cerrar mi recorrido')
      );
    case 6:
      return (
        stepHeading(
          '06 · PODEMOS ACOMPAÑARTE',
          'No tienes que atravesar esto solo.',
          'CEPVVS puede orientarte gratuitamente para revisar tu situación y ayudarte a entender tus opciones.',
        ) +
        `<div class="finish-card"><h3>Ya tienes un punto de partida</h3><div class="summary-row">${icon(c.icon)}<span>${c.title}</span></div><div class="summary-row">${icon('folder')}<span>${state.evidence.size ? state.evidence.size + ' tipos de evidencia que puedes conservar.' : 'Puedes pedir orientación aunque todavía no tengas documentos.'}</span></div><div class="summary-row">${icon('shield')}<span>Conociste protecciones que podrían aplicar.</span></div></div>` +
        hint(
          'Al contactar a CEPVVS, puedes empezar diciendo: “Quisiera orientación sobre una situación laboral”. No hace falta contar todo en el primer mensaje.',
        ) +
        `<div class="actions">${button('Hablar con orientación jurídica ' + icon('arrow'), 'contact')}${button('Volver a la ruta', 'revisit', 'secondary')}</div><button class="link-button" data-action="library">Ver sentencias clave</button>`
      );
  }
}
