import React, { useState, useEffect, useCallback, useRef } from "react";
import { artworks as defaultArtworks } from "../data/artworks";
import type { Artwork } from "../types";
import { apiFetch } from "../utils/api";

const ArtworkCarousel: React.FC = () => {
  const [artworksList, setArtworksList] = useState<Artwork[]>(defaultArtworks);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const data = await apiFetch<Artwork[]>("/artworks");
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map(item => ({
            ...item,
            src: item.image_url || item.src || ""
          }));
          setArtworksList(formatted);
        }
      } catch (err) {
        console.warn("Utilisation de la galerie statique locale:", err);
      }
    };

    fetchArtworks();
  }, []);

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

  // Autoplay
  useEffect(() => {
    if (isHovered || artworksList.length <= 1) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide, isHovered, artworksList.length]);

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

  const currentArtwork = artworksList[currentIndex] || artworksList[0];
  const imageSource = currentArtwork.src || currentArtwork.image_url || "";

  return (
    <div
      className="w-full max-w-6xl mx-auto flex flex-col items-center px-0 sm:px-4 space-y-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Artwork Display Frame with Floating Controls */}
      <div className="relative w-full aspect-[3/4] sm:aspect-[4/3] md:aspect-video max-h-[75vh] flex items-center justify-center bg-[#090d16] border-2 sm:border-4 border-white/10 rounded-lg sm:rounded-xl shadow-2xl overflow-hidden group">
        {/* Left Arrow Button */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-white text-white hover:text-black border border-white/20 hover:border-white transition-all duration-300 backdrop-blur-md cursor-pointer shadow-lg active:scale-95"
          aria-label="Dessin précédent"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Image Container with Crossfade effect */}
        <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 md:p-6">
          <img
            key={currentArtwork.id}
            src={imageSource}
            alt={currentArtwork.title}
            decoding="async"
            className="w-full h-full object-contain rounded-sm select-none transition-all duration-500 animate-tab-content filter contrast-105 brightness-95"
            draggable="false"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/dessins-salepropre/01.webp";
            }}
          />
        </div>

        {/* Image Counter Badge */}
        <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-20 bg-black/70 backdrop-blur-md text-white text-[10px] sm:text-xs font-mono px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/20 tracking-wider">
          {String(currentIndex + 1).padStart(2, '0')} / {String(artworksList.length).padStart(2, '0')}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-white text-white hover:text-black border border-white/20 hover:border-white transition-all duration-300 backdrop-blur-md cursor-pointer shadow-lg active:scale-95"
          aria-label="Dessin suivant"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Artwork Meta Information Card */}
      <div className="w-full max-w-2xl bg-bg-panel/70 border border-border-subtle p-5 rounded-xl text-center space-y-2 font-mono shadow-xl">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <h3 className="text-lg font-black uppercase text-white tracking-wide">
            {currentArtwork.title}
          </h3>
          <span className="text-xs text-cyber-yellow bg-cyber-yellow/10 border border-cyber-yellow/30 px-2 py-0.5 rounded">
            {currentArtwork.year}
          </span>
        </div>

        <p className="text-xs text-gray-400">
          {currentArtwork.artist} · {currentArtwork.medium} {currentArtwork.dimensions ? `(${currentArtwork.dimensions})` : ''}
        </p>

        {currentArtwork.description && (
          <p className="text-xs font-sans text-gray-300 leading-relaxed pt-1 max-w-lg mx-auto">
            {currentArtwork.description}
          </p>
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
