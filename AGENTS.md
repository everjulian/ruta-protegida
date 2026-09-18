# AGENTS.md — Ruta Protegida (Fundación CEPVVS)

Orientador web sobre **VIH y derechos laborales en Ecuador**. Tema **sensible**:
el tono es prudente y NO se recogen datos personales. Lee esto antes de trabajar.

## Qué es
- SPA en **Astro** + JavaScript vanilla (sin framework de UI).
- Guía de 4 fases: **Entender → Preparar → Conocer → Actuar**, con 8 "casos"
  (situaciones laborales). Al final: banner de feedback opcional.
- Capa de **IA opcional** (OpenAI, server-side) que personaliza el tono; si falla
  o no está, todo funciona con un **motor determinístico local** (fallback).

## URLs y hosting
- Oficial (Vercel: sirve sitio + función): https://ruta-protegida.vercel.app
- Respaldo (GitHub Pages): https://everjulian.github.io/ruta-protegida
- Repo: github.com/everjulian/ruta-protegida

## Comandos
- `npm run dev` — sitio en http://localhost:4321/ruta-protegida/ (¡con esa ruta!)
- `node --env-file=.env server/dev-server.mjs` — API de IA local (:8787)
- `npm run build` — compila a dist/
- `npm test` — pruebas de seguridad del endpoint (offline, sin clave)

## Arquitectura (dónde vive cada cosa)
- `src/data/` — **CONTENIDO editable** (para actualizar textos, tocar aquí):
  `cases.js`, `questions.js` (preguntas por caso), `evidence.js`, `actions.js`,
  `judgments.js` (sentencias), `phases.js`, `config.js`, `icons.js`.
- `src/lib/guidance/` — el "cerebro": `index.js` (entrada única `getGuidance`),
  `rules.js` (motor determinístico + fallback), `remote.js` (llama a la función).
- `src/lib/analytics.js` — envoltorio `track()` de Umami (único punto).
- `src/views/` — welcome, route, library, contact. `src/scripts/main.js` — orquesta.
- `src/components/` — Header, Footer, NoticeDialog, FeedbackBanner.
- `server/guidance/` — la **función de IA** (FUERA de src/, nunca llega al cliente):
  `handler.mjs` (orquesta), `openai.mjs`, `prompt.mjs` (system prompt CEPVVS),
  `schema.mjs` (validación E/S), `sanitize.mjs`, `ratelimit.mjs`, `fallback.mjs`.
- `api/guidance.js` — adaptador de Vercel para esa función.

## Reglas críticas (NO romper)
- **Ramas:** trabajar en `testing`. **Merge a `main` SOLO con aprobación explícita
  del responsable.** `main` = producción (despliega Pages y Vercel automáticamente).
- **Secretos:** `.env` está en `.gitignore` y NUNCA se sube. La `OPENAI_API_KEY`
  vive solo en el panel de Vercel. No la pongas en código, docs ni en este archivo.
- **Seguridad de la IA:** el modelo NO concluye discriminación, NO da resultados
  jurídicos, usa lenguaje prudente ("puede ser relevante", "conviene revisar").
  Solo cita sentencias de `LEGAL_CONTEXT` (por `source_id`); nunca inventa leyes.
  Salida validada contra schema estricto; si no cumple → **fallback determinístico**.
- **Privacidad:** no se envían nombre/diagnóstico/respuestas ni a la IA ni a la
  analítica. Los eventos de Umami son anónimos y neutros (ej. `rating=4`); NUNCA
  adjuntar el caso ni las respuestas del usuario a un evento.
- **Contenido:** al editar textos jurídicos, mantener el lenguaje no estigmatizante
  (ver system prompt en `server/guidance/prompt.mjs`).

## Gotchas
- **Base path por host:** Vercel usa `/`; GitHub Pages usa `/ruta-protegida`.
  Se detecta automáticamente en `astro.config.mjs` (no hardcodear rutas de assets).
- En **local** el sitio vive en `/ruta-protegida/` (la raíz da 404).
- La IA solo se llama cuando se responden **todas** las preguntas del caso; con
  menos, o ante cualquier fallo, responde el motor local al instante.
- CSP estricta en producción: si agregas un script/API externo, permítelo en el
  CSP de `src/layouts/BaseLayout.astro`.

## Analítica y feedback
- **Umami** (anónima, sin cookies). Eventos: `page_view`, `flow_start`,
  `flow_complete`, `helpfulness_response`, `rating_submit`, `contact_click`.

## Estilo
- Comentarios y textos en **español**. Seguir el estilo del código existente
  (vanilla JS, funciones que devuelven cadenas HTML en las vistas).

## Docs relacionadas
- `README.md` (humanos), `docs/SECURITY.md`, `docs/DEPLOY-API.md`.
