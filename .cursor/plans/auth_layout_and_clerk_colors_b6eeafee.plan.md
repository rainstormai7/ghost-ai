---
name: Auth layout and Clerk colors
overview: Fix auth page vertical rhythm and left-column spacing so the Clerk form aligns with the marketing headline block, and tune Clerk CSS variables / appearance so the sign-in/sign-up modal matches the reference color PNGs.
todos:
  - id: align-columns
    content: "Change auth-split-shell: lg top-align Clerk column + match left padding; reconsider mobile justify-center"
    status: completed
  - id: marketing-rhythm
    content: Tighten auth-marketing-aside spacing (logo→H1, feature list); adjust footer margin if needed
    status: completed
  - id: clerk-colors
    content: Tune :root --clerk-* / ClerkProvider appearance.variables until modal matches correct-required PNGs
    status: completed
  - id: verify-build
    content: Visual check vs context/images + npm run build; update progress-tracker.md
    status: completed
isProject: false
---

# Auth spacing, modal alignment, and Clerk color fixes

## Problem analysis (from [context/current-issues.md](context/current-issues.md) + code)

### 1) Clerk modal feels “shoved down” vs the left copy

**What the user sees:** The sign-in card sits too low relative to “Design systems at the speed of thought.” and does not line up with the left “text block.”

**Root cause in code:** In [components/auth/auth-split-shell.tsx](components/auth/auth-split-shell.tsx), the right pane uses:

```35:37:components/auth/auth-split-shell.tsx
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8 lg:px-10 lg:py-16">
          {children}
        </div>
```

`justify-center` **vertically centers** the Clerk root in the **full height** of the right column (viewport height on desktop). On the left, [components/auth/auth-marketing-aside.tsx](components/auth/auth-marketing-aside.tsx) is inside a parent with `lg:justify-between`, and the aside itself is `flex ... justify-between` with **hero + features in the top bundle** and **copyright pinned to the bottom**. So the left **hero block lives in the upper portion** of the screen, while the right **modal is centered on the whole column** — visually the modal sits much lower than the headline. That matches “alignment of the clerk modal is … shoved right down the page” relative to the main text.

**Direction:** On `lg` breakpoints, **stop vertically centering** the form in the full viewport. Instead **top-align** the Clerk column using the **same top (and horizontal) padding rhythm** as the left column (e.g. match `lg:py-16` / `lg:px-14` or whatever the aside uses), optionally with a small consistent offset so the **top of the card lines up with the top of the headline block** (or the logo row, per [context/images/correct-spacing-and-clerk-modal-allignment.png](context/images/correct-spacing-and-clerk-modal-allignment.png)). Keep `justify-center` only for mobile if the single-column layout still benefits from vertical centering below the mobile header.

### 2) Spacing between logo / “Ghost AI” and the headline

**What the user sees:** Too much (or uneven) space between the icon+brand row and “Design systems at the speed of thought.”

**Root cause in code:** The brand row uses `mb-12` ([auth-marketing-aside.tsx](components/auth/marketing-aside.tsx) line ~29). That’s a large gap (3rem). The reference likely uses a **tighter** step (often one “section” step between logo lockup and H1).

**Direction:** Reduce `mb-12` toward `mb-6`–`mb-8` and re-check `mt-*` on the subhead and `mt-10` before the feature list so vertical rhythm matches [context/images/correct-spacing-and-clerk-modal-allignment.png](context/images/correct-spacing-and-clerk-modal-allignment.png). Adjust copyright `mt-16` only if the left column balance looks off after the above.

### 3) Background / 50–50 “feel” vs uniform `bg-base`

**Note:** Reference [correct-spacing-and-clerk-modal-allignment.png](context/images/correct-spacing-and-clerk-modal-allignment.png) is described as **left charcoal vs right pure black**. The shell currently applies **one** `bg-base` on the outer wrapper ([auth-split-shell.tsx](components/auth/auth-split-shell.tsx) line 15), so both columns share the same token.

**Direction:** After fixing alignment, **compare** the reference PNG again. If the split still looks wrong, set **left** to `bg-surface` (token) and **right** to `bg-base` so the Clerk panel reads on **pitch black** without reintroducing the old “heavy” split-panel problem — only if the reference clearly shows two backgrounds.

### 4) Clerk modal colors (text, primary button, links)

**What the user wants:** Match [context/images/correct-required-clerk-modal-colors.png](context/images/correct-required-clerk-modal-colors.png); current state is wrong per [context/images/incorrect-clerk-modal-colors.png](context/images/incorrect-clerk-modal-colors.png).

**Root cause:** Global Clerk styling comes from:

- [app/layout.tsx](app/layout.tsx) — `ClerkProvider` with `dark` theme from `@clerk/ui/themes`
- [app/globals.css](app/globals.css) — `:root` `--clerk-color-*` mapped to design tokens

The **dark theme** plus **CSS variable overrides** can fight each other (e.g. primary CTA or links rendering as **white** vs **brand cyan** depending on which layer wins). The reference “required” image is described as **cyan/teal primary button with dark label text** and **accent links** in the same family — which aligns with `--accent-primary` / `--clerk-color-primary` / `--clerk-color-primary-foreground`, but links may use a different Clerk token.

**Direction:**

1. Open both color PNGs side-by-side with the running app.
2. Map discrepancies to Clerk’s documented variables (see Clerk “Variables” / CSS variables docs): adjust `--clerk-color-primary`, `--clerk-color-primary-foreground`, and any **link / accent** variables (`--clerk-color-...` for interactive text) so **primary button** and **footer action links** match **correct-required**.
3. If CSS variables are insufficient, add **`appearance.variables`** on `ClerkProvider` (and only where needed on `SignIn` / `SignUp` in [app/sign-in/[[...sign-in]]/page.tsx](app/sign-in/[[...sign-in]]/page.tsx) / [app/sign-up/[[...sign-up]]/page.tsx](app/sign-up/[[...sign-up]]/page.tsx)) for explicit `colorPrimary` / `colorPrimaryForeground` / `colorSuccess` / etc., still **referencing tokens** (`var(--accent-primary)`) per project rules — no raw hex in TSX unless unavoidable.
4. Re-run `npm run build` and visually verify sign-in **and** sign-up.

## Files to touch (implementation phase)

| Area | Files |
|------|--------|
| Column alignment + optional split bg | [components/auth/auth-split-shell.tsx](components/auth/auth-split-shell.tsx) |
| Logo→headline + list rhythm | [components/auth/auth-marketing-aside.tsx](components/auth/auth-marketing-aside.tsx) |
| Clerk tokens / provider | [app/globals.css](app/globals.css), [app/layout.tsx](app/layout.tsx), possibly sign-in/up pages |
| Tracker | [context/progress-tracker.md](context/progress-tracker.md) (brief note after change) |

## Success criteria

- On a large viewport, the **top of the Clerk card** aligns with the **hero copy block** on the left (same vertical band as in correct-spacing PNG), not mid-screen.
- **Tighter** spacing between logo lockup and H1 per reference.
- Modal **button and link colors** match **correct-required-clerk-modal-colors.png** (not incorrect).
- `npm run build` passes.
