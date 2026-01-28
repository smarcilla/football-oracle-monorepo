# Flujo del Sistema y Máquina de Estados

Este documento describe el ciclo de vida de las entidades principales (Partidos y Análisis) y cómo interactúan los servicios a través de eventos y el nuevo Servicio de Datos.

## 1. Ciclo de Vida de un Partido (Match State Machine)

Un partido en nuestro sistema transita por los siguientes estados. Estos estados son gestionados por el **Data Registry Service**.

| Estado       | Descripción                                                        | Transición disparada por...                                   |
| :----------- | :----------------------------------------------------------------- | :------------------------------------------------------------ |
| `IDENTIFIED` | El partido existe en el calendario pero no tenemos datos de shots. | Sync de calendario exitoso.                                   |
| `SCRAPING`   | El scraper está actualmente extrayendo datos de Sofascore.         | Mensaje `match.analysis.requested` leído por el Scraper.      |
| `SCRAPED`    | Los datos de shots (xG, etc.) están guardados en el Data Registry. | Evento `match.data.scraped`.                                  |
| `SIMULATING` | El motor Monte Carlo está procesando los datos.                    | Mensaje `match.data.scraped` leído por el Engine.             |
| `SIMULATED`  | Las probabilidades de victoria y resultados están calculadas.      | Evento `match.simulation.completed`.                          |
| `REPORTING`  | El Journalist Agent está generando la crónica.                     | Mensaje `match.simulation.completed` leído por el Journalist. |
| `COMPLETED`  | Crónica disponible. Flujo terminado.                               | Evento `match.report.generated`.                              |
| `FAILED`     | Error en cualquier parte del flujo.                                | Excepciones capturadas por cualquier servicio.                |

---

## 2. Flujo de Mensajería (Kafka + Data API)

### Caso de Uso A: Sincronización de Calendario

1. **Frontend**: Solicita sync.
2. **API Orchestrator**: Publica `league.sync.requested`.
3. **Scraper**: Consume evento -> Scrapea lista -> Llama a **Data API** (POST `/matches/bulk`) -> **Data API** guarda nuevos partidos en `IDENTIFIED`.
4. **Data API**: Publica `league.synced`.

### Caso de Uso B: Análisis de un Partido (Core Flow)

1. **Frontend / API Orchestrator**: Publica `match.analysis.requested` con `matchId`.
2. **Scraper**:
   - Llama a **Data API** (GET `/matches/:id`) para verificar si ya está `SCRAPED`.
   - Si no: Scrapea -> Llama a **Data API** (PATCH `/matches/:id/data`) -> **Data API** actualiza a `SCRAPED`.
   - Publica (o lo hace la Data API): `match.data.scraped`.
3. **Simulation Engine**:
   - Consume `match.data.scraped`.
   - Llama a **Data API** (GET `/matches/:id/shots`) para obtener el payload completo.
   - Ejecuta Monte Carlo.
   - Llama a **Data API** (POST `/simulations`) para guardar resultados -> **Data API** actualiza a `SIMULATED`.
   - Publica: `match.simulation.completed`.
4. **Journalist Agent**:
   - Consume `match.simulation.completed`.
   - Llama a **Data API** (GET `/matches/:id/summary`) para obtener datos reales + simulación.
   - Genera crónica con LLM.
   - Llama a **Data API** (POST `/reports`) -> **Data API** guarda y actualiza a `COMPLETED`.
   - Publica: `match.report.generated`.

---

## 3. Mapeo de Mensajes Kafka

| Topic                        | Key        | Payload                          | Productor             | Consumidor principal |
| :--------------------------- | :--------- | :------------------------------- | :-------------------- | :------------------- |
| `league.sync.requested`      | `leagueId` | `{ league, year }`               | API Orchestrator      | Scraper              |
| `league.synced`              | `leagueId` | `{ league, year, matchesCount }` | Data API / Scraper    | API Orchestrator     |
| `match.analysis.requested`   | `matchId`  | `{ matchId, league }`            | API Orchestrator      | Scraper              |
| `match.data.scraped`         | `matchId`  | `{ matchId, shotsCount }`        | Data API / Scraper    | Simulation Engine    |
| `match.simulation.completed` | `matchId`  | `{ matchId, winnerProb }`        | Data API / Engine     | Journalist Agent     |
| `match.report.generated`     | `matchId`  | `{ matchId, reportId }`          | Data API / Journalist | API Orchestrator     |

> **Nota sobre Transactional Outbox:**  
> Para garantizar que si guardamos en BD el evento se publique SIEMPRE, el **Data API** usará el patrón Outbox. El resto de servicios prefieren leer de la API para obtener payloads grandes, usando Kafka solo como señal de "disparador".
