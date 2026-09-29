# QualityTrack Frontend Architecture

## Goals

QualityTrack uses a domain-first modular frontend. The architecture is designed to keep features understandable as the product grows and to prevent large pages, duplicated API logic, and tightly coupled components.

## Stack

- React 19 + TypeScript
- Vite
- React Router
- TanStack Query for server state
- Axios for HTTP transport
- React Hook Form + Zod for forms
- Zustand only for global client state
- Tailwind CSS for styling

UI primitives live behind our own components so the visual implementation can evolve without leaking library-specific details throughout business modules.

## Dependency direction

```text
app
 ↓
modules
 ↓
shared
```

- `shared` cannot import `modules` or `app`.
- `modules` cannot import `app`.
- Modules may consume another module only through that module's public `index.ts`.
- `app` composes modules and application infrastructure.

## Source structure

```text
src/
├── app/
│   ├── providers/
│   ├── query/
│   └── router/
├── modules/
│   └── <domain>/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── model/
│       ├── pages/
│       ├── schemas/
│       ├── types/
│       └── index.ts
└── shared/
    ├── api/
    ├── components/
    │   ├── feedback/
    │   ├── layout/
    │   └── ui/
    ├── config/
    └── lib/
```

Folders are created when needed. Do not create empty architecture theatre.

## Module responsibilities

### api

HTTP functions, backend DTOs, endpoint-specific query keys, and transport adapters owned by the module.

### model

Presenters, mappers, domain-to-view transformations, status configuration, and pure business-facing helpers used by the UI.

A backend enum such as `QUALITY_INSPECTION_APPROVED` should not be translated independently in several components. One presenter/configuration maps it to the label, category, icon, and visual intent.

### hooks

Coordinate React Query, mutations, and UI-facing feature behavior. Hooks should expose a useful feature API instead of leaking Axios details.

### components

Reusable UI for one domain. Components receive data and callbacks and should not become alternate service layers.

### pages

Route-level composition. A page assembles hooks and components and handles route parameters. It should remain readable at a glance.

## State ownership

### Server state

Use TanStack Query for data whose source of truth is the backend: requests, job cases, quotations, work orders, routing, production, quality, deliveries, documents and traceability.

### Client state

Use local React state first. Use Zustand only when client-owned state genuinely spans distant parts of the application, such as authenticated session metadata or persistent UI preferences. Do not use Zustand as a second API cache.

## API contracts

`shared/api` contains transport infrastructure and generic response types only. Domain DTOs belong to the module that owns the endpoint.

When a backend DTO is not a good presentation model, map it explicitly in `model/`.

When OpenAPI client/type generation is introduced, generated contracts must live in a clearly isolated generated location and must not absorb presentation logic. Prefer generated contracts over manually duplicating large backend DTO graphs.

## Component rules

- Prefer composition over configuration-heavy mega-components.
- Keep shared primitives business-agnostic.
- Put domain semantics in domain components.
- Extract repeated status, badge and display rules into a single configuration.
- Pages should compose sections rather than contain hundreds of lines of section markup.
- Modal, table, timeline, form, and detail sections become separate components when they have independent behavior.

## File-size guardrails

| File type            |         Healthy range |
| -------------------- | --------------------: |
| Small UI component   |            50-150 LOC |
| Complex UI component |              <250 LOC |
| Page                 |              <250 LOC |
| Hook                 |              <150 LOC |
| API/service file     |              <200 LOC |
| 300+ LOC             | review for extraction |
| 500+ LOC             |            CI failure |

Generated code is excluded from these limits.

The repository enforces the hard limit with `npm run architecture:check`.

## Forms

- React Hook Form owns form state.
- Zod owns validation schemas.
- API DTO creation happens in a mapper when the form model differs from the backend contract.
- Server validation errors are translated at the form boundary.

## Error handling

Axios errors are normalized to `ApiError` in the shared client. UI code consumes a stable error shape rather than branching on Axios internals.

## Quality gates

A feature is not complete only because the happy path renders. Consider loading, empty data, HTTP errors, permission denial, unavailable actions, validation, keyboard/focus behavior, and responsive behavior.

## Architecture decision rule

Choose the smallest abstraction that prevents real duplication or coupling. Do not build speculative frameworks, but do not let temporary implementation shortcuts become the project structure.
