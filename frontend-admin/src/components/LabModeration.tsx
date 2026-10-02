import React, { useEffect, useState, useCallback } from 'react'
import type { ArtworkCommentAdmin, Artwork, TrackCommentAdmin, TrackRatingStatsAdmin } from '../types'
import apiFetch from '../utils/api'

const LabModeration: React.FC = () => {
  const [labSection, setLabSection] = useState<'artworks' | 'tracks'>('artworks')

  // Artworks Data
  const [artworkComments, setArtworkComments] = useState<ArtworkCommentAdmin[]>([])
  const [artworks, setArtworks] = useState<Artwork[]>([])

  // Tracks Data
  const [trackComments, setTrackComments] = useState<TrackCommentAdmin[]>([])
  const [trackRatings, setTrackRatings] = useState<TrackRatingStatsAdmin[]>([])

  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all')

  const fetchData = useCallback(async () => {
    try {
      const [artCommentsData, artworksData, trkCommentsData, trkRatingsData] = await Promise.all([
        apiFetch<ArtworkCommentAdmin[]>('/artworks/admin/comments').catch(() => []),
        apiFetch<Artwork[]>('/artworks?all=true').catch(() => []),
        apiFetch<TrackCommentAdmin[]>('/tracks/admin/comments').catch(() => []),
        apiFetch<TrackRatingStatsAdmin[]>('/tracks/ratings/all').catch(() => [])
      ])
      setArtworkComments(Array.isArray(artCommentsData) ? artCommentsData : [])
      setArtworks(Array.isArray(artworksData) ? artworksData : [])
      setTrackComments(Array.isArray(trkCommentsData) ? trkCommentsData : [])
      setTrackRatings(Array.isArray(trkRatingsData) ? trkRatingsData : [])
    } catch (err) {
      console.error('Erreur chargement modération Lab:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Artwork Handlers
  const handleToggleArtworkApproval = async (id: number, currentStatus: boolean) => {
    try {
      await apiFetch(`/artworks/admin/comments/${id}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({ is_approved: !currentStatus })
      })
      setArtworkComments(prev =>
        prev.map(c => (c.id === id ? { ...c, is_approved: !currentStatus } : c))
      )
    } catch (err) {
      alert(`Erreur: ${err instanceof Error ? err.message : 'Impossible de modifier le statut'}`)
    }
  }

  const handleDeleteArtworkComment = async (id: number) => {
    if (!confirm('Supprimer définitivement ce commentaire de dessin ?')) return
    try {
      await apiFetch(`/artworks/admin/comments/${id}`, {
        method: 'DELETE'
      })
      setArtworkComments(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      alert(`Erreur: ${err instanceof Error ? err.message : 'Impossible de supprimer'}`)
    }
  }

  // Track Handlers
  const handleToggleTrackApproval = async (id: number, currentStatus: boolean) => {
    try {
      await apiFetch(`/tracks/admin/comments/${id}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({ is_approved: !currentStatus })
      })
      setTrackComments(prev =>
        prev.map(c => (c.id === id ? { ...c, is_approved: !currentStatus } : c))
      )
    } catch (err) {
      alert(`Erreur: ${err instanceof Error ? err.message : 'Impossible de modifier le statut'}`)
    }
  }

  const handleDeleteTrackComment = async (id: number) => {
    if (!confirm('Supprimer définitivement ce commentaire de musique ?')) return
    try {
      await apiFetch(`/tracks/admin/comments/${id}`, {
        method: 'DELETE'
      })
      setTrackComments(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      alert(`Erreur: ${err instanceof Error ? err.message : 'Impossible de supprimer'}`)
    }
  }

  const activeCommentsList = labSection === 'artworks' ? artworkComments : trackComments

  const filteredComments = activeCommentsList.filter(c => {
    if (filter === 'approved') return c.is_approved
    if (filter === 'pending') return !c.is_approved
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-cyber-yellow font-mono text-xs">
        Chargement des avis et commentaires du Lab (Dessins & Musique)...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Sub Section Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLabSection('artworks')}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase rounded-lg transition-all cursor-pointer ${
              labSection === 'artworks'
                ? 'bg-cyber-purple text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            🎨 Galerie Dessins ({artworkComments.length})
          </button>
          <button
            type="button"
            onClick={() => setLabSection('tracks')}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase rounded-lg transition-all cursor-pointer ${
              labSection === 'tracks'
                ? 'bg-cyber-yellow text-black font-black shadow-lg'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            🎵 Compositions Musiques ({trackComments.length})
          </button>
        </div>

        <div className="text-xs font-mono text-gray-400">
          Total avis Lab : <span className="text-white font-bold">{artworkComments.length + trackComments.length}</span>
        </div>
      </div>

      {/* Global Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-bg-panel/70 border border-white/10 p-5 rounded-xl">
          <div className="text-xs font-mono uppercase text-gray-400">
            {labSection === 'artworks' ? 'Commentaires Dessins' : 'Commentaires Musiques'}
          </div>
          <div className="text-2xl font-black text-white mt-1">{activeCommentsList.length}</div>
        </div>
        <div className="bg-bg-panel/70 border border-white/10 p-5 rounded-xl">
          <div className="text-xs font-mono uppercase text-gray-400">Commentaires Validés</div>
          <div className="text-2xl font-black text-green-400 mt-1">
            {activeCommentsList.filter(c => c.is_approved).length}
          </div>
        </div>
        <div className="bg-bg-panel/70 border border-white/10 p-5 rounded-xl">
          <div className="text-xs font-mono uppercase text-gray-400">
            {labSection === 'artworks' ? 'Œuvres Notées' : 'Musiques Notées'}
          </div>
          <div className="text-2xl font-black text-cyber-yellow mt-1">
            {labSection === 'artworks'
              ? `${artworks.filter(a => (a.rating_count || 0) > 0).length} / ${artworks.length}`
              : `${trackRatings.length} titres notés`}
          </div>
        </div>
      </div>

      {/* Ratings Overview Section */}
      <div className="bg-bg-panel/70 border border-white/10 p-6 rounded-xl space-y-4">
        <h3 className="text-sm font-black font-mono uppercase text-white tracking-wider">
          ⭐ {labSection === 'artworks' ? 'Notes par Œuvre (Dessin)' : 'Notes par Morceau (Musique)'}
        </h3>

        {labSection === 'artworks' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {artworks.map(art => (
              <div
                key={art.id}
                className="p-3 bg-black/30 border border-white/5 rounded-lg flex items-center justify-between text-xs font-mono"
              >
                <div className="truncate mr-2">
                  <span className="font-bold text-white block truncate">{art.title}</span>
                  <span className="text-[10px] text-gray-400">{art.year}</span>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-cyber-yellow font-black">
                    ⭐ {art.average_rating ? Number(art.average_rating).toFixed(1) : '—'}/5
                  </span>
                  <span className="text-[10px] text-gray-400 block">
                    {art.rating_count || 0} vote{(art.rating_count || 0) > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {trackRatings.length === 0 ? (
              <p className="text-xs font-mono text-gray-400 italic col-span-3 py-2">
                Aucun vote enregistré pour le moment sur les musiques.
              </p>
            ) : (
              trackRatings.map(tr => (
                <div
                  key={tr.track_id}
                  className="p-3 bg-black/30 border border-white/5 rounded-lg flex items-center justify-between text-xs font-mono"
                >
                  <div className="truncate mr-2">
                    <span className="font-bold text-white block truncate">Piste #{tr.track_id}</span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-cyber-yellow font-black">
                      ⭐ {Number(tr.average_rating).toFixed(1)}/5
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      {tr.rating_count} vote{tr.rating_count > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Comments Moderation List */}
      <div className="bg-bg-panel/70 border border-white/10 p-6 rounded-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black font-mono uppercase text-white tracking-wider">
              💬 Modération des Avis {labSection === 'artworks' ? 'sur les Dessins' : 'sur les Musiques'}
            </h3>
            <p className="text-xs font-mono text-gray-400">
              Gérez la publication et la modération des réactions des visiteurs
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(['all', 'approved', 'pending'] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`text-xs font-mono uppercase px-3 py-1.5 rounded transition-all cursor-pointer ${
                  filter === f
                    ? 'bg-cyber-yellow text-black font-bold'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {f === 'all' ? 'Tous' : f === 'approved' ? 'Publiés' : 'Masqués'}
              </button>
            ))}
          </div>
        </div>

        {filteredComments.length === 0 ? (
          <p className="text-xs font-mono text-gray-400 italic py-6 text-center">
            Aucun commentaire dans cette catégorie ({labSection === 'artworks' ? 'Dessins' : 'Musique'}).
          </p>
        ) : (
          <div className="space-y-3">
            {filteredComments.map((c: any) => (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-cyber-yellow/30 transition-all"
              >
                <div className="space-y-1.5 grow">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className="font-bold text-cyber-yellow">{c.author_name}</span>
                    <span className="text-gray-500">sur</span>
                    <span className="text-white font-semibold bg-white/5 px-2 py-0.5 rounded">
                      {labSection === 'artworks'
                        ? (c.artwork_title || `Œuvre #${c.artwork_id}`)
                        : `Piste musicale #${c.track_id}`}
                    </span>
                    <span className="text-gray-500 text-[11px]">
                      {new Date(c.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        c.is_approved
                          ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {c.is_approved ? 'Publié' : 'Masqué'}
                    </span>
                  </div>
                  <p className="text-xs font-sans text-gray-200 leading-relaxed max-w-3xl">
                    {c.comment}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      labSection === 'artworks'
                        ? handleToggleArtworkApproval(c.id, c.is_approved)
                        : handleToggleTrackApproval(c.id, c.is_approved)
                    }
                    className={`px-3 py-1.5 rounded text-xs font-mono uppercase font-bold cursor-pointer transition-colors ${
                      c.is_approved
                        ? 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        : 'bg-green-500/10 hover:bg-green-500/20 text-green-300 border border-green-500/30'
                    }`}
                  >
                    {c.is_approved ? 'Masquer' : 'Approuver'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      labSection === 'artworks'
                        ? handleDeleteArtworkComment(c.id)
                        : handleDeleteTrackComment(c.id)
                    }
                    className="px-3 py-1.5 rounded text-xs font-mono uppercase font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 cursor-pointer transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LabModeration
