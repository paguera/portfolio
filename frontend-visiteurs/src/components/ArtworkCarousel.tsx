import React, { useState, useEffect, useCallback } from "react";
import { artworks } from "../data/artworks";

const ArtworkCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

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

  const currentArtwork = artworks[currentIndex];

  return (
    <div
      className="w-full max-w-10xl mx-auto flex flex-col items-center px-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer Flex Container for Arrows + Image Frame */}
      <div className="w-full flex items-center justify-between gap-4 md:gap-6">

        {/* Left Arrow (Outside Frame) */}
        <button
          onClick={prevSlide}
          className="p-3 rounded-full bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 hover:border-white transition-all duration-300 cursor-pointer flex-shrink-0"
          aria-label="Dessin précédent"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Center Artwork Display Frame */}
        <div className="relative flex-1 aspect-square md:aspect-video flex items-center justify-center bg-[#090d16] border-4 border-white/10 rounded-lg shadow-2xl overflow-hidden">

          {/* Image Container with Crossfade effect */}
          <div className="w-full h-full flex items-center justify-center p-4">
            <img
              key={currentArtwork.id}
              src={currentArtwork.src}
              alt={currentArtwork.title}
              decoding="async"
              className="max-w-full max-h-full object-contain rounded-sm select-none transition-all duration-500 animate-tab-content filter contrast-105 brightness-95"
              draggable="false"
            />
          </div>

          {/* Image Counter Badge */}
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-mono px-3 py-1.5 rounded-full border border-white/20 tracking-wider">
            {String(currentIndex + 1).padStart(2, '0')} / {String(artworks.length).padStart(2, '0')}
          </div>
        </div>

        {/* Right Arrow (Outside Frame) */}
        <button
          onClick={nextSlide}
          className="p-3 rounded-full bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 hover:border-white transition-all duration-300 cursor-pointer flex-shrink-0"
          aria-label="Dessin suivant"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Slide dots indicators */}
      <div className="flex space-x-1.5 mt-6 max-w-full overflow-x-auto py-2">
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
