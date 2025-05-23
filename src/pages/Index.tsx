
import { useState, useEffect } from 'react';
import PlanetScene from '@/components/PlanetScene';
import PlanetInfo from '@/components/PlanetInfo';
import PlanetNavigation from '@/components/PlanetNavigation';
import { planets } from '@/data/planets';
import { toast } from '@/components/ui/use-toast';
import SupportChat from '@/components/SupportChat';

const Index = () => {
  const [selectedPlanetId, setSelectedPlanetId] = useState('earth');
  const [isLoading, setIsLoading] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);
  const [isSpaceView, setIsSpaceView] = useState(false);
  
  // Find the currently selected planet
  const selectedPlanet = planets.find(p => p.id === selectedPlanetId) || planets[2]; // Default to Earth
  
  // Handle planet selection
  const handleSelectPlanet = (id: string) => {
    if (id === selectedPlanetId) return; // Don't reload if already selected
    setIsLoading(true);
    setSceneReady(false);
    setSelectedPlanetId(id);
  };

  // Handle scene ready
  const handleSceneReady = () => {
    setSceneReady(true);
    setIsLoading(false);
  };
  
  // Handle space view toggle
  const handleToggleSpaceView = () => {
    setIsSpaceView(!isSpaceView);
    toast({
      title: isSpaceView ? "Following planet" : "Free space navigation",
      description: isSpaceView ? "Camera will now follow the selected planet" : "You can now freely navigate space",
      duration: 3000,
    });
  };
  
  // Show a welcome toast on first load
  useEffect(() => {
    toast({
      title: "Welcome to Space Explorer",
      description: "Click on a planet name to explore our solar system!",
      duration: 5000,
    });

    // Set a safety timeout to hide loading screen if something goes wrong
    const safetyTimer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        toast({
          title: "Loading complete",
          description: "Enjoy exploring the planets!",
          duration: 3000,
        });
      }
    }, 8000);

    return () => clearTimeout(safetyTimer);
  }, []);
  
  return (
    <div className="relative overflow-hidden w-full h-screen space-bg">
      <div className="absolute top-8 left-8 z-10">
        <h1 className="text-4xl font-bold text-white">Space Explorer</h1>
        <p className="text-space-highlight">Explore our solar system</p>
      </div>
      
      <PlanetScene 
        planet={selectedPlanet} 
        planets={planets}
        onSceneReady={handleSceneReady}
        isSpaceView={isSpaceView}
      />
      
      {sceneReady && <PlanetInfo planet={selectedPlanet} />}
      
      <PlanetNavigation 
        planets={planets} 
        selectedPlanetId={selectedPlanetId} 
        onSelectPlanet={handleSelectPlanet}
        onToggleSpaceView={handleToggleSpaceView}
        isSpaceView={isSpaceView}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-space-dark bg-opacity-70 z-20">
          <div className="text-white text-xl animate-float">
            Exploring {selectedPlanet.name}...
          </div>
        </div>
      )}

      <SupportChat />
    </div>
  );
};

export default Index;
