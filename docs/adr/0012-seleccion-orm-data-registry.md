# ADR-0012: Selección de ORM para el Data Registry Service

**Fecha:** 2026-01-28  
**Estado:** Propuesto  
**Decisores:** Equipo de desarrollo, GitHub Copilot

## Contexto

Con la decisión de crear un servicio centralizado de persistencia (**Data Registry**), necesitamos elegir la herramienta para interactuar con PostgreSQL en Node.js/TypeScript. Las opciones principales son Prisma, TypeORM y Drizzle.

### Criterios de Evaluación:

1.  **Type-Safety:** Integración nativa y robusta con TypeScript.
2.  **Facilidad de Mantenimiento:** Rapidez para cambiar el esquema y generar migraciones.
3.  **Rendimiento:** Latencia mínima en las consultas.
4.  **Curva de Aprendizaje:** Familiaridad del equipo con la herramienta.
5.  **DX (Developer Experience):** Herramientas de depuración, introspección y auto-completado.

## Opciones Consideradas

### 1. Prisma

- **Enfoque:** Schema-first (DSL propio `.prisma`).
- **Pros:**
  - Cliente auto-generado con el mayor nivel de type-safety del mercado.
  - Prisma Studio para visualizar datos rápidamente.
  - Migraciones declarativas muy potentes.
  - Excelente documentación.
- **Contras:**
  - Binario de Rust (más pesado en Docker).
  - Abstracción que a veces dificulta queries SQL muy complejas.
  - Pequeño overhead de rendimiento por su motor interno.

### 2. TypeORM

- **Enfoque:** Code-first (Decoradores en clases TS).
- **Pros:**
  - Estándar de la industria durante años.
  - Soporta patrones Data Mapper y Active Record.
  - Muy familiar para desarrolladores con experiencia en Java/C# (similar a Hibernate/Entity Framework).
- **Contras:**
  - Los decoradores añaden "magia" que a veces es difícil de depurar.
  - La inferencia de tipos no es tan automática como en Prisma (requiere definir clases manualmente).
  - Mantenimiento de migraciones más manual/propenso a errores.

### 3. Drizzle ORM

- **Enfoque:** TypeScript-first ("Just SQL").
- **Pros:**
  - Extremadamente ligero (0 dependencias pesadas).
  - Rendimiento casi idéntico a SQL puro.
  - Inferencia de tipos perfecta sin generación de código (Headless).
- **Contras:**
  - Ecosistema más joven.
  - Menos abstracciones para operaciones complejas de relación.

## Decisión

Se propone el uso de **Prisma** para el Data Registry Service.

### Razón de la decisión:

En un sistema donde el **Scraper** y el **Engine** dependen de una estructura de datos muy estricta, la capacidad de Prisma para generar un cliente TypeScript 100% tipado a partir de una única fuente de verdad (el `schema.prisma`) reduce drásticamente los errores de integración.

Aunque **TypeORM** es una opción sólida y muy "enterprise", la velocidad de desarrollo (DX) y la seguridad en tiempo de compilación que ofrece **Prisma** superan los beneficios de la arquitectura clásica basada en decoradores de TypeORM para este proyecto concreto.

**Drizzle** se descartó por ser un proyecto con una curva de aprendizaje ligeramente superior para equipos acostumbrados a ORMs más abstractos, aunque se mantiene como alternativa si el rendimiento de Prisma se convirtiera en un cuello de botella crítico (poco probable en este flujo asíncrono).

## Consecuencias

### Positivas:

- Sincronización automática entre el esquema de BD y los tipos de TypeScript en todo el monorepo.
- Uso de Prisma Migrate para una evolución controlada y segura del esquema.
- Facilidad para inspeccionar el estado del sistema mediante Prisma Studio.

### Negativas:

- El tamaño de la imagen Docker del `data-registry` aumentará debido al motor de Prisma.
- Si en el futuro necesitamos SQL altamente optimizado, podríamos tener que usar el escape hatch de `$queryRaw`.
