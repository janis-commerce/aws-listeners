# Plan — jcn-561-close-trace-invocation-update-package

- [x] 1. Housekeeping: `.nvmrc`, `engines`, eslint, deps/devDeps, workflows, `coverage-ci`, borrar `.postpublish.sh`. Verifica: `npm ci`, lint, test, audit.
- [x] 2. Handlers S3 y SNS: `Log.start`, `AWS_LAMBDA_REQUEST_ID`, emit `ended` en `finally` + tests. Depende de 1 (deps). Verifica: tests.
- [x] 3. S3: decode de key, nombre/extensión, warning de records, `getObject` sin tragar errores, config v3 + tests. Depende de 1. Verifica: tests.
- [x] 4. README/docs. El fix de la entrada 2.0.0 del CHANGELOG va en master con el release (convención: CHANGELOG solo en master). Verifica: lectura.
- [x] 5. Lint + test completos con Node 22, cobertura 100%.
