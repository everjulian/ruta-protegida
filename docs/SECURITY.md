# Seguridad de la capa de IA (Ruta Protegida)

La IA es una **capa opcional de personalización del tono**. No toma decisiones
jurídicas, no concluye discriminación y no ejecuta acciones. Si falla o no está
configurada, la ruta funciona igual con el **motor determinístico local**.

## Arquitectura

```
Navegador (Astro estático, GitHub Pages)
  └─ POST contexto estructurado ─▶ /api/guidance  (server-side, con la clave)
                                      ├─ valida entrada (enums) + límites
                                      ├─ rate limiting por IP
                                      ├─ base determinística (fuente de verdad)
                                      ├─ OpenAI (sin tools, timeout, JSON estricto)
                                      ├─ valida salida vs schema + frases prohibidas
                                      └─ merge  ó  fallback determinístico
```

> **GitHub Pages no ejecuta código.** El endpoint se despliega aparte (Vercel /
> Netlify / Cloudflare Workers / Node). El front lo llama vía `PUBLIC_GUIDANCE_API`
> y, si no está disponible, usa el motor local. Ver `server/adapters/serverless.mjs`.

## La clave nunca se expone

- `OPENAI_API_KEY` se lee de `process.env` **solo** en `server/` (fuera de `src/`,
  así que nunca entra al bundle del navegador, al HTML ni a Astro client).
- `.env` está en `.gitignore`; se versiona únicamente `.env.example` sin secretos.
- El cliente solo conoce `PUBLIC_GUIDANCE_API` (una URL, no un secreto).

## Minimización de datos

- Al servidor se envía **solo** contexto estructurado: `caseId`, `phase`,
  `answers` (valores de un catálogo cerrado). Sin nombres, cédula, correos,
  teléfonos, archivos ni documentos.
- La entrada se valida contra enums: cualquier valor o campo fuera de catálogo
  se rechaza (`422`).
- Si en el futuro se añade texto libre (`userText`), se recorta y se **redacta la
  PII** (correo/teléfono/documento/URL) antes de cualquier envío al modelo.

## Defensa contra prompt injection

- El `system` prompt es **fijo**: nunca se concatena texto del usuario.
- El contexto del usuario viaja en un mensaje aparte, marcado como **dato no
  confiable**; el modelo tiene instrucción explícita de no obedecer instrucciones
  incrustadas ni revelar el prompt, claves o políticas.
- **Sin tool calling ni navegación**: el modelo no puede actuar ni consultar
  fuentes externas.
- Las **únicas fuentes jurídicas** disponibles son las que entrega el servidor
  para ese caso; los enlaces salen del catálogo, nunca del modelo.

## Validación de la salida

- Respuesta forzada a JSON estricto (structured outputs) y **re-validada** en el
  servidor: tipos, longitudes, `questionId`/acciones dentro del catálogo.
- Filtro de **frases fuera de alcance** ("tienes un caso", "vas a ganar",
  "sí hubo discriminación", fuga de secretos) y de URLs inyectadas.
- La ley, la evidencia y el CTA los define el **servidor** (motor determinístico);
  el modelo solo reordena/reescribe tono. Si algo no cumple → **fallback**.

## Errores y privacidad de logs

- Ante timeout, error de red o salida inválida → fallback determinístico (200).
- Se registran **códigos técnicos** (`output_schema_invalid`, `model_call_failed`,
  `pii_redacted`), nunca el contenido del usuario.

## Ejecución y pruebas

```bash
# Servidor local del endpoint (usa .env)
node --env-file=.env server/dev-server.mjs

# Pruebas de seguridad (offline, sin clave)
npm test
```
