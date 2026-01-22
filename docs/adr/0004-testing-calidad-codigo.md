# ADR-0004: Estrategia de testing y calidad de codigo

**Fecha:** 2026-01-22  
**Estado:** Aceptado  
**Decisores:** Equipo Football Oracle

## Contexto

Necesitamos definir las herramientas y estrategias de calidad de codigo para el proyecto:

1. **Testing:** Que framework usar y que estrategia seguir
2. **Linting:** Reglas de estilo y deteccion de errores
3. **Formatting:** Consistencia en el formato del codigo

El proyecto es un monorepo con servicios Node.js/TypeScript y un servicio Python.

## Decision

### Testing

**Framework:** Vitest

- Rapido (usa Vite bajo el capó)
- Compatible con API de Jest (migracion facil)
- Soporte nativo de TypeScript y ESM
- Buen DX (watch mode, UI opcional)

**Estrategia:** Piramide de testing clasica

```
        /\
       /  \      E2E (flujo completo: boton → reporte)
      /----\     Pocos, lentos, fragiles
     /      \
    /--------\   Integracion (servicio + DB/RabbitMQ real)
   /          \  Moderados, validan contratos
  /------------\ 
 /              \ Unit (logica en services/)
/________________\ Muchos, rapidos, sin I/O
```

| Tipo | Scope | Herramientas | Cantidad |
|------|-------|--------------|----------|
| Unit | Funciones en `services/` | Vitest | Mayoría |
| Integracion | Handler + cliente real | Vitest + Testcontainers | Moderada |
| E2E | Flujo completo | Vitest + docker-compose | Pocos (happy path) |

**Ubicacion de tests:**

```
service/
├── src/
│   └── services/
│       └── simulation.ts
└── tests/
    ├── unit/
    │   └── simulation.test.ts
    └── integration/
        └── handlers.test.ts
```

### Linting

**Framework:** ESLint 9 con flat config

- Configuracion moderna y simplificada
- Un solo archivo `eslint.config.js` en la raiz del monorepo
- Reglas compartidas para todos los servicios TS

**Reglas base:**

```javascript
// Reglas estrictas recomendadas
{
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-unused-vars": "error",
  "@typescript-eslint/explicit-function-return-type": "warn",
  "no-console": ["warn", { allow: ["warn", "error"] }]
}
```

### Formatting

**Herramienta:** Prettier (via ESLint plugin)

- Separacion de responsabilidades (ESLint = logica, Prettier = formato)
- Configuracion minima en `.prettierrc`

**Configuracion base:**

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Python (Scraper)

| Herramienta | Proposito |
|-------------|-----------|
| pytest | Testing |
| ruff | Linting (rapido, reemplaza flake8 + isort) |
| black | Formatting |

### Scripts del monorepo

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

## Alternativas Consideradas

### Testing: Jest
- **Pros:** Estandar de la industria, mucha documentacion
- **Contras:** Mas lento, configuracion ESM compleja en monorepos

### Testing: Node test runner
- **Pros:** Zero dependencies, nativo
- **Contras:** Menos features, ecosistema inmaduro

### Linting: Biome
- **Pros:** Muy rapido, todo en uno
- **Contras:** Menos reglas que ESLint, ecosistema mas pequeno

## Consecuencias

### Positivas
- Stack moderno y rapido
- Buena experiencia de desarrollo
- Configuracion compartida en monorepo

### Negativas
- Vitest menos conocido que Jest (curva de aprendizaje minima)
- ESLint 9 flat config es nuevo (menos ejemplos online)

### Riesgos
- Vitest podria tener edge cases con algunas librerias
- Mitigacion: Jest como fallback si hay problemas criticos

## Metricas de calidad objetivo

| Metrica | Objetivo | Obligatorio |
|---------|----------|-------------|
| Coverage (unit) | > 70% | No (por ahora) |
| Coverage (services/) | > 80% | Si |
| Lint errors | 0 | Si (bloquea CI) |
| Type errors | 0 | Si (bloquea CI) |

## Referencias

- https://vitest.dev/
- https://eslint.org/docs/latest/use/configure/configuration-files-new
- https://testing-library.com/docs/guiding-principles/
