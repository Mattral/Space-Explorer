import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, RefreshCw, Globe } from 'lucide-react';

interface NeoObject {
  id: string;
  name: string;
  estimated_diameter_min_m: number;
  estimated_diameter_max_m: number;
  close_approach_date: string;
  miss_distance_km: number;
  miss_distance_lunar: number;
  relative_velocity_kph: number;
  is_potentially_hazardous: boolean;
  nasa_jpl_url: string;
}

const NeoTracker = () => {
  const [neos, setNeos] = useState<NeoObject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNeos = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('neo-tracker');
      if (fnError) throw fnError;
      if (data?.neos) setNeos(data.neos);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch NEO data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && neos.length === 0 && !loading) fetchNeos();
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-6 right-36 z-20 glass-panel px-3 py-2 flex items-center gap-2 text-xs
          font-mono tracking-wider text-signal hover:text-foreground transition-colors cursor-pointer"
      >
        <AlertTriangle className="w-4 h-4" />
        NEO
      </button>

      {isOpen && (
        <div className="absolute top-16 right-36 z-20 w-80 glass-panel p-4 animate-fade-up max-h-[75vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="display-heading text-sm text-foreground">Near-Earth Objects</h3>
            <div className="flex gap-2">
              <button onClick={fetchNeos} className="text-signal hover:text-foreground transition-colors" disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground text-lg">×</button>
            </div>
          </div>

          <p className="telemetry-label mb-3">Top 10 closest upcoming approaches · NASA NeoWs</p>

          {error && (
            <div className="glass-panel p-3 border-red-500/30 text-xs text-red-400 mb-3">{error}</div>
          )}

          {loading && neos.length === 0 && (
            <div className="text-center py-8">
              <Globe className="w-6 h-6 text-signal/50 mx-auto animate-spin mb-2" />
              <p className="telemetry-label">Fetching NEO data from NASA...</p>
            </div>
          )}

          <div className="space-y-2">
            {neos.map((neo) => (
              <div
                key={neo.id}
                className={`glass-panel p-3 ${neo.is_potentially_hazardous ? 'border-red-500/30' : 'border-panel-border'}`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {neo.is_potentially_hazardous && (
                    <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                  )}
                  <span className="font-mono text-xs font-bold text-foreground truncate">{neo.name}</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div>
                    <span className="telemetry-label">APPROACH</span>
                    <p className="text-foreground/80 font-mono">{neo.close_approach_date}</p>
                  </div>
                  <div>
                    <span className="telemetry-label">MISS DIST</span>
                    <p className="text-foreground/80 font-mono">{neo.miss_distance_lunar.toFixed(1)} LD</p>
                  </div>
                  <div>
                    <span className="telemetry-label">DIAMETER</span>
                    <p className="text-foreground/80 font-mono">
                      {neo.estimated_diameter_min_m.toFixed(0)}–{neo.estimated_diameter_max_m.toFixed(0)} m
                    </p>
                  </div>
                  <div>
                    <span className="telemetry-label">VELOCITY</span>
                    <p className="text-foreground/80 font-mono">{(neo.relative_velocity_kph / 1000).toFixed(1)} km/s</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {neos.length > 0 && (
            <p className="telemetry-label mt-3 text-center opacity-50">
              Data: NASA Center for Near Earth Object Studies
            </p>
          )}
        </div>
      )}
    </>
  );
};

export default NeoTracker;
