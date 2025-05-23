import { Button } from '@/components/ui/button';
import { PlanetData } from '@/data/planets';
import { RocketIcon } from 'lucide-react';
interface PlanetNavigationProps {
  planets: PlanetData[];
  selectedPlanetId: string;
  onSelectPlanet: (id: string) => void;
  onToggleSpaceView?: () => void;
  isSpaceView?: boolean;
}
const PlanetNavigation = ({
  planets,
  selectedPlanetId,
  onSelectPlanet,
  onToggleSpaceView,
  isSpaceView = false
}: PlanetNavigationProps) => {
  return <div className="info-panel absolute top-4 right-4 p-1 z-10 flex flex-col items-end">
      <h2 className="text-white font-bold mb-3 text-xl">Explore Planets</h2>
      <Button className="w-full mb-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" onClick={onToggleSpaceView}>
        <RocketIcon className="mr-2 h-4 w-4" />
        {isSpaceView ? "Follow Selected Planet" : "Free Space View"}
      </Button>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
        {planets.map(planet => <Button key={planet.id} className={`planet-btn w-full text-left ${selectedPlanetId === planet.id ? 'bg-accent' : ''}`} variant="ghost" onClick={() => onSelectPlanet(planet.id)}>
            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{
          backgroundColor: planet.color
        }} />
            {planet.name}
          </Button>)}
      </div>
    </div>;
};
export default PlanetNavigation;