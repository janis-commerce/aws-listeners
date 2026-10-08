# aws-listeners: cierre de invocación con la trace layer y actualización del package

> Repo: `packages/aws-listeners` · Branch: `JCN-561-close-trace-invocation-update-package` · Ticket: [JCN-561](https://janiscommerce.atlassian.net/browse/JCN-561)
> Estado: aprobado · Creado: 2026-10-08

## Objetivo

Los listeners de S3 y SNS cierran la invocación con la trace layer al terminar, con o sin error. El listener de S3 maneja bien keys con caracteres especiales y nombres con varios puntos, y propaga los errores de lectura del objeto. El package queda en Node 22, con dependencias al día y los GitHub workflows del estándar actual.

## Contexto

- Los handlers de S3/SNS/SQS (`lib/*/serverless/handler.js:11`) no llaman `Log.start()` ni emiten `janiscommerce.ended`. La trace layer cierra la invocación cuando `@janiscommerce/log` hace `POST 127.0.0.1:8585/end` (`packages/log/lib/log.js:279`), disparado por el listener de `janiscommerce.ended` que registra `Log.start()` (`log.js:144-151`). Sin eso la lambda corre hasta el timeout.
- Evidencia: mobile `AppFileListener` termina el trabajo en ~8s (app, file y versions.json OK) y el REPORT marca 15000 ms `Status: timeout` en el 100% de las ejecuciones (prod 21/21 en 90 días; beta y QA 100% en 7 días).
- Referencias correctas: `packages/s3-listener/lib/serverless/handler.js:34-41` y `@janiscommerce/lambda` (`handler.js:44`, `:102`).
- Consumidores: `janis-mobile-service` (S3) y `janis-mailing-service` (SNS). Ambos pasan `(...args)`, así que `context` ya llega como 3er argumento.
- Audit: 13 vulnerabilidades de prod, todas por `@aws-sdk/client-s3@3.374.0`.

## Alcance

✅ Incluye:
- Handlers de S3 y SNS:
  - Setear `process.env.AWS_LAMBDA_REQUEST_ID = context?.awsRequestId || ''`.
  - `Log.start()` antes de validar el evento.
  - `await Events.emit('janiscommerce.ended')` en un `finally`: se emite con éxito, con error de `process()` y con error de validación.
  - Dependencias `@janiscommerce/log` y `@janiscommerce/events` (mismas versiones que `@janiscommerce/lambda`/`sqs-consumer`).
- S3:
  - `fileKey` URL-decodeado (`decodeURIComponent(key.replace(/\+/g, ' '))`).
  - Nombre/extensión con `lastIndexOf('.')`: la extensión es el último segmento; sin punto, extensión `undefined` y nombre completo.
  - Key con percent-encoding mal formado → `S3ServerlessHandlerError` `INVALID_S3_RECORD` (en vez de `URIError` crudo).
  - Archivo con punto inicial (`.hidden`) → nombre `.hidden`, extensión `undefined` (igual que `path.extname`); punto final (`file.`) → extensión `''`.
  - `S3Listener.getData()`: extensión `json` sin distinguir mayúsculas (`FILE.JSON` se parsea) y `Body` vacío devuelve `null` en vez de `TypeError`.
  - Warning si llegan más de un record (se sigue procesando solo el primero).
  - `getObject`: no tragar errores del stream (hoy devuelve `Body: null`). Usar las utilidades del SDK v3 (`transformToByteArray`).
  - Config local del cliente S3 con claves del SDK v3 (`forcePathStyle`, `credentials`).
- GitHub workflows: reemplazar `build-status.yml`, `coverage-status.yml` y `npm-publish.yml` por los reusables de `janis-commerce/.github` (igual que `packages/sns`, `slack-username: AWS Listeners`, `run-lint: true`, sin `build-types`). Script `test-ci` → `coverage-ci`. Borrar `.postpublish.sh` y el script `postpublish`.
- Puesta al día: `.nvmrc` 22, `engines: { node: ">=18" }`, eslint `es2024`/`ecmaVersion: 2024`, `@aws-sdk/client-s3` y `@janiscommerce/superstruct` a la última, dev deps (`aws-sdk-client-mock` 4, `sinon`, `mocha`, `nyc`, `eslint` 8.57).
- CHANGELOG: corregir la entrada duplicada `[1.0.0]` de 2023-07-24 a `[2.0.0]`.
- README/docs: firma real de `handle(Listener, event, context)`.
- Tests de todo lo anterior, cobertura 100%.

❌ NO incluye:
- Nada de SQS (`lib/sqs/**` y sus tests quedan como están).
- Types (`build-types`).
- Unificar las clases de error.
- Procesar más de un record en S3.
- Borrar branches remotas obsoletas (se hace aparte, con OK).
- Bump de versión y CHANGELOG de la release (los hace `prepare-release`).

## Criterios de aceptación

- [ ] Handler S3 y SNS: `Events.emit('janiscommerce.ended')` se llama una vez con éxito, con error de `process()` y con error de validación del evento; el error se sigue propagando.
- [ ] `Log.start()` se llama antes de validar y `AWS_LAMBDA_REQUEST_ID` queda con el `awsRequestId` del context.
- [ ] S3: un key `apps/picking/android/1.0.0.1/my+app%20%281%29.apk` llega al listener como `apps/picking/android/1.0.0.1/my app (1).apk`.
- [ ] S3: `app.v1.2.apk` da `fileName='app.v1.2'` y `fileExtension='apk'`; `file` da `fileName='file'` y `fileExtension=undefined`.
- [ ] S3: un error leyendo el body en `getObject` se propaga.
- [ ] S3: con más de un record se loguea un warning y se procesa el primero.
- [ ] SQS sin cambios (diff vacío en `lib/sqs/` y `tests/sqs/`).
- [ ] Workflows reusables en `.github/workflows/`, `npm run coverage-ci` existe, `.postpublish.sh` borrado.
- [ ] `npm audit --omit=dev` sin vulnerabilidades high/critical.
- [ ] `npm run lint` y `npm test` en verde con Node 22, cobertura 100%.

## Plan de archivos

- `lib/s3/serverless/handler.js`, `lib/sns/serverless/handler.js` (edit) — cierre de invocación.
- `lib/s3/serverless/dispatcher.js` (edit) — decode, nombre/extensión, warning de records.
- `lib/s3/s3-wrapper/index.js`, `lib/s3/s3-wrapper/wrapper.js` (edit) — errores de stream, config v3.
- `.github/workflows/*.yml` (reemplazo), `.postpublish.sh` (borrar), `package.json`, `package-lock.json`, `.nvmrc`, `.eslintrc.js`.
- `CHANGELOG.md`, `README.md`, `docs/*` (edit).
- `tests/s3/**`, `tests/sns/**` (edit).

## Decisiones

- `finally` en el handler en lugar de duplicar el emit: cubre éxito, error y validación con un solo punto.
- `Log.start()` antes de validar: si la validación falla, la invocación también se cierra.
- SQS fuera de alcance por decisión del usuario.
- Versión: se define en `prepare-release` (los cambios caben en minor).

## Abiertas

—
