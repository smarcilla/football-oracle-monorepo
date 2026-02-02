# Diseño de Integración: API & Data Registry - Sincronización de Ligas

## 1. Introducción

Este documento define la estrategia para la **Sincronización de Ligas y Temporadas** mediante un proceso manual controlado por administrador.

## 2. Contexto Actual

- Contamos con un modelo de datos que incluye `League` y `Season`.
- El sistema utiliza Kafka para la comunicación asíncrona.
- El tópico `league.sync.requested` es el disparador para que el Scraper traiga el calendario.

## 3. Estrategia: Sincronización Manual (Admin-Triggered)

La sincronización no será automática ni disparada por el usuario final, sino por un administrador mediante peticiones directas a la API (ej. `curl`).

- **Pros:**
  - Control total sobre cuándo se impacta a las APIs externas (Sofascore).
  - Simplicidad técnica (sin schedulers complejos).
  - Evita procesos innecesarios en temporadas ya finalizadas.
- **Contras:**
  - Requiere intervención humana para mantener los datos frescos.

## 4. Flujo Técnico (Async + Outbox)

1. **Admin (Trigger):** Realiza una petición `POST /admin/sync-league` con `{ leagueId, year }` al **API Orchestrator**.
2. **API Orchestrator:**
   - Llama al **Data Registry** (`PATCH /seasons/:id/request-sync`).
3. **Data Registry:**
   - Registra en la tabla `Outbox` el evento `league.sync.requested`.
   - Responde exitosamente al API Orchestrator.
4. **Outbox Worker (Data Registry):**
   - El proceso interno de polling de la tabla `Outbox` detecta el nuevo registro.
   - Publica efectivamente el evento `league.sync.requested` en Kafka.
5. **Scraper:**
   - Consume el evento de Kafka.
   - Obtiene los partidos vía Sofascore.
   - Envía los datos al **Data Registry** (`POST /api/matches/bulk`).
6. **Data Registry:**
   - Persiste los partidos.
   - Actualiza el campo `lastSyncAt` en la tabla `Season`.

## 5. Modelo de Datos (Season)

Se mantiene un control simplificado en la tabla `Season`:

- `isActive`: Boolean. Indica si la temporada está en curso (`true`) o ha finalizado (`false`).
- `lastSyncAt`: Fecha de la última sincronización coordinada con éxito.

## 6. Frontend

- El frontend solo mostrará ligas que tengan `lastSyncAt != null`.
- Esto asegura que el usuario final solo acceda a datos que ya han sido validados y cargados previamente por el administrador.

## 7. Definición de Endpoints

### 7.1. API Orchestrator (`apps/api`)

**`POST /admin/sync-league`**

- **Propósito**: Punto de entrada para el administrador.
- **Payload**:
  ```json
  {
    "leagueId": "England Premier League",
    "year": "24/25"
  }
  ```
- **Lógica**:
  1. Busca el `seasonId` correspondiente en el Data Registry.
  2. Llama al Data Registry mediante `PATCH /seasons/:id/request-sync`.
  3. Devuelve `202 Accepted`.

### 7.2. Data Registry (`services/data-registry`)

**`PATCH /seasons/:id/request-sync`**

- **Propósito**: Registrar la intención de sincronización y disparar el evento Outbox.
- **Lógica Interna**:
  - Inserción en la tabla `Outbox` con tópico `league.sync.requested` y payload `{ leagueId, year }`.
- **Respuesta**: `200 OK` si el registro en outbox se crea correctamente.
