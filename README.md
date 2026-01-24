# Football Oracle

Plataforma de analisis deportivo que combina ingenieria de datos, simulacion Monte Carlo e IA Generativa para analizar partidos de futbol.

## Quickstart

### Requisitos

- Docker y Docker Compose
- Node.js 20+ (para desarrollo local)
- pnpm (`npm install -g pnpm`)

### Levantar el proyecto

```bash
# Clonar el repositorio
git clone <repo-url>
cd football-oracle-monorepo

# Levantar todos los servicios
pnpm run dev:build

# O si ya tienes las imagenes construidas
pnpm run dev
```

### URLs disponibles

| Servicio | URL                   | Descripcion         |
| -------- | --------------------- | ------------------- |
| Frontend | http://localhost:3000 | Interfaz de usuario |
| API      | http://localhost:4000 | API Gateway         |
| Kafka    | localhost:9092        | Bus de eventos      |

### Probar el flujo

```bash
# Opcion 1: Desde el frontend
# Abrir http://localhost:3000 y hacer click en "Analyze Match"

# Opcion 2: Desde curl
curl -X POST http://localhost:4000/analyze/test-123
```

### Ver logs

```bash
# Todos los servicios
docker-compose logs -f

# Servicio especifico
docker-compose logs -f api
docker-compose logs -f engine
docker-compose logs -f journalist
```

### Parar los servicios

```bash
pnpm run down
```

## Documentacion

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Vision tecnica del sistema
- [STATUS.md](./STATUS.md) - Estado actual del proyecto
- [docs/adr/](./docs/adr/) - Decisiones de arquitectura (ADRs)
- [docs/phases/](./docs/phases/) - Documentacion por fase del proyecto

## Estructura del proyecto

```
/
├── apps/
│   ├── web/                 # Frontend (Next.js)
│   └── api/                 # API Gateway (Express)
├── services/
│   ├── scraper/             # Python Worker
│   ├── engine/              # Simulation Engine
│   └── journalist/          # Genkit NLG Service
├── packages/
│   └── types/               # Shared TypeScript types
├── docs/
│   ├── adr/                 # Architecture Decision Records
│   └── phases/              # Documentacion por fase
└── docker-compose.yml
```
