
import { PlanetData } from '@/data/planets';
import { Card } from '@/components/ui/card';
import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface PlanetInfoProps {
  planet: PlanetData;
}

const PlanetInfo = ({ planet }: PlanetInfoProps) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <>
      {/* Mobile minimize button */}
      <div className="md:hidden absolute bottom-4 left-4 z-30">
        <Button
          onClick={() => setIsMinimized(!isMinimized)}
          size="sm"
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-xs"
        >
          {isMinimized ? planet.name : <ChevronDownIcon className="h-3 w-3" />}
        </Button>
      </div>

      {/* Info panel */}
      <div className={`absolute bottom-4 left-4 z-20 transition-transform duration-300 ${
        isMinimized ? 'translate-y-full md:translate-y-0' : 'translate-y-0'
      } md:translate-y-0`}>
        
        {/* Desktop version - Collapsible */}
        <div className="hidden md:block">
          <Card className="info-panel text-white max-w-sm">
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between text-white hover:bg-white/10 p-4 rounded-none rounded-t-lg"
                >
                  <h2 className="text-xl font-bold">{planet.name}</h2>
                  {isExpanded ? (
                    <ChevronUpIcon className="h-5 w-5" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="p-4 pt-0">
                  <p className="mb-4 text-space-highlight text-sm">{planet.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
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
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>

        {/* Mobile version */}
        <div className="md:hidden">
          <Card className="info-panel text-white w-72 max-w-[calc(100vw-64px)] max-h-[60vh] overflow-auto">
            <div className="p-3">
              <h2 className="text-lg font-bold mb-2">{planet.name}</h2>
              <p className="mb-3 text-space-highlight text-sm">{planet.description}</p>
              
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-space-highlight">Diameter:</span>
                  <span>{planet.diameter.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-space-highlight">Distance:</span>
                  <span>{planet.distanceFromSun.toLocaleString()} M km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-space-highlight">Day:</span>
                  <span>{planet.dayLength} Earth {planet.dayLength === 1 ? 'day' : 'days'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-space-highlight">Year:</span>
                  <span>{planet.yearLength.toLocaleString()} Earth days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-space-highlight">Moons:</span>
                  <span>{planet.moons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-space-highlight">Temperature:</span>
                  <span>{planet.temperature}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PlanetInfo;
