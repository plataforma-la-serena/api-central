# api-central

API interna de Alquileres 4 Esquinas (NestJS + Prisma + PostgreSQL). Expone
departamentos, reservas, chats, medios y métricas al front público y al bot de
WhatsApp.

## Comandos

```bash
npm install
npm run dev            # desarrollo con tsx watch
npm run build          # compila a dist/
npm start              # ejecuta dist/
npm run typecheck      # tsc --noEmit
npm test               # pruebas (Vitest)
npm run coverage       # pruebas + coverage/coverage-summary.json
npm run prisma:migrate # migraciones en desarrollo
npm run prisma:deploy  # migraciones en producción
npm run seed           # administrador y datos iniciales
```

## Variables de entorno

`DATABASE_URL`, `PORT`, `CORS_ORIGIN`, `JWT_SECRET`, `JWT_EXPIRES_IN`,
`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `INTERNAL_API_TOKEN`. Ver `.env.example`.

## Calidad

CI en `.github/workflows/ci.yml`: install → typecheck → test + coverage → build
→ auditoría de dependencias.

Deuda conocida: `prisma` 6.19.3 arrastra 4 vulnerabilidades altas
(`@prisma/config` → `deepmerge-ts`, `effect`) en el CLI de migraciones. Se
resuelven migrando a Prisma 7, que es un cambio mayor; el CI falla en
críticas mientras tanto.
