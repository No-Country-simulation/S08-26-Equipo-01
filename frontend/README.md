# QualityTrack Frontend

Frontend de **QualityTrack**, una plataforma para gestionar y visualizar el ciclo completo de trabajos industriales desde dos perspectivas conectadas:

- **Portal cliente**, donde una empresa registra solicitudes, administra miembros, consulta cotizaciones y sigue el avance de sus trabajos.
- **Operación interna**, donde el equipo gestiona expedientes, cotizaciones, órdenes de trabajo, producción, calidad, materiales, entregas y trazabilidad.

La interfaz está construida como una SPA modular y responsive, con rutas protegidas según el tipo de cuenta y una experiencia visual consistente entre los distintos módulos del proceso.

## Flujo principal

```text
Cliente
  │
  ▼
Solicitud
  │
  ▼
Expediente
  │
  ▼
Cotización
  │
  ▼
Orden de trabajo
  │
  ▼
Producción
  │
  ▼
Calidad
  │
  ▼
Entrega
  │
  ▼
Trazabilidad
```

El objetivo del frontend es que cada etapa se sienta parte del mismo proceso, evitando pantallas aisladas y manteniendo navegación contextual entre las vistas relacionadas.

---

## Tecnologías

| Tecnología | Uso |
| --- | --- |
| React 19 | Construcción de interfaces |
| TypeScript 6 | Tipado estático |
| Vite 8 | Desarrollo y build |
| React Router 7 | Navegación y rutas protegidas |
| TanStack Query 5 | Estado remoto, caché y mutaciones |
| Axios | Cliente HTTP |
| Zustand | Estado de sesión |
| React Hook Form | Formularios |
| Zod | Validación de formularios y datos |
| Tailwind CSS 4 | Estilos |
| DaisyUI 5 | Utilidades/componentes visuales |
| React PDF | Visualización de documentos PDF |
| ESLint | Análisis estático |
| Prettier | Formato |
| Vercel | Despliegue |

---

## Experiencias principales

### Portal cliente

El portal cliente permite:

- registro e inicio de sesión;
- verificación de correo;
- recuperación de contraseña;
- aceptación de invitaciones;
- creación y selección de empresa;
- gestión del perfil;
- gestión de miembros;
- gestión de direcciones;
- creación de solicitudes;
- carga y consulta de documentos;
- seguimiento de solicitudes;
- consulta y aprobación de cotizaciones;
- solicitud de ajustes;
- seguimiento del avance del trabajo.

### Operación interna

El lado interno incluye:

- dashboard operativo;
- expedientes;
- cotizaciones;
- órdenes de trabajo;
- producción;
- calidad;
- entregas;
- máquinas;
- materiales;
- centro documental;
- clientes;
- usuarios internos;
- búsqueda global;
- perfil y administración de cuenta.

---

## Estructura del proyecto

```text
frontend/
├── public/
├── scripts/
├── src/
│   ├── app/
│   │   ├── layout/
│   │   ├── providers/
│   │   └── router/
│   ├── modules/
│   │   ├── auth/
│   │   ├── customer-portal/
│   │   ├── document-center/
│   │   ├── global-search/
│   │   ├── home/
│   │   ├── internal-customers/
│   │   ├── internal-users/
│   │   ├── job-cases/
│   │   ├── landing/
│   │   ├── operational-resources/
│   │   ├── quotations/
│   │   ├── user-profile/
│   │   └── work-orders/
│   └── shared/
│       ├── api/
│       ├── components/
│       ├── config/
│       └── lib/
├── .env.example
├── package.json
├── vite.config.ts
└── vercel.json
```

La organización por módulos busca mantener juntas las páginas, componentes, hooks, modelos, esquemas, APIs y tipos relacionados con cada capacidad del producto.

---

## Enrutamiento

QualityTrack utiliza `createBrowserRouter` y separa las rutas por contexto de autenticación.

