# Plan de Pruebas de Validación Local - Pipeline CI

Este plan permite verificar que las restricciones de calidad y versiones implementadas funcionan correctamente antes de subir los cambios al repositorio.

## 1. Verificación de Restricción de Versiones (Node.js)

Debido a que hemos configurado `.npmrc` con `engine-strict=true`, pnpm debería rechazar cualquier versión que no sea >= 25.

- **Check**: Intenta instalar dependencias con una versión de Node inferior.

```bash
# Ejemplo si tienes nvm o fnm
nvm use 20
pnpm install
```

- **Resultado Esperado**: El comando debe fallar con un mensaje indicando que la versión de Node.js es incompatible.
- **Validación final**: Vuelve a Node 25 y el comando debe funcionar.

```bash
nvm use 25
pnpm install --frozen-lockfile
```

## 2. Verificación de Python 3.11

- **Check**: Comprobar versión de python instalada.

```bash
python3 --version
```

- **Resultado Esperado**: Debe ser `Python 3.11.x` o superior.

**Nota**: Si tu `.venv` actual es de una versión anterior, recréalo:

```bash
cd services/scraper
rm -rf .venv
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 3. Ejecución del Ciclo de Calidad Completo (JS/TS)

Ejecuta los mismos comandos que ejecutará el pipeline:

- **Linting**: `pnpm run lint:js`
- **Type Checking**: `pnpm run typecheck`
- **Tests con Cobertura**: `pnpm run test:coverage` (Verifica que se generen archivos `lcov.info` en las carpetas `coverage/`).

## 4. Validación de Calidad Python (Scraper)

- **Check**: Ejecutar Ruff y Pytest manualmente.

```bash
# Linting
pnpm run lint:python
# Tests con cobertura XML (para SonarCloud)
pnpm run test:python:coverage
```

- **Resultado Esperado**: No debe haber errores de lint y debe generarse el archivo `services/scraper/coverage.xml`.

## 5. Consistencia de Docker (Build Check)

Para asegurar que las versiones de contenedores coinciden con la CI:

- **Check**: Construir las imágenes locales.

```bash
pnpm run dev:build
```

- **Resultado Esperado**: Todos los contenedores terminan de construirse usando Node 25 y Python 3.11 sin errores de dependencias.

## 6. Verificación de Husky (Pre-commit Hook)

- **Check**: Introduce un error de linting intencionado (ej. una variable no usada en un archivo `.ts` y guarda sin formatear).

```typescript
const testVar = 'error'; // Variable no usada
```

- **Prueba**: Intenta hacer un commit.

```bash
git add .
git commit -m "test: checking husky"
```

- **Resultado Esperado**: Husky debe interceptar el commit, ejecutar lint-staged, fallar debido a la regla `@typescript-eslint/no-unused-vars` y abortar el commit.

## 7. Simulación de Pipeline (Opcional - Herramienta `act`)

Si tienes instalada la herramienta `act`, puedes simular el pipeline de GitHub localmente:

```bash
act -j quality
```
