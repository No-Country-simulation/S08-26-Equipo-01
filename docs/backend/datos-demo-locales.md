# Datos demo locales de QualityTrack

Este flujo permite reconstruir una base PostgreSQL local desde cero y cargar escenarios
determinísticos que recorren las reglas reales de negocio.

## Diseño

El proceso está separado en tres responsabilidades:

1. `scripts/dev/reset-and-seed.ps1` elimina únicamente el schema `public` de una
   base local validada.
2. Flyway reconstruye el schema al iniciar Spring Boot.
3. El perfil `seed-demo` ejecuta `DemoDataSeeder` después del bootstrap del
   administrador y crea los escenarios usando servicios y workflows del dominio.

No se usa un `seed.sql` para forzar estados. Cotizaciones, órdenes, routing,
producción, calidad y entregas avanzan mediante los mismos servicios utilizados por
la aplicación.

## Requisitos

- PostgreSQL local.
- `psql` disponible en `PATH`.
- Java 17.
- `backend/.env` con al menos:
  - `DB_HOST`
  - `DB_PORT`
  - `DB_NAME`
  - `DB_USER`
  - `DB_PASSWORD`

El script acepta únicamente `localhost`, `127.0.0.1` o `::1` como host de
reset. También bloquea nombres de base que parezcan de producción.

## Ejecutar

Desde la raíz del repositorio:

```powershell
.\scripts\dev\reset-and-seed.ps1 -ConfirmReset
```

La confirmación explícita es obligatoria porque el comando elimina todos los objetos
del schema `public`.

Si quieres una contraseña fija para las cuentas demo:

```powershell
.\scripts\dev\reset-and-seed.ps1 -ConfirmReset -DemoPassword 'MiPasswordDemo123!'
```

Si no indicas contraseña, el script genera una aleatoria y la muestra antes de
iniciar Spring Boot.

## Orden de ejecución

```text
validaciones de seguridad
        ↓
DROP SCHEMA public + CREATE SCHEMA public
        ↓
Spring Boot
        ↓
Flyway migrate
        ↓
bootstrap admin@qualitytrack.com
        ↓
DemoDataSeeder
```

El backend queda ejecutándose al final del script.

## Cuentas demo

Todas las cuentas demo usan la contraseña indicada/generada durante el reset.

| Perfil | Correo |
| --- | --- |
| Administrador | `admin@qualitytrack.com` |
| Comercial | `ana.comercial@qualitytrack.test` |
| Ingeniería | `diego.ingenieria@qualitytrack.test` |
| Producción | `carlos.produccion@qualitytrack.test` |
| Calidad | `sofia.calidad@qualitytrack.test` |
| Logística | `luis.logistica@qualitytrack.test` |
| Auditor | `auditor.demo@qualitytrack.test` |
| Cliente principal | `maria.lopez@maquinados.test` |
| Solicitante cliente | `compras@maquinados.test` |

También se crean usuarios cliente para Motores del Norte, Grupo Atlas Industrial e
Hidráulica MX.

## Escenarios incluidos

El seed deja datos distribuidos intencionalmente para que los listados y detalles
puedan probarse sin manipular la BD manualmente:

- expediente recién recibido;
- expediente en revisión;
- expediente esperando información del cliente;
- expediente listo para cotizar;
- cotización en borrador;
- cotización enviada;
- cotización aprobada y pendiente de crear OT;
- orden de trabajo en preparación;
- orden lista para producción;
- orden con producción iniciada;
- orden pendiente de calidad;
- orden pausada por una no conformidad;
- orden lista para entrega;
- entrega preparada;
- entrega despachada;
- entrega completada.

Los escenarios operativos crean además:

- documento de fabricación real en almacenamiento local demo;
- documento fijado en la orden;
- hoja de ruta;
- operaciones;
- ejecuciones de producción;
- inspecciones y controles de calidad;
- no conformidad cuando corresponde;
- eventos de trazabilidad;
- entregas y cierre del expediente cuando se completa la cantidad.

## Idempotencia y fallos

El seeder crea un usuario marcador al finalizar correctamente. Si vuelve a iniciarse
sobre una base ya sembrada, no duplica los datos.

Si el proceso falla a mitad del seed, el marcador no se crea. El siguiente intento
rechazará continuar porque la base ya contiene datos. En ese caso se debe ejecutar
nuevamente el reset completo.

Este comportamiento es intencional: evita intentar reparar silenciosamente un seed
parcial y producir un estado difícil de reproducir.

## Almacenamiento documental

El script fuerza el proveedor `local` y usa exclusivamente:

```text
backend/storage/demo-seed-documents
```

Solo esa carpeta se limpia automáticamente. No se elimina el directorio documental
configurado normalmente por el desarrollador.

## Seguridad

El perfil `seed-demo` no debe activarse en ambientes compartidos ni productivos.

El script bloquea:

- hosts PostgreSQL no locales;
- bases `postgres`, `template0` y `template1`;
- nombres que contengan `prod`, `production` o `live`;
- nombres fuera del patrón `qualitytrack*`;
- perfiles Spring de producción;
- resets cuando existen otras conexiones abiertas a la misma base.

Estas restricciones deben mantenerse aunque el flujo demo cambie en el futuro.
