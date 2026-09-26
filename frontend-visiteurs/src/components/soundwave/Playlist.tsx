import React, { useState, useMemo } from 'react';
import type { Track, PlaylistInfo } from './types';

interface PlaylistProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onTrackSelect: (track: Track) => void;
  selectedPlaylist: string;
  onSelectPlaylist: (playlist: string) => void;
  playlists: PlaylistInfo[];
}

const Playlist: React.FC<PlaylistProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  onTrackSelect,
  selectedPlaylist,
  onSelectPlaylist,
  playlists
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrage selon la playlist et la recherche textuelle
  const filteredTracks = useMemo(() => {
    return tracks.filter(track => {
      const matchPlaylist =
        selectedPlaylist === 'all' ||
        (track.playlist && track.playlist.toLowerCase() === selectedPlaylist.toLowerCase()) ||
        (!track.playlist && selectedPlaylist === 'Général');

      const matchSearch =
        searchQuery.trim() === '' ||
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (track.playlist && track.playlist.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchPlaylist && matchSearch;
    });
  }, [tracks, selectedPlaylist, searchQuery]);

  return (
    <div className="playlist-card">
      <div className="playlist-header">
        <div className="playlist-header-title">
          <span className="playlist-icon">⚡</span>
          <h3>Playlists & Genres</h3>
        </div>
        <span className="track-count font-mono">{filteredTracks.length} / {tracks.length} Pistes</span>
      </div>

      {/* Playlist / Category Filter Tabs */}
      <div className="playlist-tabs-wrapper">
        <div className="playlist-tabs">
          {playlists.map(pl => (
            <button
              key={pl.id}
              className={`playlist-tab-btn ${selectedPlaylist.toLowerCase() === pl.id.toLowerCase() ? 'active' : ''}`}
              onClick={() => onSelectPlaylist(pl.id)}
            >
              <span className="tab-name">{pl.name}</span>
              <span className="tab-count">{pl.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar within Playlist */}
      <div className="playlist-search-box">
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="search-icon"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Rechercher un son ou un genre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="playlist-search-input"
        />
        {searchQuery && (
          <button
            className="clear-search-btn"
            onClick={() => setSearchQuery('')}
            title="Effacer la recherche"
          >
            ×
          </button>
        )}
      </div>

      {/* Track List */}
      <ul className="track-list">
        {filteredTracks.length === 0 ? (
          <li className="no-tracks-found">
            <p>Aucun titre trouvé dans cette catégorie</p>
          </li>
        ) : (
          filteredTracks.map((track, idx) => {
            const isActive = currentTrack?.id === track.id;
            return (
              <li
                key={track.id}
                className={`track-item ${isActive ? 'active' : ''}`}
                onClick={() => onTrackSelect(track)}
              >
                <div className="track-left">
                  <span className="track-index font-mono">
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
                  >
                    <div className="track-cover-center" />
                  </div>

                  <div className="track-meta">
                    <span className="track-title">{track.title}</span>
                    <div className="track-submeta">
                      <span className="track-artist">{track.artist}</span>
                      {track.playlist && (
                        <span className="track-genre-badge font-mono">
                          {track.playlist}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="track-right">
                  <span className="track-duration font-mono">{track.duration}</span>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};

export default Playlist;
