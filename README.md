# SequenceDefiner

A visual editor for creating [Mermaid](https://mermaid.js.org/) sequence diagrams — no syntax knowledge required.

## What is it?

SequenceDefiner lets you build sequence diagrams through a point-and-click interface instead of writing Mermaid markup by hand. You select actors, pick arrow types, type labels, and the app generates valid Mermaid code behind the scenes. The diagram updates in real time as you work.

You can import existing `.mmd` files to continue editing them visually, and export your work back to `.mmd` at any time.

## Features

- **Visual diagram building** — add messages, notes, and activations through form controls rather than code
- **Real-time preview** — see your sequence diagram update instantly as you make changes
- **Import / Export** — load and save standard `.mmd` (Mermaid) files
- **Actor management** — create, rename, reorder, and remove participants and actors with drag-and-drop
- **Full arrow type support** — solid, dotted, open, cross, and async arrow styles
- **Notes** — add notes to the left, right, or spanning over actors
- **Activations** — activate and deactivate actor lifelines
- **Auto-save** — your work is automatically persisted to browser LocalStorage
- **Dark mode** — toggle between light and dark themes

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| UI library | shadcn/ui (Tailwind CSS + Radix UI) |
| Diagram rendering | mermaid.js |
| Persistence | Browser LocalStorage |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/michele-massaro/SequenceDefiner.git
cd SequenceDefiner

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).

### Other commands

```bash
# Run tests
npm test

# Lint the codebase
npm run lint

# Build for production
npm run build

# Preview the production build locally
npm run preview
```

## How It Works

The app is laid out as four panels:

1. **Top Bar** — app title, new session, import/export, and theme toggle
2. **Sidebar** — lists all actors and diagram elements; supports reordering and editing
3. **Diagram Preview** — renders the sequence diagram in real time using mermaid.js
4. **Bottom Bar** — form controls for adding messages, notes, and activations

The internal state is always a valid Mermaid sequence diagram definition, so what you see in the preview is exactly what gets exported.

## Technical Documentation

For detailed information about the architecture, supported Mermaid syntax, core types, and project structure, see [TECHNICAL.md](TECHNICAL.md).

## License

[MIT](LICENSE.md)
