import { useState, useRef, useEffect } from 'react';
import { PlanetData } from '@/data/planets';
import { Search, X, Crosshair } from 'lucide-react';

interface PlanetSearchProps {
  planets: PlanetData[];
  onSelectPlanet: (id: string) => void;
  onHighlightPlanet: (id: string | null) => void;
}

const PlanetSearch = ({ planets, onSelectPlanet, onHighlightPlanet }: PlanetSearchProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? planets.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  useEffect(() => {
    if (filtered.length === 1) {
      onHighlightPlanet(filtered[0].id);
    } else {
      onHighlightPlanet(null);
    }
  }, [query]);

  const handleSelect = (id: string) => {
    onSelectPlanet(id);
    setQuery('');
    setIsFocused(false);
    onHighlightPlanet(null);
    inputRef.current?.blur();
  };

  const showDropdown = isFocused && query.trim().length > 0;

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-80">
      <div className={`info-panel rounded-xl overflow-hidden transition-all duration-300 ${
        isFocused ? 'shadow-[0_0_0_1px_hsl(188_100%_50%/0.35),0_0_20px_hsl(188_100%_50%/0.1)]' : ''
      }`}>
        {/* Input row */}
        <div className="flex items-center gap-3 px-4 py-3">
          <Search className="h-3.5 w-3.5 text-signal/60 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Search celestial bodies..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none font-body tracking-wide"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); onHighlightPlanet(null); }}
              className="text-muted-foreground hover:text-signal transition-colors p-0.5 rounded"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Results */}
        {showDropdown && filtered.length > 0 && (
          <div className="border-t border-panel-border/60 p-1.5 space-y-0.5">
            {filtered.map(planet => (
              <button
                key={planet.id}
                onMouseDown={() => handleSelect(planet.id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-signal/8 transition-colors duration-150 group"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: planet.color, boxShadow: `0 0 8px ${planet.color}80` }}
                />
                <span className="flex-1 text-sm text-foreground font-body">{planet.name}</span>
                <Crosshair className="h-3.5 w-3.5 text-signal opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        )}

        {showDropdown && filtered.length === 0 && (
          <div className="border-t border-panel-border/60 px-4 py-3">
            <p className="text-xs text-muted-foreground text-center font-body">No celestial body found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanetSearch;
