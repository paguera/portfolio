import React, { useState, useEffect } from 'react';
import type { Track } from './types';
import { apiFetch } from '../../utils/api';

interface TrackRatingStats {
  track_id: string;
  average_rating: number;
  rating_count: number;
}

interface TrackComment {
  id: number;
  track_id: string;
  author_name: string;
  comment: string;
  is_approved?: boolean;
  created_at: string;
}

interface TrackFeedbackProps {
  currentTrack: Track | null;
}

const TrackFeedback: React.FC<TrackFeedbackProps> = ({ currentTrack }) => {
  const [stats, setStats] = useState<TrackRatingStats>({
    track_id: '',
    average_rating: 0,
    rating_count: 0
  });
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingFeedback, setRatingFeedback] = useState<string | null>(null);

  // Comments
  const [comments, setComments] = useState<TrackComment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentFeedback, setCommentFeedback] = useState<string | null>(null);

  const getVisitorId = () => {
    let visitorUuid = localStorage.getItem('paguera_visitor_id');
    if (!visitorUuid) {
      visitorUuid = crypto.randomUUID();
      localStorage.setItem('paguera_visitor_id', visitorUuid);
    }
    return visitorUuid;
  };

  useEffect(() => {
    if (!currentTrack?.id) return;

    setUserRating(null);
    setRatingFeedback(null);
    setCommentFeedback(null);

    const fetchTrackDetails = async () => {
      try {
        const [statsData, commentsData] = await Promise.all([
          apiFetch<TrackRatingStats>(`/tracks/${currentTrack.id}/ratings`).catch(() => ({
            track_id: currentTrack.id,
            average_rating: 0,
            rating_count: 0
          })),
          apiFetch<TrackComment[]>(`/tracks/${currentTrack.id}/comments`).catch(() => [])
        ]);

        if (statsData) {
          setStats({
            track_id: currentTrack.id,
            average_rating: Number(statsData.average_rating) || 0,
            rating_count: Number(statsData.rating_count) || 0
          });
        }
        if (Array.isArray(commentsData)) {
          setComments(commentsData);
        }
      } catch (err) {
        console.debug('Failed to load track rating/comments', err);
      }
    };

    fetchTrackDetails();
  }, [currentTrack?.id]);

  const handleRate = async (rating: number) => {
    if (!currentTrack?.id || isSubmittingRating) return;
    setIsSubmittingRating(true);
    try {
      const visitorUuid = getVisitorId();
      const res = await apiFetch<{ message: string; stats: TrackRatingStats }>(
        `/tracks/${currentTrack.id}/rate`,
        {
          method: 'POST',
          body: JSON.stringify({ rating, visitor_uuid: visitorUuid })
        }
      );
      setUserRating(rating);
      if (res.stats) {
        setStats({
          track_id: currentTrack.id,
          average_rating: Number(res.stats.average_rating) || rating,
          rating_count: Number(res.stats.rating_count) || 1
        });
      }
      setRatingFeedback('Merci pour votre vote ! ⭐');
      setTimeout(() => setRatingFeedback(null), 4000);
    } catch (err: any) {
      setRatingFeedback(err.message || 'Erreur lors de la notation');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTrack?.id || !commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    setCommentFeedback(null);
    try {
      const visitorUuid = getVisitorId();
      const res = await apiFetch<{ message: string; data: TrackComment }>(
        `/tracks/${currentTrack.id}/comments`,
        {
          method: 'POST',
          body: JSON.stringify({
            author_name: authorName.trim() || 'Visiteur',
            comment: commentText.trim(),
            visitor_uuid: visitorUuid
          })
        }
      );

      if (res.data) {
        setComments(prev => [res.data, ...prev]);
      }
      setCommentText('');
      setCommentFeedback('Votre commentaire a bien été publié !');
      setTimeout(() => setCommentFeedback(null), 4000);
    } catch (err: any) {
      setCommentFeedback(err.message || "Erreur lors de l'envoi");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (!currentTrack) {
    return null;
  }

  return (
    <div className="w-full bg-[#161822]/90 border border-white/10 p-5 md:p-6 rounded-2xl shadow-xl backdrop-blur-md mt-6 text-white space-y-4">
      {/* Top bar: Track Info & Stars */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyber-yellow bg-cyber-yellow/10 border border-cyber-yellow/30 px-2.5 py-0.5 rounded uppercase font-bold">
              {currentTrack.playlist || 'Musique'}
            </span>
            <span className="text-xs font-mono text-gray-400">
              Évaluation du morceau
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white mt-1">
            {currentTrack.title}
          </h3>
          <p className="text-xs font-mono text-gray-400">
            {currentTrack.artist} · {currentTrack.album}
          </p>
        </div>

        {/* Star Rating Controls */}
        <div className="flex flex-col items-start sm:items-end space-y-1">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled =
                (hoverRating !== null ? hoverRating : userRating || Math.round(stats.average_rating)) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  disabled={isSubmittingRating}
                  className="text-2xl transition-transform hover:scale-125 focus:outline-none cursor-pointer p-0.5 text-cyber-yellow"
                  title={`Noter ${star}/5`}
                  aria-label={`Noter ${star} sur 5`}
                >
                  {isFilled ? '★' : '☆'}
                </button>
              );
            })}
            <span className="text-sm font-black font-mono ml-2 text-white">
              {stats.average_rating > 0 ? stats.average_rating.toFixed(1) : '—'}/5
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <span>{stats.rating_count} avis</span>
            <span>·</span>
            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              className="text-cyber-yellow hover:underline cursor-pointer flex items-center gap-1 font-bold"
            >
              <span>💬 {comments.length} réactions</span>
              <span>{showComments ? '▲' : '▼'}</span>
            </button>
          </div>
          {ratingFeedback && (
            <span className="text-xs font-mono text-cyber-yellow animate-fade-in">
              {ratingFeedback}
            </span>
          )}
        </div>
      </div>

      {/* Expandable Comments Drawer */}
      {showComments && (
        <div className="space-y-4 pt-2 animate-in fade-in duration-300">
          <h4 className="text-xs font-black font-mono uppercase tracking-wider text-gray-300 flex items-center gap-2">
            <span>💬 Avis & Impressions sur ce son</span>
            <span className="text-gray-500">({comments.length})</span>
          </h4>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="space-y-3 bg-black/40 p-4 rounded-xl border border-white/5">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Votre nom ou pseudo"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                maxLength={60}
                className="sm:w-1/3 bg-[#0e1017] text-white placeholder-gray-500 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono focus:border-cyber-yellow focus:outline-none"
              />
              <input
                type="text"
                placeholder="Laissez votre avis, retour ou commentaire sur cette composition..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={1000}
                required
                className="grow bg-[#0e1017] text-white placeholder-gray-500 border border-white/10 rounded-lg px-3 py-2 text-xs font-sans focus:border-cyber-yellow focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !commentText.trim()}
                className="px-4 py-2 bg-cyber-yellow text-black font-black uppercase text-xs font-mono tracking-wider rounded-lg hover:bg-yellow-300 transition-all disabled:opacity-50 cursor-pointer shrink-0"
              >
                {isSubmittingComment ? 'Envoi...' : 'Publier'}
              </button>
            </div>
            {commentFeedback && (
              <p className="text-xs font-mono text-cyber-yellow">{commentFeedback}</p>
            )}
          </form>

          {/* Comments List */}
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="text-xs font-mono text-gray-400 italic py-2">
                Aucun avis pour l'instant sur ce titre. Donnez le vôtre !
              </p>
            ) : (
              comments.map((comm) => (
                <div
                  key={comm.id}
                  className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-gray-400 font-mono text-[11px]">
                    <span className="font-bold text-cyber-yellow">{comm.author_name}</span>
                    <span>
                      {comm.created_at
                        ? new Date(comm.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })
                        : ''}
                    </span>
                  </div>
                  <p className="text-gray-200 font-sans leading-relaxed">{comm.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackFeedback;
