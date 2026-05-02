_(No open issues.)_

**Resolved:** Dialog text was hard to read because `html` had no `dark` class while Tailwind’s `dark:` variants only apply under `.dark`, so inputs and other tokens misbehaved; slug/helper copy also used very low-contrast `text-copy-faint`. Fixed via `dark` on `<html>`, explicit `text-foreground` on inputs, stronger dialog title/description defaults, and readable slug preview styling.
