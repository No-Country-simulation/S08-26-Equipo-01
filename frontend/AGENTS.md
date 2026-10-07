# QualityTrack Frontend Agent Rules

These rules are mandatory for any automated or human implementation in `frontend/`.

## Before coding

1. Read `ARCHITECTURE.md`.
2. Inspect the current Git status before modifying files.
3. Check whether the requested behavior belongs to an existing domain module.
4. Reuse an existing shared primitive before creating another one.
5. Keep backend contracts and presentation models separate when their responsibilities differ.
6. Check whether the requested screen or workflow already exists in Figma before inventing a new UI.
7. Review the relevant backend contract before implementing mutations, permissions, status transitions, or domain rules.

Do not rewrite or replace an existing implementation without first understanding why it exists.

## Sources of truth

QualityTrack has different sources of truth for different concerns.

### Backend

The backend is authoritative for:

- API contracts.
- Available operations.
- Authentication.
- Authorization.
- Roles and permissions.
- Domain invariants.
- Status transitions.
- Validation rules.
- Workflow rules.
- Persistence behavior.

Never invent frontend behavior that contradicts the backend.

If the frontend cannot obtain data required by an existing Figma screen, do not hardcode or fabricate it. Identify the missing contract and report or implement the appropriate backend support.

### Figma

Figma is the primary visual and UX reference for the frontend.

Current QualityTrack Figma file:

- File key: `089ECFGXjz9UrhFr8ndFDx`

When a corresponding screen exists in Figma:

- Match its visual hierarchy.
- Preserve the intended layout.
- Preserve the important spacing and grouping.
- Preserve labels and terminology.
- Preserve available actions.
- Preserve disabled/read-only states.
- Preserve workflow presentation.
- Preserve status presentation.
- Preserve the distinction between internal and customer-facing experiences.
- Reuse the established QualityTrack visual language instead of inventing unrelated patterns.

Do not blindly copy generated Figma code. Treat Figma as the visual target and implement it using the project's existing React architecture and reusable components.

Figma defines how the workflow is presented; the backend defines what the workflow is allowed to do.

If Figma and backend behavior differ:

1. Do not silently invent a compromise.
2. Preserve backend correctness.
3. Keep the UI as close as possible to the intended design.
4. Explicitly identify the discrepancy before changing domain behavior.

If no Figma screen exists for a required state, derive the new state from the nearest existing QualityTrack design rather than introducing a new design language.

## Non-negotiable rules

- Pages orchestrate. They do not contain API clients, large data transformations, or domain workflows.
- API access lives inside the owning module's `api/` folder or in `shared/api/` for infrastructure only.
- Server state belongs to TanStack Query. Do not mirror API resources in Zustand.
- Zustand is reserved for genuine client-global state such as session or UI preferences.
- Shared UI components must not know business rules.
- Domain-specific components stay in their domain module.
- Cross-module imports use the module public API (`index.ts`). Never import another module's internal files.
- Imports between files inside the same module use relative paths; `@/modules/...` aliases are reserved for module boundaries.
- Avoid `any`. Model unknown data as `unknown` and narrow it.
- Do not duplicate status labels, colors, event mappings, or formatting logic across screens.
- Prefer small focused hooks, presenters, mappers, schemas, and components over one large file.
- Loading, empty, error, disabled, and permission states are part of the feature, not optional polish.
- Accessibility basics are required: semantic elements, labels, keyboard behavior, focus visibility, and meaningful text.
- Do not expose backend-only technical statuses in customer-facing UI when the backend provides a public/customer status.
- Do not infer permissions only from visible buttons. Backend authorization remains authoritative.
- Do not hardcode IDs that should come from application context or API data.
- Do not duplicate backend calculations when the backend is authoritative for the resulting value.
- Avoid speculative abstractions for functionality that does not yet exist.

## Module boundaries

The dependency direction is:

```text
app -> modules -> shared
```

Rules:

- `shared/` must not import from `modules/` or `app/`.
- `modules/` must not import from `app/`.
- Cross-module imports must use the target module's public `index.ts`.
- Internal files from another module must never be imported directly.
- Same-module imports should use relative paths.
- The `@/modules/...` alias is reserved for crossing module boundaries through public APIs.

Before creating a new module, verify that the feature does not already belong to an existing domain.

## Server state

Use TanStack Query for server-managed state.

Use it for:

- Lists.
- Details.
- Server-backed workflows.
- Mutations.
- Cache invalidation.
- Loading state.
- Request errors.

After successful mutations, invalidate or update the appropriate queries instead of maintaining duplicate copies manually.

Do not use Zustand as an API cache.

## Client state

Use Zustand only when state genuinely needs to survive across unrelated components or routes.

Good candidates include:

- Authentication/session state.
- Global UI preferences.

