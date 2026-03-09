# Architecture — Space Explorer

> System architecture documentation for the Space Explorer Solar System Observation Platform.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  React   │  │   Three.js   │  │   Tailwind CSS   │  │
│  │  Router  │  │   WebGL      │  │   Design System  │  │
│  └────┬─────┘  └──────┬───────┘  └────────┬─────────┘  │
│       │               │                   │             │
│  ┌────▼───────────────▼───────────────────▼─────────┐  │
│  │              Application Layer                    │  │
│  │  ┌────────┐  ┌──────────┐  ┌─────────────────┐   │  │
│  │  │ Pages  │  │ 3D Scene │  │  UI Components  │   │  │
│  │  └───┬────┘  └────┬─────┘  └───────┬─────────┘   │  │
│  │      │            │                │              │  │
│  │  ┌───▼────────────▼────────────────▼───────────┐  │  │
│  │  │            State Management                  │  │  │
│  │  │  (React useState + React Query)              │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Data Layer                           │   │
│  │  planets.ts (static dataset, no API dependency)   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Module Architecture

### Three.js Subsystem (`src/components/three/`)

The 3D rendering pipeline is decomposed into single-responsibility modules:

```
Three.js Subsystem
├── PlanetScene.tsx          ← Scene orchestrator (lifecycle, refs, mount/unmount)
│
├── SkyboxCreator.tsx        ← Procedural skybox + multi-layer star field
│   ├── createSkybox()       → Canvas2D gradient + nebula + star painting
│   └── createStars()        → 3 PointsMaterial layers (4000/2000/500 particles)
│
├── LightingSystem.tsx       ← Light rig + Sun mesh
│   └── createLighting()     → PointLight (sun) + AmbientLight + HemisphereLight
│                              + Sun mesh (MeshBasicMaterial) + corona glow
│
├── PlanetCreator.tsx        ← Planet factory + procedural textures
│   ├── createSolarSystem()  → Orchestrates all planet/belt/comet creation
│   ├── generatePlanetTexture() → Canvas2D per-planet surface generation
│   ├── createSaturnRings()  → RingGeometry with tilt
│   ├── createAsteroidBelt() → 150 random SphereGeometry objects
│   ├── createKuiperBelt()   → 80 KBOs + 4 named dwarf planets
│   ├── createOortCloud()    → Wireframe SphereGeometry (BackSide)
│   └── createComets()       → 8 nucleus+tail groups
│
├── Animator.tsx             ← Animation loop + camera control
│   ├── setupAnimation()     → requestAnimationFrame loop
│   │   ├── Orbital motion   → Per-planet angle calculation
│   │   ├── Moon animation   → Relative to parent planet
│   │   ├── Belt rotation    → Asteroid + Kuiper slow rotation
│   │   ├── Comet orbits     → Elliptical paths with tail direction
│   │   └── Camera follow    → Lerp-based tracking or free OrbitControls
│   ├── setupResizeHandler() → Responsive viewport updates
│   └── createOrbitPath()    → BufferGeometry circle for orbit lines
│
└── ResourceDisposer.tsx     ← GPU memory cleanup
    └── cleanupResources()   → Dispose geometry, material, textures, renderer
```

### Procedural Texture Generation

Instead of loading external `.jpg` texture files (which are error-prone and add network latency), all planet surfaces are generated at runtime using Canvas2D:

| Planet | Technique |
|--------|-----------|
| Earth | Blue base + elliptical green continents + white polar caps + semi-transparent cloud wisps |
| Jupiter | Horizontal color bands (12 alternating) + Great Red Spot ellipse |
| Saturn | Horizontal color bands (8 alternating) + external RingGeometry |
| Mars | Russet base + crater details + white polar caps |
| Venus | Yellow-orange base + dense cloud ellipses (20 overlapping) |
| Mercury | Gray base + circular crater stroke outlines (30 random) |
| Uranus/Neptune | Cyan/blue base + subtle atmospheric bands |

**Benefit**: Zero external dependencies, instant load, no 404 errors, smaller bundle size.

---

## Component Hierarchy

```
App.tsx
├── QueryClientProvider (React Query)
├── TooltipProvider
├── Toaster (toast notifications)
├── Sonner (sonner notifications)
└── BrowserRouter
    └── Routes
        ├── "/" → Index.tsx
        │   ├── PlanetScene (Three.js canvas)
        │   ├── PlanetInfo (telemetry panel)
        │   ├── PlanetNavigation (planet selector)
        │   └── SupportChat (comms dialog)
        └── "*" → NotFound.tsx
```

---

## State Management

### Local Component State

