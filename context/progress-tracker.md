# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 1: Foundation — Prisma schema, client singleton, and initial migration in place.

## Current Goal

- Continue Phase 1 foundation; pick the next feature unit from feature specs.

## Completed

- `01-design-system`: shadcn/ui initialized with Tailwind v4 support; Button, Card, Dialog, Input, Tabs, Textarea, and ScrollArea components added to `components/ui/`; lucide-react installed; `lib/utils.ts` created with `cn()` helper; dark theme CSS custom properties defined in `app/globals.css` with project design tokens mapped to Tailwind utilities via `@theme inline`.
- `02-editor`: `components/editor/editor-navbar.tsx` — fixed top navbar with sidebar toggle (PanelLeftOpen / PanelLeftClose); `components/editor/project-sidebar.tsx` — floating overlay sidebar with Projects header, My Projects / Shared tabs (empty placeholder state), and New Project button; dialog color-token pattern documented in globals.css for future use.
- `03-auth`: `@clerk/ui` installed; `proxy.ts` at project root with `clerkMiddleware()` protecting all routes except `/sign-in` and `/sign-up`; `ClerkProvider` with Clerk `dark` theme wraps root layout; Clerk CSS variables overridden via `globals.css` using project design tokens (no hardcoded colors); `app/sign-in/[[...sign-in]]/page.tsx` and `app/sign-up/[[...sign-up]]/page.tsx` with two-panel layout (left: logo + tagline + feature list, right: Clerk form) on large screens, form-only on small screens; `app/page.tsx` redirects authenticated users to `/editor` and unauthenticated users to `/sign-in`; `UserButton` added to editor navbar right section; `app/editor/page.tsx` shell created. Auth marketing shell: `components/auth/auth-split-shell.tsx` + `auth-marketing-aside.tsx` — 50/50 `lg` split (`bg-surface` left vs `bg-base` right), headline + feature rows with Lucide icons; Geist Sans via `body`/shell `font-sans`, Clerk `--clerk-font-family*` in `globals.css`, and `appearance.elements` on `ClerkProvider` / sign-in/up.
- `04-project-dialogues`: `useProjectDialogs` hook (`hooks/use-project-dialogs.ts`) for dialog, form, and loading state; `ProjectDialogs` + slug helper `lib/project-slug.ts` and mock data `lib/mock-projects.ts`; `/editor` home heading, description, and `New Project` (Plus); create (name + live slug preview), rename (prefill, current name in description, auto-focus, Enter submits), delete (confirmation, destructive confirm); sidebar lists mock owned vs shared projects, rename/delete only for owners; mobile-only backdrop scrim closes sidebar on tap; `Input` forwards refs for focus.
- `05-prisma`: `prisma/models/project.prisma` — `Project` (ownerId, name, optional description, `ProjectStatus` DRAFT/ARCHIVED, optional `canvasJsonPath`, timestamps; indexes on `ownerId`, `createdAt`) and `ProjectCollaborator` (project relation cascade delete, email, createdAt; `@@unique([projectId, email])`; indexes on email and `[projectId, createdAt]`). `lib/prisma.ts` — cached singleton (`globalThis` in non-production): `DATABASE_URL` `prisma+postgres://*` → Accelerate (`accelerateUrl` + `@prisma/extension-accelerate`); else `Pool` + `PrismaPg` adapter. Migration `20260502101516_init` applied; client generated under `app/generated/prisma`.

## In Progress

- None.

## Next Up

- Add the next planned feature unit here.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Add decisions that affect the system design or data model.

## Session Notes

- Auth UI (spacing + Clerk colors): Desktop uses `bg-surface` marketing column vs `bg-base` Clerk column; form column is `lg:justify-start` with padding matching the aside (`lg:px-14 lg:py-16`), inner wrapper `lg:mt-14` to align the card top with the headline under the logo row. Marketing aside: tighter logo→H1 (`mb-7`), subhead (`mt-4`), features (`mt-8` / `space-y-6`). Clerk: `:root` adds `--clerk-color-neutral`, `--clerk-color-ring`; `ClerkProvider` `appearance.variables` reinforce tokens; `elements.formButtonPrimary` and `footerActionLink` force brand primary + teal links so the CTA matches reference PNGs over theme defaults. **Follow-up:** Increased top breathing room — `lg:pt-24` on both columns, logo→headline `mb-10`, Clerk offset `lg:mt-17` to keep card aligned with H1; mobile form wrapper `py-12`.
