import React from "react";
import { Helmet } from "react-helmet-async";

interface SocialLink {
  id: string;
  name: string;
  url: string;
  handle: string;
  description: string;
  badge: string;
  colorClass: string;
  borderHoverClass: string;
  bgHoverClass: string;
  icon: React.ReactNode;
}

const linksList: SocialLink[] = [
  {
    id: "youtube",
    name: "YouTube",
    url: "https://youtube.com/@salepropre",
    handle: "@salepropre",
    description:
      "Un son parfois brut, des idées sales, mais des solutions toujours propres ! Découvrez mes créations vidéo, musiques et expérimentations créatives.",
    badge: "Vidéo & Audio",
    colorClass: "text-red-500",
    borderHoverClass: "hover:border-red-500/80",
    bgHoverClass: "hover:bg-red-500/5",
    icon: (
      <svg className="w-10 h-10 fill-current text-red-500 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/gabriel-fortier-3951a933b/",
    handle: "Gabriel Fortier",
    description:
      "Mon profil professionnel LinkedIn — Découvrez mon parcours, mes compétences en développement Web/Audio et échangeons sur des opportunités de projets.",
    badge: "Réseau Pro",
    colorClass: "text-[#ffffff]",
    borderHoverClass: "hover:border-[#0A66C2]/80",
    bgHoverClass: "hover:bg-[#0A66C2]/5",
    icon: (
      <svg className="w-10 h-10 fill-current text-[#0A66C2] shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    ),
  },
  {
    id: "github",
    name: "GitHub",
    url: "https://github.com/paguera",
    handle: "@paguera",
    description:
      "Explorez mes dépôts de code open source, projets full-stack, outils audio et expérimentations techniques.",
    badge: "Code & Dev",
    colorClass: "text-gray-200",
    borderHoverClass: "hover:border-cyber-cyan/80",
    bgHoverClass: "hover:bg-cyber-cyan/5",
    icon: (
      <svg className="w-10 h-10 fill-current text-gray-200 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    id: "soundcloud",
    name: "SoundCloud",
    url: "https://soundcloud.com/salepropre",
    handle: "salepropre",
    description:
      "Écoutez mes compositions musicales, productions sonores, beats et expérimentations audio.",
    badge: "Musique & Prod",
    colorClass: "text-[#FF5500]",
    borderHoverClass: "hover:border-[#FF5500]/80",
    bgHoverClass: "hover:bg-[#FF5500]/5",
    icon: (
      <svg className="w-10 h-10 fill-current text-[#FF5500] shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M1.175 12.225c-.04 0-.074.032-.078.071L.82 15.65c-.004.043.03.078.073.078h.556c.041 0 .074-.032.077-.073l.245-3.355c.003-.043-.031-.078-.074-.078h-.522zm1.393-.974c-.042 0-.077.033-.08.075l-.41 5.303c-.003.042.03.076.073.076h.547c.041 0 .075-.032.077-.073l.41-5.305c.003-.042-.03-.076-.073-.076h-.544zm1.442-.871c-.043 0-.077.034-.08.077l-.427 7.054c-.003.042.03.076.073.076h.547c.042 0 .076-.032.077-.074l.427-7.055c.003-.043-.03-.078-.073-.078h-.544zm1.439-1.077c-.043 0-.077.034-.08.077l-.416 9.208c-.003.042.03.076.073.076h.548c.041 0 .075-.032.076-.074l.417-9.21c.003-.042-.03-.077-.073-.077h-.545zm1.441.139c-.043 0-.077.034-.08.077l-.415 8.932c-.003.042.03.076.073.076h.548c.041 0 .075-.032.076-.073l.417-8.935c.003-.042-.03-.077-.073-.077h-.546zm1.44.256c-.044 0-.078.034-.08.077l-.403 8.416c-.003.042.03.076.073.076h.548c.041 0 .075-.032.076-.073l.403-8.419c.003-.042-.03-.077-.073-.077h-.544zm1.441.118c-.044 0-.078.034-.08.077l-.377 8.181c-.003.042.03.076.073.076h.548c.041 0 .075-.032.076-.073l.377-8.184c.003-.042-.03-.077-.073-.077h-.544zm1.44.116c-.044 0-.078.034-.08.077l-.337 7.949c-.003.042.03.076.073.076h.548c.041 0 .075-.032.076-.073l.337-7.952c.003-.042-.03-.077-.073-.077h-.544zm1.44.179c-.044 0-.078.034-.08.077l-.3 7.592c-.003.042.03.076.073.076h.548c.041 0 .075-.032.076-.073l.3-7.595c.003-.042-.03-.077-.073-.077h-.544zm1.441.298c-.044 0-.078.034-.08.077l-.248 7.039c-.003.042.03.076.073.076h.548c.041 0 .075-.032.076-.073l.248-7.042c.003-.042-.03-.077-.073-.077h-.544zm7.391-2.923c-.76 0-1.481.189-2.115.52-.303-.799-.867-1.467-1.589-1.921A4.27 4.27 0 0 0 14.512 7c-2.36 0-4.274 1.913-4.274 4.272 0 .151.011.3.028.448A4.954 4.954 0 0 0 9.21 11.5c-2.736 0-4.954 2.218-4.954 4.954 0 2.737 2.218 4.955 4.954 4.955h11.956C22.84 21.409 24 20.249 24 18.818c0-1.431-1.16-2.591-2.834-2.591z" />
      </svg>
    ),
  },
];

const Liens: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Liens & Réseaux | GVF Portfolio</title>
        <meta
          name="description"
          content="Retrouvez l'ensemble de mes liens et réseaux sociaux : YouTube, LinkedIn, GitHub et SoundCloud."
        />
      </Helmet>

      <div className="max-w-4xl mx-auto pb-20 text-text-main">
        <div className="border-2 border-border-subtle p-6 md:p-12 shadow-2xl bg-bg-panel relative overflow-hidden">
          {/* Background decorative typography */}
          <div className="absolute -top-10 -right-10 opacity-[0.02] pointer-events-none select-none">
            <span className="text-[200px] font-black uppercase leading-none">
              LINKS
            </span>
          </div>

          <header className="mb-10 relative z-10">
            <h1 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter flex items-center gap-4">
              <span className="w-8 h-8 bg-cyber-cyan"></span>
              Liens &amp; Réseaux
            </h1>
            <p className="text-sm md:text-base opacity-70 max-w-2xl font-sans">
              Retrouvez l'ensemble de mes chaînes, profils professionnels et plateformes de création ci-dessous.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {linksList.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group border-2 border-border-subtle ${item.borderHoverClass} ${item.bgHoverClass} bg-bg-main p-6 transition-all duration-300 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.6)] hover:-translate-y-0.5`}
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="p-3 bg-bg-panel border border-border-subtle group-hover:border-current transition-colors">
                      {item.icon}
                    </div>
                    <span className="text-[10px] text-cyber-yellow uppercase tracking-widest px-2.5 py-1 bg-bg-panel border border-border-subtle text-cyber-cyan font-mono">
                      {item.badge}
                    </span>
                  </div>

                  <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2 transition-colors">
                    {item.name}
                    <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-secondary text-lg">
                      &rarr;
                    </span>
                  </h2>

                  <p className={`text-xs font-mono font-bold mb-3 ${item.colorClass}`}>
                    {item.handle}
                  </p>

                  <p className="text-xs opacity-75 font-sans leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border-subtle/50 flex items-center justify-between text-[11px] font-mono font-bold text-text-muted group-hover:text-text-main transition-colors">
                  <span>VISITER_PLATEFORME</span>
                  <span className="font-bold">&rarr;</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Liens;
