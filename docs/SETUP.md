# Setup Guide — Space Explorer

> Complete setup instructions for development, testing, and production deployment.

---

## Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| **Node.js** | ≥ 18.x | JavaScript runtime |
| **npm** | ≥ 9.x | Package manager (included with Node.js) |
| **Git** | ≥ 2.x | Version control |
| **Modern Browser** | Chrome 90+ / Firefox 90+ / Safari 15+ | WebGL 2.0 support required |

### Recommended

| Tool | Purpose |
|------|---------|
| [nvm](https://github.com/nvm-sh/nvm) | Node version management |
| VS Code | IDE with TypeScript/Tailwind extensions |
| React DevTools | Browser extension for component debugging |

---

## Installation

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Install Dependencies

```bash
npm install
```

This installs ~30 production dependencies including:
- `react` + `react-dom` — UI framework
- `three` + `@types/three` — 3D rendering engine
- `tailwindcss` + `tailwindcss-animate` — Styling system
- `@radix-ui/*` — Accessible UI primitives (shadcn/ui)
- `react-router-dom` — Client-side routing
- `@tanstack/react-query` — Async state management

### 3. Start Development Server

```bash
npm run dev
```

Opens at `http://localhost:5173` with hot module replacement (HMR).

---

## Project Configuration

### Vite (`vite.config.ts`)

- Path alias: `@/` maps to `src/`
- Development server: port 5173 (auto-configured)
- Production build: ES2020 target, chunk splitting

### TypeScript (`tsconfig.app.json`)

- Strict mode enabled
- Path aliases configured for `@/` imports
- JSX: `react-jsx` transform (no React import needed)

### Tailwind CSS (`tailwind.config.ts`)

- Custom color tokens: `nasa-*` namespace
- Custom fonts: `font-display` (Orbitron), `font-body` (Exo 2)
- Animation keyframes: `accordion-down`, `accordion-up`, `float`
- Plugin: `tailwindcss-animate`

### Design Tokens (`src/index.css`)

All theme colors defined as CSS custom properties in HSL format:

```css
--nasa-cyan: 190 85% 50%;     /* Primary interactive color */
--nasa-gold: 45 90% 55%;      /* Accent / warning */
--nasa-red: 0 75% 55%;        /* Destructive / alert */
--nasa-green: 145 65% 45%;    /* Success / active status */
--nasa-panel: 220 40% 8%;     /* Panel background */
--nasa-panel-border: 200 40% 25%;  /* Panel edge */
--nasa-glow: 200 80% 55%;     /* Glow effects */
```

---

## Build & Deploy

### Production Build

```bash
npm run build
```

Output: `dist/` directory with optimized assets.

### Preview Production Build

```bash
npm run preview
```

### Deploy via Lovable

1. Open [Lovable project](https://lovable.dev)
2. Click **Share** → **Publish**
3. Optionally connect a custom domain in Project → Settings → Domains

### Self-Hosting

Serve the `dist/` directory with any static file server:

```bash
# Example with Node.js serve
npx serve dist

# Example with Python
cd dist && python3 -m http.server 8080
```

---

## Environment Notes

### No External Textures Required

All planet textures and the skybox are generated procedurally using Canvas2D at runtime. The `/public/textures/` directory exists for potential future high-resolution texture upgrades but is **not required** for the application to function.

### No Backend Required

Space Explorer is a fully client-side application. No API keys, environment variables, or backend services are needed for core functionality.

### WebGL Requirements

The application requires WebGL 2.0. If running in a VM or headless environment, ensure GPU acceleration is available or use a software renderer like `xvfb` + Mesa.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Blank screen on load | Check browser console for WebGL errors. Update GPU drivers. |
| Poor frame rate | Reduce `window.devicePixelRatio` or close other GPU-heavy tabs |
| Fonts not loading | Ensure internet access for Google Fonts CDN |
| Build errors | Run `npm install` again; check Node.js version ≥ 18 |

---

## IDE Setup (VS Code)

Recommended extensions:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ]
}
```
