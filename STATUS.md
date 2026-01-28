# Project Status

> Este fichero mantiene el estado actual del proyecto para continuidad entre sesiones.  
> **Ultima actualizacion:** 2026-01-27

## Estado Actual

**Fase:** Implementación de Scrapers (Phase 4)  
**Branch activa:** `main` (Mergeada la integración base de Sofascore)  
**Proximo paso:** Implementar scraping por liga/temporada y persistencia de eventos.

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

### Fase 4: Scrapers y Calidad

- [x] Implementación de `SofascoreClient` y `MatchHandler`
- [x] Dockerfile optimizado con Google Chrome y no-root user
- [x] Configuración de latencia baja en Kafka (linger.ms, fetch.min.bytes)
- [x] Seguridad: 0 issues en SonarCloud para el servicio Scraper
- [ ] Implementar scraping masivo por liga y temporada
- [ ] Persistencia de eventos scrapeados en base de datos (PostgreSQL) para evitar re-scraping
- [ ] ADR para la estrategia de persistencia (Outbox pattern vs persistencia simple)

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
Tareas pendientes de Fase 4 (Scraper):
1. Caso de Uso: Scrapear todos los partidos de una liga y temporada concreta (ej: LaLiga 2023/24).
   - Necesitaremos un nuevo mensaje en Kafka o un endpoint en API para disparar esto.
2. Persistencia en BD: Guardar los eventos procesados en PostgreSQL.
   - Evitar scrappear partidos que ya están en la base de datos.
   - Evaluar si usamos el patrón Outbox para garantizar que si se guarda en BD, se publique en Kafka y viceversa.
3. Actualizar documentacion de Fase 4 y añadir ADR si es necesario para el esquema de BD del scraper.
```
