# Service Design: Data Registry

## 1. Misión

El **Data Registry** es el único servicio con acceso directo a la base de datos PostgreSQL y al estado persistente en Redis. Actúa como el cerebro de datos del sistema, garantizando la integridad, gestionando la máquina de estados y proporcionando una interfaz tipada (Data API) al resto de servicios.

## 2. Tecnologías

- **Runtime:** Node.js + TypeScript.
- **Framework:** Express 5.
- **ORM:** Prisma (PostgreSQL).
- **Caché:** Redis (ioredis).
- **Validación:** Zod con abstracción de Validators.
- **Mensajería:** Kafka (vía Internal Outbox Relay).

## 3. Estructura de Carpetas

```
/src
  /config         # Configuración (env, db, redis)
  /handlers       # Controladores de rutas Express (Input/Output)
  /services       # Orquestadores de dominio y State Machine
  /repositories   # Abstracción de persistencia (Prisma y Redis)
  /mappers        # Conversión Domain Types <=> Prisma Models
  /validators     # Esquemas Zod y abstracciones de validación
  /middleware     # Error handling, Auth, Logging
  /jobs           # Internal Outbox Relay (Background workers)
  index.ts        # Punto de entrada (Servidor Express)
```

## 4. Diseño del Sistema por Capas

### Handlers (Rutas)

Reciben las peticiones HTTP, delegan la validación y llaman al **Service** correspondiente. Devuelven respuestas usando tipos de dominio de `@football-oracle/types`. Un handler nunca habla con un Repository directamente.

### Services (Lógica de Dominio)

Es la instancia donde reside la inteligencia del sistema. Gestiona la **máquina de estados** y coordina el uso de la caché. Por ejemplo, al leer un partido, el Service consulta al **Cache Service** antes de ir al **Repository**. Al intentar cambiar un estado a `SIMULATED`, el Service comprueba si el estado actual es `SIMULATING`, pide al **Repository** guardar el cambio y asegura que se genere la entrada en el **Outbox**.

### Repositories (Persistencia y Caché)

Abstraen el acceso a los motores de almacenamiento. Tendremos dos tipos:

1.  **Prisma Repositories:** Para la persistencia de largo plazo en PostgreSQL.
2.  **Cache Repositories (Redis):** Para el almacenamiento transitorio, locks y vistas rápidas.

Esta separación permite que la lógica de "dónde se guarda el dato" esté aislada, facilitando el testing.

### Services (Lógica de Dominio)

Es la instancia donde reside la inteligencia del sistema. Actúa como **orquestador** entre los diferentes repositorios. Es el responsable de implementar patrones como:

- **Cache-Aside:** Preguntar al `CacheRepository`, si falla, preguntar al `PrismaRepository` y actualizar la caché.
- **Invalidación:** Asegurar que tras un cambio en la persistencia de largo plazo, se limpie el registro correspondiente en la caché.
- **State Machine:** Validar que un partido solo avance de estado si se cumplen las condiciones de negocio.

### Validators & Mappers

- **Validators:** Abstracción sobre Zod para validar payloads de entrada.
- **Mappers:** Funciones puras que transforman los objetos de Prisma (internos) en interfaces de dominio de `@football-oracle/types` (públicos) y viceversa.

## 5. Estrategia de Eventos: "Hybrid Outbox"

Sobre tu duda del Outbox, la mejor forma de implementarlo sin añadir servicios externos adicionales (como un relay independiente) es el **Hybrid Internal Outbox**:

1.  **Commit Atómico:** El **Repository** guarda el dato (ej: `Match`) y el mensaje (ej: `match.data.scraped`) en la misma transacción SQL. El mensaje se guarda en una tabla `Outbox` como `PENDING`.
2.  **Relay Interno:** En el `index.ts`, iniciamos un pequeño worker (`/jobs/outbox-relay.ts`) que corre en el mismo proceso de Node.js.
3.  **Polling Corto:** Este worker revisa la tabla `Outbox` cada 100-500ms. Si hay mensajes `PENDING`, los envía a Kafka. Tras recibir el `ACK` de Kafka, marca el mensaje como `PROCESSED`.

