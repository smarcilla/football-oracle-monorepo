### Migrating Database

Crea una nueva migración en para sincronizar el estado del modelo con la BD

```bash
export $(cat .env | xargs) && pnpm exec prisma migrate dev --name add_league_sync
```

### Seed Database

Llena la base de datos con datos iniciales

```bash
pnpm --filter @football-oracle/data-registry run prisma:seed
```
