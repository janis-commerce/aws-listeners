# Plan — jcn-561-close-trace-invocation-update-package

- [ ] 1. Housekeeping: `.nvmrc`, `engines`, eslint, deps/devDeps, workflows, `coverage-ci`, borrar `.postpublish.sh`. Verifica: `npm ci`, lint, test, audit.
- [ ] 2. Handlers S3 y SNS: `Log.start`, `AWS_LAMBDA_REQUEST_ID`, emit `ended` en `finally` + tests. Depende de 1 (deps). Verifica: tests.
- [ ] 3. S3: decode de key, nombre/extensión, warning de records, `getObject` sin tragar errores, config v3 + tests. Depende de 1. Verifica: tests.
- [ ] 4. CHANGELOG (fix entrada 2.0.0), README/docs. Verifica: lectura.
- [ ] 5. Lint + test completos con Node 22, cobertura 100%.