| Component | State | Purpose |
|-----------|-------|---------|
| `Index` | `selectedPlanetId` | Currently focused planet |
| `Index` | `isLoading` / `sceneReady` | Loading gate for UI overlays |
| `Index` | `isSpaceView` | Camera mode toggle |
| `PlanetInfo` | `isMinimized` / `isExpanded` | Panel visibility |
| `PlanetNavigation` | `isOpen` / `isExpanded` | Mobile menu + desktop collapsible |
| `SupportChat` | `isOpen` / `messages` | Chat dialog state |

### Three.js Refs (Imperative)

The Three.js scene uses React refs (not state) for mutable 3D objects:

| Ref | Type | Purpose |
|-----|------|---------|
| `mountRef` | `HTMLDivElement` | Canvas mount point |
| `sceneRef` | `THREE.Scene` | Scene graph root |
| `cameraRef` | `THREE.PerspectiveCamera` | View camera |
| `rendererRef` | `THREE.WebGLRenderer` | GPU renderer |
| `controlsRef` | `OrbitControls` | Camera interaction |
| `planetObjectsRef` | `Map<string, PlanetObject>` | Planet mesh registry |
| `frameIdRef` | `number` | requestAnimationFrame ID (for cleanup) |

---

## Design System Architecture

### Token Hierarchy

```
CSS Custom Properties (index.css)
    └── Tailwind Config Mapping (tailwind.config.ts)
        └── Component Classes
            └── Rendered UI
```

### NASA Mission Control Theme

| Token | HSL Value | Use |
|-------|-----------|-----|
| `--nasa-cyan` | `190 85% 50%` | Primary interactive elements, borders, glows |
| `--nasa-gold` | `45 90% 55%` | Warnings, accents |
| `--nasa-red` | `0 75% 55%` | Destructive actions, alerts |
| `--nasa-green` | `145 65% 45%` | Active status indicators |
| `--nasa-panel` | `220 40% 8%` | Panel backgrounds |
| `--nasa-panel-border` | `200 40% 25%` | Panel edges |
| `--nasa-glow` | `200 80% 55%` | Box shadow glow effects |

### Typography

- **Display**: Orbitron (Google Fonts) — mission-critical labels, headers
- **Body**: Exo 2 (Google Fonts) — readable body text, descriptions
- **Telemetry Labels**: Orbitron at 0.6rem, letter-spacing 0.12em, uppercase

---

## Rendering Pipeline

```
1. Mount        → Create Scene, Camera, Renderer
2. Initialize   → Skybox → Stars → Lighting → Solar System
3. Animate      → requestAnimationFrame loop
   ├── Update planet positions (orbital angles)
   ├── Update moon positions (relative to parent)
   ├── Rotate belts
   ├── Move comets
   ├── Update camera (lerp to target or free control)
   └── Render frame
4. Cleanup      → Dispose all GPU resources on unmount
```

### Frame Budget

At 60 FPS, each frame has ~16.6ms. The animation loop:
- Planet position updates: ~0.1ms (8 planets × trigonometry)
- Moon updates: ~0.05ms
- Belt/comet updates: ~0.02ms
- Camera lerp: ~0.01ms
- OrbitControls update: ~0.1ms
- `renderer.render()`: ~2-8ms (GPU bound)

**Total CPU time**: < 1ms per frame. GPU is the bottleneck.

---

## Error Handling Strategy

| Scenario | Handling |
|----------|----------|
| Texture load failure | N/A — all textures are procedural (eliminated the error class) |
| WebGL context loss | Renderer disposal + safety timeout forces UI unlock after 8s |
| Component unmount during animation | `cancelAnimationFrame()` + ref null checks |
| Window resize | Debounce-free resize handler updates camera aspect + renderer size |

---

## Future Architecture Considerations

### Potential Enhancements

1. **React Three Fiber Migration**: Replace imperative Three.js with declarative R3F for better React integration
2. **Web Workers**: Offload orbital calculations to a worker thread
3. **LOD System**: Level-of-detail switching for planets based on camera distance
4. **Real NASA Data**: Integrate JPL Horizons API for real-time ephemeris data
5. **Lovable Cloud Backend**: Add user accounts, saved viewpoints, mission logs
6. **Accessibility**: Screen reader descriptions for planet data, keyboard navigation for 3D scene

### Why Not MCP?

The NASA earthdata-mcp repository is a Python-based MCP (Model Context Protocol) server for querying NASA's Common Metadata Repository — a data catalog with 60,000+ Earth science datasets. It requires:
- Python 3.13+
- PostgreSQL with pgvector
- AWS Lambda infrastructure
- Terraform deployment

This is fundamentally a **backend AI tool server** for dataset discovery, not a frontend visualization component. Integrating it would require a full backend infrastructure that provides no value to a solar system visualization app. The architectures serve entirely different purposes.

---

*Document version: 1.0 | Last updated: 2026-02-18*
