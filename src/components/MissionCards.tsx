import { useState } from 'react';
import { missions, SpacecraftMission } from '@/data/missions';
import { Rocket, ChevronRight, X, Satellite } from 'lucide-react';

const MissionCards = () => {
  const [selectedMission, setSelectedMission] = useState<SpacecraftMission | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-6 right-6 z-20 glass-panel px-3 py-2 flex items-center gap-2 text-xs
          font-mono tracking-wider text-signal hover:text-foreground transition-colors cursor-pointer"
      >
        <Satellite className="w-4 h-4" />
        MISSIONS
      </button>

      {/* Mission list */}
      {isOpen && !selectedMission && (
        <div className="absolute top-16 right-6 z-20 w-72 glass-panel p-4 space-y-2 animate-fade-up max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="display-heading text-sm text-foreground">Spacecraft Missions</h3>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          {missions.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMission(m)}
              className="w-full text-left glass-panel p-3 hover:border-signal/40 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="font-mono text-xs font-bold text-foreground">{m.name}</span>
                <span className={`ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  m.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  m.status === 'completed' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {m.status.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">{m.target}</p>
              <div className="flex items-center justify-between mt-1.5">
                <span className="telemetry-label">{m.agency}</span>
                <ChevronRight className="w-3 h-3 text-signal/50 group-hover:text-signal transition-colors" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Mission detail card */}
      {selectedMission && (
        <div className="absolute top-16 right-6 z-20 w-80 glass-panel p-5 animate-fade-up max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSelectedMission(null)}
              className="text-signal text-xs font-mono hover:text-foreground transition-colors flex items-center gap-1"
            >
              ← BACK
            </button>
            <button onClick={() => { setSelectedMission(null); setIsOpen(false); }} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: selectedMission.color }} />
            <h3 className="display-heading text-base text-foreground">{selectedMission.name}</h3>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="glass-panel p-2 text-center">
              <p className="telemetry-label mb-0.5">AGENCY</p>
              <p className="text-xs text-foreground font-mono">{selectedMission.agency}</p>
            </div>
            <div className="glass-panel p-2 text-center">
              <p className="telemetry-label mb-0.5">LAUNCH</p>
              <p className="text-xs text-foreground font-mono">{selectedMission.launchDate}</p>
            </div>
            <div className="glass-panel p-2 text-center">
              <p className="telemetry-label mb-0.5">TARGET</p>
              <p className="text-xs text-foreground font-mono">{selectedMission.target}</p>
            </div>
            <div className="glass-panel p-2 text-center">
              <p className="telemetry-label mb-0.5">STATUS</p>
              <p className={`text-xs font-mono font-bold ${
                selectedMission.status === 'active' ? 'text-green-400' :
                selectedMission.status === 'completed' ? 'text-amber-400' : 'text-red-400'
              }`}>
                {selectedMission.status.toUpperCase()}
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed mb-4">{selectedMission.description}</p>

          {/* Timeline */}
          <div className="mb-4">
            <h4 className="telemetry-label mb-2">MISSION TIMELINE</h4>
            <div className="space-y-1.5">
              {selectedMission.waypoints.map((wp, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: selectedMission.color }} />
                  <div>
                    <span className="text-[10px] font-mono text-signal/70">{wp.date}</span>
                    {wp.label && <p className="text-[11px] text-foreground/80">{wp.label}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Highlights */}
          <div>
            <h4 className="telemetry-label mb-2">KEY ACHIEVEMENTS</h4>
            <ul className="space-y-1">
              {selectedMission.highlights.map((h, i) => (
                <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                  <Rocket className="w-3 h-3 shrink-0 mt-0.5" style={{ color: selectedMission.color }} />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default MissionCards;