### Rutas públicas

Ejemplos:

```text
/
 /login
 /register
 /verify-email
 /forgot-password
 /reset-password
 /customer-invitations/accept
 /internal-invitations/accept
```

### Rutas internas

Ejemplos:

```text
/dashboard
/job-cases
/quotations
/work-orders
/production
/quality
/deliveries
/machines
/materials
/documents
/customers
/internal-users
/profile
```

### Portal cliente

Ejemplos:

```text
/portal
/portal/:customerId
/portal/:customerId/requests
/portal/:customerId/requests/new
/portal/:customerId/quotations
/portal/:customerId/members
/portal/:customerId/company
```

Las rutas están protegidas mediante componentes específicos para:

```text
ProtectedRoute
PublicOnlyRoute
InternalOnlyRoute
CustomerOnlyRoute
```

De esta manera, una cuenta cliente no entra en las vistas internas y una cuenta interna no utiliza el portal cliente como área principal.

---

## Carga diferida

Las principales vistas protegidas se cargan mediante imports dinámicos.

Ejemplo conceptual:

```tsx
lazy: lazyComponent(
  () => import('@/modules/job-cases'),
  'JobCasesPage',
)
```

Esto evita cargar todos los módulos de la aplicación en el bundle inicial y mantiene separadas las áreas funcionales.

---

## Requisitos

Para ejecutar el frontend localmente:

- Node.js
- npm

Comprueba tu instalación:

```bash
node -v
npm -v
```

---

## Instalación

Desde la carpeta del frontend:

```bash
cd frontend
```

Instala las dependencias respetando exactamente `package-lock.json`:

```bash
npm ci
```

Se recomienda `npm ci` en lugar de `npm install` cuando se busca reproducir el entorno definido por el repositorio.

---

## Variables de entorno

El proyecto incluye:

```text
frontend/.env.example
```

Crea un archivo `.env` o `.env.local`:

```bash
cp .env.example .env.local
```

En PowerShell:

```powershell
Copy-Item .env.example .env.local
```

La variable principal es:

```env
VITE_API_URL=/api/v1
```

### Backend ejecutado directamente

Si Spring Boot está disponible en el puerto `8080`:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

### Backend mediante Docker Compose

Si utilizas el `compose.yaml` del backend, el servicio se expone al host en el puerto `8085`:

```env
VITE_API_URL=http://localhost:8085/api/v1
```

> Las variables expuestas al cliente deben utilizar el prefijo `VITE_`.

---

## Ejecutar en desarrollo

```bash
npm run dev
```

Vite utiliza normalmente:

```text
http://localhost:5173
```

Si aparece:

```text
"vite" no se reconoce como un comando...
```

normalmente significa que las dependencias locales todavía no están instaladas.

Ejecuta:

```bash
npm ci
npm run dev
```

No es necesario instalar Vite globalmente.

---

## Scripts

El proyecto dispone de los siguientes comandos:

### Desarrollo

```bash
npm run dev
```

Inicia Vite en modo desarrollo.

### TypeScript

```bash
npm run typecheck
```

Ejecuta:

```text
tsc -b
```

### Lint

```bash
npm run lint
```

Analiza el código con ESLint.

### Formato

Aplicar formato:

```bash
npm run format
```

Comprobar formato sin modificar archivos:

```bash
npm run format:check
```

### Arquitectura

```bash
npm run architecture:check
```

Ejecuta las comprobaciones internas definidas en:

```text
scripts/check-file-size.mjs
```

### Validación completa

```bash
npm run check
```

Ejecuta:

```text
architecture:check
typecheck
lint
format:check
```

### Build

```bash
npm run build
```

Ejecuta el typecheck y genera el build de producción con Vite.

### Preview

```bash
npm run preview
```

Permite revisar localmente el build generado.

---

## Flujo recomendado antes de subir cambios

Antes de hacer push de cambios importantes:

