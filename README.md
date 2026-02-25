# Space Explorer — Solar System Observation Platform

> A real-time, interactive 3D visualization of our solar system built with React, Three.js, and TypeScript. Designed to NASA mission-control standards for clarity, performance, and reliability.

[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-ff69b4)](https://lovable.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-61dafb)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.176-black)](https://threejs.org/)

---

## Overview

Space Explorer renders a scientifically-proportional model of our solar system with:

- **8 planets** with procedurally generated textures (no external assets required)
- **Asteroid belt** between Mars and Jupiter (~150 objects)
- **Kuiper Belt** with 4 named dwarf planets (Pluto, Eris, Haumea, Makemake)
- **Oort Cloud** wireframe boundary visualization
- **8 comets** with directional tails
- **Moon systems** for Earth, Mars, Jupiter, Saturn, Uranus, and Neptune
- **Procedural star field** with 6,500+ stars across 3 depth layers
- **Procedural nebula skybox** — zero external texture dependencies

## Key Features

| Feature | Description |
|---------|-------------|
| **Procedural Textures** | All planet surfaces generated via Canvas2D — Earth shows continents, clouds, and polar caps; Jupiter has banded atmosphere and Great Red Spot |
| **Orbital Mechanics** | Planets orbit at proportionally scaled speeds (Mercury fastest, Neptune slowest) |
| **Camera Modes** | Target-lock follows selected planet; Free Navigation for manual exploration |
| **Telemetry Panel** | NASA-style data readout showing diameter, distance, orbital period, temperature, moon count |
| **Mission Control UI** | Orbitron + Exo 2 typography, cyan-accented glass panels, pulse indicators, scan-line loading |
| **Responsive** | Full mobile support with collapsible panels |

## Quick Start

```bash
# Clone
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

The app opens at `http://localhost:5173`.

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | React 18 + TypeScript | Component framework |
| **3D Engine** | Three.js 0.176 | WebGL rendering, orbit controls |
| **Build** | Vite 5 | Dev server, HMR, production bundling |
| **Styling** | Tailwind CSS + custom design tokens | NASA mission-control theme |
| **UI Components** | shadcn/ui (Radix primitives) | Accessible, composable UI |
| **Routing** | React Router 6 | SPA navigation |
| **State** | React Query 5 | Server state management (future use) |

## Project Structure

```
space-explorer/
├── public/                    # Static assets
├── src/
│   ├── components/
│   │   ├── three/             # Three.js subsystem (modular)
│   │   │   ├── Animator.tsx         # Animation loop, orbital mechanics, camera
│   │   │   ├── LightingSystem.tsx   # Sun, ambient, hemisphere lights
│   │   │   ├── PlanetCreator.tsx    # Planet meshes, procedural textures, belts
│   │   │   ├── ResourceDisposer.tsx # GPU resource cleanup
│   │   │   ├── SkyboxCreator.tsx    # Procedural skybox + star fields
│   │   │   └── hooks/
│   │   │       └── useThreeScene.tsx
│   │   ├── ui/                # shadcn/ui components
│   │   ├── PlanetInfo.tsx     # Telemetry data panel
│   │   ├── PlanetNavigation.tsx # Planet selector & camera mode
│   │   ├── PlanetScene.tsx    # Three.js scene container
│   │   └── SupportChat.tsx    # Mission Control comms (placeholder)
│   ├── data/
│   │   └── planets.ts         # Planet dataset (8 bodies, scientifically accurate)
│   ├── pages/
│   │   ├── Index.tsx          # Main application page
│   │   └── NotFound.tsx       # 404 handler
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions
│   ├── index.css              # Design system tokens + NASA theme
│   ├── App.tsx                # Router + providers
│   └── main.tsx               # Entry point
├── docs/
│   ├── SETUP.md               # Detailed setup guide
│   └── ARCHITECTURE.md        # System architecture deep-dive
├── tailwind.config.ts         # Extended color tokens (nasa-*)
├── vite.config.ts             # Build configuration
└── tsconfig.json              # TypeScript configuration
```

## Design System

The UI follows a **NASA Mission Control** aesthetic:

- **Typography**: [Orbitron](https://fonts.google.com/specimen/Orbitron) (headers/labels) + [Exo 2](https://fonts.google.com/specimen/Exo+2) (body text)
- **Color Tokens**: `--nasa-cyan`, `--nasa-gold`, `--nasa-red`, `--nasa-green`, `--nasa-panel`, `--nasa-glow`
- **Panel Style**: Frosted glass with backdrop blur, subtle cyan edge glow, scan-line animations
- **Status Indicators**: Pulsing green dots for active/tracking states

All colors are defined as HSL CSS custom properties in `src/index.css` and mapped to Tailwind classes in `tailwind.config.ts`.

## Performance

- **Procedural textures**: Zero network requests for planet surfaces — instant load
- **GPU-aware rendering**: `devicePixelRatio` capped at 2x to prevent GPU thrashing
- **Geometry optimization**: Low-poly asteroids (8 segments), high-poly planets (64 segments)
- **Resource disposal**: Proper Three.js cleanup on unmount (geometries, materials, textures, renderer)
- **Star field layers**: 3 depth layers with size attenuation for natural parallax

## Deployment

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

Or deploy via [Lovable](https://lovable.dev) → Share → Publish.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/mission-patch`)
3. Commit changes (`git commit -m 'Add Mars rover telemetry'`)
4. Push to branch (`git push origin feature/mission-patch`)
5. Open a Pull Request

## License

This project is open source. See individual file headers for specific attributions.

---

*"For all mankind." — NASA*
