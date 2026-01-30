# Project Status

> Este fichero mantiene el estado actual del proyecto para continuidad entre sesiones.  
> **Ultima actualizacion:** 2026-01-30

## Estado Actual

**Fase:** Integración Outbox Relay & Testing (Phase 4)  
**Branch activa:** `feat/data-registry-outbox-relay`  
**Siguiente objetivo:** Integración Scraper Python con Data Registry (Iniciando diseño).

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
- [x] Diseño técnico y arquitectura del `Outbox Relay Job` ([V2](docs/services/002-data-registry.md))
- [x] Implementación de `OutboxRelay` y `OutboxRepository` (Node.js)
- [x] Refactorización de `MatchService` y `MatchHandler` para Inyección de Dependencias
- [x] Cobertura de tests unitarios al 51% (objetivo >70%)
- [x] Configuración de variables de entorno para Kafka y Relay Job en Docker
- [x] Inicio de `OutboxRelay` en `src/index.ts` con configuración dinámica
- [x] Ejecutar migración de DB (`retries` field en Outbox table)
- [x] Validar funcionamiento del Job dentro del contenedor Docker
- [x] Implementar Outbox Relay Job (Kafka Bridge)
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
Tareas pendientes de Continuidad:
1. Conclusión de Branch:
   - Git merge feat/data-registry-outbox-relay hacia develop/main.
2. Diseño Técnico:
   - Crear Documento de diseño para la integración Scraper (Python) -> Data Registry (API).
   - Definir contratos de API, autenticación interna y manejo de errores asíncronos.
3. Decisión de Arquitectura:
   - Posponer la capa de Redis hasta tener carga real/integración completa con el Scraper para validar su beneficio.
```
