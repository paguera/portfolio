import React, { useState, useEffect } from "react";

export const PrivacyNotice: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const acknowledged = localStorage.getItem("paguera_privacy_acknowledged");
    if (!acknowledged) {
      // Small delay for smooth arrival after page render
      const timer = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcknowledge = () => {
    localStorage.setItem("paguera_privacy_acknowledged", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      role="region"
      aria-label="Information relative à la confidentialité et aux cookies"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-[#1f2128]/95 border-2 border-cyber-yellow/40 backdrop-blur-xl p-5 rounded-xl shadow-2xl text-white font-sans transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyber-yellow animate-pulse"></span>
          <h4 className="font-mono text-xs font-black uppercase tracking-wider text-cyber-yellow">
            Confidentialité &amp; Télémétrie
          </h4>
        </div>
        <button
          onClick={handleAcknowledge}
          className="text-gray-400 hover:text-white text-lg leading-none p-1 cursor-pointer"
          aria-label="Fermer"
        >
          &times;
        </button>
      </div>

      <p className="text-xs text-gray-300 leading-relaxed font-sans mb-3">
        Ce portfolio mesure l&apos;audience et consigne les accès techniques (IP, appareil, pages vues) à des fins statistiques et de sécurité internes. Aucun traceur publicitaire ou service tiers (Google, Meta) n&apos;est utilisé.
      </p>

      {showDetails && (
        <div className="mb-3.5 p-2.5 bg-black/40 border border-white/10 rounded text-[11px] font-mono text-gray-300 space-y-1.5 animate-in fade-in duration-200">
          <div className="text-cyber-yellow font-bold">▹ Hébergement &amp; Données :</div>
          <p>Télémétrie auto-hébergée (PostgreSQL) sans revente de données ni ciblage publicitaire.</p>
          <div className="text-cyber-yellow font-bold">▹ Droits RGPD :</div>
          <p>Conformément au RGPD et aux recommandations de la CNIL, vous pouvez réinitialiser votre identifiant local en vidant le cache de votre navigateur.</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/10">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-[11px] font-mono text-gray-400 hover:text-cyber-yellow underline cursor-pointer"
        >
          {showDetails ? "Masquer les détails" : "En savoir plus ▹"}
        </button>

        <button
          type="button"
          onClick={handleAcknowledge}
          className="px-4 py-2 bg-cyber-yellow text-black font-mono font-black text-xs uppercase tracking-wider hover:bg-yellow-300 transition-colors shadow-md rounded-sm cursor-pointer"
        >
          [ COMPRIS ]
        </button>
      </div>
    </div>
  );
};

export default PrivacyNotice;
