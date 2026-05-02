/** URL-safe slug from a display name (live preview / persisted slug). */
export function slugifyProjectName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

/**
 * Removes symbols and punctuation that are not usable in a normal project title.
 * Allows letters (any script), numbers, whitespace, hyphen, apostrophe, period, comma, and underscore.
 */
const PROJECT_NAME_DISALLOWED = /[^\p{L}\p{N}\s\-'.,_]/gu

export function filterProjectNameInput(value: string): string {
  return value.replace(PROJECT_NAME_DISALLOWED, "")
}

/** True when the trimmed name produces a non-empty slug (at least one a–z or 0–9 survives slugify). */
export function isValidProjectNameForSlug(name: string): boolean {
  const t = name.trim()
  if (!t) return false
  return slugifyProjectName(t).length > 0
}
