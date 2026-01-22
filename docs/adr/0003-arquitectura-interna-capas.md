# ADR-0003: Arquitectura interna simple por capas

**Fecha:** 2026-01-22  
**Estado:** Aceptado  
**Decisores:** Equipo Football Oracle

## Contexto

Debemos decidir la arquitectura interna de cada microservicio. Las opciones principales son:

1. **Hexagonal (Ports & Adapters):** Alta separacion, testeable, pero mas ceremonia
2. **DDD (Domain-Driven Design):** Modelado rico del dominio, pero requiere dominio complejo
3. **Capas simples:** Pragmatico, menos abstraccion, mas directo

### Analisis por servicio

| Servicio | Logica de dominio | Complejidad |
|----------|-------------------|-------------|
| Frontend | Ninguna (UI) | Baja |
| API Orchestrator | CRUD + eventos | Baja |
| Scraper | ETL basico | Baja |
| Simulation Engine | Algoritmo Monte Carlo | **Media-Alta** |
| Journalist | Orquestar LLM | Media |

## Decision

Adoptar **arquitectura por capas simple** en todos los servicios, con la posibilidad de refactorizar a Hexagonal si la complejidad lo justifica.

### Estructura estandar por servicio (Node.js/TypeScript)

```
service/
├── src/
│   ├── index.ts          # Entry point
│   ├── config/           # Configuracion y variables de entorno
│   ├── handlers/         # Entry points (eventos, HTTP)
│   ├── services/         # Logica de negocio
│   ├── clients/          # Integraciones externas (DB, APIs, RabbitMQ)
│   └── types/            # Tipos locales del servicio
├── tests/
├── Dockerfile
└── package.json
```

### Estructura para Scraper (Python)

```
scraper/
├── src/
│   ├── __main__.py       # Entry point
│   ├── config.py         # Configuracion
│   ├── handlers/         # Consumers de eventos
│   ├── services/         # Logica de scraping
│   └── clients/          # RabbitMQ, HTTP
├── tests/
├── Dockerfile
└── requirements.txt
```

### Reglas de dependencia

```
handlers → services → clients
    ↓          ↓          ↓
  (I/O)    (logica)   (external)
```

- `handlers` conoce `services` pero no `clients` directamente
- `services` puede usar `clients` para I/O
- `services` contiene la logica pura (testeable sin mocks cuando sea posible)

## Alternativas Consideradas

### Opcion A: Hexagonal/Clean Architecture completa
- **Pros:** Maxima separacion, muy testeable, preparado para cambios
- **Contras:** Excesiva para servicios con poca logica, mas archivos y abstracciones

### Opcion B: Hexagonal solo en Simulation Engine
- **Pros:** Aplica donde tiene sentido
- **Contras:** Inconsistencia entre servicios, mas carga cognitiva

### Opcion C: Sin estructura definida
- **Pros:** Maxima flexibilidad
- **Contras:** Cada servicio diferente, dificil de mantener

## Consecuencias

### Positivas
- Estructura consistente y predecible
- Facil de entender para nuevos desarrolladores
- Suficiente separacion para testing
- Rapido de implementar

### Negativas
- Menos separacion que Hexagonal (logica puede acoplarse a I/O)
- Podria requerir refactor si crece la complejidad

### Riesgos
- Simulation Engine podria necesitar refactor a Hexagonal en el futuro
- Mitigacion: Mantener `services/` lo mas puro posible desde el inicio

## Criterio de re-evaluacion

Reconsiderar Hexagonal si:
- Un servicio supera 10 archivos en `services/`
- Se necesitan multiples implementaciones de una integracion (ej: cambiar de RabbitMQ a Kafka)
- Los tests requieren mocks excesivos

## Referencias

- https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- https://martinfowler.com/bliki/PresentationDomainDataLayering.html
