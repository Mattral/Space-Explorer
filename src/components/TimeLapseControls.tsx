import { useState, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, FastForward, Rewind } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface TimeLapseControlsProps {
  onTimeScaleChange: (scale: number) => void;
}

const SPEED_PRESETS = [
  { label: '0.1×', value: 0.1 },
  { label: '1×',   value: 1   },
  { label: '5×',   value: 5   },
  { label: '20×',  value: 20  },
  { label: '100×', value: 100 },
];

const TimeLapseControls = ({ onTimeScaleChange }: TimeLapseControlsProps) => {
  const [isPaused, setIsPaused] = useState(false);
  const [timeScale, setTimeScale] = useState(1);
  const [isReversed, setIsReversed] = useState(false);

  const applyScale = useCallback((scale: number, reversed: boolean, paused: boolean) => {
    const effective = paused ? 0 : (reversed ? -Math.abs(scale) : scale);
    onTimeScaleChange(effective);
  }, [onTimeScaleChange]);

  const handleSliderChange = (vals: number[]) => {
    const raw = vals[0];
    // Logarithmic mapping: slider 0–100 → 0.01×–500×
    const mapped = Math.pow(10, (raw / 100) * Math.log10(500));
    const clamped = Math.min(500, Math.max(0.01, mapped));
    setTimeScale(clamped);
    applyScale(clamped, isReversed, isPaused);
  };

  const setPreset = (value: number) => {
    setTimeScale(value);
    applyScale(value, isReversed, isPaused);
  };

  const togglePause = () => {
    const next = !isPaused;
    setIsPaused(next);
    applyScale(timeScale, isReversed, next);
  };

  const toggleReverse = () => {
    const next = !isReversed;
    setIsReversed(next);
    applyScale(timeScale, next, isPaused);
  };

  // Convert actual timeScale back to slider position
  const sliderVal = Math.round((Math.log10(Math.max(0.01, timeScale)) / Math.log10(500)) * 100);

  const displayScale = timeScale < 1 ? `1/${Math.round(1/timeScale)}×` : `${timeScale < 10 ? timeScale.toFixed(1) : Math.round(timeScale)}×`;

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4 animate-fade-up">
      <div className="info-panel rounded-xl px-5 py-3">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="status-dot" />
            <span className="telemetry-label tracking-widest uppercase">Orbital Time Control</span>
          </div>
          <div className="flex items-center gap-1.5">
            {isReversed && (
              <span className="telemetry-label text-solar px-1.5 py-0.5 rounded bg-solar/10 border border-solar/20">REV</span>
            )}
            {isPaused && (
              <span className="telemetry-label text-signal px-1.5 py-0.5 rounded bg-signal/10 border border-signal/20">PAUSED</span>
            )}
            <span className="telemetry-value text-foreground">
              {isPaused ? '0×' : (isReversed ? '-' : '') + displayScale}
            </span>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3">
          {/* Reverse */}
          <button
            onClick={toggleReverse}
            className={`p-2 rounded-lg transition-all duration-200 border ${
              isReversed
                ? 'border-solar/60 bg-solar/15 text-solar'
                : 'border-panel-border bg-panel-glass/30 text-muted-foreground hover:text-foreground hover:border-signal/40'
            }`}
            title="Reverse time"
          >
            <Rewind className="h-4 w-4" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePause}
            className={`p-2.5 rounded-xl transition-all duration-200 border ${
              isPaused
                ? 'border-signal/60 bg-signal/15 text-signal'
                : 'border-panel-border bg-panel-glass/30 text-muted-foreground hover:text-signal hover:border-signal/40'
            }`}
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>

          {/* Slider */}
          <div className="flex-1">
            <Slider
              value={[sliderVal]}
              min={0}
              max={100}
              step={1}
              onValueChange={handleSliderChange}
              className="w-full"
            />
          </div>

          {/* Fast forward */}
          <button
            onClick={() => setPreset(Math.min(500, timeScale * 5))}
            className="p-2 rounded-lg border border-panel-border bg-panel-glass/30 text-muted-foreground hover:text-foreground hover:border-signal/40 transition-all duration-200"
            title="5× faster"
          >
            <FastForward className="h-4 w-4" />
          </button>
        </div>

        {/* Preset buttons */}
        <div className="flex items-center gap-1.5 mt-2.5">
          <span className="telemetry-label mr-1 opacity-60">PRESET</span>
          {SPEED_PRESETS.map(p => (
            <button
              key={p.value}
              onClick={() => setPreset(p.value)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all duration-150 border ${
                Math.abs(timeScale - p.value) < 0.05 && !isPaused
                  ? 'border-signal/60 bg-signal/15 text-signal'
                  : 'border-panel-border/50 text-muted-foreground hover:text-foreground hover:border-signal/30'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeLapseControls;
