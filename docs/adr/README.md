# Architecture Decision Records

Este directorio contiene los ADRs (Architecture Decision Records) del proyecto Football Oracle.

## Indice

| ID                                                 | Titulo                                    | Estado    | Fecha      |
| -------------------------------------------------- | ----------------------------------------- | --------- | ---------- |
| [0000](0000-adr-template.md)                       | Template                                  | -         | -          |
| [0001](0001-usar-adrs.md)                          | Usar ADRs para documentar decisiones      | Aceptado  | 2026-01-22 |
| [0002](0002-walking-skeleton.md)                   | Walking Skeleton como primera iteracion   | Aceptado  | 2026-01-22 |
| [0003](0003-arquitectura-interna-capas.md)         | Arquitectura interna simple por capas     | Aceptado  | 2026-01-22 |
| [0004](0004-testing-calidad-codigo.md)             | Estrategia de testing y calidad de codigo | Aceptado  | 2026-01-22 |
| [0005](0005-ci-cd-git-hooks.md)                    | CI/CD y validacion local con Git Hooks    | Aceptado  | 2026-01-22 |
| [0006](0006-database-initialization-migrations.md) | Gestión de Iniciación y Migraciones de BD | Aceptado  | 2026-01-22 |
| [0007](0007-migracion-kafka.md)                    | Migración a Apache Kafka                  | Aceptado  | 2026-01-23 |
| [0008](0008-uso-sonarqube-sonarcloud.md)           | Uso de SonarCloud para calidad            | Aceptado  | 2026-01-26 |
| [0009](0009-migracion-express-5.md)                | Migración a Express 5                     | Aceptado  | 2026-01-26 |
| [0010](0010-implementacion-scrapers-sofascore.md)  | Implementación de Scrapers con ScraperFC  | Propuesto | 2026-01-27 |
| [0011](0011-arquitectura-servicio-persistencia.md) | Centralización de Persistencia (Data API) | Propuesto | 2026-01-28 |
| [0012](0012-seleccion-orm-data-registry.md)        | Selección de ORM para el Data Registry    | Propuesto | 2026-01-28 |

## Como crear un nuevo ADR

1. Copia `0000-adr-template.md`
2. Renombra a `NNNN-nombre-descriptivo.md` (siguiente numero disponible)
3. Completa todas las secciones
4. Actualiza este indice
5. Crea PR para revision

## Estados

- **Propuesto:** En discusion, pendiente de aprobacion
- **Aceptado:** Decision tomada y vigente
- **Deprecado:** Ya no aplica pero se mantiene como referencia
- **Sustituido:** Reemplazado por otro ADR (indicar cual)