```bash
npm run check
npm run build
```

Esto valida:

```text
Arquitectura
    ↓
TypeScript
    ↓
ESLint
    ↓
Prettier
    ↓
Build de producción
```

---

## Comunicación con la API

El frontend utiliza una instancia centralizada de Axios.

La URL base proviene de:

```text
VITE_API_URL
```

y, si no está configurada, utiliza:

```text
/api/v1
```

El cliente HTTP tiene además:

- timeout;
- transformación común de errores;
- mensajes de respaldo según el status HTTP;
- integración con la sesión autenticada.

Los errores del backend se normalizan antes de llegar a las vistas para evitar que cada pantalla implemente su propio manejo de errores.

---

## Estado remoto

TanStack Query se utiliza para administrar datos provenientes del backend.

Esto permite centralizar:

- queries;
- mutaciones;
- caché;
- invalidación;
- estados de carga;
- estados de error;
- sincronización después de operaciones.

El estado global de autenticación se mantiene separado mediante Zustand.

---

## Autenticación

El frontend soporta:

- login;
- registro;
- verificación de correo;
- reenvío de verificación;
- recuperación de contraseña;
- reset de contraseña;
- invitaciones de clientes;
- invitaciones internas;
- navegación según tipo de cuenta;
- acceso demo.

Después de autenticarse, el destino depende del tipo de cuenta:

```text
CUSTOMER → /portal
INTERNAL → /dashboard
```

Las rutas públicas de autenticación no se utilizan como destino de retorno después de un login exitoso.

---

## Acceso demo

La pantalla de login ofrece dos entradas de demostración:

```text
Demo cliente
Demo equipo interno
```

El frontend **no contiene la contraseña demo**.

En lugar de enviar credenciales sensibles, realiza:

```http
POST /api/v1/auth/demo-login
```

con uno de estos valores:

```json
{
  "accountType": "CUSTOMER"
}
```

o:

```json
{
  "accountType": "INTERNAL"
}
```

El backend resuelve las credenciales de demostración y devuelve una sesión normal.

Esto permite mantener la contraseña demo fuera del bundle público.

---

## Formularios

Los formularios utilizan principalmente:

```text
React Hook Form
    +
Zod
```

Esta combinación permite:

- validación declarativa;
- mensajes de error claros;
- tipado;
- reutilización de esquemas;
- menor cantidad de estado manual.

---

## Diseño responsive

La interfaz fue diseñada para funcionar tanto en escritorio como en dispositivos móviles.

Entre los criterios aplicados se encuentran:

- layouts apilables;
- reducción de scroll horizontal;
- tablas adaptadas para conservar acciones importantes;
- nombres de archivos largos contenidos dentro de sus tarjetas;
- sidebar móvil con viewport dinámico;
- bloqueo del scroll de fondo al abrir navegación móvil;
- botones y headers reorganizados en pantallas pequeñas;
- tarjetas y paneles con `min-width` seguro;
- continuidad visual entre portal cliente y operación interna.

El objetivo no es simplemente reducir el contenido de escritorio, sino reorganizarlo para mantener usable el flujo completo en pantallas pequeñas.

---

## Navegación interna

El área interna utiliza una estructura compartida con:

```text
AppShell
├── Sidebar
├── Topbar
└── Outlet de la ruta activa
```

La navegación se adapta a las capacidades internas disponibles y mantiene acceso a las principales áreas de operación.

En móvil, el sidebar funciona como drawer independiente del scroll de la página.

---

## Portal cliente

El portal cliente mantiene su propio shell y navegación.

El flujo de creación de solicitudes guía al usuario por distintas etapas y conserva una experiencia visual consistente con:

- detalles de solicitud;
- documentos;
- seguimiento;
- cotizaciones;
- empresa;
- miembros.

La intención es que el cliente pueda entender el estado de su trabajo sin necesitar conocer la terminología operativa interna.

---

## Expediente

