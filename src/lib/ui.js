import { icon } from '../data/icons.js';
import { state } from './state.js';

// -----------------------------------------------------------------------------
// Pequeños helpers de presentación que devuelven cadenas HTML.
// Mantener libres de efectos: solo construyen markup.
// -----------------------------------------------------------------------------

export function button(label, action, style = 'primary', extra = '') {
  return `<button class="button ${style}" data-action="${action}" ${extra}>${label}</button>`;
}

export function hint(text, warm = false) {
  return `<div class="hint ${warm ? 'warm' : ''}">${icon(warm ? 'alert' : 'shield')}<span>${text}</span></div>`;
}

export function legalNote() {
  return `<p class="legal-note">Esta herramienta brinda información general, no reemplaza asesoría jurídica. Cada caso requiere revisión individual. <button data-action="notice">Conoce el alcance de esta guía.</button></p>`;
}

export function stepHeading(k, title, desc) {
  return `<span class="eyebrow">${k}</span><h1>${title}</h1><p class="subtitle">${desc}</p>`;
}

export function bottom(next = 'Continuar', disabled = false) {
  return `<div class="bottom-actions">${button(icon('back') + ' Atrás', 'back', 'secondary')}${button(next + ' ' + icon('arrow'), 'next', 'primary', disabled ? 'disabled' : '')}</div>`;
}

export function question(id, title, options) {
  return `<fieldset class="question"><legend>${title}</legend><div class="options">${options
    .map(
      (x) =>
        `<label class="option"><input type="radio" name="${id}" value="${x}" ${state.answers[id] === x ? 'checked' : ''}>${x}</label>`,
    )
    .join('')}</div></fieldset>`;
}
