# SequenceDefiner — Implementation Tasks

Tasks are ordered by dependency. Each phase builds on the previous one.

---

## Phase 1: Project Setup

- [x] Initialize Vite project with React 19 + TypeScript template
- [x] Install and configure Tailwind CSS
- [x] Install and configure shadcn/ui (init + required components: Button, Input, Select, Dialog, DropdownMenu, Separator, ScrollArea, Tooltip)
- [x] Install mermaid.js
- [x] Define the core TypeScript types in `src/lib/types.ts` (`Actor`, `ActorType`, `ArrowType`, `Message`, `Activation`, `Note`, `DiagramElement`, `DiagramState`)
- [x] Set up the basic app layout shell in `App.tsx` (top bar, sidebar, main area with preview + bottom bar) using placeholder components

## Phase 2: Core Data Layer

- [x] Implement `useDiagram` hook — manages `DiagramState` (actors + elements) with all mutation functions:
  - `addActor`, `removeActor`, `renameActor`, `reorderActor`, `updateActorType`
  - `addElement`, `removeElement`, `reorderElement`
  - `resetDiagram` (new session)
  - `loadState` (for import)
- [x] Implement `mermaid-serializer.ts` — converts `DiagramState` into a valid Mermaid sequence diagram string
- [x] Implement `mermaid-parser.ts` — parses a Mermaid sequence diagram string into `DiagramState`
- [x] Write unit tests for the serializer (round-trip: state → mermaid string → verify output)
- [x] Write unit tests for the parser (known `.mmd` input → expected `DiagramState`)
- [x] Write round-trip tests (state → serialize → parse → compare with original state)

## Phase 3: Diagram Preview

- [ ] Implement `useMermaid` hook — takes a Mermaid string, renders it into an SVG using mermaid.js, handles errors gracefully
- [ ] Implement `DiagramPreview` component — displays the rendered SVG, re-renders on every state change
- [ ] Wire `useDiagram` → `mermaid-serializer` → `useMermaid` → `DiagramPreview` so the preview updates in real time

## Phase 4: Bottom Bar — Adding Elements

- [ ] Implement `BottomBar` component shell with tabs/sections for Message, Activation, and Note
- [ ] Implement "Add Message" form — From (dropdown), To (dropdown), Label (text input), Arrow Type (selector with all 8 types), Add button
- [ ] Implement "Add Activation/Deactivation" form — Actor (dropdown), Type (activate/deactivate toggle), Add button
- [ ] Implement "Add Note" form — Position (left of/right of/over), Actor(s) selector, Text input, Add button
- [ ] Verify that adding each element type updates the preview in real time

## Phase 5: Sidebar — Actor Management

- [ ] Implement `ActorList` component — displays all actors with name, alias, and type icon
- [ ] Implement "Add Actor" UI — inline form or dialog with name, optional alias, and type (participant/actor) fields
- [ ] Implement "Remove Actor" — delete button with confirmation dialog warning about associated messages being removed
- [ ] Implement "Rename Actor" — inline edit or dialog for name and alias
- [ ] Implement "Reorder Actors" — drag-and-drop or up/down arrow buttons
- [ ] Implement `Sidebar` component combining actor list and element list

## Phase 6: Sidebar — Element List

- [ ] Implement `ElementList` component — displays all elements with human-readable summaries
  - Messages: "Alice →→ Bob: Hello" (with arrow type visual hint)
  - Activations: "activate Bob" / "deactivate Bob"
  - Notes: "Note over Alice: text"
- [ ] Implement "Delete Element" — delete button on each element
- [ ] Implement "Reorder Elements" — drag-and-drop or up/down arrow buttons

## Phase 7: Top Bar

- [ ] Implement `TopBar` component with app name and menu
- [ ] Implement "New Session" — clears diagram state after confirmation dialog
- [ ] Implement "Export File" — serializes current state to `.mmd` and triggers browser file download
- [ ] Implement "Import File" — opens file picker, reads `.mmd` file, parses it with `mermaid-parser`, loads the resulting state into `useDiagram`
- [ ] Handle import errors gracefully (show toast/alert for malformed files)

## Phase 8: Persistence

- [ ] Implement `useLocalStorage` hook — auto-saves `DiagramState` to LocalStorage on every change
- [ ] Restore diagram state from LocalStorage on app load
- [ ] Clear LocalStorage when "New Session" is triggered
- [ ] Persist theme preference to LocalStorage

## Phase 9: Theming

- [ ] Set up shadcn/ui theme provider with light and dark mode support
- [ ] Implement `ThemeToggle` component in the top bar
- [ ] Ensure all components render correctly in both themes
- [ ] Ensure the Mermaid diagram preview respects the current theme (light/dark mermaid theme)

## Phase 10: Polish & Edge Cases

- [ ] Handle empty state — show a helpful message when no actors/elements exist
- [ ] Validate element creation — disable "Add" when required fields are missing (e.g., no actors exist yet, no label provided)
- [ ] Handle actor removal cascade — when an actor is removed, also remove all messages and notes referencing that actor
- [ ] Prevent duplicate actor names/aliases
- [ ] Handle large diagrams — ensure the preview area is scrollable
- [ ] Responsive layout — ensure the app is usable on smaller screens (collapsible sidebar)
- [ ] Keyboard accessibility — ensure all controls are keyboard-navigable
- [ ] Add loading state for Mermaid rendering

## Phase 11: Build & Deploy

- [ ] Configure Vite production build
- [ ] Test production build locally with `npm run preview`
- [ ] Add meta tags and favicon
- [ ] Set up deployment (e.g., Vercel, Netlify, or GitHub Pages)