El expediente funciona como vista histórica y de seguimiento del caso.

No busca duplicar todas las acciones de una orden de trabajo.

Concentra:

- origen de la solicitud;
- información necesaria para cotización;
- documentos;
- material;
- aclaraciones;
- responsable;
- estado;
- acciones disponibles;
- actividad y trazabilidad.

---

## Cotizaciones

Las vistas de cotización conectan visualmente la solicitud con el proceso comercial.

El frontend contempla:

- listado;
- detalle;
- conceptos;
- revisiones;
- solicitudes de ajuste;
- vista previa;
- impresión;
- acciones del cliente;
- transición a orden de trabajo.

---

## Órdenes de trabajo y producción

Las órdenes de trabajo concentran la preparación operativa.

Entre sus capacidades visuales se encuentran:

- documentos fijados;
- materiales;
- hoja de ruta;
- operaciones;
- dependencias;
- ejecución de producción;
- transición hacia calidad.

---

## Calidad

La experiencia de calidad soporta inspecciones flexibles.

La UI no depende únicamente de mediciones numéricas y puede representar distintos tipos de checks según lo definido por el backend.

---

## Entregas

El flujo de entrega permite representar:

- preparación;
- dirección y receptor;
- transportista;
- despacho;
- evidencia;
- entrega completada.

La confirmación operativa pertenece al equipo que realiza la entrega, evitando depender de una acción posterior del destinatario para cerrar el proceso.

---

## Documentos y PDF

El frontend utiliza `react-pdf` para las experiencias que requieren previsualización de documentos PDF.

Los documentos se integran en las vistas relacionadas con su contexto, por ejemplo:

- solicitudes;
- expedientes;
- cotizaciones;
- órdenes;
- materiales.

---

## Alias de imports

Vite define:

```text
@ → ./src
```

Por ello los imports pueden escribirse como:

```tsx
import { apiClient } from '@/shared/api/apiClient'
```

en lugar de cadenas relativas largas.

---

## Build de producción

Genera el build con:

```bash
npm run build
```

El resultado se crea en:

```text
dist/
```

Puede revisarse localmente con:

```bash
npm run preview
```

---

## Despliegue en Vercel

El frontend público de QualityTrack está desplegado en:

```text
https://qualitytrack-frontend.vercel.app/
```

El repositorio incluye un `vercel.json` que redirige las rutas de la SPA hacia `index.html`, permitiendo que React Router resuelva rutas como:

```text
/job-cases/123
/quotations/45
/portal/8/requests
```

incluso al entrar directamente o refrescar la página.

Para un ambiente productivo se debe configurar correctamente:

```env
VITE_API_URL=https://<backend>/api/v1
```

según la estrategia de despliegue utilizada.

---

## Calidad de código

Actualmente el frontend utiliza como puertas de calidad:

```text
architecture:check
typecheck
lint
format:check
build
```

El `package.json` actual no define un script de pruebas unitarias automatizadas, por lo que `npm run check` no debe interpretarse como ejecución de una suite de tests.

---

## Arquitectura de UI

A nivel general, el frontend sigue estas ideas:

- módulos organizados por capacidad de negocio;
- componentes compartidos solo cuando existe reutilización real;
- acceso a API encapsulado;
- estado remoto separado del estado de sesión;
- rutas protegidas por contexto;
- formularios tipados;
- carga diferida de módulos grandes;
- mensajes de error consistentes;
- diseño responsive como parte del flujo, no como parche posterior.

---

## Proyecto

**QualityTrack** fue desarrollado como una plataforma de simulación industrial orientada a la trazabilidad y coordinación entre cliente, equipo comercial, ingeniería, producción, calidad y logística.

Repositorio:

```text
EdgarCamberos1894/QualityTrack
```

Frontend:

```text
https://qualitytrack-frontend.vercel.app/
```

Backend:

```text
https://qualitytrack.onrender.com
```
