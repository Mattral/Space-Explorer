import { PlanetData } from '@/data/planets';
import { RocketIcon, GitCompareArrows, ChevronRightIcon, Crosshair, Eye, Sun, AlertTriangle, Satellite } from 'lucide-react';
import { useState } from 'react';

interface PlanetNavigationProps {
  planets: PlanetData[];
  selectedPlanetId: string;
  onSelectPlanet: (id: string) => void;
  onToggleSpaceView?: () => void;
  isSpaceView?: boolean;
  onOpenComparison?: () => void;
  onCloseUp?: (planetId: string) => void;
}

const PlanetNavigation = ({
  planets, selectedPlanetId, onSelectPlanet, onToggleSpaceView, isSpaceView = false, onOpenComparison, onCloseUp
}: PlanetNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'planets' | 'tools'>('planets');

  return (
    <>
      {/* ── Desktop right-side panel ─────────────────────────── */}
      <div className="hidden md:flex absolute top-6 right-6 z-20 flex-col gap-2 animate-fade-in">
        {/* Action buttons */}
        <div className="info-panel rounded-xl p-3 flex flex-col gap-2">
          <button
            onClick={onToggleSpaceView}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-body transition-all duration-200 border ${
              isSpaceView
                ? 'bg-signal/15 border-signal/40 text-signal'
                : 'bg-transparent border-panel-border hover:bg-signal/8 hover:border-signal/30 text-muted-foreground hover:text-signal'
            }`}
          >
            <RocketIcon className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="tracking-wider uppercase font-mono text-[0.62rem]">
              {isSpaceView ? 'Lock Target' : 'Free Nav'}
            </span>
          </button>
          <button
            onClick={onOpenComparison}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-body transition-all duration-200 border border-panel-border hover:bg-accent/10 hover:border-accent/40 text-muted-foreground hover:text-accent"
          >
            <GitCompareArrows className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="tracking-wider uppercase font-mono text-[0.62rem]">Compare</span>
          </button>
        </div>

        {/* Planet list */}
        <div className="info-panel rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-panel-border/60">
            <p className="telemetry-label flex items-center gap-2">
              <span className="status-dot-signal" />
              Solar System Bodies
            </p>
          </div>
          <div className="p-1.5 space-y-0.5 max-h-72 overflow-y-auto">
            {planets.map(planet => {
              const isSelected = planet.id === selectedPlanetId;
              return (
                <div key={planet.id} className="flex items-center gap-0.5">
                  <button
                    onClick={() => onSelectPlanet(planet.id)}
                    className={`planet-btn flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                      isSelected ? 'active' : ''
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300"
                      style={{
                        backgroundColor: planet.color,
                        boxShadow: isSelected ? `0 0 8px ${planet.color}` : 'none',
                      }}
                    />
                    <span className={`flex-1 text-xs tracking-wide font-body ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {planet.name}
                    </span>
                    {isSelected && (
                      <Crosshair className="h-3 w-3 text-signal opacity-70 flex-shrink-0" />
                    )}
                  </button>
                  {isSelected && (
                    <button
                      onClick={() => onCloseUp?.(planet.id)}
                      className="p-1.5 rounded-lg hover:bg-signal/20 text-signal/60 hover:text-signal transition-colors"
                      title="Close-up view"
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Mobile: floating button + slide drawer ─────────────── */}
      <div className="md:hidden absolute top-4 right-4 z-30">
        <button
          onClick={() => setIsOpen(v => !v)}
          className="info-panel rounded-xl w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-signal transition-colors"
        >
          {isOpen ? (
            <ChevronRightIcon className="h-4 w-4" />
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-16 right-4 z-30 w-72 animate-fade-up">
          <div className="info-panel rounded-xl overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-panel-border/60">
              <button
                onClick={() => setMobileTab('planets')}
                className={`flex-1 px-3 py-2.5 text-[0.65rem] tracking-widest uppercase font-mono flex items-center justify-center gap-1.5 transition-all ${
                  mobileTab === 'planets' ? 'text-signal border-b-2 border-signal' : 'text-muted-foreground'
                }`}
              >
                <Crosshair className="h-3 w-3" /> Planets
              </button>
              <button
                onClick={() => setMobileTab('tools')}
                className={`flex-1 px-3 py-2.5 text-[0.65rem] tracking-widest uppercase font-mono flex items-center justify-center gap-1.5 transition-all ${
                  mobileTab === 'tools' ? 'text-signal border-b-2 border-signal' : 'text-muted-foreground'
                }`}
              >
                <Satellite className="h-3 w-3" /> Tools
              </button>
            </div>

            {mobileTab === 'planets' && (
              <div className="p-3 space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => { onToggleSpaceView?.(); setIsOpen(false); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[0.65rem] tracking-widest uppercase font-mono border transition-all duration-200 ${
                      isSpaceView
                        ? 'bg-signal/15 border-signal/40 text-signal'
                        : 'border-panel-border text-muted-foreground hover:text-signal hover:border-signal/30'
                    }`}
                  >
                    <RocketIcon className="h-3 w-3" />
                    {isSpaceView ? 'Lock' : 'Free'}
                  </button>
                  <button
                    onClick={() => { onOpenComparison?.(); setIsOpen(false); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[0.65rem] tracking-widest uppercase font-mono border border-panel-border text-muted-foreground hover:text-accent hover:border-accent/30 transition-all duration-200"
                  >
                    <GitCompareArrows className="h-3 w-3" />
                    Compare
                  </button>
                </div>

                <div className="space-y-0.5 max-h-64 overflow-y-auto">
                  {planets.map(planet => {
                    const isSelected = planet.id === selectedPlanetId;
                    return (
                      <button
                        key={planet.id}
                        onClick={() => { onSelectPlanet(planet.id); setIsOpen(false); }}
                        className={`planet-btn w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${isSelected ? 'active' : ''}`}
                      >
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: planet.color, boxShadow: isSelected ? `0 0 8px ${planet.color}` : 'none' }} />
                        <span className={`flex-1 text-xs font-body ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{planet.name}</span>
                        {isSelected && <Crosshair className="h-3 w-3 text-signal opacity-70" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {mobileTab === 'tools' && (
              <div className="p-3 space-y-2">
                <MobileToolLink icon={<Sun className="h-3.5 w-3.5 text-solar" />} label="Solar Activity" desc="Live flares & CMEs" />
                <MobileToolLink icon={<AlertTriangle className="h-3.5 w-3.5 text-alert" />} label="Near-Earth Objects" desc="Asteroid tracker" />
                <MobileToolLink icon={<Satellite className="h-3.5 w-3.5 text-signal" />} label="Missions" desc="Spacecraft explorer" />
                <p className="telemetry-label text-center pt-2 opacity-50">
                  Open on desktop for full panels
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const MobileToolLink = ({ icon, label, desc }: { icon: React.ReactNode; label: string; desc: string }) => (
  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-panel-border/40 bg-panel-bg/30">
    {icon}
    <div>
      <p className="text-xs text-foreground font-medium">{label}</p>
      <p className="text-[0.6rem] text-muted-foreground">{desc}</p>
    </div>
  </div>
);

export default PlanetNavigation;
