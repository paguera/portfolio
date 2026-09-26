import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import UnifiedVisualizer from "./UnifiedVisualizer";
import Playlist from "./Playlist";
import { tracks as defaultTracks } from "./tracks";
import { useAudioAnalyser } from "./useAudioAnalyser";
import type { Track, PlaylistInfo } from "./types";
import { apiFetch } from "../../utils/api";
import "./soundwave.css";

const SoundwaveApp: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>(defaultTracks);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>("all");
  const [strobeThreshold, setStrobeThreshold] = useState<number>(0.58);

  // Custom audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  // Mobile & Visualizer visibility state
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  const [showVisualizer, setShowVisualizer] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768;
    }
    return false;
  });

  // Fullscreen state & ref
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Audio HTML element & analyser setup
  const audioRef = useRef<HTMLAudioElement>(null);
  const { analyser, analyserL, analyserR, initAudio, resumeAudio } = useAudioAnalyser(audioRef);

  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // Helper for cyber gradients (yellow, amber, purple, gold, coral)
  const getCyberGradientForString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorCombos = [
      "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)", // Cyber Yellow to Amber
      "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", // Cyber Purple to Violet
      "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)", // Warm Amber
      "linear-gradient(135deg, #ec4899 0%, #be185d 100%)", // Coral Pink
      "linear-gradient(135deg, #c39c6b 0%, #78350f 100%)", // Warm Gold
      "linear-gradient(135deg, #facc15 0%, #ca8a04 100%)", // Neon Yellow
      "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)", // Cyber Orange
      "linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)", // Bright Violet
    ];
    const index = Math.abs(hash) % colorCombos.length;
    return colorCombos[index];
  };

  // Format filename into clean artist and title
  const parseFilename = (filename: string, fallbackFolder: string) => {
    const cleanName = filename.replace(/\.[^/.]+$/, "");
    // Check for [Genre] Prefix
    let genre = fallbackFolder;
    let nameWithoutTag = cleanName;
    const tagMatch = cleanName.match(/^\[(.*?)\]\s*(.*)$/);
    if (tagMatch) {
      genre = tagMatch[1].trim();
      nameWithoutTag = tagMatch[2].trim();
    }

    const parts = nameWithoutTag.split(" - ");
    let artist = "Paguera";
    let title = nameWithoutTag;

    if (parts.length > 1) {
      artist = parts[0].trim();
      title = parts.slice(1).join(" - ").trim();
    }

    return { title, artist, genre };
  };

  // Load tracks dynamically from /audio/ directory listing & subdirectories
  useEffect(() => {
    const fetchDynamicAudio = async () => {
      try {
        const response = await fetch("/audio/");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const items = await response.json();
          if (Array.isArray(items) && items.length > 0) {
            const audioExtensions = /\.(mp3|wav|ogg|flac|m4a|aac|webm)$/i;
            const discoveredTracks: Track[] = [];

            // 1. Check root files and subdirectories
            for (let i = 0; i < items.length; i++) {
              const item = items[i];
              const itemName = item.name;

              // Check if item is a subdirectory (playlist)
              const isDir = item.type === "directory" || (!audioExtensions.test(itemName) && !itemName.includes("."));

              if (isDir) {
                const folderName = itemName.replace(/\/$/, "");
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
                          duration: "Audio",
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
                // Root audio file
                const { title, artist, genre } = parseFilename(itemName, "Général");
                discoveredTracks.push({
                  id: `root-${i}-${itemName}`,
                  title,
                  artist,
                  album: "Général",
                  duration: "Audio",
                  url: `/audio/${encodeURIComponent(itemName)}`,
                  coverGradient: getCyberGradientForString(itemName),
                  playlist: genre || "Général"
                });
              }
            }

            if (discoveredTracks.length > 0) {
              setTracks(discoveredTracks);
            }
          }
        }
      } catch (err) {
        console.warn("Using fallback curated audio playlist:", err);
      }
    };

    fetchDynamicAudio();
  }, []);

  // Compute playlists/genres list with track count
  const playlists: PlaylistInfo[] = useMemo(() => {
    const counts: Record<string, number> = {};
    tracks.forEach((t) => {
      const name = t.playlist || "Général";
      counts[name] = (counts[name] || 0) + 1;
    });

    const list: PlaylistInfo[] = Object.entries(counts).map(([name, count]) => ({
      id: name,
      name,
      count
    }));

    return [
      { id: "all", name: "Tous les titres", count: tracks.length },
      ...list
    ];
  }, [tracks]);

  // Current active playlist track subset for Next/Prev navigation
  const activePlaylistTracks = useMemo(() => {
    if (selectedPlaylist === "all") return tracks;
    return tracks.filter(
      (t) => (t.playlist || "Général").toLowerCase() === selectedPlaylist.toLowerCase()
    );
  }, [tracks, selectedPlaylist]);

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const lastTrackedTrackIdRef = useRef<string | null>(null);

  const trackAudioPlay = useCallback(async (track: Track) => {
    if (!track || lastTrackedTrackIdRef.current === track.id) return;
    lastTrackedTrackIdRef.current = track.id;

    try {
      let visitorUuid = localStorage.getItem("paguera_visitor_id");
      if (!visitorUuid) {
        visitorUuid = crypto.randomUUID();
        localStorage.setItem("paguera_visitor_id", visitorUuid);
      }

      await apiFetch("/visitors/track-audio", {
        method: "POST",
        body: JSON.stringify({
          visitorUuid,
          trackId: track.id,
          trackTitle: track.title,
          trackArtist: track.artist,
          playlist: track.playlist || "Général",
        }),
      });
    } catch (err) {
      // Non-blocking telemetry
      console.debug("Audio play tracking err:", err);
    }
  }, []);

  const handleTrackSelect = useCallback((track: Track) => {
    setCurrentTrack(track);
    trackAudioPlay(track);
    if (audioRef.current) {
      audioRef.current.src = track.url;
      initAudio();
      resumeAudio();
      audioRef.current.play().catch((err) => {
        console.log("Playback blocked or interrupted: ", err);
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
      const currentIndex = currentList.findIndex((t) => t.id === currentTrack.id);
      nextIndex = (currentIndex + 1) % currentList.length;
    }
    handleTrackSelect(currentList[nextIndex]);
  }, [activePlaylistTracks, tracks, isShuffle, currentTrack, handleTrackSelect]);

  const handlePrev = useCallback(() => {
    const currentList = activePlaylistTracks.length > 0 ? activePlaylistTracks : tracks;
    if (currentList.length === 0) return;
    let prevIndex = 0;
    if (currentTrack) {
      const currentIndex = currentList.findIndex((t) => t.id === currentTrack.id);
      prevIndex = currentIndex - 1;
      if (prevIndex < 0) prevIndex = currentList.length - 1;
    }
    handleTrackSelect(currentList[prevIndex]);
  }, [activePlaylistTracks, tracks, currentTrack, handleTrackSelect]);

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
      {/* Background ambient glowing orbs (Yellow & Purple) */}
      <div className="bg-glow glow-yellow"></div>
      <div className="bg-glow glow-purple"></div>

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
            <h1>Compositions sonores</h1>
          </div>
          <p className="subtitle">
            Lecteur audio & visualiseur interactif — Découvrez mes créations musicales classées par genres et playlists.
          </p>
        </header>

        <main className="main-content">
          {/* Visualizer / Mobile Hero Section */}
          <section className="visualizer-section">
            {/* Visualizer Toolbar */}
            <div className="viz-toolbar">
              <div className="viz-toggle-wrapper">
                <button
                  className={`viz-toggle-btn ${showVisualizer ? "active" : ""}`}
                  onClick={() => setShowVisualizer(!showVisualizer)}
                  title={showVisualizer ? "Masquer le visualiseur" : "Activer le visualiseur"}
                >
                  <span className="pulse-dot"></span>
                  <span className="font-mono text-xs">
                    {showVisualizer ? "[ VISUALISEUR: ACTIF ]" : "[ VISUALISEUR: MASQUÉ ]"}
                  </span>
                </button>
              </div>

              {showVisualizer && (
                <div className="strobe-slider-panel">
                  <span className="strobe-slider-label font-mono">
                    STROBE: {Math.round(strobeThreshold * 100)}%
                  </span>
                  <input
                    type="range"
                    min="0.25"
                    max="1.00"
                    step="0.01"
                    value={strobeThreshold}
                    onChange={(e) => setStrobeThreshold(parseFloat(e.target.value))}
                    className="strobe-slider"
                    title="Seuil d'impact du stroboscope"
                  />
                </div>
              )}
            </div>

            {/* Viewport: Canvas on Desktop or Mobile Hero Card when disabled */}
            {showVisualizer ? (
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
                  aria-label="Toggle plein écran"
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
                        <p>Sélectionnez une piste dans la playlist pour lancer la lecture et le visualiseur</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Sleek Responsive Mobile / Minimalist Hero Player Card */
              <div className="mobile-player-hero">
                <div className="mobile-hero-content">
                  <div
                    className="mobile-vinyl-cover"
                    style={{
                      background: currentTrack?.coverGradient || "linear-gradient(135deg, #fbbf24 0%, #8b5cf6 100%)",
                      animation: isPlaying ? "spin 12s linear infinite" : "none"
                    }}
                  >
                    <div className="mobile-vinyl-hole">
                      <div className="vinyl-gold-center"></div>
                    </div>
                  </div>

                  <div className="mobile-hero-details">
                    <span className="mobile-genre-badge font-mono">
                      {currentTrack?.playlist || (isMobile ? "Mode Mobile Optimisé" : "Mode Lecteur Épuré")}
                    </span>
                    <h3 className="mobile-track-title">
                      {currentTrack ? currentTrack.title : "Aucun titre sélectionné"}
                    </h3>
                    <p className="mobile-track-artist">
                      {currentTrack ? currentTrack.artist : "Choisissez un morceau ci-dessous"}
                    </p>

                    {isMobile && (
                      <p className="mobile-perf-note font-mono">
                        Visualiseur désactivé par défaut sur mobile pour garantir une fluidité maximale.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Playlist Sidebar / Manager */}
          <aside className="sidebar-section">
            <Playlist
              tracks={tracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onTrackSelect={handleTrackSelect}
              selectedPlaylist={selectedPlaylist}
              onSelectPlaylist={setSelectedPlaylist}
              playlists={playlists}
            />
          </aside>
        </main>

        {/* Hidden native HTML audio element */}
        <audio ref={audioRef} crossOrigin="anonymous" preload="auto" />
      </div>

      {/* Custom Bottom Player Control Bar */}
      <div className={`player-bar-container ${currentTrack ? "active" : ""}`}>
        <div className="player-bar">
          {/* Left: Track Info */}
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
                  <div className="player-submeta">
                    <span className="player-artist">{currentTrack.artist}</span>
                    {currentTrack.playlist && (
                      <span className="player-genre-tag font-mono">{currentTrack.playlist}</span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="player-no-track font-mono">Prêt pour la lecture</div>
            )}
          </div>

          {/* Center: Play Controls & Timeline */}
          <div className="player-middle">
            <div className="player-controls">
              <button
                className={`ctrl-btn toggle-btn ${isShuffle ? "active" : ""}`}
                onClick={() => setIsShuffle(!isShuffle)}
                title="Lecture aléatoire"
                aria-label="Lecture aléatoire"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3M3 12a15.964 15.964 0 002.33 8.358m0 0L7.5 18m-2.17 2.358L3 18" />
                </svg>
              </button>

              <button className="ctrl-btn" onClick={handlePrev} title="Piste précédente" aria-label="Piste précédente">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                </svg>
              </button>

              <button className="play-pause-btn" onClick={handlePlayPause} title={isPlaying ? "Pause" : "Play"} aria-label={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ marginLeft: "2px" }}>
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              <button className="ctrl-btn" onClick={handleNext} title="Piste suivante" aria-label="Piste suivante">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                </svg>
              </button>

              <button
                className={`ctrl-btn toggle-btn ${isRepeat ? "active" : ""}`}
                onClick={() => setIsRepeat(!isRepeat)}
                title="Répéter la piste"
                aria-label="Répéter la piste"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
            </div>

            <div className="player-timeline">
              <span className="time-label font-mono">{formatTime(currentTime)}</span>
              <div className="progress-slider-container">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="progress-slider"
                  style={{
                    background: `linear-gradient(to right, #fbbf24 0%, #8b5cf6 ${currentProgressPercent}%, rgba(255, 255, 255, 0.1) ${currentProgressPercent}%, rgba(255, 255, 255, 0.1) 100%)`
                  }}
                  aria-label="Barre de progression audio"
                />
              </div>
              <span className="time-label font-mono">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Volume section */}
          <div className="player-right">
            <div className="volume-control">
              <button className="ctrl-btn volume-btn" onClick={handleMuteToggle} title={isMuted ? "Réactiver le son" : "Couper le son"} aria-label="Contrôle du volume">
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
                  background: `linear-gradient(to right, #fbbf24 0%, #8b5cf6 ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.1) ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.1) 100%)`
                }}
                aria-label="Réglage du volume"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoundwaveApp;
