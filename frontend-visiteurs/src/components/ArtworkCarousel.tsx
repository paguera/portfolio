import React, { useState, useEffect, useCallback, useRef } from "react";
import { artworks as defaultArtworks } from "../data/artworks";
import type { Artwork, ArtworkComment, RatingStats } from "../types";
import { apiFetch } from "../utils/api";

const ArtworkCarousel: React.FC = () => {
  const [artworksList, setArtworksList] = useState<Artwork[]>(defaultArtworks);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Ratings & Comments State
  const [currentStats, setCurrentStats] = useState<RatingStats>({ average_rating: 0, rating_count: 0 });
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState<string | null>(null);

  // Comments state
  const [comments, setComments] = useState<ArtworkComment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentFeedback, setCommentFeedback] = useState<string | null>(null);

  const getVisitorId = () => {
    let visitorUuid = localStorage.getItem("paguera_visitor_id");
    if (!visitorUuid) {
      visitorUuid = crypto.randomUUID();
      localStorage.setItem("paguera_visitor_id", visitorUuid);
    }
    return visitorUuid;
  };

  const fetchArtworks = async () => {
    try {
      const data = await apiFetch<Artwork[]>("/artworks");
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map((item) => ({
          ...item,
          src: item.image_url || item.src || "",
          average_rating: item.average_rating ? Number(item.average_rating) : 0,
          rating_count: item.rating_count ? Number(item.rating_count) : 0,
        }));
        setArtworksList(formatted);
      }
    } catch (err) {
      console.warn("Utilisation de la galerie statique locale:", err);
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, []);

  const currentArtwork = artworksList[currentIndex] || artworksList[0];

  // Fetch comments and stats when current artwork changes
  useEffect(() => {
    if (!currentArtwork?.id) return;

    setCurrentStats({
      average_rating: currentArtwork.average_rating || 0,
      rating_count: currentArtwork.rating_count || 0,
    });
    setUserRating(null);
    setRatingMessage(null);
    setCommentFeedback(null);

    const fetchDetails = async () => {
      try {
        const [statsData, commentsData] = await Promise.all([
          apiFetch<RatingStats>(`/artworks/${currentArtwork.id}/ratings`).catch(() => ({
            average_rating: currentArtwork.average_rating || 0,
            rating_count: currentArtwork.rating_count || 0,
          })),
          apiFetch<ArtworkComment[]>(`/artworks/${currentArtwork.id}/comments`).catch(() => []),
        ]);

        if (statsData) {
          setCurrentStats({
            average_rating: Number(statsData.average_rating) || 0,
            rating_count: Number(statsData.rating_count) || 0,
          });
        }
        if (Array.isArray(commentsData)) {
          setComments(commentsData);
        }
      } catch (e) {
        console.debug("Details fetch fallback", e);
      }
    };

    fetchDetails();
  }, [currentArtwork?.id, currentIndex]);

  const handleRate = async (rating: number) => {
    if (!currentArtwork?.id || isSubmittingRating) return;
    setIsSubmittingRating(true);
    try {
      const visitorUuid = getVisitorId();
      const res = await apiFetch<{ message: string; stats: RatingStats }>(
        `/artworks/${currentArtwork.id}/rate`,
        {
          method: "POST",
          body: JSON.stringify({ rating, visitor_uuid: visitorUuid }),
        }
      );
      setUserRating(rating);
      if (res.stats) {
        setCurrentStats({
          average_rating: Number(res.stats.average_rating) || rating,
          rating_count: Number(res.stats.rating_count) || 1,
        });
      }
      setRatingMessage("Merci pour votre note ! ⭐");
      setTimeout(() => setRatingMessage(null), 4000);
    } catch (err: any) {
      setRatingMessage(err.message || "Erreur lors de la notation");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentArtwork?.id || !commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    setCommentFeedback(null);
    try {
      const visitorUuid = getVisitorId();
      const res = await apiFetch<{ message: string; data: ArtworkComment }>(
        `/artworks/${currentArtwork.id}/comments`,
        {
          method: "POST",
          body: JSON.stringify({
            author_name: authorName.trim() || "Visiteur",
            comment: commentText.trim(),
            visitor_uuid: visitorUuid,
          }),
        }
      );

      if (res.data) {
        setComments((prev) => [res.data, ...prev]);
      }
      setCommentText("");
      setCommentFeedback("Votre commentaire a bien été publié !");
      setTimeout(() => setCommentFeedback(null), 4000);
    } catch (err: any) {
      setCommentFeedback(err.message || "Erreur lors de l'envoi du commentaire");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const nextSlide = useCallback(() => {
    if (artworksList.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % artworksList.length);
  }, [artworksList.length]);

  const prevSlide = useCallback(() => {
    if (artworksList.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + artworksList.length) % artworksList.length);
  }, [artworksList.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (event.key === "ArrowRight") {
        nextSlide();
      } else if (event.key === "ArrowLeft") {
        prevSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [nextSlide, prevSlide]);

  // Autoplay (disabled when comments open or hovered)
  useEffect(() => {
    if (isHovered || showComments || artworksList.length <= 1) return;
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, [nextSlide, isHovered, showComments, artworksList.length]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
  };

  if (artworksList.length === 0) {
    return null;
  }

  const imageSource = currentArtwork?.src || currentArtwork?.image_url || "";

  return (
    <div
      className="w-full max-w-5xl mx-auto flex flex-col items-center px-2 sm:px-4 space-y-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Artwork Display Frame with Floating Controls */}
      <div className="relative w-full aspect-[3/4] sm:aspect-[4/3] md:aspect-video max-h-[72vh] flex items-center justify-center bg-[#090d16] border-2 sm:border-4 border-white/10 rounded-xl shadow-2xl overflow-hidden group">
        {/* Left Arrow Button */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-black/70 hover:bg-cyber-yellow text-white hover:text-black border border-white/20 hover:border-cyber-yellow transition-all duration-300 backdrop-blur-md cursor-pointer shadow-lg active:scale-95"
          aria-label="Dessin précédent"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Image Container */}
        <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 md:p-6">
          <img
            key={currentArtwork.id}
            src={imageSource}
            alt={currentArtwork.title}
            decoding="async"
            className="w-full h-full object-contain rounded-sm select-none transition-all duration-500 filter contrast-105 brightness-95"
            draggable="false"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/LOGO.avif";
            }}
          />
        </div>

        {/* Image Counter Badge */}
        <div className="absolute top-3 right-3 z-20 bg-black/75 backdrop-blur-md text-white text-xs font-mono px-3 py-1 rounded-full border border-white/20 tracking-wider">
          {String(currentIndex + 1).padStart(2, "0")} / {String(artworksList.length).padStart(2, "0")}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-black/70 hover:bg-cyber-yellow text-white hover:text-black border border-white/20 hover:border-cyber-yellow transition-all duration-300 backdrop-blur-md cursor-pointer shadow-lg active:scale-95"
          aria-label="Dessin suivant"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Artwork Meta & Rating Card */}
      <div className="w-full bg-bg-panel/80 border border-white/10 p-6 rounded-2xl space-y-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="text-center md:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h3 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                {currentArtwork.title}
              </h3>
              <span className="text-xs font-mono text-cyber-yellow bg-cyber-yellow/10 border border-cyber-yellow/30 px-2 py-0.5 rounded">
                {currentArtwork.year || "2026"}
              </span>
            </div>
            <p className="text-xs font-mono text-gray-400">
              {currentArtwork.artist || "GABRIEL VF"} · {currentArtwork.medium || "Technique mixte"}{" "}
              {currentArtwork.dimensions ? `(${currentArtwork.dimensions})` : ""}
            </p>
          </div>

          {/* Interactive Star Rating Widget (Style Marsai) */}
          <div className="flex flex-col items-center md:items-end space-y-1">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled =
                  (hoverRating !== null ? hoverRating : userRating || Math.round(currentStats.average_rating)) >= star;
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
                    aria-label={`Noter ${star} étoiles sur 5`}
                  >
                    {isFilled ? "★" : "☆"}
                  </button>
                );
              })}
              <span className="text-sm font-black font-mono text-white ml-2">
                {currentStats.average_rating > 0 ? currentStats.average_rating.toFixed(1) : "—"}/5
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
              <span>{currentStats.rating_count} avis</span>
              <span>·</span>
              <button
                type="button"
                onClick={() => setShowComments(!showComments)}
                className="text-cyber-yellow hover:underline cursor-pointer flex items-center gap-1 font-bold"
              >
                <span>💬 {comments.length} commentaires</span>
                <span>{showComments ? "▲" : "▼"}</span>
              </button>
            </div>
            {ratingMessage && (
              <span className="text-xs font-mono text-cyber-yellow animate-fade-in">
                {ratingMessage}
              </span>
            )}
          </div>
        </div>

        {currentArtwork.description && (
          <p className="text-xs sm:text-sm font-sans text-gray-300 leading-relaxed max-w-3xl">
            {currentArtwork.description}
          </p>
        )}

        {/* COMMENTS SECTION (EXPANDABLE) */}
        {showComments && (
          <div className="pt-4 border-t border-white/10 space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black font-mono uppercase tracking-wider text-white flex items-center gap-2">
                <span>💬 Avis & Réactions des Visiteurs</span>
                <span className="text-xs font-normal text-gray-400">({comments.length})</span>
              </h4>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="space-y-3 bg-black/30 p-4 rounded-xl border border-white/5">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Votre prénom ou pseudo"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  maxLength={60}
                  className="sm:w-1/3 bg-bg-main text-white placeholder-gray-500 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono focus:border-cyber-yellow focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Laissez votre impression ou commentaire sur ce dessin..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  maxLength={1000}
                  required
                  className="grow bg-bg-main text-white placeholder-gray-500 border border-white/10 rounded-lg px-3 py-2 text-xs font-sans focus:border-cyber-yellow focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !commentText.trim()}
                  className="px-4 py-2 bg-cyber-yellow text-black font-black uppercase text-xs font-mono tracking-wider rounded-lg hover:bg-yellow-300 transition-all disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {isSubmittingComment ? "Envoi..." : "Publier"}
                </button>
              </div>
              {commentFeedback && (
                <p className="text-xs font-mono text-cyber-yellow">{commentFeedback}</p>
              )}
            </form>

            {/* Comments List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-xs font-mono text-gray-400 italic py-2">
                  Aucun commentaire pour le moment. Soyez le premier à partager votre ressenti !
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
                          ? new Date(comm.created_at).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : ""}
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

      {/* Slide dots indicators */}
      <div className="flex space-x-1.5 max-w-full overflow-x-auto py-2">
        {artworksList.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              index === currentIndex
                ? "bg-cyber-yellow scale-125 border border-cyber-yellow"
                : "bg-white/20 hover:bg-white/50"
            }`}
            aria-label={`Aller au dessin ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ArtworkCarousel;
