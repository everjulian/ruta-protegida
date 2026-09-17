// -----------------------------------------------------------------------------
// Prueba aislada de getGuidance (no toca la interfaz).
// Uso:  node scripts/guidance.demo.mjs
// Valida el modelo de datos y las reglas con varios escenarios.
// -----------------------------------------------------------------------------
import { getGuidance } from '../src/lib/guidance/index.js';

const scenarios = [
  {
    name: 'Trato distinto: empleador conocía + problema DESPUÉS + cambio de tareas',
    context: {
      caseId: 'trato',
      phase: 'entender',
      answers: {
        known: 'Sí',
        timing: 'Después',
        event: 'Cambio de tareas o trato',
        changed: 'Sí',
      },
    },
  },
  {
    name: 'Ya despedido (sin responder preguntas todavía)',
    context: { caseId: 'despedido', phase: 'preparar', answers: {} },
  },
  {
    name: 'Presión para renunciar (2 respuestas)',
    context: {
      caseId: 'presion',
      phase: 'entender',
      answers: { known: 'Sí', event: 'Comentarios o presión' },
    },
  },
  {
    name: 'Difusión del diagnóstico',
    context: {
      caseId: 'privacidad',
      phase: 'entender',
      answers: { known: 'Sí', event: 'Difusión o solicitud de datos', changed: 'No' },
    },
  },
];

const line = (s = '') => console.log(s);
const rule = () => line('─'.repeat(72));

for (const { name, context } of scenarios) {
  const g = await getGuidance(context);
  rule();
  line('▶ ' + name);
  line('  caseId: ' + context.caseId + '  ·  respuestas: ' + JSON.stringify(context.answers));
  rule();

  line('MICRO (' + g.micro.length + '):');
  g.micro.forEach((m) => line('  · [' + m.questionId + '] ' + m.text));

  line('\nRESUMEN:');
  if (!g.summary) {
    line('  (aún no se muestra: hacen falta ≥2 respuestas)');
  } else {
    line('  Hechos:');
    g.summary.facts.forEach((f) => line('    - ' + f));
    line('  Qué conviene revisar:');
    g.summary.review.forEach((r) => line('    - ' + r));
  }

  line('\nQUÉ PUEDES HACER AHORA:');
  g.actions.forEach((a) =>
    line('  ' + (a.urgent ? '⚑' : '·') + (a.cta ? ' [CTA]' : '') + ' ' + a.label),
  );

  line('\nEVIDENCIA PRIORIZADA (top 4):');
  g.evidence.slice(0, 4).forEach((e) => line('  ' + (e.priority + 1) + '. ' + e.label));

  line('\nRESPALDO JURÍDICO:');
  g.legal.forEach((l) => line('  · ' + l.code + ' — ' + l.plainWhy));

  line('\nCTA: visible=' + g.cta.visible + '  urgencia=' + g.cta.urgency + (g.cta.reason ? '  («' + g.cta.reason + '»)' : ''));
  line('meta: ' + JSON.stringify(g.meta));
  line();
}
rule();
line('OK · getGuidance ejecutado para ' + scenarios.length + ' escenarios.');
