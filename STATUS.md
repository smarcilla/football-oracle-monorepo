# Project Status

> Este fichero mantiene el estado actual del proyecto para continuidad entre sesiones.  
> **Ultima actualizacion:** 2026-01-29

## Estado Actual

**Fase:** Integración Scraper & Data Registry (Phase 4)  
**Branch activa:** `main` (Infraestructura de persistencia y Prisma 7 finalizada)  
**Proximo paso:** Conectar el Scraper Python con el Data Registry para persistir partidos reales.

## Roadmap

| Fase                  | Descripcion                                               | Estado      |
| --------------------- | --------------------------------------------------------- | ----------- |
| 1. Documentacion base | ARCHITECTURE.md + ADRs iniciales                          | Completado  |
| 2. Walking Skeleton   | Infraestructura + servicios mock (ADR-0002)               | Completado  |
| 3. CI/CD y calidad    | Husky + GitHub Actions + lint/format (ADR-0004, ADR-0005) | Completado  |
| 4. Scraper & Registry | Integracion Sofascore + Persistencia Prisma               | En progreso |
| 5. Simulation Engine  | Algoritmo Monte Carlo                                     | Pendiente   |
| 6. Journalist Agent   | Integracion Genkit + LLM                                  | Pendiente   |
| 7. Frontend completo  | UI con visualizaciones                                    | Pendiente   |

## Trabajo en Progreso

### Fase 4: Scrapers y Persistencia

- [x] Implementación de `SofascoreClient` y `MatchHandler` (Python)
- [x] Dockerfile optimizado con Google Chrome y no-root user
- [x] Seguridad: 0 issues en SonarCloud para el servicio Scraper
- [x] Análisis y decisión tecnológica para persistencia ([ADR-0011](docs/adr/0011-arquitectura-servicio-persistencia.md))
- [x] Definición detallada del modelo de datos y estrategia Redis ([ARCHITECTURE.md](ARCHITECTURE.md#5-modelo-de-datos-y-estrategia-de-persistencia))
- [x] Documentación de máquina de estados y flujo de eventos ([system-flow-states.md](docs/system-flow-states.md))
- [x] Diseño técnico del servicio `Data Registry` ([docs/services/data-registry.md](docs/services/data-registry.md))
- [/] Implementar `Data Registry Service` (SQL Persistencia + Prisma 7 OK)
- [ ] Implementar Outbox Relay Job (Kafka Bridge)
- [ ] Implementar Capa de Caché en Repositorios (Redis)
- [ ] Conectar Scraper Python con la API del Data Registry
- [ ] Implementar scraping masivo por liga y temporada (Sync Job)

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
Tareas pendientes de Fase 4 (Persistencia y Scraper):
1. Completar el Data Registry:
   - Implementar el 'Outbox Relay Job' para que los eventos guardados en la DB salgan realmente hacia Kafka.
   - Añadir la lógica de Redis (Cache-Aside) en los repositorios de Match.
2. Iniciar la integración del Scraper Python:
   - Implementar el cliente HTTP en Python para comunicarse con el Data Registry.
   - Validar el flujo: Scraper -> Data Registry -> Outbox -> Kafka.
3. Implementar el comando de 'sync' masivo por liga/temporada.
```
