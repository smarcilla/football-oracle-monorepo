# ADR-0009: Migración a Express 5

**Fecha:** 2026-01-26  
**Estado:** Aceptado  
**Decisores:** Equipo Football Oracle

## Contexto

El proyecto se inició utilizando Express 4.21.0. Sin embargo, estamos en las fases iniciales de desarrollo y no existen restricciones de compatibilidad con sistemas legados. 

Express 5 ofrece mejoras significativas en la robustez del código, especialmente en la gestión de errores asíncronos, que es una parte central de nuestra arquitectura basada en eventos (Kafka) y procesamiento de datos.

## Decision

Migrar el servicio `apps/api` de Express 4 a Express 5.

Las razones principales son:
1.  **Gestión nativa de promesas:** Express 5 captura automáticamente los rechazos de promesas en rutas y middlewares asíncronos, eliminando la necesidad de envolver cada handler en un `.catch(next)` o usar utilidades externas como `asyncHandler`.
2.  **Preparación para el futuro:** Evitar deuda técnica desde el día 1 utilizando la versión más moderna del framework.
3.  **Simplificación del código:** Reducción de boilerplate en la gestión de errores de los handlers de Kafka y API REST.

## Alternativas Consideradas

### Opción A: Mantener Express 4
- **Pros:** Estabilidad probada.
- **Contras:** Requiere gestión manual de errores en handlers `async`, lo que aumenta la probabilidad de errores catastróficos si se olvida un `.catch()`.

## Consecuencias

### Positivas
- Código más limpio y legible en los controladores.
- Sistema de gestión de errores más robusto y automatizado.
- Alineación con las recomendaciones modernas de TypeScript y Node.js.

### Negativas
- Potenciales cambios menores en el comportamiento de middlewares específicos (CORS, body-parser), aunque son mínimos en la versión 5.

## Referencias

- [Express 5.0 Migration Guide](https://expressjs.com/en/guide/migrating-5.html)
