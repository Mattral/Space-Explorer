import { useState } from 'react';
import { PlanetData } from '@/data/planets';
import { Button } from '@/components/ui/button';
import { X, GitCompareArrows } from 'lucide-react';

interface PlanetComparisonProps {
  planets: PlanetData[];
  isOpen: boolean;
  onClose: () => void;
}

const PlanetComparison = ({ planets, isOpen, onClose }: PlanetComparisonProps) => {
  const [planetA, setPlanetA] = useState<string>('earth');
  const [planetB, setPlanetB] = useState<string>('mars');

  if (!isOpen) return null;

  const a = planets.find(p => p.id === planetA)!;
  const b = planets.find(p => p.id === planetB)!;

  const metrics = [
    { label: 'Diameter', key: 'diameter', unit: 'km', format: (v: number) => v.toLocaleString() },
    { label: 'Distance from Sun', key: 'distanceFromSun', unit: 'M km', format: (v: number) => v.toLocaleString() },
    { label: 'Day Length', key: 'dayLength', unit: 'Earth days', format: (v: number) => v.toString() },
    { label: 'Year Length', key: 'yearLength', unit: 'Earth days', format: (v: number) => v.toLocaleString() },
    { label: 'Moons', key: 'moons', unit: '', format: (v: number) => v.toString() },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm animate-fade-in">
      <div className="info-panel rounded-xl w-[90vw] max-w-2xl max-h-[85vh] overflow-auto relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <GitCompareArrows className="h-5 w-5 text-nasa-cyan" />
            <h2 className="font-display text-lg tracking-widest uppercase text-foreground">
              Comparison Mode
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Planet selectors */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[{ value: planetA, setter: setPlanetA }, { value: planetB, setter: setPlanetB }].map((sel, idx) => (
            <div key={idx}>
              <div className="telemetry-label mb-2">{idx === 0 ? 'Body A' : 'Body B'}</div>
              <select
                value={sel.value}
                onChange={(e) => sel.setter(e.target.value)}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {planets.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Comparison headers */}
        <div className="grid grid-cols-[1fr_1fr_auto_1fr] gap-2 items-center mb-3 px-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: a.color, boxShadow: `0 0 8px ${a.color}60` }} />
            <span className="font-display text-sm tracking-wider text-foreground">{a.name}</span>
          </div>
          <div />
          <div className="text-center">
            <span className="telemetry-label">Metric</span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className="font-display text-sm tracking-wider text-foreground">{b.name}</span>
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: b.color, boxShadow: `0 0 8px ${b.color}60` }} />
          </div>
        </div>

        {/* Data rows */}
        <div className="space-y-1">
          {metrics.map((m) => {
            const valA = (a as any)[m.key] as number;
            const valB = (b as any)[m.key] as number;
            const maxVal = Math.max(valA, valB);
            const barA = maxVal > 0 ? (valA / maxVal) * 100 : 50;
            const barB = maxVal > 0 ? (valB / maxVal) * 100 : 50;

            return (
              <div key={m.key} className="bg-muted/30 rounded-md px-3 py-2.5">
                <div className="text-center mb-1.5">
                  <span className="telemetry-label">{m.label}</span>
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                  {/* Left bar */}
                  <div className="flex items-center gap-2">
                    <span className="telemetry-value text-xs whitespace-nowrap">{m.format(valA)}</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${barA}%`,
                          backgroundColor: a.color,
                          boxShadow: `0 0 6px ${a.color}40`,
                        }}
                      />
                    </div>
                  </div>

                  <span className="text-[10px] text-muted-foreground font-body">{m.unit}</span>

                  {/* Right bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ml-auto"
                        style={{
                          width: `${barB}%`,
                          backgroundColor: b.color,
                          boxShadow: `0 0 6px ${b.color}40`,
                        }}
                      />
                    </div>
                    <span className="telemetry-value text-xs whitespace-nowrap">{m.format(valB)}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Temperature (string comparison) */}
          <div className="bg-muted/30 rounded-md px-3 py-2.5">
            <div className="text-center mb-1.5">
              <span className="telemetry-label">Temperature</span>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
              <span className="telemetry-value text-xs text-center">{a.temperature}</span>
              <span className="text-[10px] text-muted-foreground">vs</span>
              <span className="telemetry-value text-xs text-center">{b.temperature}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanetComparison;
