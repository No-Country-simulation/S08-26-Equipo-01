# QualityTrack — Frontend

Frontend de **QualityTrack**, sistema para la gestión y trazabilidad de órdenes de trabajo. Construido con Vite + React + TypeScript.

## Stack

| Capa                           | Tecnología                   |
| ------------------------------ | ---------------------------- |
| Framework                      | Vite + React 19 + TypeScript |
| Estilos                        | Tailwind CSS                 |
| Componentes UI                 | DaisyUI                      |
| Routing                        | React Router DOM             |
| Estado servidor (GETs)         | TanStack Query               |
| Mutaciones (POST/PATCH/DELETE) | Axios                        |
| Estado sesión / UI             | Zustand                      |
| Formularios                    | React Hook Form + Zod        |
| PDF                            | React-PDF                    |
| Lint / Formato                 | ESLint + Prettier            |

## Scripts

```bash
npm run dev      # dev server
npm run build    # typecheck (tsc -b) + build
npm run lint     # ESLint
npm run format   # Prettier (write)
npm run preview  # sirve el build
```

## Estructura

```
src/
├── features/
│   ├── Auth/            # UI de la feature (SIN lógica de datos)
│   │   ├── components/  # atoms/ molecules/ organisms/ templates/
│   │   ├── types/
│   │   ├── constants/
│   │   └── helpers/
│   └── SystemDesign/    # feature de ejemplo funcional
├── hooks/               # hooks: conectan Pages con Services
├── pages/               # páginas: punto de conexión UI <-> datos
├── routes/              # configuración del router
├── services/            # acceso a datos (apiClient, queryClient, services)
├── store/               # stores de Zustand
└── shared/              # código reutilizable
    ├── components/
    ├── types/
    ├── constants/
    └── utils/
```

## Reglas de arquitectura

> Estas reglas son obligatorias. Los PRs deben respetarlas.

### 1. Flujo de datos (una sola dirección)

```
Pages → Hooks → Services → API / Mocks
```

Las **Pages** consumen **hooks**; los hooks trabajan con los **services**; los services hablan con la API (o mocks). Nunca se salta una capa: una Page no llama a un service directamente ni un component consume hooks o services.

### 2. UI desacoplada de los datos

Los **components** de cada feature reciben **datos y callbacks por props**. No conocen cómo se obtienen los datos ni importan servicios/hooks. Está prohibido llamar a `useQuery`, `apiClient` o un service desde `features/*/components/*`.

### 3. Ubicación del código

- **Dentro de la feature** (`features/X/`): solo UI (`components/*`), `types`, `constants` y `helpers` puros.
- **A nivel raíz**: `hooks/` (dedicados a la feature), `services/` (dato + `apiClient`/`queryClient`), `store/`, `pages/`, `routes/`.
- **`shared/`**: solo lo reutilizable entre features (spinners, alerts, tipos de error, utils). Si algo lo usa una sola feature, vive en esa feature.

### 4. Estado del servidor

- **GETs** → TanStack Query (el estado del servidor es cacheado/observado por `queryClient`).
- **POST / PATCH / DELETE** → Axios a través de la **instancia única** `apiClient` (`src/services/apiClient.ts`). No crear instancias nuevas de axios.

### 5. Jerarquía de componentes (Atomic Design)

```
templates → organisms → molecules → atoms
```

- **atoms**: unidad mínima (botón, badge, input).
- **molecules**: combinan atoms con un propósito (card de un registro).
- **organisms**: sección que recibe listas/colecciones por props y delega.
- **templates**: estructura la página y maneja estados (loading/error/empty/data).

### 6. Manejo de errores

`apiClient` normaliza los errores de red/HTTP a `ApiError` (`shared/types/apiError.ts`). Para mostrar mensajes, usa `getErrorMessage` (`shared/utils/errorMessage.ts`).

## Rutas

| Ruta      | Página                                          |
| --------- | ----------------------------------------------- |
| `/` o `*` | Redirige a `/auth`                              |
| `/auth`   | Página de autenticación (placeholder)           |
| `/design` | Ejemplo funcional (GET demo con TanStack Query) |

## Agregar una feature nueva

1. Crear la carpeta en `features/<Name>/` replicando `Auth/` (components con atoms/molecules/organisms/templates, types, constants, helpers).
2. Crear el service en `services/<name>.service.ts` (con `apiClient`).
3. Crear el hook en `hooks/use<Name>.ts` (con `useQuery` para GETs).
4. Crear la page en `pages/<Name>Page.tsx` que conecte hook + template.
5. Registrar la ruta en `routes/router.tsx`.

## Variables de entorno

Copiar `.env.example` y definir `VITE_API_URL` con la URL del backend. Si queda vacía, se usa el proxy relativo `/api`.
