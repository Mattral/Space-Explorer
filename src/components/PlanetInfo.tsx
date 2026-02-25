import { PlanetData } from '@/data/planets';
import { ChevronUpIcon, ChevronDownIcon, Activity, Globe, Clock, Thermometer, Orbit } from 'lucide-react';
import { useState } from 'react';
import OrbitalDataPanel from '@/components/OrbitalDataPanel';

interface PlanetInfoProps {
  planet: PlanetData;
}

const stats = (planet: PlanetData) => [
  { label: 'Diameter', value: `${planet.diameter.toLocaleString()} km`, icon: Globe, pct: Math.min(planet.diameter / 150000, 1) },
  { label: 'Distance from Sun', value: `${planet.distanceFromSun.toLocaleString()} M km`, icon: Orbit, pct: Math.min(planet.distanceFromSun / 5000, 1) },
  { label: 'Day Length', value: `${planet.dayLength} Earth d`, icon: Clock, pct: null },
  { label: 'Year Length', value: `${planet.yearLength.toLocaleString()} Earth d`, icon: Clock, pct: null },
  { label: 'Moons', value: `${planet.moons}`, icon: Activity, pct: Math.min(planet.moons / 90, 1) },
  { label: 'Surface Temp', value: planet.temperature, icon: Thermometer, pct: null },
];

const PlanetInfo = ({ planet }: PlanetInfoProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showOrbital, setShowOrbital] = useState(false);

  const planetStats = stats(planet);

  return (
    <div className="absolute bottom-6 left-6 z-20 w-80 max-w-[calc(100vw-3rem)] animate-fade-up">
      <div className="info-panel rounded-xl overflow-hidden">

        {/* Header */}
        <button
          onClick={() => setIsExpanded(v => !v)}
          className="w-full flex items-center gap-3 px-5 py-4 hover:bg-signal/5 transition-colors duration-200 group"
        >
          {/* Planet color orb with glow */}
          <span
          className="w-4 h-4 rounded-full flex-shrink-0 transition-all duration-300"
            style={{
              backgroundColor: planet.color,
              boxShadow: `0 0 12px ${planet.color}90, 0 0 24px ${planet.color}40, 0 0 0 2px ${planet.color}30`,
            }}
          />
          <div className="flex-1 text-left">
            <h2 className="display-heading text-lg text-foreground leading-none">{planet.name}</h2>
            <p className="telemetry-label mt-0.5">Celestial Body · Class {planet.moons > 10 ? 'Gas Giant' : planet.moons > 0 ? 'Terrestrial' : 'Inner Planet'}</p>
          </div>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <span className="status-dot" />
            {isExpanded
              ? <ChevronUpIcon className="h-4 w-4 text-muted-foreground group-hover:text-signal transition-colors" />
              : <ChevronDownIcon className="h-4 w-4 text-muted-foreground group-hover:text-signal transition-colors" />
            }
          </div>
        </button>

        {isExpanded && (
          <div className="px-5 pb-5 space-y-4">
            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed font-body border-l-2 border-signal/30 pl-3">
              {planet.description}
            </p>

            {/* Stats grid */}
            <div className="space-y-2.5">
              <div className="telemetry-label flex items-center gap-2">
                <span className="inline-block w-4 h-px bg-signal/50" />
                Telemetry Data
                <span className="inline-block flex-1 h-px bg-signal/20" />
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {planetStats.map((stat) => (
                  <div key={stat.label} className="space-y-1">
                    <div className="telemetry-label">{stat.label}</div>
                    <div className="telemetry-value text-sm">{stat.value}</div>
                    {stat.pct !== null && (
                      <div className="data-bar mt-1">
                        <div
                          className="data-bar-fill"
                          style={{ width: `${stat.pct * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Orbital mechanics toggle */}
            <button
              onClick={() => setShowOrbital(v => !v)}
              className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-signal/5 hover:bg-signal/10 border border-signal/15 transition-all duration-200"
            >
              <span className="telemetry-label text-signal/90 tracking-wider">
                Orbital Mechanics · Kepler
              </span>
              {showOrbital
                ? <ChevronUpIcon className="h-3.5 w-3.5 text-signal" />
                : <ChevronDownIcon className="h-3.5 w-3.5 text-signal" />
              }
            </button>

            {showOrbital && <OrbitalDataPanel planet={planet} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanetInfo;
