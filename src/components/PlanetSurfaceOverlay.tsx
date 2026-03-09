import { PlanetData } from '@/data/planets';
import { planetSurfaceData } from '@/data/planetSurface';
import { Mountain, Wind, Magnet, X } from 'lucide-react';
import { useState } from 'react';

interface PlanetSurfaceOverlayProps {
  planet: PlanetData;
  onClose: () => void;
}

const PlanetSurfaceOverlay = ({ planet, onClose }: PlanetSurfaceOverlayProps) => {
  const data = planetSurfaceData[planet.id];
  const [activeTab, setActiveTab] = useState<'geology' | 'atmosphere' | 'magnetic'>('geology');

  if (!data) return null;

  const tabs = [
    { key: 'geology' as const, label: 'Geology', icon: Mountain },
    { key: 'atmosphere' as const, label: 'Atmosphere', icon: Wind },
    { key: 'magnetic' as const, label: 'Mag Field', icon: Magnet },
  ];

  return (
    <div className="absolute bottom-6 left-6 z-30 w-96 max-w-[calc(100vw-3rem)] animate-fade-up">
      <div className="info-panel rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-panel-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: planet.color, boxShadow: `0 0 6px ${planet.color}` }} />
            <span className="display-heading text-sm text-foreground">{planet.name} Surface Analysis</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-signal/10 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-panel-border/40">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[0.65rem] tracking-widest uppercase font-mono transition-all ${
                activeTab === key
                  ? 'text-signal border-b-2 border-signal bg-signal/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-signal/5'
              }`}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 max-h-64 overflow-y-auto">
          {activeTab === 'geology' && (
            <div className="space-y-3">
              {data.geologicalFeatures.map((feature, i) => (
                <div key={i} className="group">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="w-1 h-1 rounded-full bg-signal/60" />
                    <span className="text-xs font-medium text-foreground">{feature.name}</span>
                    <span className="telemetry-label text-[0.6rem] px-1.5 py-0.5 rounded bg-signal/10 text-signal/80">{feature.type}</span>
                  </div>
                  <p className="text-[0.68rem] text-muted-foreground ml-3 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'atmosphere' && (
            <div className="space-y-3">
              {/* Bar chart */}
              <div className="space-y-2">
                {data.atmosphere.map((comp, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-foreground">{comp.name}</span>
                      <span className="telemetry-label text-[0.6rem]">{comp.percentage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-panel-border/30 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.max(comp.percentage, 1)}%`,
                          backgroundColor: comp.color,
                          boxShadow: `0 0 6px ${comp.color}40`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {/* Pressure note */}
              <p className="telemetry-label text-[0.6rem] mt-2 opacity-60">
                {planet.id === 'venus' ? 'Surface pressure: 92 atm (9.3 MPa)' :
                 planet.id === 'earth' ? 'Surface pressure: 1 atm (101.3 kPa)' :
                 planet.id === 'mars' ? 'Surface pressure: 0.006 atm (610 Pa)' :
                 'No solid surface — pressure increases with depth'}
              </p>
            </div>
          )}

          {activeTab === 'magnetic' && (
            <div className="space-y-4">
              {/* Field visualization */}
              <div className="relative h-36 flex items-center justify-center">
                <MagneticFieldVis type={data.magneticField.type} tilt={data.magneticField.tilt} color={planet.color} />
              </div>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="telemetry-label text-[0.55rem] mb-0.5">Strength</p>
                  <p className="text-xs font-medium text-foreground">{data.magneticField.strength}</p>
                </div>
                <div className="text-center">
                  <p className="telemetry-label text-[0.55rem] mb-0.5">Type</p>
                  <p className="text-xs font-medium text-foreground capitalize">{data.magneticField.type}</p>
                </div>
                <div className="text-center">
                  <p className="telemetry-label text-[0.55rem] mb-0.5">Tilt</p>
                  <p className="text-xs font-medium text-foreground">{data.magneticField.tilt}°</p>
                </div>
              </div>
              <p className="text-[0.68rem] text-muted-foreground leading-relaxed">{data.magneticField.description}</p>
            </div>
          )}
        </div>

        {/* Footer shortcut hint */}
        <div className="px-4 py-2 border-t border-panel-border/40 flex items-center justify-center gap-4">
          <span className="telemetry-label text-[0.55rem] opacity-50">ESC exit · SPACE toggle · ←→ cycle</span>
        </div>
      </div>
    </div>
  );
};

/** SVG magnetic field line visualization */
const MagneticFieldVis = ({ type, tilt, color }: { type: string; tilt: number; color: string }) => {
  const lines = type === 'quadrupole' ? 6 : type === 'dipole' ? 4 : 0;

  if (type === 'none' || lines === 0) {
    return (
      <div className="flex flex-col items-center gap-2 opacity-50">
        <Magnet className="h-8 w-8 text-muted-foreground" />
        <span className="telemetry-label text-[0.6rem]">No intrinsic field</span>
      </div>
    );
  }

  return (
    <svg viewBox="0 0 200 140" className="w-full h-full">
      <g transform={`rotate(${tilt}, 100, 70)`}>
        {/* Planet circle */}
        <circle cx="100" cy="70" r="16" fill={color} opacity="0.3" />
        <circle cx="100" cy="70" r="14" fill={color} opacity="0.6" />
        {/* Axis line */}
        <line x1="100" y1="10" x2="100" y2="130" stroke={color} strokeWidth="0.5" opacity="0.3" strokeDasharray="3,3" />
        {/* Field lines */}
        {Array.from({ length: lines }).map((_, i) => {
          const side = i % 2 === 0 ? 1 : -1;
          const spread = 20 + (Math.floor(i / 2)) * 18;
          const height = 35 + (Math.floor(i / 2)) * 12;
          return (
            <path
              key={i}
              d={`M 100 ${70 - 14} Q ${100 + side * spread} ${70 - height} ${100 + side * spread * 0.6} 70 Q ${100 + side * spread} ${70 + height} 100 ${70 + 14}`}
              fill="none"
              stroke={color}
              strokeWidth="1"
              opacity={0.4 - i * 0.05}
            >
              <animate attributeName="stroke-opacity" values="0.2;0.5;0.2" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
            </path>
          );
        })}
        {/* N/S labels */}
        <text x="100" y="8" textAnchor="middle" fill={color} fontSize="7" opacity="0.6">N</text>
        <text x="100" y="138" textAnchor="middle" fill={color} fontSize="7" opacity="0.6">S</text>
      </g>
    </svg>
  );
};

export default PlanetSurfaceOverlay;
