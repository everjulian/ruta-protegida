import { sources } from './sources.js';

// -----------------------------------------------------------------------------
// Sentencias de la Corte Constitucional del Ecuador que respaldan la guía.
// El orden del arreglo define el índice usado en `cases[].legal`.
// -----------------------------------------------------------------------------
export const judgments = [
  {
    code: '080-13-SEP-CC',
    year: '2013',
    theme: 'Protección laboral y reubicación',
    body: 'Estableció protección reforzada frente a la separación de un servidor público por un rendimiento afectado por su salud, sin esfuerzos previos de reubicación.',
    why: 'Ayuda a revisar si se consideraron alternativas antes de la desvinculación.',
    url: sources.old,
    label: 'Ver precedente explicado por la Corte',
    note: 'Referencia oficial: reconstrucción del precedente en la reseña de la sentencia 2904-22-EP/24.',
  },
  {
    code: '1776-17-EP/24',
    year: '2024',
    theme: 'Estabilidad e intimidad',
    body: 'La Corte protegió a una persona separada de la Comisión de Tránsito por vivir con VIH y examinó la divulgación de su diagnóstico.',
    why: 'Permite entender que la estabilidad laboral y la intimidad deben protegerse de forma conjunta.',
    url: sources.s1776,
    label: 'Leer sentencia oficial · PDF',
  },
  {
    code: '2846-18-EP/24',
    year: '2024',
    theme: 'Discriminación y diagnóstico reservado',
    body: 'Analizó un despido discriminatorio y aclaró que la persona trabajadora no está obligada a revelar al empleador su diagnóstico de VIH.',
    why: 'Es relevante para revisar el conocimiento del empleador y resguardar la información personal.',
    url: sources.s2846,
    label: 'Leer sentencia oficial · PDF',
  },
  {
    code: '2904-22-EP/24',
    year: '2024',
    theme: 'Protección en el empleo privado',
    body: 'Aplicó precedentes de protección a una trabajadora de una empresa privada despedida en circunstancias vinculadas a su condición de salud.',
    why: 'La protección también alcanza relaciones laborales privadas. Deben analizarse los hechos de cada caso.',
    url: sources.s2904,
    label: 'Leer sentencia oficial · PDF',
  },
];
