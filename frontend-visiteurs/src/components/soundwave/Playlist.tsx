import React from 'react';
import type { Track } from './types';

interface PlaylistProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onTrackSelect: (track: Track) => void;
}

const Playlist: React.FC<PlaylistProps> = ({ tracks, currentTrack, isPlaying, onTrackSelect }) => {
  return (
    <div className="playlist-card">
      <div className="playlist-header">
        <h3>Ma Playlist</h3>
        <span className="track-count">{tracks.length} Pistes</span>
      </div>
      <ul className="track-list">
        {tracks.map((track, idx) => {
          const isActive = currentTrack?.id === track.id;
          return (
            <li 
              key={track.id}
              className={`track-item ${isActive ? 'active' : ''}`}
              onClick={() => onTrackSelect(track)}
            >
              <div className="track-left">
                <span className="track-index">
                  {isActive && isPlaying ? (
                    <div className="eq-icon">
                      <span className="eq-bar"></span>
                      <span className="eq-bar"></span>
                      <span className="eq-bar"></span>
                    </div>
                  ) : (
                    String(idx + 1).padStart(2, '0')
                  )}
                </span>
                
                <div 
                  className="track-cover" 
                  style={{ background: track.coverGradient }} 
                />
                
                <div className="track-meta">
                  <span className="track-title">{track.title}</span>
                  <span className="track-artist">{track.artist}</span>
                </div>
              </div>
              
              <div className="track-right">
                <span className="track-duration">{track.duration}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Playlist;
