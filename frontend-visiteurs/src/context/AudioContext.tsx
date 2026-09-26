import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { Track, PlaylistInfo } from '../components/soundwave/types';
import { tracks as defaultTracks } from '../components/soundwave/tracks';
import { useAudioAnalyser } from '../components/soundwave/useAudioAnalyser';
import { apiFetch } from '../utils/api';

interface AudioContextType {
  tracks: Track[];
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  selectedPlaylist: string;
  setSelectedPlaylist: (playlist: string) => void;
  playlists: PlaylistInfo[];
  activePlaylistTracks: Track[];
  analyser: AnalyserNode | null;
  analyserL: AnalyserNode | null;
  analyserR: AnalyserNode | null;
  initAudio: () => void;
  resumeAudio: () => void;
  handlePlayPause: () => void;
  handleTrackSelect: (track: Track) => void;
  handleNext: () => void;
  handlePrev: () => void;
  handleSeek: (time: number) => void;
  handleVolumeChange: (val: number) => void;
  handleMuteToggle: () => void;
  formatTime: (secs: number) => string;
}


const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>(defaultTracks);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>('all');

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('soundwave_volume');
      return saved ? parseFloat(saved) : 0.85;
    }
    return 0.85;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { analyser, analyserL, analyserR, initAudio, resumeAudio } = useAudioAnalyser(audioRef);

  const getCyberGradientForString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorCombos = [
      'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
      'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
      'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      'linear-gradient(135deg, #c39c6b 0%, #78350f 100%)',
      'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)',
      'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
      'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
    ];
    const index = Math.abs(hash) % colorCombos.length;
    return colorCombos[index];
  };

  const parseFilename = (filename: string, fallbackFolder: string) => {
    const cleanName = filename.replace(/\.[^/.]+$/, '');
    let genre = fallbackFolder;
    let nameWithoutTag = cleanName;
    const tagMatch = cleanName.match(/^\[(.*?)\]\s*(.*)$/);
    if (tagMatch) {
      genre = tagMatch[1].trim();
      nameWithoutTag = tagMatch[2].trim();
    }

    const parts = nameWithoutTag.split(' - ');
    let artist = 'Paguera';
    let title = nameWithoutTag;

    if (parts.length > 1) {
      artist = parts[0].trim();
      title = parts.slice(1).join(' - ').trim();
    }

    return { title, artist, genre };
  };

  // Discover tracks from /audio/ directory
  useEffect(() => {
    const fetchDynamicAudio = async () => {
      try {
        const response = await fetch('/audio/');
        if (!response.ok) return;

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const items = await response.json();
          if (Array.isArray(items) && items.length > 0) {
            const audioExtensions = /\.(mp3|wav|ogg|flac|m4a|aac|webm)$/i;
            const discoveredTracks: Track[] = [];

            for (let i = 0; i < items.length; i++) {
              const item = items[i];
              const itemName = item.name;
              const isDir = item.type === 'directory' || (!audioExtensions.test(itemName) && !itemName.includes('.'));

              if (isDir) {
                const folderName = itemName.replace(/\/$/, '');
                try {
                  const subResp = await fetch(`/audio/${encodeURIComponent(folderName)}/`);
                  if (subResp.ok) {
                    const subItems = await subResp.json();
                    if (Array.isArray(subItems)) {
                      const subAudioFiles = subItems.filter(f => f.name && audioExtensions.test(f.name));
                      subAudioFiles.forEach((file, fIdx) => {
                        const { title, artist, genre } = parseFilename(file.name, folderName);
                        discoveredTracks.push({
                          id: `folder-${folderName}-${fIdx}-${file.name}`,
                          title,
                          artist,
                          album: folderName,
                          duration: 'Audio',
                          url: `/audio/${encodeURIComponent(folderName)}/${encodeURIComponent(file.name)}`,
                          coverGradient: getCyberGradientForString(file.name),
                          playlist: genre || folderName
                        });
                      });
                    }
                  }
                } catch (subErr) {
                  console.warn(`Could not read subfolder ${folderName}:`, subErr);
                }
              } else if (audioExtensions.test(itemName)) {
                const { title, artist, genre } = parseFilename(itemName, 'Général');
                discoveredTracks.push({
                  id: `root-${i}-${itemName}`,
                  title,
                  artist,
                  album: 'Général',
                  duration: 'Audio',
                  url: `/audio/${encodeURIComponent(itemName)}`,
                  coverGradient: getCyberGradientForString(itemName),
                  playlist: genre || 'Général'
                });
              }
            }

            if (discoveredTracks.length > 0) {
              setTracks(discoveredTracks);
            }
          }
        }
      } catch (err) {
        console.warn('Using curated fallback audio list:', err);
      }
    };

    fetchDynamicAudio();
  }, []);

  const playlists: PlaylistInfo[] = useMemo(() => {
    const counts: Record<string, number> = {};
    tracks.forEach(t => {
      const name = t.playlist || 'Général';
      counts[name] = (counts[name] || 0) + 1;
    });

    const list: PlaylistInfo[] = Object.entries(counts).map(([name, count]) => ({
      id: name,
      name,
      count
    }));

    return [
      { id: 'all', name: 'Tous les titres', count: tracks.length },
      ...list
    ];
  }, [tracks]);

  const activePlaylistTracks = useMemo(() => {
    if (selectedPlaylist === 'all') return tracks;
    return tracks.filter(
      t => (t.playlist || 'Général').toLowerCase() === selectedPlaylist.toLowerCase()
    );
  }, [tracks, selectedPlaylist]);

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const lastTrackedTrackIdRef = useRef<string | null>(null);

  const trackAudioPlay = useCallback(async (track: Track) => {
    if (!track || lastTrackedTrackIdRef.current === track.id) return;
    lastTrackedTrackIdRef.current = track.id;

    try {
      let visitorUuid = localStorage.getItem('paguera_visitor_id');
      if (!visitorUuid) {
        visitorUuid = crypto.randomUUID();
        localStorage.setItem('paguera_visitor_id', visitorUuid);
      }

      await apiFetch('/visitors/track-audio', {
        method: 'POST',
        body: JSON.stringify({
          visitorUuid,
          trackId: track.id,
          trackTitle: track.title,
          trackArtist: track.artist,
          playlist: track.playlist || 'Général',
        }),
      });
    } catch (err) {
      console.debug('Audio telemetry err:', err);
    }
  }, []);

  const handleTrackSelect = useCallback((track: Track) => {
    setCurrentTrack(track);
    trackAudioPlay(track);
    if (audioRef.current) {
      audioRef.current.src = track.url;
      initAudio();
      resumeAudio();
      audioRef.current.play().catch(err => {
        console.log('Playback error:', err);
      });
    }
  }, [initAudio, resumeAudio, trackAudioPlay]);

  const handleNext = useCallback(() => {
    const currentList = activePlaylistTracks.length > 0 ? activePlaylistTracks : tracks;
    if (currentList.length === 0) return;
    let nextIndex = 0;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * currentList.length);
    } else if (currentTrack) {
      const currentIndex = currentList.findIndex(t => t.id === currentTrack.id);
      nextIndex = (currentIndex + 1) % currentList.length;
    }
    handleTrackSelect(currentList[nextIndex]);
  }, [activePlaylistTracks, tracks, isShuffle, currentTrack, handleTrackSelect]);

  const handlePrev = useCallback(() => {
    const currentList = activePlaylistTracks.length > 0 ? activePlaylistTracks : tracks;
    if (currentList.length === 0) return;
    let prevIndex = 0;
    if (currentTrack) {
      const currentIndex = currentList.findIndex(t => t.id === currentTrack.id);
      prevIndex = currentIndex - 1;
      if (prevIndex < 0) prevIndex = currentList.length - 1;
    }
    handleTrackSelect(currentList[prevIndex]);
  }, [activePlaylistTracks, tracks, currentTrack, handleTrackSelect]);

  const handlePlayPause = useCallback(() => {
    if (!currentTrack) {
      const listToPlay = activePlaylistTracks.length > 0 ? activePlaylistTracks : tracks;
      if (listToPlay.length > 0) {
        handleTrackSelect(listToPlay[0]);
      }
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        initAudio();
        resumeAudio();
        audioRef.current.play().catch(err => {
          console.log('Playback error:', err);
        });
      }
    }
  }, [currentTrack, activePlaylistTracks, tracks, isPlaying, initAudio, resumeAudio, handleTrackSelect]);

  const handleSeek = (val: number) => {
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundwave_volume', val.toString());
    }
    if (audioRef.current) {
      audioRef.current.volume = val;
      if (val > 0 && isMuted) {
        audioRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const handleMuteToggle = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (audioRef.current) {
      audioRef.current.muted = nextMute;
    }
  };

  // Sync HTML Audio element event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => {
      const d = audio.duration || 0;
      setDuration(d);
      if (currentTrack && d > 0) {
        const formatted = formatTime(d);
        setTracks(prev => prev.map(t => t.id === currentTrack.id ? { ...t, duration: formatted } : t));
      }
    };

    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(e => console.error('Loop failed', e));
      } else {
        handleNext();
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    audio.volume = isMuted ? 0 : volume;
    audio.muted = isMuted;

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, isRepeat, handleNext, volume, isMuted]);

  // Global Keyboard listener for Spacebar Play/Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause]);

  const toggleShuffle = () => setIsShuffle(prev => !prev);
  const toggleRepeat = () => setIsRepeat(prev => !prev);

  const value = {
    tracks,
    setTracks,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    isRepeat,
    toggleShuffle,
    toggleRepeat,
    selectedPlaylist,
    setSelectedPlaylist,
    playlists,
    activePlaylistTracks,
    analyser,
    analyserL,
    analyserR,
    initAudio,
    resumeAudio,
    handlePlayPause,
    handleTrackSelect,
    handleNext,
    handlePrev,
    handleSeek,
    handleVolumeChange,
    handleMuteToggle,
    formatTime
  };


  return (
    <AudioContext.Provider value={value}>
      {children}
      {/* Root audio element */}
      <audio ref={audioRef} crossOrigin='anonymous' preload='auto' />
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
