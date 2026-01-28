# Definición de Eventos y Mapeo de Datos

Este documento define la interfaz de comunicación del Scraper (Kafka) y el esquema de datos de nuestro dominio, explicando cómo transformamos el "Raw Data" de Sofascore en información útil para la simulación, el frontend y la IA.

## 1. Flujo de Eventos (Kafka)

### Entrada: `match.analysis.requested`

Emitido por la **API** cuando un usuario solicita el análisis de un partido.

- **Payload**: `MatchAnalysisRequested`
- **Decisión**: Usamos el `matchId` de Sofascore directamente como identificador en todo nuestro sistema para evitar tablas de mapeo complejas en esta fase.

### Salida: `match.data.scraped`

Emitido por el **Scraper** tras procesar la información.

- **Payload**: `MatchDataScraped` (Extensión del actual `MatchDataExtracted`)
- **Decisión**: Enviar un único evento rico que contenga tanto metadatos del partido como el listado de disparos. Esto simplifica la sincronización en el Engine y el Journalist.

---

## 2. Definición del Modelo de Dominio (Mapeo)

### A. Metadatos del Partido (`MatchMetadata`)

Transformación desde el objeto raíz de `get_match_dicts`.

| Campo Dominio | Fuente Sofascore                          | Decisión / Razón                                    |
| ------------- | ----------------------------------------- | --------------------------------------------------- |
| `id`          | `id`                                      | Identificador único externo.                        |
| `homeTeam`    | `homeTeam.name`                           | Nombre para visualización.                          |
| `awayTeam`    | `awayTeam.name`                           | Nombre para visualización.                          |
| `homeColors`  | `homeTeam.teamColors`                     | **UI**: Para tematizar las gráficas en el frontend. |
| `awayColors`  | `awayTeam.teamColors`                     | **UI**: Para tematizar las gráficas en el frontend. |
| `score`       | `homeScore.current` - `awayScore.current` | Resultado real para comparar con la simulación.     |
| `startTime`   | `startTimestamp`                          | Convertido a ISO String para legibilidad.           |
| `league`      | `tournament.uniqueTournament.name`        | Contexto para el Journalist.                        |

### B. Eventos de Disparo (`ShotEvent`)

Transformación desde el DataFrame de `scrape_match_shots`.

| Campo Dominio | Fuente Sofascore    | Decisión / Razón                                                                     |
| ------------- | ------------------- | ------------------------------------------------------------------------------------ | -------- |
| `playerId`    | `player.id`         | Identificación única del jugador.                                                    |
| `playerName`  | `player.name`       | **Journalist**: Para mencionar nombres propios en la crónica.                        |
| `team`        | `isHome`            | Mapeo a enum `'home'                                                                 | 'away'`. |
| `minute`      | `time`              | Contexto temporal para la crónica de la IA.                                          |
| `xg`          | `xg`                | **Simulation**: Valor fundamental para el modelo Monte Carlo.                        |
| `result`      | `shotType`          | Mapeo de `goal`, `miss`, `save`, `block`.                                            |
| `situation`   | `situation`         | **Journalist**: Permite decir si fue "tras un córner" o "en contraataque".           |
| `bodyPart`    | `bodyPart`          | **Journalist**: Permite decir si fue "un remate de cabeza" o "disparo con la zurda". |
| `location`    | `playerCoordinates` | Guardado como `{x, y}` aunque no se use en simulación (valor estético/futuro).       |

---

## 3. Decisiones de Diseño

1.  **Preservación de xG Original**: Aunque podríamos intentar recalcular xG, la decisión es **usar el xG de Sofascore**. Es una métrica aceptada por la industria y nos permite centrar el valor del proyecto en la simulación Monte Carlo posterior, no en el modelo de xG base.
2.  **Enriquecimiento para el Journalist**: Hemos decidido incluir `playerName`, `situation` y `bodyPart`. Aunque el simulador solo necesita xG y equipo, estos campos permiten que el agente de IA genere crónicas coherentes (ej: _"El Brentford dominó mediante jugadas a balón parado, destacando un disparo de Toney de cabeza con 0.35 xG"_).
3.  **Normalización de Enums**: Convertiremos los valores de Sofascore (ej: `left-foot`) a un estándar propio en TypeScript (`LEFT_FOOT`) para desacoplar el frontend de los strings crudos del scraper.
4.  **Uso de JSON en Kafka**: Mantendremos JSON para los mensajes de Kafka por su facilidad de inspección en esta fase, a pesar de que Avro/Protobuf serían más eficientes a largo plazo.

---

## 4. Estructura del Mensaje de Salida (Propuesta)

```json
{
  "matchId": "11352485",
  "metadata": {
    "league": "Premier League",
    "homeTeam": { "id": 50, "name": "Brentford", "colors": { "primary": "#ffffff" } },
    "awayTeam": { "id": 43, "name": "Fulham", "colors": { "primary": "#000000" } },
    "realScore": { "home": 0, "away": 0 }
  },
  "shots": [
    {
      "playerName": "Antonee Robinson",
      "team": "away",
      "minute": 90,
      "xg": 0.0909,
      "result": "block",
      "situation": "assisted",
      "bodyPart": "left-foot"
    }
  ],
  "scrapedAt": "2026-01-27T17:30:00Z"
}
```
