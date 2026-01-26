# ADR-0001: Usar ADRs para documentar decisiones de arquitectura

**Fecha:** 2026-01-22  
**Estado:** Aceptado  
**Decisores:** Equipo Football Oracle

## Contexto

El proyecto Football Oracle es una arquitectura de microservicios con multiples decisiones tecnicas que tomar. Necesitamos:

1. Documentar decisiones para no olvidarlas
2. Mantener consistencia entre desarrolladores (humanos e IA)
3. Poder revisar el razonamiento detras de cada decision
4. Medir y gestionar la deuda tecnica

## Decision

Adoptamos **Architecture Decision Records (ADRs)** como formato estandar para documentar decisiones.

Estructura:

```
docs/adr/
├── 0000-adr-template.md      # Plantilla
├── 0001-usar-adrs.md         # Este documento
├── 0002-*.md                 # Siguientes decisiones
└── ...
```

Convenciones:

- Numeracion secuencial de 4 digitos: `NNNN-nombre-descriptivo.md`
- Estados posibles: `Propuesto`, `Aceptado`, `Deprecado`, `Sustituido`
- Inmutabilidad: No editar ADRs aceptados, crear uno nuevo que lo sustituya

## Alternativas Consideradas

### Opcion A: DECISIONS.md unico

- **Pros:** Simple, todo en un sitio
- **Contras:** Dificil de mantener cuando crece, no hay historial por decision

### Opcion B: CONTRIBUTING.md + DECISIONS.md

- **Pros:** Separa workflows de decisiones tecnicas
- **Contras:** No es un formato estandar, menos estructura

## Consecuencias

### Positivas

- Formato reconocido en la industria
- Cada decision tiene su propio historial git
- Facil de referenciar desde codigo o PRs
- La IA puede leer y seguir decisiones previas

### Negativas

- Mas ficheros que mantener
- Requiere disciplina para crear ADRs

### Riesgos

- Que no se creen ADRs para decisiones importantes (mitigar con checklist en PRs)

## Referencias

- https://adr.github.io/
- https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions
