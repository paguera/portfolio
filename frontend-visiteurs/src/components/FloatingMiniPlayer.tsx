import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';

const FloatingMiniPlayer: React.FC = () => {
  const location = useLocation();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    handlePlayPause,
    handleNext,
    handlePrev,
    handleSeek,
    handleVolumeChange,
    handleMuteToggle,
    formatTime
  } = useAudio();

  const [isMinimized, setIsMinimized] = useState(false);

  // If we are on the full music page, don't show the floating player to avoid duplicate bars
  const isMusicPage =
    location.pathname === '/music' ||
    location.pathname.startsWith('/productions') ||
    location.pathname.startsWith('/audio');

  if (!currentTrack || isMusicPage) {
    return null;
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (isMinimized) {
    return (
      <div className='fixed bottom-6 right-6 z-50 animate-bounce'>
        <button
          onClick={() => setIsMinimized(false)}
          className='flex items-center gap-3 bg-bg-panel/95 backdrop-blur-md border-2 border-cyber-yellow p-3 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:scale-105 transition-all text-white font-mono text-xs cursor-pointer'
          title='Agrandir le lecteur audio'
        >
          <div
            className='w-8 h-8 rounded-full flex items-center justify-center shrink-0'
            style={{
              background: currentTrack.coverGradient,
              animation: isPlaying ? 'spin 6s linear infinite' : 'none'
            }}
          >
            <div className='w-2.5 h-2.5 rounded-full bg-black'></div>
          </div>

          <div className='flex flex-col text-left pr-2'>
            <span className='font-bold text-cyber-yellow text-[11px] truncate max-w-[120px]'>
              {currentTrack.title}
            </span>
            <span className='text-[9px] text-gray-400'>
              {isPlaying ? '▶ En lecture' : '⏸ En pause'}
            </span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className='fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-6 md:w-[480px] z-50 transition-all duration-300'>
      <div className='bg-bg-panel/95 backdrop-blur-md border-2 border-cyber-yellow/80 rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(251,191,36,0.25)] p-4 flex flex-col gap-3 font-mono text-white relative overflow-hidden'>
        {/* Subtle Top Glowing Line */}
        <div
          className='absolute top-0 left-0 h-1 bg-gradient-to-r from-cyber-yellow via-amber-500 to-purple-500 transition-all duration-300'
          style={{ width: `${progressPercent}%` }}
        />

        {/* Header Row: Track Info + Actions */}
        <div className='flex items-center justify-between gap-3'>
          <div className='flex items-center gap-3 min-w-0'>
            {/* Vinyl artwork */}
            <div
              className='w-12 h-12 rounded-full border border-cyber-yellow/40 flex items-center justify-center shrink-0 shadow'
              style={{
                background: currentTrack.coverGradient,
                animation: isPlaying ? 'spin 8s linear infinite' : 'none'
              }}
            >
              <div className='w-3.5 h-3.5 rounded-full bg-black border border-cyber-yellow/30'></div>
            </div>

            {/* Track Info */}
            <div className='flex flex-col min-w-0'>
              <div className='flex items-center gap-2'>
                <span className='font-black text-sm text-white truncate max-w-[180px] sm:max-w-[220px]'>
                  {currentTrack.title}
                </span>
                {currentTrack.playlist && (
                  <span className='text-[9px] px-1.5 py-0.5 rounded bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold shrink-0'>
                    {currentTrack.playlist}
                  </span>
                )}
              </div>
              <span className='text-xs text-text-muted mt-0.5'>
                {currentTrack.artist}
              </span>
            </div>
          </div>

          {/* Controls: Go to full lab & minimize */}
          <div className='flex items-center gap-2 shrink-0'>
            <Link
              to='/music'
              className='text-[10px] font-bold text-cyber-yellow hover:text-white border border-cyber-yellow/40 hover:border-cyber-yellow px-2 py-1 rounded transition-colors uppercase'
              title='Ouvrir le laboratoire musical complet'
            >
              Lab ↗
            </Link>
            <button
              onClick={() => setIsMinimized(true)}
              className='text-gray-400 hover:text-white text-xs px-1.5 py-1'
              title='Réduire le lecteur'
            >
              _
            </button>
          </div>
        </div>

        {/* Controls & Progress Bar */}
        <div className='flex flex-col gap-2'>
          {/* Progress Slider */}
          <div className='flex items-center gap-2 text-[10px] text-gray-400'>
            <span className='w-8 text-right'>{formatTime(currentTime)}</span>
            <input
              type='range'
              min='0'
              max={duration || 100}
              value={currentTime}
              onChange={e => handleSeek(parseFloat(e.target.value))}
              className='grow accent-cyber-yellow h-1.5 bg-black/50 rounded cursor-pointer'
            />
            <span className='w-8'>{formatTime(duration)}</span>
          </div>

          {/* Buttons Row */}
          <div className='flex items-center justify-between pt-1'>
            {/* Play/Pause & Skip Buttons */}
            <div className='flex items-center gap-2'>
              <button
                onClick={handlePrev}
                className='p-1.5 text-gray-300 hover:text-white transition-colors cursor-pointer'
                title='Piste précédente'
              >
                <svg viewBox='0 0 24 24' width='16' height='16' fill='currentColor'>
                  <path d='M6 6h2v12H6zm3.5 6l8.5 6V6z' />
                </svg>
              </button>

              <button
                onClick={handlePlayPause}
                className='w-9 h-9 rounded-full bg-cyber-yellow text-black flex items-center justify-center font-black hover:bg-yellow-300 transition-all shadow-md cursor-pointer'
                title={isPlaying ? 'Pause (Espace)' : 'Lecture (Espace)'}
              >
                {isPlaying ? (
                  <svg viewBox='0 0 24 24' width='16' height='16' fill='currentColor'>
                    <path d='M6 19h4V5H6v14zm8-14v14h4V5h-4z' />
                  </svg>
                ) : (
                  <svg viewBox='0 0 24 24' width='16' height='16' fill='currentColor' style={{ marginLeft: '2px' }}>
                    <path d='M8 5v14l11-7z' />
                  </svg>
                )}
              </button>

              <button
                onClick={handleNext}
                className='p-1.5 text-gray-300 hover:text-white transition-colors cursor-pointer'
                title='Piste suivante'
              >
                <svg viewBox='0 0 24 24' width='16' height='16' fill='currentColor'>
                  <path d='M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z' />
                </svg>
              </button>
            </div>

            {/* Volume Control */}
            <div className='flex items-center gap-2'>
              <button
                onClick={handleMuteToggle}
                className='text-gray-400 hover:text-white transition-colors'
                title={isMuted ? 'Réactiver le son' : 'Couper le son'}
              >
                {isMuted || volume === 0 ? '🔇' : '🔊'}
              </button>
              <input
                type='range'
                min='0'
                max='1'
                step='0.05'
                value={isMuted ? 0 : volume}
                onChange={e => handleVolumeChange(parseFloat(e.target.value))}
                className='w-16 accent-cyber-yellow h-1 bg-black/50 rounded cursor-pointer'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingMiniPlayer;
