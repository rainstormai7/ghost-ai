Add a floating control bar for zoom and undo/redo, then wire the same actions to keyboard shortcuts.

## Implementation

1. Add a pill-shaped control bar at the bottom-left of the canvas.

   It should sit above the shape panel and include two groups:
   - zoom controls: zoom out, fit view, zoom in
   - history controls: undo, redo

   Separate the two groups with a thin divider.

2. Wire the zoom controls to the React Flow instance.
   - zoom in
   - zoom out
   - fit view
   - use a short animation so the movement feels smooth

3. Wire undo and redo to Liveblocks history.
   - use the existing Liveblocks undo/redo hooks
   - disable undo when there is nothing to undo
   - disable redo when there is nothing to redo
   - keep disabled buttons visually dimmed
   - keyboard shortcut handlers must check the same Liveblocks availability state (canUndo/canRedo) and no-op when disabled

4. Create a `useKeyboardShortcuts` hook in `hooks/`.

   The hook should:
   - receive the React Flow instance
   - receive undo and redo handlers
   - receive canUndo and canRedo flags
   - listen for keyboard shortcuts on `window`
   - ignore shortcuts while typing in inputs, textareas, or editable text fields
   - call event.preventDefault() for all handled shortcuts to stop native browser behavior
   - verify the React Flow instance viewport is initialized before performing zoom actions
   - unregister the window keydown listener on unmount

5. Support these shortcuts with guards:
   - `+` or `=` to zoom in (only when viewport is initialized)
   - `-` to zoom out (only when viewport is initialized)
   - `Cmd/Ctrl + Z` to undo (only when canUndo is true)
   - `Cmd/Ctrl + Shift + Z` to redo (only when canRedo is true)
   - `Cmd/Ctrl + Y` to redo (only when canRedo is true)
   - all shortcuts call event.preventDefault() when handled

## Scope Limits

- don’t change the shape panel
- don’t change node or edge rendering
- don’t add extra canvas controls
- don’t change the existing collaborative state setup

## Check When Done

- Control bar is added to the canvas.
- Zoom actions use the React Flow instance.
- Undo and redo use Liveblocks history.
- Keyboard shortcuts are handled in `hooks/useKeyboardShortcuts`.
- Shortcut handling skips editable fields.
- `npm run build` passes.
