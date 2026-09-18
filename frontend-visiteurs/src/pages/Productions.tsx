import React from "react";
import { Helmet } from "react-helmet-async";
import SoundwaveApp from "../components/soundwave/SoundwaveApp";

const Productions: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Productions sonores</title>
        <meta
          name="description"
          content="Visualiseur audio interactif Soundwave, synthétiseur et expérimentations sonores intégrés au portfolio Paguera."
        />
      </Helmet>

      <div className="w-full">
        <SoundwaveApp />
      </div>
    </>
  );
};

export default Productions;
