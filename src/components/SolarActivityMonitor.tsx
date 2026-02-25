import { useState, useEffect } from 'react';
import { Sun, Zap, AlertTriangle, Activity, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SolarEvent {
  id: string;
  type: 'FLR' | 'CME';
  beginTime: string;
  endTime?: string;
  classType?: string;
  speed?: number;
  note?: string;
  link?: string;
}

const SolarActivityMonitor = () => {
  const [events, setEvents] = useState<SolarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSolarData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('solar-activity', {
        method: 'GET',
      });
      if (fnError) throw fnError;
      setEvents(data?.events || []);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch solar data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && events.length === 0 && !loading) {
      fetchSolarData();
    }
  }, [isOpen]);

  const flares = events.filter(e => e.type === 'FLR');
  const cmes = events.filter(e => e.type === 'CME');

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 hidden md:block">
      <button
        onClick={() => setIsOpen(v => !v)}
        className="info-panel rounded-xl px-4 py-2.5 flex items-center gap-2.5 hover:bg-solar/5 transition-all duration-200 group"
      >
        <Sun className="h-3.5 w-3.5 text-solar animate-pulse" />
        <span className="telemetry-label text-solar/80 group-hover:text-solar transition-colors">
          Solar Activity
        </span>
        {events.length > 0 && (
          <span className="telemetry-mono text-solar text-[0.6rem]">
            {events.length}
          </span>
        )}
        {isOpen ? <ChevronUp className="h-3 w-3 text-solar/60" /> : <ChevronDown className="h-3 w-3 text-solar/60" />}
      </button>

      {isOpen && (
        <div className="info-panel rounded-xl mt-2 w-96 max-h-[70vh] overflow-hidden animate-fade-up">
          <div className="px-4 py-3 border-b border-panel-border/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-solar" />
              <span className="display-heading text-sm text-foreground">Solar Activity Monitor</span>
            </div>
            <button onClick={fetchSolarData} disabled={loading} className="telemetry-label text-signal hover:text-signal-glow transition-colors">
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {error && (
            <div className="px-4 py-3 text-alert text-xs flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5" />
              {error}
            </div>
          )}

          {/* Summary */}
          <div className="px-4 py-3 grid grid-cols-2 gap-3 border-b border-panel-border/40">
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-solar" />
              <div>
                <div className="telemetry-label">Solar Flares</div>
                <div className="telemetry-value text-sm">{flares.length}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-alert" />
              <div>
                <div className="telemetry-label">CMEs</div>
                <div className="telemetry-value text-sm">{cmes.length}</div>
              </div>
            </div>
          </div>

          {/* Event list */}
          <div className="max-h-64 overflow-y-auto p-2 space-y-1">
            {events.length === 0 && !loading && (
              <p className="text-center text-muted-foreground text-xs py-4">No recent solar events</p>
            )}
            {events.map(event => (
              <div
                key={event.id}
                className={`rounded-lg px-3 py-2.5 border transition-all duration-200 ${
                  event.type === 'FLR'
                    ? 'border-solar/20 bg-solar/5 hover:bg-solar/10'
                    : 'border-alert/20 bg-alert/5 hover:bg-alert/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {event.type === 'FLR' ? (
                      <Zap className="h-3 w-3 text-solar" />
                    ) : (
                      <Activity className="h-3 w-3 text-alert" />
                    )}
                    <span className="telemetry-mono text-[0.65rem]">
                      {event.type === 'FLR' ? 'Flare' : 'CME'}
                      {event.classType && ` · ${event.classType}`}
                    </span>
                  </div>
                  {event.link && (
                    <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-signal">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <div className="mt-1.5 flex items-center gap-3">
                  <span className="telemetry-label text-[0.52rem]">
                    {new Date(event.beginTime).toLocaleString()}
                  </span>
                  {event.speed && (
                    <span className="telemetry-label text-alert/80 text-[0.52rem]">
                      {Math.round(event.speed)} km/s
                    </span>
                  )}
                </div>
                {event.note && (
                  <p className="text-muted-foreground text-[0.6rem] mt-1 line-clamp-2">{event.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SolarActivityMonitor;
