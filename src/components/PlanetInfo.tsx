import { PlanetData } from '@/data/planets';
import { Card } from '@/components/ui/card';
interface PlanetInfoProps {
  planet: PlanetData;
}
const PlanetInfo = ({
  planet
}: PlanetInfoProps) => {
  return <Card className="info-panel text-white absolute bottom-4 left-4 p-4 w-80 max-w-[calc(100%-64px)] overflow-auto max-h-[calc(100vh-200px)] z-10">
      <h2 className="text-2xl font-bold mb-3">{planet.name}</h2>
      <p className="mb-4 text-space-highlight">{planet.description}</p>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <h3 className="text-xs uppercase text-space-highlight font-medium">Diameter</h3>
          <p>{planet.diameter.toLocaleString()} km</p>
        </div>
        <div>
          <h3 className="text-xs uppercase text-space-highlight font-medium">Distance from Sun</h3>
          <p>{planet.distanceFromSun.toLocaleString()} million km</p>
        </div>
        <div>
          <h3 className="text-xs uppercase text-space-highlight font-medium">Day Length</h3>
          <p>{planet.dayLength} Earth {planet.dayLength === 1 ? 'day' : 'days'}</p>
        </div>
        <div>
          <h3 className="text-xs uppercase text-space-highlight font-medium">Year Length</h3>
          <p>{planet.yearLength.toLocaleString()} Earth days</p>
        </div>
        <div>
          <h3 className="text-xs uppercase text-space-highlight font-medium">Moons</h3>
          <p>{planet.moons}</p>
        </div>
        <div>
          <h3 className="text-xs uppercase text-space-highlight font-medium">Temperature</h3>
          <p>{planet.temperature}</p>
        </div>
      </div>
    </Card>;
};
export default PlanetInfo;