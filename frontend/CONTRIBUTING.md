# Contributing to the QualityTrack Frontend

## Branches

Create frontend work from `develop`:

```text
feature/frontend-<scope>
fix/frontend-<scope>
docs/frontend-<scope>
```

## Before implementation

- Read `ARCHITECTURE.md` and `AGENTS.md`.
- Identify the owning domain module.
- Check existing shared components and module public APIs.
- Confirm the backend contract before inventing fields or states.

## Naming

- Components: `PascalCase.tsx`
- Hooks: `useSomething.ts`
- Schemas: `something.schema.ts`
- API files: `something.api.ts`
- Query keys: `something.keys.ts`
- Presenters/mappers: `something.presenter.ts` / `something.mapper.ts`

## Imports

Prefer the `@/` alias. Inside one module, relative imports are acceptable. From outside a module, import only from its public `index.ts`.

## Commands

```bash
npm run dev
npm run typecheck
npm run lint
npm run format:check
npm run build
```

## Pull requests

A frontend PR should explain what user flow changes, which module owns it, which API contracts are consumed, how it was validated, and whether loading/error/empty states are covered.

Do not mix unrelated refactors into a feature PR.