Prefer local React state for:

- Dialog visibility.
- Temporary form interaction.
- Selected tabs.
- Page-local filters unless persistence is intentionally required.

## API contracts

Frontend TypeScript types must accurately reflect backend DTOs.

Do not:

- Guess missing fields.
- Rename domain concepts merely for convenience without an explicit presentation model.
- Reuse an internal DTO for a customer-facing contract when the backend exposes different contracts.
- Assume a mutation accepts fields that are not present in the backend request DTO.
- Assume a backend transition occurs automatically when the backend requires an explicit operation.

Where backend DTOs and UI view models differ, map them deliberately in the module's model/presenter layer.

## Permissions

UI permissions improve UX but do not replace backend authorization.

Frontend permissions should be derived from known session/account context and backend contracts.

Keep these concepts separate:

- Internal roles.
- Customer account membership roles.

Customer memberships must never grant internal application roles.

If the frontend does not possess enough information to determine a permission confidently, prefer a conservative UI and let the backend remain authoritative rather than inventing authorization data.

## Internal and customer experiences

Internal users and customer users are distinct application contexts.

Do not mix:

- Internal navigation.
- Customer navigation.
- Internal status terminology.
- Customer-facing status terminology.
- Internal permissions.
- Customer membership permissions.

When both experiences exist for the same domain object, reuse domain data and shared visual primitives where appropriate, but keep their page workflows and authorization contexts explicit.

## Forms

Use the project's existing form stack and patterns.

Validation should:

- Reflect backend constraints where known.
- Give immediate useful feedback.
- Avoid duplicating complex business rules that belong exclusively to the backend.

For mutations:

1. Validate the local form.
2. Submit the backend contract.
3. Handle backend validation/conflict errors.
4. Refresh or invalidate affected server state.
5. Show an appropriate success/error state.

Do not optimistically fake irreversible business transitions unless there is a deliberate reason to do so.

## UI implementation

Prefer composition over giant configurable components.

A component should generally have one clear responsibility.

Extract UI when:

- A section has its own interaction.
- A section has its own loading/error behavior.
- A section appears in multiple states/screens.
- A section can be understood independently.
- The parent page is becoming difficult to scan.

Do not turn every small wrapper into a component merely to reduce line count.

Reuse existing QualityTrack primitives before creating new ones.

## Size guardrails

- UI component: usually 50-150 LOC.
- Complex component/page/hook: preferably below 250 LOC.
- At 300 LOC, review for extraction before adding more.
- Files above 500 LOC fail `npm run architecture:check`.
- Generated files and vendor code are exempt.

The goal is not to game the line counter. The goal is readable separation of responsibilities.

## Extraction triggers

Extract when one of these appears:

- A JSX section has its own data or interaction responsibility.
- Logic is repeated.
- Mapping/formatting can be tested independently.
- A component has more than one reason to change.
- A hook coordinates unrelated workflows.
- A page knows backend details that belong to an API adapter or presenter.

## Git and repository safety

Before making changes:

```bash
git status
```

Respect existing uncommitted work.

Do not:

- Delete unrelated changes.
- Reset the branch without explicit approval.
- Force-push without explicit approval.
- Merge branches without explicit approval.
- Rewrite another contributor's work unnecessarily.
- Commit generated build output.
- Commit `.env` files or credentials.

When the task is complete, summarize which files or areas changed.

Unless explicitly requested, do not create commits, push branches, or open/merge pull requests automatically.

## Validation workflow

Do not wait until the very end of a large implementation to discover basic formatting or type issues.

When dependencies are available, use:

```bash
npm run format
npm run check
npm run build
```

`npm run check` is expected to cover the project's configured architecture, type, lint, and formatting checks.

When backend code is modified, run the appropriate backend tests from the backend project, for example:

```bash
mvnw.cmd test
```

on Windows, or:

```bash
./mvnw test
```

on Unix-like systems.

Fix root causes instead of weakening lint/type rules to make checks pass.

Do not disable strict TypeScript checks merely to suppress an implementation error.

## Definition of done

Before marking work complete:

- Types represent the contract accurately.
- Domain logic is not duplicated in UI.
- Existing components were reused where appropriate.
- The change respects module boundaries.
- Figma was reviewed when a corresponding design exists.
- The implementation preserves the established QualityTrack visual language.
- Backend workflows and permissions were verified against the actual contract.
- Internal and customer contexts are not accidentally mixed.
- Error/loading/empty states were considered.
- Disabled/read-only/permission states were considered.
- `npm run architecture:check`, lint, typecheck, format check and build should pass in an environment with dependencies installed.
- Backend tests should pass when backend behavior was changed.
- No debug code, temporary mocks, hardcoded IDs, or commented-out implementation remains.
- No credentials or local `.env` files were introduced.
