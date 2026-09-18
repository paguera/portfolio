import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook personnalisé pour analyser le flux audio d'un élément HTMLAudioElement.
 * Permet d'obtenir un analyseur global (mono), ainsi que des analyseurs séparés pour les canaux gauche et droit.
 */
export const useAudioAnalyser = (
  audioInput: React.RefObject<HTMLAudioElement | null> | HTMLAudioElement | null
) => {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [analyserL, setAnalyserL] = useState<AnalyserNode | null>(null);
  const [analyserR, setAnalyserR] = useState<AnalyserNode | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Récupère l'élément audio sous-jacent à partir de la ref ou de l'élément direct
  const getAudioElement = useCallback((): HTMLAudioElement | null => {
    if (!audioInput) return null;
    if ('current' in audioInput) {
      return audioInput.current;
    }
    return audioInput;
  }, [audioInput]);

  // Relance le contexte audio s'il a été suspendu par le navigateur (sécurité autoplay)
  const resumeAudio = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch((err) => {
        console.warn('Impossible de relancer le contexte audio :', err);
      });
    }
  }, []);

  // Initialise l'API Web Audio, crée les analyseurs et configure le routage
  const initAudio = useCallback(() => {
    const audioElement = getAudioElement();
    if (!audioElement) return;

    if (!audioContextRef.current) {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioCtx();

        // 1. Analyseur principal (mixage mono / global)
        const newAnalyser = audioContextRef.current.createAnalyser();
        newAnalyser.fftSize = 2048;
        newAnalyser.smoothingTimeConstant = 0.8;

        // 2. Analyseur pour le canal gauche
        const leftAnalyser = audioContextRef.current.createAnalyser();
        leftAnalyser.fftSize = 2048;
        leftAnalyser.smoothingTimeConstant = 0.8;

        // 3. Analyseur pour le canal droit
        const rightAnalyser = audioContextRef.current.createAnalyser();
        rightAnalyser.fftSize = 2048;
        rightAnalyser.smoothingTimeConstant = 0.8;

        // 4. Séparateur de canaux pour diviser la stéréo
        const splitter = audioContextRef.current.createChannelSplitter(2);

        if (!sourceNodeRef.current) {
          // Crée la source à partir de l'élément audio HTML
          sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioElement);
          
          // Connecte la source à l'analyseur principal
          sourceNodeRef.current.connect(newAnalyser);
          
          // Connecte la source au séparateur de canaux
          sourceNodeRef.current.connect(splitter);
          
          // Connecte la sortie 0 (Gauche) du séparateur à l'analyseur gauche
          splitter.connect(leftAnalyser, 0, 0);
          
          // Connecte la sortie 1 (Droite) du séparateur à l'analyseur droit
          splitter.connect(rightAnalyser, 1, 0);
          
          // Connecte l'analyseur principal vers la destination (les haut-parleurs) pour entendre le son
          newAnalyser.connect(audioContextRef.current.destination);
        }

        setAnalyser(newAnalyser);
        setAnalyserL(leftAnalyser);
        setAnalyserR(rightAnalyser);
      } catch (err) {
        console.warn("Erreur lors de l'initialisation de l'AudioContext :", err);
      }
    }

    resumeAudio();
  }, [getAudioElement, resumeAudio]);

  // Écoute l'événement 'play' de l'élément audio pour démarrer le contexte
  useEffect(() => {
    const audioElement = getAudioElement();
    if (!audioElement) return;

    const handlePlay = () => {
      initAudio();
      resumeAudio();
    };

    audioElement.addEventListener('play', handlePlay);

    if (!audioElement.paused) {
      handlePlay();
    }

    return () => {
      audioElement.removeEventListener('play', handlePlay);
    };
  }, [getAudioElement, initAudio, resumeAudio]);

  return { analyser, analyserL, analyserR, initAudio, resumeAudio };
};


