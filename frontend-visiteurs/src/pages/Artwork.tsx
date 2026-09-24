import React from "react";
import { Helmet } from "react-helmet-async";
import ArtworkCarousel from "../components/ArtworkCarousel";

const Artwork: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Galerie d'Art & Dessins | Paguera</title>
        <meta
          name="description"
          content="Exposition de dessins d'art contemporain et créations visuelles par Gabriel Fortier (Paguera)."
        />
      </Helmet>

      <div className="flex flex-col items-center justify-center min-h-[70vh] md:min-h-[85vh] py-2 md:py-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-2">
            Galerie d'Art
          </h1>
          <p className="text-sm font-mono text-gray-400 uppercase tracking-widest">
            Dessins contemporains & explorations graphiques
          </p>
        </div>
        <ArtworkCarousel />
      </div>
    </>
  );
};

export default Artwork;
