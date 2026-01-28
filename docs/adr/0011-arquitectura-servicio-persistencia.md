# ADR-011: Centralización de Persistencia a través de un Servicio de Datos (Data API)

**Fecha:** 2026-01-28  
**Estado:** Propuesto  
**Decisores:** Equipo de desarrollo, GitHub Copilot

## Contexto

El sistema modular actual (monorepo) utiliza Kafka para la comunicación asíncrona entre servicios escritos en lenguajes heterogéneos (Node.js y Python). Hasta ahora, se había planteado que cada servicio pudiera tener acceso directo a la base de datos PostgreSQL ([ADR-0006](docs/adr/0006-database-initialization-migrations.md)).

Sin embargo, surgen varios retos:
1.  **Heterogeneidad de Clientes:** Implementar y mantener un ORM tanto en Node.js (Prisma/Drizzle) como en Python (SQLAlchemy/Tortoise) requiere duplicar la lógica de negocio y el esquema de datos, aumentando el riesgo de "schema drift".
2.  **Gestión de Secretos:** Cada servicio debe conocer las credenciales de la base de datos.
3.  **Eficiencia del Scraper:** El scraper de Python debe consultar frecuentemente si un partido ya ha sido procesado para evitar baneos de IPs externas. Hacerlo directamente contra la BD desde Python requiere una infraestructura de conexión adicional.
4.  **Caché:** Se desea utilizar Redis para optimizar la lectura de datos estáticos (resultados de partidos terminados). Gestionar esta caché de forma coherente desde múltiples servicios es complejo.

## Decisión

Implementar un **Servicio de Datos (Data Registry / Persistence Service)** centralizado en Node.js/TypeScript. 

### Características principales:
- **Único punto de acceso a la base de datos:** Solo este servicio poseerá las credenciales de PostgreSQL.
- **API REST/Internal:** Expondrá endpoints para que el Scraper (Python), el API Orchestrator y otros servicios realicen operaciones CRUD y consultas complejas.
- **Abstracción del ORM:** Utilizará un único ORM (Prisma o Drizzle) para gestionar el esquema y las migraciones.
- **Gestión de Caché (Redis):** Integrará de forma transparente una capa de caché para datos de partidos finalizados y reportes generados.
- **Garante de la Máquina de Estados:** Centralizará la lógica para cambiar el estado de un partido (de `PENDING` a `SCRAPED`, `SIMULATED`, etc.).

### Flujo de Trabajo:
1.  El **API Orchestrator** consulta al **Servicio de Datos** para listar partidos.
2.  El **Scraper** consulta al **Servicio de Datos** antes de iniciar un proceso de extracción.
3.  Al recibir resultados, el **Servicio de Datos** actualiza la BD y, opcionalmente, publica el evento en Kafka para continuar el flujo (implementando el **Transactional Outbox Pattern**).

## Consecuencias

### Positivas:
- **Desacoplamiento Tecnológico:** El Scraper de Python solo necesita un cliente HTTP estándar.
- **Consistencia Garantizada:** Un único esquema centralizado y validado por Zod/TypeScript.
- **Seguridad Mejorada:** Menor superficie de exposición para las credenciales de BD.
- **Facilidad de Observabilidad:** Un único lugar donde monitorizar el rendimiento de las consultas y la salud de la BD.

### Negativas / Riesgos:
- **Latencia:** Se añade un salto de red adicional (HTTP) en las operaciones de persistencia. Se considera aceptable dado que el flujo principal es asíncrono.
- **Punto único de fallo:** Si el Servicio de Datos cae, el sistema queda inoperativo. Se mitigará mediante estrategias de alta disponibilidad en el despliegue.
- **Sobrecarga de Desarrollo Inicial:** Requiere definir y mantener una API interna adicional.

## Alternativas Consideradas

1.  **Acceso Directo (Prisma + Python Client):** Descartado por la dificultad de mantener la paridad de tipos y la gestión de conexiones desde Python.
2.  **Uso de un "Headless ORM" compartido:** Difícil de implementar entre Node y Python sin usar FFI o herramientas complejas.

## Validación de la Propuesta del Usuario

La propuesta del usuario de usar un servicio de BD es **muy acertada** por las siguientes razones adicionales:
- **Inmutabilidad de datos deportivos:** Al ser datos mayoritariamente estáticos post-partido, el servicio de datos puede servir el 90% de las peticiones desde Redis con latencia mínima.
- **Prevención de Baneos:** El Scraper puede ser extremadamente "agresivo" comprobando el estado en nuestra API interna antes de realizar cualquier llamada a Sofascore.
