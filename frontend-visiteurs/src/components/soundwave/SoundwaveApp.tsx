import React, { useState, useRef, useEffect, useCallback } from "react";
import UnifiedVisualizer from "./UnifiedVisualizer";
import Playlist from "./Playlist";
import { tracks as defaultTracks } from "./tracks";
import { useAudioAnalyser } from "./useAudioAnalyser";
import type { Track } from "./types";
import "./soundwave.css";

const SoundwaveApp: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>(defaultTracks);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [strobeThreshold, setStrobeThreshold] = useState<number>(0.58);

  // Custom audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  // Fullscreen state & ref
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Référence vers l'élément audio HTML et initialisation des analyseurs (principal, canal gauche, canal droit)
  const audioRef = useRef<HTMLAudioElement>(null);
  const { analyser, analyserL, analyserR, initAudio, resumeAudio } = useAudioAnalyser(audioRef);

  // Sync fullscreen change state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!wrapperRef.current) return;

    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen().catch((err) => {
        console.error("Error entering fullscreen: ", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Error exiting fullscreen: ", err);
      });
    }
  };

  // Load tracks dynamically from /audio/ directory listing if available
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch("/audio/");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const files = await response.json();
          if (Array.isArray(files)) {
            const audioExtensions = /\.(mp3|wav|ogg|flac|m4a|aac|webm)$/i;
            const audioFiles = files.filter(file => file.name && audioExtensions.test(file.name));

            if (audioFiles.length > 0) {
              const getGradientForString = (str: string) => {
                let hash = 0;
                for (let i = 0; i < str.length; i++) {
                  hash = str.charCodeAt(i) + ((hash << 5) - hash);
                }
                const hue1 = Math.abs(hash % 360);
                const hue2 = Math.abs((hash * 13) % 360);
                return `linear-gradient(135deg, hsl(${hue1}, 70%, 55%) 0%, hsl(${hue2}, 70%, 45%) 100%)`;
              };

              const parsedTracks: Track[] = audioFiles.map((file, index) => {
                const filename = file.name;
                const cleanName = filename.replace(/\.[^/.]+$/, "");
                const parts = cleanName.split(" - ");
                let artist = "Unknown Artist";
                let title = cleanName;

                if (parts.length > 1) {
                  artist = parts[0].trim();
                  title = parts.slice(1).join(" - ").trim();
                }

                return {
                  id: `dynamic-${index}-${filename}`,
                  title,
                  artist,
                  album: "Audio Folder",
                  duration: "Audio",
                  url: `/audio/${encodeURIComponent(filename)}`,
                  coverGradient: getGradientForString(filename)
                };
              });

              setTracks(parsedTracks);
            }
          }
        }
      } catch (err) {
        console.warn("Using fallback audio tracks:", err);
      }
    };

    fetchTracks();
  }, []);

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleTrackSelect = useCallback((track: Track) => {
    setCurrentTrack(track);
    if (audioRef.current) {
      audioRef.current.src = track.url;
      initAudio();
      resumeAudio();
      audioRef.current.play().catch((err) => {
        console.log("Playback blocked or interrupted: ", err);
      });
    }
  }, [initAudio, resumeAudio]);

  const handleNext = useCallback(() => {
    if (tracks.length === 0) return;
    let nextIndex = 0;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else if (currentTrack) {
      const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
      nextIndex = (currentIndex + 1) % tracks.length;
    }
    handleTrackSelect(tracks[nextIndex]);
  }, [tracks, isShuffle, currentTrack, handleTrackSelect]);

  const handlePrev = useCallback(() => {
    if (tracks.length === 0) return;
    let prevIndex = 0;
    if (currentTrack) {
      const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
      prevIndex = currentIndex - 1;
      if (prevIndex < 0) prevIndex = tracks.length - 1;
    }
    handleTrackSelect(tracks[prevIndex]);
  }, [tracks, currentTrack, handleTrackSelect]);

  // Sync state with audio element
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
        audio.play().catch(e => console.error("Loop failed", e));
      } else {
        handleNext();
      }
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);

    audio.volume = isMuted ? 0 : volume;
    audio.muted = isMuted;

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrack, isRepeat, handleNext, volume, isMuted]);

  const handlePlayPause = () => {
    if (!currentTrack && tracks.length > 0) {
      handleTrackSelect(tracks[0]);
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        initAudio();
        resumeAudio();
        audioRef.current.play().catch((err) => {
          console.log("Playback error: ", err);
        });
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
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

  const currentProgressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="soundwave-page-wrapper">
      {/* Background glowing blurred radial orbs spanning full screen */}
      <div className="bg-glow glow-purple"></div>
      <div className="bg-glow glow-cyan"></div>

      <div className="soundwave-app">

      <header className="app-header">
        <div className="logo-section">
          <div className="logo-waves">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <h1>Compositions originales</h1>
        </div>
        <p className="subtitle">
          Bienvenue dans mon univers sonore : écoutez mes créations et explorez-les en direct avec le visualiseur interactif Soundwave.
        </p>
      </header>

      <main className="main-content">
        <section className="visualizer-section">
          {/* Visualizer Selector Tabs */}
          <div className="viz-tabs-container">
            <div className="strobe-slider-panel">
              <span className="strobe-slider-label">
                [ STROBE_THRESHOLD: {Math.round(strobeThreshold * 100)}% ]
              </span>
              <input
                type="range"
                min="0.25"
                max="1.00"
                step="0.01"
                value={strobeThreshold}
                onChange={(e) => setStrobeThreshold(parseFloat(e.target.value))}
                className="strobe-slider"
              />
            </div>
          </div>

          {/* Holographic Screen Viewport */}
          <div className="canvas-wrapper" ref={wrapperRef}>
            <div className="screen-glow"></div>

            <span className="corner-tag tl"></span>
            <span className="corner-tag tr"></span>
            <span className="corner-tag bl"></span>
            <span className="corner-tag br"></span>

            <button
              className="fullscreen-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
            >
              {isFullscreen ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 4v4H4M16 4v4h4M20 16h-4v4M4 16h4v4" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4" />
                </svg>
              )}
            </button>

            <div className="canvas-container">
              <UnifiedVisualizer
                analyser={analyser}
                analyserL={analyserL}
                analyserR={analyserR}
                currentTrack={currentTrack}
                strobeThreshold={strobeThreshold}
              />

              {!currentTrack && (
                <div className="no-track-overlay">
                  <div className="overlay-content">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 0v1.5m0-1.5L9 12m10.5-6v10.5m-10.5-3L20 10.5M9 12v7.5m0-7.5l-6 3m6-3l6-3M3 15v4.5M3 15l6-3m-6 3h6m0 0v4.5" />
                    </svg>
                    <p>Sélectionnez une piste dans la playlist pour démarrer la visualisation</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Playlist Sidebar */}
        <aside className="sidebar-section">
          <Playlist
            tracks={tracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTrackSelect={handleTrackSelect}
          />
        </aside>
      </main>

      {/* Hidden native HTML audio element */}
      <audio ref={audioRef} crossOrigin="anonymous" preload="auto" />

      </div> {/* end soundwave-app */}

      {/* Custom Bottom Player Control Bar */}
      <div className={`player-bar-container ${currentTrack ? 'active' : ''}`}>
        <div className="player-bar">
          <div className="player-track-info">
            {currentTrack ? (
              <>
                <div
                  className="player-cover"
                  style={{
                    background: currentTrack.coverGradient,
                    animation: isPlaying ? "spin 12s linear infinite" : "none"
                  }}
                />
                <div className="player-meta">
                  <h4 className="player-title">{currentTrack.title}</h4>
                  <p className="player-artist">{currentTrack.artist}</p>
                </div>
              </>
            ) : (
              <div className="player-no-track">Aucune piste en lecture</div>
            )}
          </div>

          <div className="player-middle">
            <div className="player-controls">
              <button
                className={`ctrl-btn toggle-btn ${isShuffle ? 'active' : ''}`}
                onClick={() => setIsShuffle(!isShuffle)}
                title="Lecture aléatoire"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3M3 12a15.964 15.964 0 002.33 8.358m0 0L7.5 18m-2.17 2.358L3 18" />
                </svg>
              </button>

              <button className="ctrl-btn" onClick={handlePrev} title="Piste précédente">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                </svg>
              </button>

              <button className="play-pause-btn" onClick={handlePlayPause} title={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ marginLeft: '2px' }}>
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              <button className="ctrl-btn" onClick={handleNext} title="Piste suivante">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                </svg>
              </button>

              <button
                className={`ctrl-btn toggle-btn ${isRepeat ? 'active' : ''}`}
                onClick={() => setIsRepeat(!isRepeat)}
                title="Répéter la piste"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
            </div>

            <div className="player-timeline">
              <span className="time-label">{formatTime(currentTime)}</span>
              <div className="progress-slider-container">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="progress-slider"
                  style={{
                    background: `linear-gradient(to right, var(--neon-cyan) 0%, var(--neon-purple) ${currentProgressPercent}%, rgba(255, 255, 255, 0.08) ${currentProgressPercent}%, rgba(255, 255, 255, 0.08) 100%)`
                  }}
                />
              </div>
              <span className="time-label">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="player-right">
            <div className="volume-control">
              <button className="ctrl-btn volume-btn" onClick={handleMuteToggle}>
                {isMuted || volume === 0 ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L4.5 9H1.5v6h3l4.5 3.75V5.25z" />
                  </svg>
                ) : volume < 0.4 ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12a7.5 7.5 0 00-1.5-4.5M21 12a10.5 10.5 0 00-3-6" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="volume-slider"
                style={{
                  background: `linear-gradient(to right, var(--neon-cyan) 0%, var(--neon-purple) ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.08) ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.08) 100%)`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoundwaveApp;
