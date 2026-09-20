import React, { useState, useEffect, useCallback, useRef } from "react";
import { artworks } from "../data/artworks";

const ArtworkCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % artworks.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + artworks.length) % artworks.length);
  }, []);

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
    if (isHovered) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, isHovered]);

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

  const currentArtwork = artworks[currentIndex];

  return (
    <div
      className="w-full max-w-6xl mx-auto flex flex-col items-center px-0 sm:px-4"
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
            src={currentArtwork.src}
            alt={currentArtwork.title}
            decoding="async"
            className="w-full h-full object-contain rounded-sm select-none transition-all duration-500 animate-tab-content filter contrast-105 brightness-95"
            draggable="false"
          />
        </div>

        {/* Image Counter Badge */}
        <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-20 bg-black/70 backdrop-blur-md text-white text-[10px] sm:text-xs font-mono px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/20 tracking-wider">
          {String(currentIndex + 1).padStart(2, '0')} / {String(artworks.length).padStart(2, '0')}
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

      {/* Slide dots indicators */}
      <div className="flex space-x-1.5 mt-4 sm:mt-6 max-w-full overflow-x-auto py-2">
        {artworks.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              index === currentIndex
                ? "bg-white scale-125 border border-white"
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
