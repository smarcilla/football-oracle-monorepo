# ADR-0008: Uso de SonarCloud para gestión de calidad y deuda técnica

**Fecha:** 2026-01-26  
**Estado:** Aceptado  
**Decisores:** Equipo Football Oracle

## Contexto

A medida que el monorepo crece y se utiliza asistencia de IA para la generación de código, aumenta la probabilidad de introducir errores sutiles, vulnerabilidades de seguridad o deuda técnica involuntaria. Necesitamos una herramienta que proporcione una visión holística de la salud del código a través de todo el monorepo (TypeScript y Python).

Los objetivos principales son:

1.  **Practicar con herramientas de industria:** Integrar herramientas de análisis estático avanzadas.
2.  **Gestionar la deuda técnica:** Identificar áreas del código que necesitan refactorización.
3.  **Supervisión de IA:** Validar que el código generado por IA no cumple solo con los requisitos funcionales, sino también con estándares de calidad y seguridad.

## Decision

Utilizaremos **SonarCloud** como plataforma de análisis de calidad de código e inspección continua.

1.  **Integración con GitHub Actions:** Se ejecutará un escaneo automático en cada Pull Request y en la rama principal.
2.  **Análisis Local (VSCode):** Se recomienda el uso de la extensión **SonarLint** vinculada al proyecto de SonarCloud para obtener feedback inmediato en el editor.
3.  **Configuración del Monorepo:** Se configurará para soportar múltiples lenguajes (TypeScript, Python) y reportar cobertura de tests combinada.

## Alternativas Consideradas

### Opción A: CodeClimate

- **Pros:** Fácil configuración.
- **Contras:** Menos potente en el análisis profundo comparado con Sonar.

### Opción B: Mantener solo linters locales (ESLint/Ruff)

- **Pros:** Menos complejidad.
- **Contras:** Falta de trazabilidad de deuda técnica a largo plazo y visión agregada del proyecto.

## Consecuencias

### Positivas

- Visibilidad inmediata de la calidad del código y la seguridad.
- Seguimiento histórico de la deuda técnica.
- Identificación proactiva de "code smells".

### Negativas

- Mayor tiempo de ejecución en el pipeline de CI.
- Necesidad de mantener un archivo de configuración extra (`sonar-project.properties`).

### Riesgos

- Configuración incorrecta del monorepo que resulte en análisis incompletos de algún servicio.

## Referencias

- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [SonarLint for VSCode](https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarlint-vscode)
