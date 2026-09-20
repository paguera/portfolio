import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeSplashProps {
  onComplete: () => void;
}

const PARTICLES = Array.from({ length: 26 }, (_, i) => ({
  id: i,
  x: ((i * 37) % 100 - 50) * 14,
  y: ((i * 53) % 100 - 50) * 8,
  scale: ((i % 5) * 0.4 + 1.2),
  delay: (i % 8) * 0.02,
  bg: i % 2 === 0 ? '#facc15' : '#00f2fe',
  shadow: i % 2 === 0 ? '0 0 10px #facc15' : '0 0 10px #00f2fe',
}));

export function WelcomeSplash({ onComplete }: WelcomeSplashProps) {
  const [phase, setPhase] = useState<'logo' | 'split' | 'done'>('logo');
  const [imgSrc, setImgSrc] = useState('/LOGO.avif');

  useEffect(() => {
    // Logo appears and stays for 1.6s
    const logoTimer = setTimeout(() => setPhase('split'), 1600);
    // Split animation for 1.1s then complete
    const completeTimer = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 2800);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-[#07080e] flex flex-col items-center justify-center overflow-hidden select-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Cyber Background Ambient Glows */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/15 rounded-full blur-[140px]" />
            <div className="absolute bottom-1/3 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[140px]" />
          </motion.div>

          {/* Center Logo */}
          <motion.div
            className="relative mb-6"
            initial={{ scale: 0.75, opacity: 0, y: 20 }}
            animate={
              phase === 'split'
                ? { scale: 1.15, opacity: 0, y: -35 }
                : { scale: 1, opacity: 1, y: 0 }
            }
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(250,204,21,0.3)] ring-2 ring-yellow-400/60 ring-offset-4 ring-offset-[#07080e]">
              <img
                src={imgSrc}
                alt="PAGUERA PORTFOLIO"
                className="w-full h-full object-cover"
                onError={() => {
                  if (imgSrc === '/LOGO.avif') setImgSrc('/logo.jpg');
                }}
              />
            </div>
            {/* Pulsing ring around logo */}
            <div className="absolute inset-0 rounded-2xl ring-2 ring-cyan-400/60 animate-ping pointer-events-none opacity-40" />
          </motion.div>

          {/* Logo Title Container */}
          <div className="relative flex items-center justify-center gap-3 font-sans">
            {/* Left half - "PAGUERA" */}
            <motion.div
              className="overflow-hidden"
              initial={{ x: 0 }}
              animate={phase === 'split' ? { x: -180, opacity: 0 } : { x: 0, opacity: 1 }}
              transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
            >
              <motion.span
                className="text-4xl sm:text-6xl md:text-7xl font-black bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent tracking-tight drop-shadow-[0_0_20px_rgba(250,204,21,0.4)]"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              >
                PAGUERA
              </motion.span>
            </motion.div>

            {/* Neon Sparkle center effect */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={phase === 'split' ? { opacity: 1, scale: 2 } : { opacity: 0.7, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full shadow-[0_0_40px_15px_#facc15]" />
            </motion.div>

            {/* Right half - "PORTFOLIO" */}
            <motion.div
              className="overflow-hidden"
              initial={{ x: 0 }}
              animate={phase === 'split' ? { x: 180, opacity: 0 } : { x: 0, opacity: 1 }}
              transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
            >
              <motion.span
                className="text-4xl sm:text-6xl md:text-7xl font-black bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent tracking-tight drop-shadow-[0_0_20px_rgba(0,242,254,0.4)]"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
              >
                PORTFOLIO
              </motion.span>
            </motion.div>
          </div>

          {/* Subtitles & Signature */}
          <motion.div
            className="flex flex-col items-center gap-1.5 mt-5"
            initial={{ opacity: 0, y: 15 }}
            animate={phase === 'logo' ? { opacity: 1, y: 0 } : { opacity: 0, y: -15 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <span className="text-xs sm:text-sm font-extrabold tracking-[0.35em] uppercase text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]">
              GABRIEL FORTIER
            </span>
            <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">
              Développement Full-Stack · Audio · Art
            </p>
          </motion.div>

          {/* Cyber Neon Particles Burst during split */}
          {phase === 'split' && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {PARTICLES.map((particle) => (
                <motion.div
                  key={particle.id}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                    backgroundColor: particle.bg,
                    boxShadow: particle.shadow,
                  }}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: particle.x,
                    y: particle.y,
                    opacity: 0,
                    scale: particle.scale,
                  }}
                  transition={{
                    duration: 0.85,
                    delay: particle.delay,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
