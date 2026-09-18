export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  url: string;
  coverGradient: string;
}

// Modes de visualisation disponibles dans le lecteur Soundwave
export type VisualizerMode = 'waveform' | 'bars' | 'circular' | 'particles' | 'phase' | 'all';
