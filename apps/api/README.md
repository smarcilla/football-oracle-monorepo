# Football Oracle - API Orchestrator (`apps/api`)

## Testing League Synchronization

Este servicio actúa como orquestador para las acciones administrativas del sistema.

### 1. Sincronizar Liga y Temporada

Este endpoint dispara el proceso de sincronización. Busca el ID de la temporada en el **Data Registry** y registra una petición de carga en el **Outbox**.

**Endpoint:** `POST /admin/sync-league`

**Ejemplo con `curl`:**

```bash
curl -X POST http://localhost:4000/admin/sync-league \
  -H "Content-Type: application/json" \
  -d '{
    "leagueId": "England Premier League",
    "year": "24/25"
  }'
```

**Respuesta Esperada (`202 Accepted`):**

```json
{
  "status": "success",
  "message": "Synchronization request accepted",
  "data": {
    "seasonId": 1
  }
}
```

### 2. Comprobar Salud de la API

**Endpoint:** `GET /health`

```bash
curl http://localhost:4000/health
```

## Flujo Técnico tras la petición

1. **API** -> `GET /seasons?leagueId=...&year=...` (al Data Registry) para obtener el ID.
2. **API** -> `PATCH /seasons/:id/request-sync` (al Data Registry).
3. **Data Registry** -> Inserta en la tabla `Outbox`.
4. **Outbox Relay** (Data Registry) -> Publica en Kafka `league.sync.requested`.
5. **Scraper** -> Consume de Kafka e inicia el scraping de Sofascore.
