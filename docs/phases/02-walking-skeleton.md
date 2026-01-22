# Fase 2: Walking Skeleton

**Estado:** Completada  
**Fecha:** 2026-01-22  
**Branch:** `feat/walking-skeleton`  
**ADR relacionado:** [ADR-0002](../adr/0002-walking-skeleton.md)

## Objetivo

Validar la comunicacion entre todos los servicios antes de implementar logica de negocio real. El Walking Skeleton es una version minima funcional que prueba la integracion end-to-end.

## Componentes implementados

| Componente | Implementacion | Estado |
|------------|----------------|--------|
| Frontend | Boton "Analyze Match" que llama a la API | OK |
| API | Endpoint POST /analyze/:id que publica evento | OK |
| Scraper | Consume evento, publica datos mock | OK |
| Engine | Consume datos, ejecuta simulacion mock | OK |
| Journalist | Consume simulacion, genera reporte mock | OK |

## Flujo de eventos

```
Frontend (click) 
    → POST /analyze/:id 
    → API publica "match.analysis_requested"
    → Scraper consume, publica "match.data_extracted"
    → Engine consume, publica "match.simulation_completed"  
    → Journalist consume, publica "match.report_ready"
    → API consume y logea "FLOW COMPLETED"
```

## Como probar

### 1. Levantar los servicios

```bash
# Desde la raiz del proyecto
pnpm run dev:build
```

Esperar a ver estos logs indicando que los servicios estan listos:

```
api-1         | [API] Server running on port 4000
engine-1      | [Engine] Waiting for messages...
journalist-1  | [Journalist] Waiting for messages...
web-1         | Ready in 66ms
```

### 2. Ejecutar la prueba

**Opcion A: Desde el frontend**

1. Abrir http://localhost:3000
2. Click en el boton "Analyze Match"
3. Ver mensaje de confirmacion

**Opcion B: Desde curl**

```bash
curl -X POST http://localhost:4000/analyze/test-match-123
```

Respuesta esperada:
```json
{"status":"accepted","message":"Analysis started for match test-match-123"}
```

### 3. Verificar los logs

```bash
docker-compose logs --tail=100
```

**Logs esperados (en orden):**

1. **API** publica el evento:
```
api-1 | [API] Received analyze request for match: test-match-123
api-1 | [RabbitMQ] Published to match.analysis_requested
```

2. **Scraper** procesa y publica datos mock:
```
scraper-1 | [Scraper] Processing match: test-match-123
scraper-1 | [Scraper] Extracted 4 shots
```

3. **Engine** ejecuta simulacion mock:
```
engine-1 | [Engine] Processing match: test-match-123
engine-1 | [Engine] Running Monte Carlo simulation (mock)...
engine-1 | [Engine] Real Madrid vs Barcelona
engine-1 | [Engine] Simulation complete: { homeWinProb: 0.45, ... }
```

4. **Journalist** genera reporte mock:
```
journalist-1 | [Journalist] Processing match: test-match-123
journalist-1 | [Journalist] Generating match report (mock)...
journalist-1 | [Journalist] Report generated: Real Madrid vs Barcelona: Analysis Report
```

5. **API** confirma flujo completado:
```
api-1 | [API] ========================================
api-1 | [API] FLOW COMPLETED! Report ready: { ... }
api-1 | [API] ========================================
```

### 4. Verificar RabbitMQ (opcional)

1. Abrir http://localhost:15672
2. Login: `football` / `football`
3. Ir a "Exchanges" → ver `football_oracle` (topic exchange)
4. Ir a "Queues" → ver las colas temporales de cada servicio

## Troubleshooting

### Los servicios no se conectan a RabbitMQ

Los servicios tienen retry logic. Si RabbitMQ tarda en iniciar, veran logs como:
```
[RabbitMQ] Connection failed, retrying... (9 left)
```

Esperar a que se conecten (maximo ~20 segundos).

### El scraper no muestra logs

Python no hace flush automatico. El servicio funciona aunque no muestre logs detallados. Verificar que Engine recibe los datos.

### Error "port already in use"

```bash
# Parar servicios existentes
docker-compose down

# Si persiste, matar procesos en los puertos
lsof -i :3000 -i :4000 -i :5432 -i :5672 -i :6379
```

### Rebuild completo

```bash
docker-compose down -v  # -v elimina volumenes
docker-compose build --no-cache
docker-compose up
```

## Criterios de exito

- [x] `docker-compose up` levanta toda la infraestructura
- [x] Click en boton del frontend genera logs en todos los servicios
- [x] El flujo completo tarda < 5 segundos
- [x] API recibe el evento final `match.report_ready`

## Siguiente fase

[Fase 3: CI/CD y Calidad](./03-ci-cd-quality.md) - Configurar Husky, ESLint, Prettier y GitHub Actions antes de escribir logica de negocio real.
