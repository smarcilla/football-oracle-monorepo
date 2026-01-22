# Project Status

> Este fichero mantiene el estado actual del proyecto para continuidad entre sesiones.  
> **Ultima actualizacion:** 2026-01-22

## Estado Actual

**Fase:** Walking Skeleton  
**Branch activa:** `feat/walking-skeleton`  
**Proximo paso:** Merge PR y comenzar CI/CD (Fase 3)

## Roadmap

| Fase | Descripcion | Estado |
|------|-------------|--------|
| 1. Documentacion base | ARCHITECTURE.md + ADRs iniciales | Completado |
| 2. Walking Skeleton | Infraestructura + servicios mock (ADR-0002) | En progreso (PR pendiente) |
| 3. CI/CD y calidad | Husky + GitHub Actions + lint/format (ADR-0004, ADR-0005) | Pendiente |
| 4. Scraper real | Integracion con Sofascore/ScraperFC | Pendiente |
| 5. Simulation Engine | Algoritmo Monte Carlo | Pendiente |
| 6. Journalist Agent | Integracion Genkit + LLM | Pendiente |
| 7. Frontend completo | UI con visualizaciones | Pendiente |

## Trabajo en Progreso

### Branch: `feat/walking-skeleton`
- [x] Estructura monorepo con pnpm workspaces
- [x] docker-compose.yml (PostgreSQL, RabbitMQ, Redis)
- [x] apps/api - Express con RabbitMQ pub/sub
- [x] apps/web - Next.js frontend
- [x] services/scraper - Python worker
- [x] services/engine - Node simulation engine
- [x] services/journalist - Node report generator
- [x] packages/types - Tipos TypeScript compartidos
- [x] Flujo completo probado end-to-end
- [x] Documentacion en docs/phases/02-walking-skeleton.md
- [ ] Crear PR
- [ ] Merge a main

## Arquitectura Implementada

```
User -> Web (Next.js) -> API (Express)
                            |
                            v
                        RabbitMQ
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
