# Estrategia de migraciones de base de datos — services/data-registry

Este documento resume la estrategia recomendada para generar, versionar y aplicar migraciones de Prisma en `services/data-registry`, y cómo integrarlo en el pipeline de despliegue.

## Resumen rápido

- `schema.prisma`: definición de modelos, enums y relaciones.
- `prisma generate`: genera el Prisma Client usado por la aplicación; debe ejecutarse en la fase de build.
- `prisma migrate dev`: genera migraciones versionadas y aplica cambios en desarrollo.
- `prisma migrate deploy`: aplica migraciones versionadas en entornos no interactivos (producción / staging).
- `prisma db push`: sincroniza el schema con la BD sin crear migraciones (solo para desarrollo rápido o prototipos).

## Flujo recomendado

- **Desarrollo local**
  - Iterar modelos con: `npx prisma migrate dev --name <descripcion>`.
  - Revisar el SQL generado en `prisma/migrations/<timestamp>_name/migration.sql`.
  - Probar localmente y ejecutar tests.
  - Commitear los cambios de `schema.prisma` y la carpeta `prisma/migrations`.
  - Alternativa rápida: `npx prisma db push` para sincronizar sin migraciones (no recomendado para mantener historial).

- **CI (pre-deploy)**
  - Validar que `prisma migrate dev` no genera cambios inesperados (opcionalmente ejecutar en un job temporal).
  - Ejecutar linters y tests que dependan de la BD en un entorno ephemeral que aplique las migraciones.
  - Confirmar que `prisma/migrations` ha sido commiteado.

- **Producción / Staging**
  - NO usar `prisma db push` en prod.
  - Flujo seguro:
    1. Generar migraciones en desarrollo o en una rama feature (`prisma migrate dev`).
    2. Revisar y commitear `prisma/migrations`.
    3. En el despliegue, ejecutar `npx prisma migrate deploy` antes de arrancar la app.
  - `prisma migrate deploy` aplica los SQL ya versionados y revisados, evitando que la base se modifique de manera inesperada.

## Comandos útiles

- Generar/actualizar client: `npx prisma generate`
- Crear migración en dev: `npx prisma migrate dev --name descripcion`
- Aplicar migraciones en prod (no interactivo): `npx prisma migrate deploy`
- Forzar sincronía (dev/iteración): `npx prisma db push`

## Entrypoint sugerido (ejecución en el contenedor)

Ejemplo de `entrypoint.sh` (colócalo en `services/data-registry/entrypoint.sh`):

```sh
#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL no establecido; saltando migraciones."
else
  if [ "$NODE_ENV" = "production" ]; then
    echo "Production: aplicando migraciones versionadas..."
    npx prisma migrate deploy
  else
    echo "Development: sincronizando schema (db push)..."
    npx prisma db push
  fi
fi

exec "$@"
```

Notas:

- `prisma migrate deploy` es idempotente y no pedirá confirmaciones.
- En entornos de desarrollo/local el `db push` acelera iteraciones pero no deja historial.

## Ajuste en `Dockerfile`

- Ya existe un paso en el `Dockerfile` que ejecuta `prisma:generate` durante la build — dejarlo así para que el `prisma client` esté embebido en la imagen.
- Copiar `entrypoint.sh`, darle `chmod +x` y usarlo como `ENTRYPOINT` para aplicar migraciones en startup.

Fragmento recomendado al final del `Dockerfile`:

```dockerfile
COPY services/data-registry/entrypoint.sh /app/services/data-registry/entrypoint.sh
RUN chmod +x /app/services/data-registry/entrypoint.sh

ENTRYPOINT ["/app/services/data-registry/entrypoint.sh"]
CMD ["node", "services/data-registry/dist/index.js"]
```

## Integración con CI/CD (ejemplo GitHub Actions)

Job de preparación/validación (antes de merge):

```yaml
jobs:
  validate-migrations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: pnpm install --frozen-lockfile
      - name: Validate migrations
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
        run: |
          npx prisma migrate deploy
          # ejecutar tests que dependan de la BD
```

Job de despliegue (en el runner de producción):

```yaml
- name: Apply DB migrations on deploy host
  run: npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
```

Notas: en algunos despliegues la ejecución de migraciones la hace un job distinto al de despliegue de la app; esto facilita permisos y ventanas de mantenimiento controladas.

## Backups y rollback

- Prisma no hace rollback automático de migraciones. Para seguro:
  - Realizar backup de la BD antes de aplicar migraciones críticas.
  - Tener scripts de rollback SQL preparados (si la migración lo requiere) o restaurar desde backup.
  - Ejecutar migraciones en una ventana de mantenimiento para cambios destructivos.

## Checklist pre-despliegue

- [ ] `prisma/migrations` commiteado y revisado.
- [ ] PR con migración revisada, cambios en `schema.prisma` aprobados.
- [ ] Backup de la BD configurado (snapshots automáticos o dump).
- [ ] Pruebas E2E que cubren las rutas afectadas por el esquema.
- [ ] Plan de rollback documentado para migraciones destructivas.

## Monitoreo

- Registrar eventos de migración en logs del despliegue.
- Comprobar métricas clave después de migración (latencias, errores de queries).

## Resumen final

1. Genera migraciones con `npx prisma migrate dev` en dev.
2. Revisa y commitea `prisma/migrations`.
3. En despliegue, aplica migraciones con `npx prisma migrate deploy` desde un entrypoint o job CI.
4. Usa `db push` sólo en dev/iteración y evita en producción.

---

Documento creado para referencia en próximas sesiones. Si quieres, puedo:

- añadir `entrypoint.sh` y el fragmento de `Dockerfile` al repo (commit), o
- crear un job de GitHub Actions inicial para validar/apply migraciones.
