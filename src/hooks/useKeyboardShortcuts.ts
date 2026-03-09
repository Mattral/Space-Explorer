import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsProps {
  planetIds: string[];
  selectedPlanetId: string;
  onSelectPlanet: (id: string) => void;
  closeUpPlanetId: string | null;
  onCloseUp: (id: string | null) => void;
  onTimeScaleChange: (fn: (prev: number) => number) => void;
}

export const useKeyboardShortcuts = ({
  planetIds,
  selectedPlanetId,
  onSelectPlanet,
  closeUpPlanetId,
  onCloseUp,
  onTimeScaleChange,
}: KeyboardShortcutsProps) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't capture when typing in inputs
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    const currentIndex = planetIds.indexOf(selectedPlanetId);

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        e.preventDefault();
        const next = (currentIndex + 1) % planetIds.length;
        onSelectPlanet(planetIds[next]);
        break;
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        e.preventDefault();
        const prev = (currentIndex - 1 + planetIds.length) % planetIds.length;
        onSelectPlanet(planetIds[prev]);
        break;
      }
      case ' ': {
        e.preventDefault();
        if (closeUpPlanetId) {
          onCloseUp(null);
        } else {
          onCloseUp(selectedPlanetId);
        }
        break;
      }
      case 'Escape': {
        if (closeUpPlanetId) {
          e.preventDefault();
          onCloseUp(null);
        }
        break;
      }
      case '=':
      case '+': {
        e.preventDefault();
        onTimeScaleChange((prev: number) => Math.min(prev * 2, 500));
        break;
      }
      case '-':
      case '_': {
        e.preventDefault();
        onTimeScaleChange((prev: number) => Math.max(prev / 2, 0.01));
        break;
      }
    }
  }, [planetIds, selectedPlanetId, closeUpPlanetId, onSelectPlanet, onCloseUp, onTimeScaleChange]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
