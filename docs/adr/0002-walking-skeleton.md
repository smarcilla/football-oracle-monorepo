# ADR-0002: Walking Skeleton como primera iteracion

**Fecha:** 2026-01-22  
**Estado:** Aceptado  
**Decisores:** Equipo Football Oracle

## Contexto

El proyecto Football Oracle es una arquitectura de microservicios event-driven con 5 servicios que se comunican via RabbitMQ. Antes de implementar logica de negocio compleja, necesitamos validar:

1. La comunicacion entre servicios funciona
2. Docker Compose orquesta todo correctamente
3. El flujo completo de eventos se ejecuta end-to-end
4. La estructura del monorepo es viable

## Decision

Implementar un **Walking Skeleton** (esqueleto funcional) como primera iteracion:

### Alcance del Walking Skeleton

| Componente | Implementacion minima |
|------------|----------------------|
| **Frontend** | Boton "Analizar Partido" que hace POST a API |
| **API** | Endpoint que publica `match.analysis_requested` |
| **Scraper** | Consume evento, logea, publica `match.data_extracted` con datos mock |
| **Simulator** | Consume evento, logea, publica `match.simulation_completed` con datos mock |
| **Journalist** | Consume evento, logea, publica `match.report_ready` con texto mock |
| **API** | Consume `match.report_ready`, logea "Flujo completado" |

### Criterio de exito

- [ ] `docker-compose up` levanta toda la infraestructura
- [ ] Click en boton del frontend genera logs en todos los servicios
- [ ] El flujo completo tarda < 5 segundos (sin logica real)

## Alternativas Consideradas

### Opcion A: Implementar servicio por servicio completo
- **Pros:** Cada servicio queda terminado
- **Contras:** Alto riesgo de integracion al final, feedback tardio

### Opcion B: Solo infraestructura (Docker + RabbitMQ)
- **Pros:** Rapido de montar
- **Contras:** No valida la comunicacion real entre servicios

## Consecuencias

### Positivas
- Detectamos problemas de integracion temprano
- Base solida para iterar con logica real
- Todo el equipo puede probar el flujo completo
- Reduce riesgo arquitectonico

### Negativas
- No entrega valor de negocio inmediato
- Puede parecer "poco progreso" al principio

### Riesgos
- Quedarse demasiado tiempo en el skeleton sin avanzar (mitigar con timebox de 1-2 dias)

## Referencias

- https://wiki.c2.com/?WalkingSkeleton
- Alistair Cockburn - "Walking Skeleton"
