import React from "react";
import { Helmet } from "react-helmet-async";
import ArtworkCarousel from "../components/ArtworkCarousel";

const Home: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Accueil - Galerie d'Art</title>
        <meta
          name="description"
          content="Bienvenue sur mon portfolio. Découvrez mon exposition de dessins d'art contemporain et mes projets."
        />
      </Helmet>
      <div className="flex flex-col items-center justify-center min-h-[70vh] md:min-h-[85vh] py-2 md:py-6">
        <ArtworkCarousel />
      </div>
    </>
  );
};

export default Home;
