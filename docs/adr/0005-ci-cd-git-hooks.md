# ADR-0005: CI/CD y validacion local con Git Hooks

**Fecha:** 2026-01-22  
**Estado:** Aceptado  
**Decisores:** Equipo Football Oracle

## Contexto

Para garantizar la calidad del codigo necesitamos validacion en dos niveles:

1. **Local (pre-commit/pre-push):** Feedback rapido antes de subir codigo
2. **CI (GitHub Actions):** Validacion definitiva, bloquea merges si falla

Esto complementa el ADR-0004 (testing y calidad) definiendo cuando y como se ejecutan esas validaciones.

## Decision

### Validacion Local: Husky + lint-staged

**Husky:** Gestiona Git hooks de forma portable (funciona en cualquier maquina que clone el repo).

**lint-staged:** Ejecuta validaciones solo sobre archivos staged (rapido).

#### Hook: pre-commit

Ejecuta en cada commit (debe ser rapido < 10s):

```bash
# Solo archivos staged
- ESLint (fix automatico)
- Prettier (fix automatico)
- Type check (tsc --noEmit)
```

#### Hook: pre-push

Ejecuta antes de push (puede ser mas lento):

```bash
- Tests unitarios afectados
- Build check
```

#### Configuracion

```json
// package.json
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ],
    "*.py": [
      "ruff check --fix",
      "black"
    ]
  }
}
```

### CI: GitHub Actions

#### Workflow: ci.yml

Ejecuta en cada PR y push a main:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:coverage

  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
```

#### Workflow: python.yml (Scraper)

```yaml
name: Python CI

on:
  push:
    paths: ['services/scraper/**']
  pull_request:
    paths: ['services/scraper/**']

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install ruff black pytest
      - run: ruff check .
      - run: black --check .
      - run: pytest
    working-directory: services/scraper
```

### Branch Protection (GitHub)

Configurar en `main`:

- [x] Require PR before merging
- [x] Require status checks: `lint`, `typecheck`, `test`, `build`
- [x] Require branches to be up to date
- [ ] Require approvals (opcional para proyecto individual)

## Alternativas Consideradas

### Local: Sin hooks
- **Pros:** Menos friccion para commits rapidos
- **Contras:** Errores llegan a CI, feedback tardio

### Local: Lefthook (en lugar de Husky)
- **Pros:** Mas rapido, escrito en Go
- **Contras:** Menos adopcion, Husky es el estandar

### CI: GitLab CI / CircleCI
- **Pros:** Mas features en algunos casos
- **Contras:** GitHub Actions es nativo, menos config

## Consecuencias

### Positivas
- Errores detectados antes de llegar a CI
- PRs siempre pasan validaciones minimas
- Formato consistente automaticamente

### Negativas
- Pre-commit hooks pueden ser lentos si no se usa lint-staged
- Desarrolladores pueden saltarse hooks (--no-verify)

### Riesgos
- Hooks muy lentos frustran al equipo → mantener pre-commit < 10s
- Mitigacion: Solo lint/format en pre-commit, tests en pre-push o CI

## Implementacion

| Fase | Tarea | Prioridad |
|------|-------|-----------|
| Walking Skeleton | No implementar (foco en integracion) | - |
| Post-skeleton | Configurar Husky + lint-staged | Alta |
| Post-skeleton | Crear GitHub Actions workflows | Alta |
| Post-skeleton | Configurar branch protection | Media |

## Referencias

- https://typicode.github.io/husky/
- https://github.com/lint-staged/lint-staged
- https://docs.github.com/en/actions
