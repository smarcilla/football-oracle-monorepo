# ADR-0006: Estrategia de Inicializacion y Migraciones de Base de Datos

**Fecha:** 2026-01-22  
**Estado:** Propuesto  
**Decisores:** Equipo de desarrollo

## Contexto

Durante las pruebas del Walking Skeleton se detectó que definir `POSTGRES_DB=football` en docker-compose.yml solo crea la base de datos vacía en el contenedor de PostgreSQL. Los servicios que intentan conectarse fallan con:

```
FATAL: database "football" does not exist
```

Además, aunque la BD exista, el schema (tablas definidas en ARCHITECTURE.md sección 5) no se crea automáticamente. Necesitamos definir:

1. **Inicialización:** Cómo crear la BD y schema inicial en un entorno nuevo
2. **Migraciones:** Cómo evolucionar el schema de forma controlada
3. **Herramientas:** Qué ORM/query builder/migration tool usar

### Restricciones

- Monorepo con pnpm workspaces
- Servicios en TypeScript (mayoría) y Python (scraper)
- Debe funcionar en desarrollo local (Docker) y producción (VPS)
- El scraper Python solo lee datos, no necesita escribir en BD directamente

## Decision

**PENDIENTE** - Este ADR documenta las opciones a evaluar. La decisión se tomará cuando implementemos la persistencia real (post-Walking Skeleton).

## Alternativas Consideradas

### Opcion A: Prisma (ORM completo)

- **Pros:**
  - Type-safe queries generados automáticamente
  - Migraciones declarativas (`prisma migrate`)
  - Prisma Studio para inspección visual
  - Muy popular en ecosistema Node/TypeScript
  - Soporta PostgreSQL nativo
- **Contras:**
  - Abstracción pesada, puede ser overkill para queries simples
  - El scraper Python no puede usar el cliente generado
  - Lock-in al schema de Prisma

### Opcion B: Drizzle ORM

- **Pros:**
  - Más ligero que Prisma, SQL-like syntax
  - Type-safe sin code generation pesado
  - Drizzle Kit para migraciones
  - Mejor rendimiento que Prisma en benchmarks
- **Contras:**
  - Ecosistema más joven, menos documentación
  - Misma limitación con Python

### Opcion C: SQL puro + golang-migrate

- **Pros:**
  - Control total sobre el SQL
  - Migraciones explícitas en archivos .sql
  - golang-migrate es agnóstico al lenguaje
  - Python puede usar los mismos schemas
- **Contras:**
  - Sin type-safety en queries
  - Más código boilerplate
  - Hay que gestionar conexiones manualmente

### Opcion D: Híbrido (Prisma para Node + SQL para Python)

- **Pros:**
  - Type-safety en servicios TypeScript
  - Python usa psycopg2/asyncpg directo con el mismo schema
  - Prisma genera las migraciones, todos las consumen
- **Contras:**
  - Complejidad de mantener dos formas de acceso
  - Riesgo de drift si Python hace queries ad-hoc

## Estrategia de Inicializacion (Independiente de la herramienta)

### Desarrollo Local

1. **docker-compose init container** o script de healthcheck:
   ```yaml
   services:
     db-init:
       image: postgres:16
       depends_on:
         postgres:
           condition: service_healthy
       command: ["psql", "-h", "postgres", "-U", "user", "-f", "/init.sql"]
       volumes:
         - ./packages/database/init.sql:/init.sql
   ```

2. **Wait-for-it pattern:** Los servicios esperan a que la BD esté lista antes de conectar

3. **Migraciones en startup:** Cada servicio ejecuta migraciones pendientes al arrancar (riesgo de race conditions)

### Produccion

- Migraciones ejecutadas en CI/CD antes del deploy
- Nunca migraciones automáticas en startup de producción
- Backup antes de cada migración

## Consecuencias

### Positivas (al resolver)
- Entorno de desarrollo reproducible con un solo comando
- Schema versionado y auditable
- Rollback posible ante errores

### Negativas (deuda actual)
- Walking Skeleton funciona sin BD real (mocks)
- Cualquier servicio que intente usar PostgreSQL fallará

### Riesgos
- Si elegimos mal la herramienta, migrar después es costoso
- Migraciones automáticas en producción pueden causar downtime

## Trabajo Pendiente

- [ ] Evaluar opciones cuando implementemos persistencia real
- [ ] Crear `packages/database/` con schema inicial
- [ ] Configurar healthcheck de PostgreSQL en docker-compose
- [ ] Documentar proceso de setup para nuevos desarrolladores

## Referencias

- [Prisma Documentation](https://www.prisma.io/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [golang-migrate](https://github.com/golang-migrate/migrate)
- ARCHITECTURE.md sección 5 (Modelo de Datos)
- ARCHITECTURE.md sección 11 (TODOs de BD)
