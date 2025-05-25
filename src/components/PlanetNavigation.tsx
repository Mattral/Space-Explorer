
import { Button } from '@/components/ui/button';
import { PlanetData } from '@/data/planets';
import { RocketIcon, MenuIcon, XIcon, ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <div className="md:hidden absolute top-4 right-4 z-30">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="sm"
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          {isOpen ? <XIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation panel - Redesigned with collapsible sections */}
      <div className={`absolute top-4 right-4 z-20 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
      } md:translate-x-0`}>
        
        {/* Desktop version - Always visible with collapsible content */}
        <div className="hidden md:block">
          <div className="info-panel p-3 max-w-xs">
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between text-white hover:bg-white/10 p-2"
                >
                  <span className="font-bold text-lg">Explore Planets</span>
                  <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${
                    isExpanded ? 'transform rotate-180' : ''
                  }`} />
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-3 mt-3">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-sm" 
                  onClick={onToggleSpaceView}
                >
                  <RocketIcon className="mr-2 h-4 w-4" />
                  {isSpaceView ? "Follow Selected Planet" : "Free Space View"}
                </Button>
                
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                  {planets.map(planet => (
                    <Button 
                      key={planet.id} 
                      className={`planet-btn w-full text-left text-sm justify-start ${
                        selectedPlanetId === planet.id ? 'bg-accent text-accent-foreground' : 'text-white hover:bg-white/10'
                      }`} 
                      variant="ghost" 
                      onClick={() => onSelectPlanet(planet.id)}
                    >
                      <span 
                        className="inline-block w-3 h-3 rounded-full mr-3 flex-shrink-0" 
                        style={{ backgroundColor: planet.color }} 
                      />
                      <span className="truncate">{planet.name}</span>
                    </Button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* Mobile version - Slide out panel */}
        <div className="md:hidden">
          <div className="info-panel p-4 w-72 max-h-96 overflow-y-auto">
            <h2 className="text-white font-bold mb-4 text-lg">Explore Planets</h2>
            
            <Button 
              className="w-full mb-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-sm" 
              onClick={() => {
                onToggleSpaceView?.();
                setIsOpen(false);
              }}
            >
              <RocketIcon className="mr-2 h-4 w-4" />
              {isSpaceView ? "Follow Planet" : "Free View"}
            </Button>
            
            <div className="grid grid-cols-1 gap-2">
              {planets.map(planet => (
                <Button 
                  key={planet.id} 
                  className={`planet-btn w-full text-left text-sm justify-start ${
                    selectedPlanetId === planet.id ? 'bg-accent text-accent-foreground' : 'text-white hover:bg-white/10'
                  }`} 
                  variant="ghost" 
                  onClick={() => {
                    onSelectPlanet(planet.id);
                    setIsOpen(false);
                  }}
                >
                  <span 
                    className="inline-block w-3 h-3 rounded-full mr-3 flex-shrink-0" 
                    style={{ backgroundColor: planet.color }} 
                  />
                  <span className="truncate">{planet.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlanetNavigation;