**¿Por qué no usar el modelo de consulta (Pull)?**
Si los consumidores tuvieran que preguntar al Data Registry si hay novedades, perderíamos la naturaleza asíncrona de Kafka. El Relay interno nos da lo mejor de ambos mundos: **Garantía de entrega** (si el commit falla, no sale mensaje) y **Baja latencia/Desacoplamiento** (el consumidor se entera vía Kafka sin pollings constantes).

## 6. Diseño de la API (Endpoints)

### Gestión de Partidos

- `GET /matches`: Lista partidos con filtros (liga, temporada, estado).
- `GET /matches/:id`: Detalle completo (Metadatos + Shots + Simulación + Reporte).
- `PATCH /matches/:id/status`: Cambia el estado (valida transiciones legales).
- `POST /matches/bulk`: Creación masiva de partidos (Scraper sync).

### Scraping y Análisis

- `PATCH /matches/:id/data`: Guarda los `raw_shots` tras el scrap.
- `POST /simulations`: Registra resultados de Monte Carlo.
- `POST /reports`: Guarda la crónica generada por la IA.

## 5. Esquema Prisma (Resumen)

```prisma
model League {
  id      String   @id
  name    String
  country String
  seasons Season[]
}

model Season {
  id       Int     @id @default(autoincrement())
  name     String
  league   League  @relation(fields: [leagueId], references: [id])
  leagueId String
  matches  Match[]
}

model Match {
  id           Int          @id
  date         DateTime
  status       MatchStatus  @default(IDENTIFIED)
  homeTeamId   Int
  awayTeamId   Int
  seasonId     Int
  realScore    Json?
  rawShots     Json?
  scrapedAt    DateTime?
  simulation   Simulation?
  report       Report?
  season       Season       @relation(fields: [seasonId], references: [id])
}

enum MatchStatus {
  IDENTIFIED
  SCRAPING
  SCRAPED
  SIMULATING
  SIMULATED
  REPORTING
  COMPLETED
  FAILED
}
```

## 6. Lógica de Negocio Crítica

### Transiciones de Estado

El servicio debe rechazar transiciones inválidas (ej: pasar de `IDENTIFIED` a `SIMULATING` sin haber pasado por `SCRAPED`).

### Estrategia de Redis

- Al llamar a `GET /matches/:id`, el servicio busca primero en Redis `cache:match:view:{id}`.
- Si no existe, consulta DB, construye el objeto agregado y lo guarda en Redis con un TTL largo si el partido ya está en estado `COMPLETED`.

### Patrón Outbox

Cada vez que se guarda un `Match`, una `Simulation` o un `Report`, se crea una entrada en una tabla `Outbox`. Un worker interno lee estas entradas y las empuja al topic de Kafka correspondiente, marcándolas como procesadas.

## 7. Estado de Implementación (Enero 2026)

El servicio se encuentra en una fase funcional básica, con la infraestructura de persistencia principal establecida:

- **Migración a Prisma 7**: Configuración finalizada con `prisma.config.js` y Driver Adapters operativos.
- **Persistencia Base**: Implementación de Repositorios SQL (`Match`, `League`, `Season`, `Simulation`, `Report`) y definición de la tabla `Outbox`.
- **Estructura por Capas**: Handlers y Services iniciales implementados con validación Zod.
- **Dockerización**: Pipeline de construcción y despliegue con migraciones automáticas funcionando.

### Pendientes Críticos en Data Registry:

1.  **Outbox Relay Job**: Falta implementar el worker en `/src/jobs` que realice el polling de la tabla `Outbox`, publique en Kafka y actualice el estado a `PROCESSED`. Actualmente los eventos se guardan en la DB pero **no salen a Kafka**.
2.  **Capa de Caché (Redis)**: Redis está configurado pero los Repositorios aún no implementan la lógica de _Cache-Aside_ ni de invalidación.
3.  **Máquina de Estados**: La lógica de validación de transiciones en los Services está en fase de esqueleto y requiere ser completada.

## 8. Siguientes Pasos

- **Implementar Outbox Relay**: Crear el proceso de fondo para el envío de eventos.
- **Integrar Redis en Repositorios**: Añadir soporte para caché de lectura en partidos y listas.
- **Conexión con Scraper (Python)**: Una vez los eventos fluyan, conectar el scraper para alimentar el sistema.
