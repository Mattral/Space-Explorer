import { useState } from 'react';
import { Sun, Zap, AlertTriangle, Activity, Satellite, ChevronDown, ChevronUp, ExternalLink, RefreshCw, Globe, Rocket, ChevronRight, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { missions, SpacecraftMission } from '@/data/missions';

/* ── Types ──────────────────────────────────────────────── */
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

type ActivePanel = 'solar' | 'neo' | 'missions' | null;

/* ── Component ──────────────────────────────────────────── */
const SpaceToolbar = () => {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  // Solar state
  const [solarEvents, setSolarEvents] = useState<SolarEvent[]>([]);
  const [solarLoading, setSolarLoading] = useState(false);
  const [solarError, setSolarError] = useState<string | null>(null);

  // NEO state
  const [neos, setNeos] = useState<NeoObject[]>([]);
  const [neoLoading, setNeoLoading] = useState(false);
  const [neoError, setNeoError] = useState<string | null>(null);

  // Missions state
  const [selectedMission, setSelectedMission] = useState<SpacecraftMission | null>(null);

  const toggle = (panel: ActivePanel) => {
    if (activePanel === panel) {
      setActivePanel(null);
      setSelectedMission(null);
    } else {
      setActivePanel(panel);
      setSelectedMission(null);
      if (panel === 'solar' && solarEvents.length === 0 && !solarLoading) fetchSolar();
      if (panel === 'neo' && neos.length === 0 && !neoLoading) fetchNeos();
    }
  };

  /* ── Fetchers ── */
  const fetchSolar = async () => {
    setSolarLoading(true);
    setSolarError(null);
    try {
      const { data, error } = await supabase.functions.invoke('solar-activity', { method: 'GET' });
      if (error) throw error;
      setSolarEvents(data?.events || []);
    } catch (e: any) {
      setSolarError(e.message || 'Failed to fetch solar data');
    } finally {
      setSolarLoading(false);
    }
  };

  const fetchNeos = async () => {
    setNeoLoading(true);
    setNeoError(null);
    try {
      const { data, error } = await supabase.functions.invoke('neo-tracker');
      if (error) throw error;
      if (data?.neos) setNeos(data.neos);
    } catch (e: any) {
      setNeoError(e.message || 'Failed to fetch NEO data');
    } finally {
      setNeoLoading(false);
    }
  };

  const flares = solarEvents.filter(e => e.type === 'FLR');
  const cmes = solarEvents.filter(e => e.type === 'CME');

  return (
    <div className="absolute top-6 left-56 z-20 hidden md:flex flex-col items-start gap-2">
      {/* ── Toolbar buttons ── */}
      <div className="info-panel rounded-xl flex items-center gap-0.5 p-1">
        <ToolbarBtn
          active={activePanel === 'solar'}
          onClick={() => toggle('solar')}
          icon={<Sun className="h-3.5 w-3.5" />}
          label="Solar"
          color="text-solar"
          badge={solarEvents.length > 0 ? solarEvents.length : undefined}
        />
        <ToolbarBtn
          active={activePanel === 'neo'}
          onClick={() => toggle('neo')}
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          label="NEO"
          color="text-alert"
          badge={neos.filter(n => n.is_potentially_hazardous).length || undefined}
        />
        <ToolbarBtn
          active={activePanel === 'missions'}
          onClick={() => toggle('missions')}
          icon={<Satellite className="h-3.5 w-3.5" />}
          label="Missions"
          color="text-signal"
        />
      </div>

      {/* ── Dropdown panel ── */}
      {activePanel && (
        <div className="info-panel rounded-xl w-96 max-h-[75vh] overflow-hidden animate-fade-up mt-0">
          {activePanel === 'solar' && (
            <SolarPanel
              events={solarEvents}
              flares={flares}
              cmes={cmes}
              loading={solarLoading}
              error={solarError}
              onRefresh={fetchSolar}
              onClose={() => setActivePanel(null)}
            />
          )}
          {activePanel === 'neo' && (
            <NeoPanel
              neos={neos}
              loading={neoLoading}
              error={neoError}
              onRefresh={fetchNeos}
              onClose={() => setActivePanel(null)}
            />
          )}
          {activePanel === 'missions' && (
            <MissionsPanel
              selectedMission={selectedMission}
              onSelectMission={setSelectedMission}
              onClose={() => setActivePanel(null)}
            />
          )}
        </div>
      )}
    </div>
  );
};

/* ── Toolbar Button ── */
const ToolbarBtn = ({ active, onClick, icon, label, color, badge }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string; color: string; badge?: number;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-all duration-200 ${
      active
        ? `${color} bg-current/10 border border-current/30`
        : `text-muted-foreground hover:${color} hover:bg-current/5`
    }`}
    style={active ? { backgroundColor: `hsl(var(--${color.replace('text-', '')}) / 0.1)` } : {}}
  >
    {icon}
    <span className="hidden lg:inline">{label}</span>
    {badge !== undefined && badge > 0 && (
      <span className={`${color} text-[0.55rem] font-bold`}>{badge}</span>
    )}
  </button>
);

/* ── Solar Panel ── */
const SolarPanel = ({ events, flares, cmes, loading, error, onRefresh, onClose }: {
  events: SolarEvent[]; flares: SolarEvent[]; cmes: SolarEvent[];
  loading: boolean; error: string | null; onRefresh: () => void; onClose: () => void;
}) => (
  <>
    <div className="px-4 py-3 border-b border-panel-border/60 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Sun className="h-4 w-4 text-solar" />
        <span className="display-heading text-sm text-foreground">Solar Activity</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onRefresh} disabled={loading} className="telemetry-label text-signal hover:text-signal-glow transition-colors">
          {loading ? 'Loading...' : 'Refresh'}
        </button>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
      </div>
    </div>
    {error && (
      <div className="px-4 py-3 text-alert text-xs flex items-center gap-2">
        <AlertTriangle className="h-3.5 w-3.5" />{error}
      </div>
    )}
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
    <div className="max-h-64 overflow-y-auto p-2 space-y-1">
      {events.length === 0 && !loading && (
        <p className="text-center text-muted-foreground text-xs py-4">No recent solar events</p>
      )}
      {loading && events.length === 0 && (
        <div className="text-center py-8">
          <Sun className="h-5 w-5 text-solar/50 mx-auto animate-spin mb-2" />
          <p className="telemetry-label">Fetching solar data...</p>
        </div>
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
              {event.type === 'FLR' ? <Zap className="h-3 w-3 text-solar" /> : <Activity className="h-3 w-3 text-alert" />}
              <span className="telemetry-mono text-[0.65rem]">
                {event.type === 'FLR' ? 'Flare' : 'CME'}{event.classType && ` · ${event.classType}`}
              </span>
            </div>
            {event.link && (
              <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-signal">
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-3">
            <span className="telemetry-label text-[0.52rem]">{new Date(event.beginTime).toLocaleString()}</span>
            {event.speed && <span className="telemetry-label text-alert/80 text-[0.52rem]">{Math.round(event.speed)} km/s</span>}
          </div>
          {event.note && <p className="text-muted-foreground text-[0.6rem] mt-1 line-clamp-2">{event.note}</p>}
        </div>
      ))}
    </div>
  </>
);

/* ── NEO Panel ── */
const NeoPanel = ({ neos, loading, error, onRefresh, onClose }: {
  neos: NeoObject[]; loading: boolean; error: string | null; onRefresh: () => void; onClose: () => void;
}) => (
  <>
    <div className="px-4 py-3 border-b border-panel-border/60 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-alert" />
        <span className="display-heading text-sm text-foreground">Near-Earth Objects</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onRefresh} disabled={loading} className="telemetry-label text-signal hover:text-signal-glow transition-colors">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
      </div>
    </div>
    <p className="telemetry-label px-4 py-2">Top 10 closest approaches · NASA NeoWs</p>
    {error && <div className="px-4 py-2 text-alert text-xs">{error}</div>}
    {loading && neos.length === 0 && (
      <div className="text-center py-8">
        <Globe className="w-6 h-6 text-signal/50 mx-auto animate-spin mb-2" />
        <p className="telemetry-label">Fetching NEO data...</p>
      </div>
    )}
    <div className="max-h-64 overflow-y-auto p-2 space-y-1.5">
      {neos.map(neo => (
        <div key={neo.id} className={`info-panel rounded-lg p-3 ${neo.is_potentially_hazardous ? 'border-alert/30' : ''}`}>
          <div className="flex items-center gap-2 mb-1.5">
            {neo.is_potentially_hazardous && <AlertTriangle className="w-3 h-3 text-alert shrink-0" />}
            <span className="font-mono text-xs font-bold text-foreground truncate">{neo.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <div><span className="telemetry-label">APPROACH</span><p className="text-foreground/80 font-mono">{neo.close_approach_date}</p></div>
            <div><span className="telemetry-label">MISS DIST</span><p className="text-foreground/80 font-mono">{neo.miss_distance_lunar.toFixed(1)} LD</p></div>
            <div><span className="telemetry-label">DIAMETER</span><p className="text-foreground/80 font-mono">{neo.estimated_diameter_min_m.toFixed(0)}–{neo.estimated_diameter_max_m.toFixed(0)} m</p></div>
            <div><span className="telemetry-label">VELOCITY</span><p className="text-foreground/80 font-mono">{(neo.relative_velocity_kph / 1000).toFixed(1)} km/s</p></div>
          </div>
        </div>
      ))}
    </div>
    {neos.length > 0 && <p className="telemetry-label p-3 text-center opacity-50">Data: NASA CNEOS</p>}
  </>
);

/* ── Missions Panel ── */
const MissionsPanel = ({ selectedMission, onSelectMission, onClose }: {
  selectedMission: SpacecraftMission | null;
  onSelectMission: (m: SpacecraftMission | null) => void;
  onClose: () => void;
}) => (
  <>
    <div className="px-4 py-3 border-b border-panel-border/60 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {selectedMission ? (
          <button onClick={() => onSelectMission(null)} className="text-signal text-xs font-mono hover:text-foreground transition-colors">← BACK</button>
        ) : (
          <>
            <Satellite className="h-4 w-4 text-signal" />
            <span className="display-heading text-sm text-foreground">Spacecraft Missions</span>
          </>
        )}
      </div>
      <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
    </div>

    {!selectedMission ? (
      <div className="max-h-64 overflow-y-auto p-2 space-y-1.5">
        {missions.map(m => (
          <button
            key={m.id}
            onClick={() => onSelectMission(m)}
            className="w-full text-left rounded-lg p-3 border border-panel-border/40 hover:border-signal/40 bg-transparent hover:bg-signal/5 transition-all group"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
              <span className="font-mono text-xs font-bold text-foreground">{m.name}</span>
              <span className={`ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded ${
                m.status === 'active' ? 'bg-bio/20 text-bio' :
                m.status === 'completed' ? 'bg-solar/20 text-solar' :
                'bg-alert/20 text-alert'
              }`}>{m.status.toUpperCase()}</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">{m.target}</p>
            <div className="flex items-center justify-between mt-1.5">
              <span className="telemetry-label">{m.agency}</span>
              <ChevronRight className="w-3 h-3 text-signal/50 group-hover:text-signal transition-colors" />
            </div>
          </button>
        ))}
      </div>
    ) : (
      <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: selectedMission.color }} />
          <h3 className="display-heading text-base text-foreground">{selectedMission.name}</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'AGENCY', value: selectedMission.agency },
            { label: 'LAUNCH', value: selectedMission.launchDate },
            { label: 'TARGET', value: selectedMission.target },
            { label: 'STATUS', value: selectedMission.status.toUpperCase() },
          ].map(item => (
            <div key={item.label} className="rounded-lg border border-panel-border/40 p-2 text-center">
              <p className="telemetry-label mb-0.5">{item.label}</p>
              <p className="text-xs text-foreground font-mono">{item.value}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{selectedMission.description}</p>
        <div>
          <h4 className="telemetry-label mb-2">MISSION TIMELINE</h4>
          <div className="space-y-1.5">
            {selectedMission.waypoints.map((wp, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: selectedMission.color }} />
                <div>
                  <span className="text-[10px] font-mono text-signal/70">{wp.date}</span>
                  {wp.label && <p className="text-[11px] text-foreground/80">{wp.label}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="telemetry-label mb-2">KEY ACHIEVEMENTS</h4>
          <ul className="space-y-1">
            {selectedMission.highlights.map((h, i) => (
              <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                <Rocket className="w-3 h-3 shrink-0 mt-0.5" style={{ color: selectedMission.color }} />
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )}
  </>
);

export default SpaceToolbar;
