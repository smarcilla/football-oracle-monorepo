# Project Status

> Este fichero mantiene el estado actual del proyecto para continuidad entre sesiones.  
> **Ultima actualizacion:** 2026-01-27

## Estado Actual

**Fase:** Implementación de Scrapers (Phase 4)  
**Branch activa:** `phase-4-scrapers-sofascocore`  
**Proximo paso:** Implementar cliente Sofascore en servicio scraper

## Roadmap

| Fase                  | Descripcion                                               | Estado      |
| --------------------- | --------------------------------------------------------- | ----------- |
| 1. Documentacion base | ARCHITECTURE.md + ADRs iniciales                          | Completado  |
| 2. Walking Skeleton   | Infraestructura + servicios mock (ADR-0002)               | Completado  |
| 3. CI/CD y calidad    | Husky + GitHub Actions + lint/format (ADR-0004, ADR-0005) | Completado  |
| 4. Scraper real       | Integracion con Sofascore/ScraperFC                       | En progreso |
| 5. Simulation Engine  | Algoritmo Monte Carlo                                     | Pendiente   |
| 6. Journalist Agent   | Integracion Genkit + LLM                                  | Pendiente   |
| 7. Frontend completo  | UI con visualizaciones                                    | Pendiente   |

## Trabajo en Progreso

### Branch: `phase-3-ci-cd-quality`

- [x] Pipeline de CI en GitHub Actions (.github/workflows/ci.yml)
- [x] Restricción de Node.js 25 y Python 3.11
- [x] Configuración de SonarCloud con cobertura combinada
- [x] Plan de validación local (docs/tests/ci-validation-plan.md)
- [ ] Ejecutar plan de validación y merge a main

## Arquitectura Implementada

```
User -> Web (Next.js) -> API (Express)
                            |
                            v
                          Kafka
                            |
        +-------------------+-------------------+
        |                   |                   |
        v                   v                   v
    Scraper (Py)     Engine (Node)     Journalist (Node)
```

**Flujo de eventos:**

1. `match.analysis.requested` - API publica cuando usuario solicita analisis
2. `match.data.scraped` - Scraper publica con datos del partido
3. `simulation.completed` - Engine publica con resultados de simulacion
4. `report.generated` - Journalist publica con reporte final

## Decisiones Pendientes

Referencia rapida a TODOs del ARCHITECTURE.md:

- [ ] Consistencia de datos (3 TODOs)
- [ ] Robustez y fallos (4 TODOs)
- [ ] Seguridad (4 TODOs)
- [ ] Observabilidad (3 TODOs)
- [ ] Gestion de BD (2 TODOs) - Ver ADR-0006

## Como Ejecutar

```bash
# Levantar infraestructura + servicios
pnpm run dev:build

# Ver logs en tiempo real
docker compose logs -f

# Probar flujo completo
curl -X POST http://localhost:3001/analyze \
  -H "Content-Type: application/json" \
  -d '{"matchId": "test-123", "homeTeam": "Real Madrid", "awayTeam": "Barcelona"}'

# Parar todo
pnpm run down
```

## Notas para Proxima Sesion

```
Al iniciar nueva sesion:
1. Leer este fichero (STATUS.md)
2. Revisar ARCHITECTURE.md para contexto tecnico
3. Revisar ADRs relevantes segun la fase actual
4. Continuar desde "Proximo paso"

Fase 3 incluye:
- Husky para git hooks (pre-commit, commit-msg)
- ESLint 9 flat config para TypeScript
- Ruff para Python linting
- Prettier para formateo
- GitHub Actions para CI
- Vitest para tests unitarios
```
