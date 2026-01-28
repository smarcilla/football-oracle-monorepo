# ADR-0010: Implementación de Scrapers con ScraperFC y Sofascore

## Estado

Propuesto

## Fecha

2026-01-27

## Contexto

Para el proyecto Football Oracle, necesitamos una fuente fiable de datos de fútbol que incluya no solo resultados, sino también estadísticas detalladas y eventos de disparos (shots). Sofascore es una de las plataformas con mayor detalle en estos datos.

## Decisión

Se ha decidido utilizar la librería `ScraperFC` (Python) para realizar el scraping de Sofascore. Esta librería proporciona una interfaz simplificada para acceder a la API de aplicaciones como Sofascore, manejando la complejidad de las peticiones HTTP y el parseo inicial.

Específicamente se utilizará la clase `ScraperFC.sofascore.Sofascore` para:

- Obtener calendarios de ligas completas.
- Recuperar detalles técnicos de partidos.
- Extraer dataframes de disparos con coordenadas y xG.

## Consecuencias

- **Positivas**:
  - Rapidez en la implementación al usar una librería especializada.
  - Soporte para múltiples ligas sin necesidad de mantenimiento manual de parsers.
  - Los datos de disparos ya vienen estructurados en DataFrames de Pandas.
- **Negativas/Riesgos**:
  - Dependencia de una librería externa que puede romperse si la API de Sofascore cambia.
  - Requiere Selenium en algunos casos (aunque SofascoreClient suele usar API directa), lo que puede aumentar el consumo de recursos.
  - Necesidad de gestionar el "rate limiting" para no ser bloqueados.

## Alternativas Consideradas

- **Scraping Manual (BeautifulSoup/Selenium)**: Descartado por el alto coste de mantenimiento.
- **APIs de Pago (Sportmonks/Opta)**: Descartado por el coste económico en esta fase del proyecto.
