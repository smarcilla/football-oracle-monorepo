# Referencia de Datos: Sofascore (ScraperFC)

Este documento detalla la estructura exhaustiva de los datos "crudos" obtenidos de Sofascore.

## 1. Calendario de Partidos (`get_match_dicts`)

Retorna una lista de objetos de evento. A continuación se detallan todos los campos disponibles en un objeto de partido:

### Campos Raíz

- **`id`** (`int`): Identificador único del partido (ej: `11352485`).
- **`customId`** (`string`): Identificador alfanumérico.
- **`slug`** (`string`): URL slug del partido (ej: `"brentford-fulham"`).
- **`startTimestamp`** (`int`): Timestamp Unix del inicio del partido.
- **`status`** (`dict`): Estado del partido.
  - `code` (100 = Finalizado).
  - `description`: "Ended".
  - `type`: "finished".
- **`winnerCode`** (`int`): Indica el ganador (1=Local, 2=Visitante, 3=Empate).
- **`homeTeam`** / **`awayTeam`** (`dict`):
  - `id`, `name`, `slug`, `shortName`, `nameCode`.
  - `userCount`: Popularidad del equipo.
  - `gender`: "M"/"F".
  - `teamColors`: `primary`, `secondary`, `text`.
  - `country`: `name`, `alpha2`, `alpha3`.
  - `fieldTranslations`: Traducciones de nombres.
- **`homeScore`** / **`awayScore`** (`dict`):
  - `current`, `display`: Goles totales.
  - `period1`, `period2`: Goles por mitad.
  - `normaltime`: Goles en tiempo reglamentario.
- **`tournament`** (`dict`):
  - `name`, `slug`, `priority`, `id`.
  - `category`: `name`, `id`, `flag`, `country`.
  - `uniqueTournament`: Metadatos de la competición (colores, popularidad, funciones disponibles).
- **`season`** (`dict`): `name`, `year`, `id`.
- **`roundInfo`** (`dict`): `round` (número de jornada).
- **`time`** (`dict`): Info de tiempos añadidos (`injuryTime1`, `injuryTime2`) y timestamps de periodos.
- **`hasXg`**, **`hasEventPlayerStatistics`**, **`hasEventPlayerHeatMap`**, **`hasGlobalHighlights`** (`bool`): Flags de disponibilidad de funciones extra.
- **`changes`** (`dict`): Historial de cambios técnicos.
- **`isEditor`**, **`feedLocked`**, **`finalResultOnly`** (`bool`): Metadatos del feed.

---

## 2. Datos de Disparos (`scrape_match_shots`)

Cada fila del DataFrame representa un incidente de disparo con los siguientes campos:

### Campos de Disparo

- **`id`** (`int`): ID único del incidente.
- **`incidentType`** (`string`): Siempre "shot".
- **`isHome`** (`bool`): True si el disparo es del equipo local.
- **`time`** (`int`): Minuto del partido.
- **`addedTime`** (`float`): Minuto extra en caso de descuento (NaN si no aplica).
- **`timeSeconds`** (`int`): Segundo exacto del partido.
- **`shotType`** (`string`): Resultado del disparo (`goal`, `miss`, `save`, `block`).
- **`situation`** (`string`): Contexto (`assisted`, `set-piece`, `fast-break`, `corner`, `regular`).
- **`bodyPart`** (`string`): `left-foot`, `right-foot`, `head`.
- **`xg`** (`float`): Valor de Expected Goals de Sofascore.
- **`xgot`** (`float`): Expected Goals on Target (NaN si el disparo no fue a puerta).
- **`player`** (`dict`):
  - `id`, `name`, `shortName`, `position` (D, M, F, G), `jerseyNumber`.
- **`playerCoordinates`** (`dict`): Ubicación del jugador al disparar `{x, y, z}`.
- **`goalMouthLocation`** (`string`): Zona de la portería (`low-centre`, `high-left`, etc.).
- **`goalMouthCoordinates`** (`dict`): Punto exacto de entrada o impacto en portería `{x, y, z}`.
- **`blockCoordinates`** (`dict`): Ubicación del bloqueo si `shotType` es "block".
- **`draw`** (`dict`): Vectores simplificados para visualización (trayectorias start/end).
- **`periodTimeSeconds`**, **`reversedPeriodTimeSeconds`** (`int`): Tiempos técnicos de periodo.

---

## 3. Notas técnicas

1.  **Valores Nulos**: Campos como `xgot` o `blockCoordinates` pueden ser `NaN` según el resultado del disparo.
2.  **Referencia Geográfica**: Aunque la posición no sea vital para la simulación inicial, los campos `playerCoordinates` permiten futuras expansiones de métricas espaciales.
3.  **Identificadores**: El `id` de partido de Sofascore debe guardarse para permitir re-extraer disparos si los pesos del modelo de simulación cambian.
