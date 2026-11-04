import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const skillCategories = [
  {
    title: "Frontend & UI/UX",
    icon: "💻",
    skills: ["React 19", "TypeScript", "Vite", "Tailwind CSS", "Responsive Design", "Accessibilité (a11y)", "Framer Motion", "Context API"]
  },
  {
    title: "Backend & Données",
    icon: "⚙️",
    skills: ["Node.js", "Express 5", "PostgreSQL", "MariaDB", "APIs RESTful", "JWT / Sécurité Auth", "Modélisation Merise", "Bcrypt & RBAC"]
  },
  {
    title: "DevOps & Infrastructure",
    icon: "🐳",
    skills: ["Docker & Podman", "AlmaLinux", "Arch Linux", "Docker Compose", "Nginx Reverse-Proxy", "Tailscale VPN", "GitHub Actions CI/CD", "Télémétrie"]
  },
  {
    title: "Méthodes & Soft Skills",
    icon: "🎯",
    skills: ["Méthodes Agiles / Scrum", "Git / GitHub Flow", "Clean Code & Rigueur", "Autonomie & Veille Tech", "Créativité & Polyvalence"]
  }
];

const CV: React.FC = () => {
  const [showSkills, setShowSkills] = useState(true);

  return (
    <>
      <Helmet>
        <title>Curriculum Vitæ & Parcours | Gabriel Fortier</title>
        <meta
          name="description"
          content="Curriculum Vitæ interactif de Gabriel Fortier (Paguera) - Développeur Full-Stack."
        />
      </Helmet>

      <div className="space-y-12 md:space-y-16 max-w-5xl mx-auto py-4">
        {/* HEADER SECTION (Inspiré du style Marsai Agenda) */}
        <header className="text-center space-y-4 border-b border-white/10 pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-yellow/10 border border-cyber-yellow/40 text-cyber-yellow text-xs font-mono tracking-widest uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-cyber-yellow animate-pulse"></span>
            Curriculum Vitæ Interactif
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-none">
            Parcours & <span className="text-cyber-yellow">Expériences</span>
          </h1>

          <p className="text-base sm:text-xl font-bold text-gray-400 font-mono max-w-2xl mx-auto">
            Développeur Full-Stack · Conception Web & API · Basé à Lyon
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {/* <a
              href="/cv.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-cyber-yellow text-black font-black uppercase text-xs tracking-widest hover:bg-yellow-300 transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Consulter le CV (PDF)
            </a> */}
            <Link
              to="/contact"
              className="px-6 py-3 border-2 border-white/20 hover:border-cyber-yellow text-white hover:text-cyber-yellow font-black uppercase text-xs tracking-widest transition-all bg-bg-panel/50"
            >
              Me Proposer une Mission →
            </Link>
          </div>
        </header>


        {/* ACCORDION 3: COMPÉTENCES TECHNIQUES */}
        <section className="w-full rounded-2xl bg-bg-panel/60 border border-white/10 overflow-hidden backdrop-blur-md transition-all duration-300 hover:border-cyber-yellow/40 shadow-xl">
          <button
            type="button"
            className="w-full flex items-center justify-between p-6 sm:p-8 cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-yellow"
            onClick={() => setShowSkills(!showSkills)}
            aria-expanded={showSkills}
          >
            <div className="flex items-center gap-4 sm:gap-6">
              <span
                className={`text-2xl sm:text-3xl font-mono text-cyber-yellow transition-transform duration-300 ${
                  showSkills ? "rotate-90" : "rotate-0"
                }`}
                aria-hidden="true"
              >
                ▶
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                  Compétences & Outils Clés
                </h2>
                <p className="text-xs sm:text-sm font-mono text-gray-400">
                  Technologies maîtrisées, bases de données, DevOps & méthodologies
                </p>
              </div>
            </div>
          </button>

          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              showSkills ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-6 sm:p-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 bg-black/20">
              {skillCategories.map((cat, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl bg-bg-main/80 border border-white/10 space-y-4 hover:border-cyber-yellow/30 transition-all shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      {cat.title}
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {cat.skills.map((skill, sIdx) => (
                      <li key={sIdx} className="text-xs font-mono text-gray-300 flex items-center gap-2">
                        <span className="text-cyber-yellow text-[10px]">■</span>
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION CARTE & MOBILITÉ (Inspiré de Access de Marsai) */}
        <section className="space-y-8 pt-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Périmètre d'Action & <span className="text-cyber-yellow">Mobilité</span>
            </h2>
            <p className="text-xs sm:text-sm font-mono text-gray-400">
              Modalités de collaboration, localisation et flexibilité
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-bg-panel/70 border border-white/10 backdrop-blur-md hover:border-cyber-yellow/40 transition-all flex flex-col space-y-3">
              <span className="text-3xl">🏢</span>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                Base Opérationnelle
              </h3>
              <h4 className="text-xs font-mono font-bold text-cyber-yellow uppercase">
                Lyon & Auvergne-Rhône-Alpes
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                Disponible pour des rencontres en présentiel, réunions de cadrage et interventions sur site à Lyon et en région AURA.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-bg-panel/70 border border-white/10 backdrop-blur-md hover:border-cyber-yellow/40 transition-all flex flex-col space-y-3">
              <span className="text-3xl">💻</span>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                Télétravail & Full Remote
              </h3>
              <h4 className="text-xs font-mono font-bold text-cyber-yellow uppercase">
                France & International
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                Environnement de développement et infrastructure personnelle entièrement configurés sous AlmaLinux / Arch Linux (VPN Tailscale, conteneurs, observabilité).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-bg-panel/70 border border-white/10 backdrop-blur-md hover:border-cyber-yellow/40 transition-all flex flex-col space-y-3">
              <span className="text-3xl">🚀</span>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                Disponibilité & Contrats
              </h3>
              <h4 className="text-xs font-mono font-bold text-cyber-yellow uppercase">
                CDI · Freelance · Missions
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                Ouvert aux opportunités d'embauche et prestations techniques de développement full-stack et d'automatisation DevOps.
              </p>
            </div>
          </div>

          {/* Interactive Map Frame with Cyber/Dark styling */}
          <div className="h-96 w-full overflow-hidden rounded-2xl border-2 border-white/10 shadow-2xl relative group bg-[#13161f]">
            <iframe
              title="Carte de localisation et mobilité - Lyon"
              width="100%"
              height="100%"
              className="grayscale invert-[0.88] hue-rotate-190 brightness-90 contrast-125 opacity-80 group-hover:opacity-100 transition-opacity duration-500 border-0"
              src="https://maps.google.com/maps?q=Lyon%20France&t=&z=11&ie=UTF8&iwloc=&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-xs font-mono text-white flex items-center gap-2 pointer-events-none">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-yellow animate-ping"></span>
              <span>Basé sur Lyon</span>
            </div>
          </div>
        </section>
          </div>
        </>
  );
}

export default CV;
