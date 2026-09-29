# QualityTrack Frontend

Frontend for QualityTrack, rebuilt with a domain-first modular architecture.

## Core stack

| Concern             | Technology                            |
| ------------------- | ------------------------------------- |
| UI                  | React 19 + TypeScript                 |
| Build               | Vite                                  |
| Styling             | Tailwind CSS                          |
| Routing             | React Router                          |
| Server state        | TanStack Query                        |
| HTTP                | Axios                                 |
| Forms               | React Hook Form + Zod                 |
| Client-global state | Zustand                               |
| Quality             | ESLint + Prettier + TypeScript strict |

## Start

```bash
npm install
cp .env.example .env
npm run dev
```

## Quality commands

```bash
npm run architecture:check
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run check
```

## Architecture

Read these before implementing features:

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [AGENTS.md](./AGENTS.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)

The source code follows `app → modules → shared`. Each business domain owns its API, hooks, models, components, and route pages. Server state belongs to TanStack Query. Shared components contain no business rules.
