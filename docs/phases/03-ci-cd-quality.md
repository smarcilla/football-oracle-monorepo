# Fase 3: CI/CD, Calidad y Testing

**Estado:** En Progreso  
**Fecha:** 2026-01-26  
**Branch:** `phase-3-ci-cd-quality`  
**ADRs relacionados:**

- [ADR-0004](../adr/0004-testing-calidad-codigo.md)
- [ADR-0005](../adr/0005-ci-cd-git-hooks.md)
- [ADR-0008](../adr/0008-uso-sonarqube-sonarcloud.md)

## Objetivo

Establecer las bases de calidad del código, automatización de pruebas y pipelines de integración continua para asegurar la estabilidad del monorepo a medida que crece, integrando SonarCloud para la gestión de la deuda técnica.

## Requisitos de Calidad

| Herramienta    | Aplicación                                             | Estado      |
| -------------- | ------------------------------------------------------ | ----------- |
| **ESLint**     | Linting para TypeScript (API, Web, Engine, Journalist) | Configurado |
| **Prettier**   | Formateo de código universal                           | Configurado |
| **Ruff**       | Linting y formateo para Python (Scraper)               | Configurado |
| **SonarCloud** | Análisis de deuda técnica y calidad (Cloud + Local)    | Configurado |
| **Husky**      | Git Hooks (pre-commit, pre-push)                       | Configurado |
| **Commitlint** | Validación de mensajes de commit                       | Pendiente   |

## Estrategia de Testing

| Nivel            | Herramienta             | Alcance                           | Estado    |
| ---------------- | ----------------------- | --------------------------------- | --------- |
| **Unit Testing** | Vitest                  | Lógica de negocio y utilidades    | Pendiente |
| **Integration**  | Supertest / Kafka Mocks | Flujos entre servicios            | Pendiente |
| **Python Tests** | Pytest                  | Scraping y procesamiento de datos | Pendiente |

## CI/CD Pipeline (GitHub Actions)

Se implementará un workflow principal `.github/workflows/ci.yml` que incluya:

1. **Lint Check**: Ejecución de linters en todos los paquetes.
2. **Type Check**: Verificación de tipos TypeScript.
3. **Unit Tests**: Ejecución de la suite de pruebas unitarias.
4. **Build Check**: Verificación de que todos los servicios compilan/construyen correctamente.
5. **SonarCloud Scan**: Análisis estático y reporte de deuda técnica.

## Entregables Técnicos

- [x] Configuración de ESLint/Prettier en la raíz y paquetes.
- [x] Configuración de Ruff para el servicio Python.
- [x] Integración de SonarCloud (archivo `sonar-project.properties` y GitHub Action).
- [x] Configuración de SonarLint para VSCode (local).
- [x] Implementación de Git Hooks con Husky.
- [ ] Pipeline de GitHub Actions funcional.
- [ ] Estructura de carpetas para tests en cada servicio.

## Cómo validar esta fase

### 1. Ejecución Local de Linters

```bash
pnpm run lint
```

### 2. Ejecución Local de Tests

```bash
pnpm run test
```

### 3. Git Hooks

Intentar realizar un commit que no cumpla con las reglas de linting o formato para verificar que Husky lo bloquea.
