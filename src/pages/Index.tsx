import { useState, useEffect, useRef } from 'react';
import PlanetScene from '@/components/PlanetScene';
import PlanetInfo from '@/components/PlanetInfo';
import PlanetNavigation from '@/components/PlanetNavigation';
import PlanetSearch from '@/components/PlanetSearch';
import PlanetComparison from '@/components/PlanetComparison';
import TimeLapseControls from '@/components/TimeLapseControls';
import AstronomerChat from '@/components/AstronomerChat';
import { planets } from '@/data/planets';
import { toast } from '@/components/ui/use-toast';
import SupportChat from '@/components/SupportChat';
import MissionCards from '@/components/MissionCards';
import NeoTracker from '@/components/NeoTracker';

const Index = () => {
  const [selectedPlanetId, setSelectedPlanetId] = useState('earth');
  const [isLoading, setIsLoading] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);
  const [isSpaceView, setIsSpaceView] = useState(false);
  const [highlightPlanetId, setHighlightPlanetId] = useState<string | null>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [timeScale, setTimeScale] = useState(1);

  const selectedPlanet = planets.find(p => p.id === selectedPlanetId) || planets[2];

  const handleSelectPlanet = (id: string) => {
    if (id === selectedPlanetId) return;
    setIsLoading(true);
    setSceneReady(false);
    setSelectedPlanetId(id);
  };

  const handleSceneReady = () => {
    setSceneReady(true);
    setIsLoading(false);
  };

  const handleToggleSpaceView = () => {
    setIsSpaceView(!isSpaceView);
    toast({
      title: isSpaceView ? "Target Lock Engaged" : "Free Navigation Active",
      description: isSpaceView ? "Camera tracking selected body" : "Manual control enabled — navigate freely",
      duration: 3000,
    });
  };

  useEffect(() => {
    toast({
      title: "Mission Control Online",
      description: "Select a celestial body to begin observation.",
      duration: 5000,
    });

    const safetyTimer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setSceneReady(true);
      }
    }, 8000);

    return () => clearTimeout(safetyTimer);
  }, []);

  return (
    <div className="relative overflow-hidden w-full h-screen bg-background hud-grid">

      {/* ── Top-left: Mission header ─────────────────────────── */}
      <div className="absolute top-6 left-6 z-10 animate-fade-up">
        <div className="flex items-center gap-3 mb-1.5">
          <div className="status-dot" />
          <h1 className="display-heading text-xl tracking-tight text-foreground">
            Space Explorer
          </h1>
          <div className="h-px flex-1 w-20 bg-gradient-to-r from-signal/40 to-transparent" />
        </div>
        <p className="telemetry-label ml-5">
          Solar System Observation Platform · v2.0
        </p>
      </div>

      {/* ── Search ───────────────────────────────────────────── */}
      <PlanetSearch
        planets={planets}
        onSelectPlanet={handleSelectPlanet}
        onHighlightPlanet={setHighlightPlanetId}
      />

      {/* ── 3D Scene ─────────────────────────────────────────── */}
      <PlanetScene
        planet={selectedPlanet}
        planets={planets}
        onSceneReady={handleSceneReady}
        isSpaceView={isSpaceView}
        highlightPlanetId={highlightPlanetId}
        timeScale={timeScale}
      />

      {/* ── Planet info panel ────────────────────────────────── */}
      {sceneReady && <PlanetInfo planet={selectedPlanet} />}

      {/* ── Navigation ───────────────────────────────────────── */}
      <PlanetNavigation
        planets={planets}
        selectedPlanetId={selectedPlanetId}
        onSelectPlanet={handleSelectPlanet}
        onToggleSpaceView={handleToggleSpaceView}
        isSpaceView={isSpaceView}
        onOpenComparison={() => setIsComparisonOpen(true)}
      />

      {/* ── Comparison ───────────────────────────────────────── */}
      <PlanetComparison
        planets={planets}
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
      />

      {/* ── Loading overlay ──────────────────────────────────── */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 z-20 backdrop-blur-sm">
          <div className="text-center space-y-5 animate-fade-up">
            {/* Pulsing planet orb */}
            <div className="relative mx-auto w-16 h-16">
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-20"
                style={{ backgroundColor: selectedPlanet.color }}
              />
              <div
                className="absolute inset-2 rounded-full animate-pulse"
                style={{ backgroundColor: selectedPlanet.color, boxShadow: `0 0 30px ${selectedPlanet.color}60` }}
              />
            </div>

            <div>
              <div className="display-heading text-xl text-foreground tracking-tight">
                Acquiring {selectedPlanet.name}
              </div>
              <p className="telemetry-label mt-2">Initializing telemetry systems...</p>
            </div>

            {/* Scan bar */}
            <div className="w-56 h-px bg-panel-border mx-auto overflow-hidden relative rounded-full">
              <div className="scan-line absolute inset-0" />
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom-right timestamp ───────────────────────────── */}
      <div className="absolute bottom-5 right-5 z-10 hidden md:block text-right">
        <p className="telemetry-label">
          Mission Time · {new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC
        </p>
        <p className="telemetry-label mt-0.5 opacity-50">
          {selectedPlanet.name.toUpperCase()} · LOCK
        </p>
      </div>

      {/* ── Corner HUD brackets ──────────────────────────────── */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-signal/25 pointer-events-none" />
      <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-signal/25 pointer-events-none hidden md:block" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-signal/25 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-signal/25 pointer-events-none" />

      {/* ── Time-lapse controls ───────────────────────────── */}
      {sceneReady && (
        <TimeLapseControls onTimeScaleChange={setTimeScale} />
      )}

      {/* ── Mission Cards ────────────────────────────────── */}
      <MissionCards />

      {/* ── NEO Tracker ──────────────────────────────────── */}
      <NeoTracker />

      {/* ── AI Astronomer ─────────────────────────────────── */}
      <AstronomerChat selectedPlanet={selectedPlanet} />

      <SupportChat />
    </div>
  );
};

export default Index;
