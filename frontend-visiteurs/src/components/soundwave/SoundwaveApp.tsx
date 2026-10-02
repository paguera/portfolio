import React, { useState, useRef, useEffect } from "react";
import UnifiedVisualizer from "./UnifiedVisualizer";
import Playlist from "./Playlist";
import TrackFeedback from "./TrackFeedback";
import { useAudio } from "../../context/AudioContext";

import "./soundwave.css";

const SoundwaveApp: React.FC = () => {
  const {
    tracks,
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
    analyser,
    analyserL,
    analyserR,
    handlePlayPause,
    handleTrackSelect,
    handleNext,
    handlePrev,
    handleSeek,
    handleVolumeChange,
    handleMuteToggle,
    formatTime
  } = useAudio();


  const [strobeThreshold, setStrobeThreshold] = useState<number>(0.58);

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
            Lecteur audio &amp; visualiseur interactif — Découvrez mes créations musicales classées par genres et playlists.
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

            {/* Track Rating and Comments Section */}
            {currentTrack && <TrackFeedback currentTrack={currentTrack} />}
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
                onClick={toggleShuffle}
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
                onClick={toggleRepeat}
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
                  onChange={e => handleSeek(parseFloat(e.target.value))}
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
                onChange={e => handleVolumeChange(parseFloat(e.target.value))}
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
