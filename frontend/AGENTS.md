# QualityTrack Frontend Agent Rules

These rules are mandatory for any automated or human implementation in `frontend/`.

## Before coding

1. Read `ARCHITECTURE.md`.
2. Check whether the requested behavior belongs to an existing domain module.
3. Reuse an existing shared primitive before creating another one.
4. Keep backend contracts and presentation models separate when their responsibilities differ.

## Non-negotiable rules

- Pages orchestrate. They do not contain API clients, large data transformations, or domain workflows.
- API access lives inside the owning module's `api/` folder or in `shared/api/` for infrastructure only.
- Server state belongs to TanStack Query. Do not mirror API resources in Zustand.
- Zustand is reserved for genuine client-global state such as session or UI preferences.
- Shared UI components must not know business rules.
- Domain-specific components stay in their domain module.
- Cross-module imports use the module public API (`index.ts`). Never import another module's internal files.
- Avoid `any`. Model unknown data as `unknown` and narrow it.
- Do not duplicate status labels, colors, event mappings, or formatting logic across screens.
- Prefer small focused hooks, presenters, mappers, schemas, and components over one large file.
- Loading, empty, error, disabled, and permission states are part of the feature, not optional polish.
- Accessibility basics are required: semantic elements, labels, keyboard behavior, focus visibility, and meaningful text.

## Size guardrails

- UI component: usually 50-150 LOC.
- Complex component/page/hook: preferably below 250 LOC.
- At 300 LOC, review for extraction before adding more.
- Files above 500 LOC fail `npm run architecture:check`.
- Generated files and vendor code are exempt.

## Extraction triggers

Extract when one of these appears:

- A JSX section has its own data or interaction responsibility.
- Logic is repeated.
- Mapping/formatting can be tested independently.
- A component has more than one reason to change.
- A hook coordinates unrelated workflows.
- A page knows backend details that belong to an API adapter or presenter.

## Definition of done

Before marking work complete:

- Types represent the contract accurately.
- Domain logic is not duplicated in UI.
- Existing components were reused where appropriate.
- The change respects module boundaries.
- Error/loading/empty states were considered.
- `npm run architecture:check`, lint, typecheck, format check and build should pass in an environment with dependencies installed.
- No debug code, temporary mocks, or commented-out implementation remains.
