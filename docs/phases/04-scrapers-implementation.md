# Fase 4: Implementación de Scrapers (Sofascore)

**Estado:** No Iniciado  
**Fecha:** 2026-01-27  
**Branch:** `phase-4-scrapers-sofascocore`  
**ADRs relacionados:**

- [ADR-0010](../adr/0010-implementacion-scrapers-sofascore.md)

## Objetivo

Implementar los componentes de extracción de datos del servicio `scraper` utilizando la librería `ScraperFC`. El foco principal es la obtención de datos de partidos, estadísticas detalladas y disparos desde Sofascore.

## Alcance Técnico

Se integrará la librería `ScraperFC` para interactuar con la API de Sofascore y extraer la siguiente información:

1. **Listado de Partidos**: Obtener todos los partidos de una liga y temporada específica.
2. **Detalles de Partido**: Obtener el diccionario de datos completo de un partido individual.
3. **Estadísticas de Disparos**: Extraer información detallada sobre los disparos realizados en un partido.

## Componentes a Implementar

### 1. Cliente Sofascore (`ScraperFC`)

Se utilizará la clase `Sofascore` de la librería `ScraperFC` con los siguientes métodos clave:

| Método                          | Descripción                                 | Retorno        |
| ------------------------------- | ------------------------------------------- | -------------- |
| `get_match_dicts(year, league)` | Obtiene los partidos de una temporada/liga. | `list[dict]`   |
| `get_match_dict(match_id)`      | Obtiene datos de un partido por ID o URL.   | `dict`         |
| `scrape_match_shots(match_id)`  | Scrapea los disparos de un partido jugado.  | `pd.DataFrame` |

### 2. Servicio de Scraping (Python)

- **Integración**: Añadir `ScraperFC`, `pandas` y `selenium` (dependencia de ScraperFC) al `requirements.txt`.
- **Módulos**:
  - `src/clients/sofascore_client.py`: Wrapper sobre `ScraperFC.sofascore.Sofascore`.
  - `src/handlers/match_handler.py`: Lógica para procesar y emitir los datos a Kafka.

## Plan de Tareas

- [ ] Definición del ADR-0010 para la estrategia de scraping.
- [ ] Actualización de dependencias del servicio `scraper`.
- [ ] Implementación del cliente `SofascoreClient`.
- [ ] Implementación de lógica de extracción por liga/año.
- [ ] Pruebas unitarias con mocks para evitar llamadas reales a la API durante el CI.
- [ ] Integración con el sistema de mensajería (Kafka) para enviar los datos extraídos.

## Validación

- Ejecución de tests unitarios: `pytest services/scraper/tests`.
- Verificación de formato de datos (esquemas JSON para partidos y disparos).
- Comprobación de integración con Kafka (mensajes recibidos en el topic de partidos/shots).
