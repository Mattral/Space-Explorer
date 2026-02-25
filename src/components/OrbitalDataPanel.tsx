import { useEffect, useState } from 'react';
import { PlanetData } from '@/data/planets';
import { calculatePosition, dateToJD, orbitalElements } from '@/data/keplerOrbits';

interface OrbitalDataPanelProps {
  planet: PlanetData;
}

const OrbitalDataPanel = ({ planet }: OrbitalDataPanelProps) => {
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const update = () => {
      const jd = dateToJD(new Date());
      const pos = calculatePosition(planet.id, jd);
      setPosition(pos);
      setDistance(Math.sqrt(pos[0] ** 2 + pos[1] ** 2 + pos[2] ** 2));
    };
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [planet.id]);

  const elem = orbitalElements[planet.id];
  if (!elem) return null;

  const rows = [
    { label: 'Semi-major Axis', value: `${elem.a.toFixed(4)} AU` },
    { label: 'Eccentricity', value: elem.e.toFixed(6) },
    { label: 'Inclination', value: `${elem.i.toFixed(4)}°` },
    { label: 'Distance (now)', value: `${distance.toFixed(4)} AU` },
  ];

  return (
    <div className="rounded-lg border border-signal/15 bg-signal/5 p-3 space-y-2.5 animate-fade-in">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {rows.map(r => (
          <div key={r.label}>
            <div className="telemetry-label">{r.label}</div>
            <div className="telemetry-mono">{r.value}</div>
          </div>
        ))}
        <div className="col-span-2">
          <div className="telemetry-label">Heliocentric Position (AU)</div>
          <div className="telemetry-mono">
            X {position[0].toFixed(3)} · Y {position[1].toFixed(3)} · Z {position[2].toFixed(3)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrbitalDataPanel;
