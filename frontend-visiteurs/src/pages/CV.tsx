import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

interface ExperienceItem {
  period: string;
  role: string;
  company: string;
  location: string;
  description: string;
  achievements: string[];
  technologies: string[];
  type: "Pro" | "Projet" | "Formation";
}

const experiences: ExperienceItem[] = [
  {
    period: "2024 — Présent",
    role: "Développeur Full-Stack & DevOps",
    company: "Projets Indépendants & Systèmes Personnels",
    location: "Lyon & Télétravail",
    type: "Pro",
    description: "Conception et déploiement d'architectures web robustes, d'APIs performantes et d'environnements containerisés sécurisés.",
    achievements: [
      "Architecture de plateformes complètes découplées (Frontend Visiteurs, Back-office Admin sécurisé Tailscale, API Express 5).",
      "Conteneurisation multi-stage avec Docker & Podman, orchestration de bases PostgreSQL et reverse-proxies Nginx sous AlmaLinux / Arch Linux.",
      "Mise en place de systèmes de télémétrie respectueux de la vie privée, modération de contenus et sécurité renforcée (RBAC, Rate Limiting, Helmet).",
      "Développement de projets phares : Marsai (Festival Vidéo IA), Merise-Forge, ClamAV Watchdog et Portfolio Full-Stack."
    ],
    technologies: ["React 19", "TypeScript", "Node.js", "Express 5", "PostgreSQL", "Docker / Podman", "AlmaLinux", "Arch Linux", "Nginx", "Tailwind CSS"]
  },
  {
    period: "2024 — 2025",
    role: "Titre Professionnel Développeur Web & Web Mobile (DWWM)",
    company: "Centre de Formation Professionnelle",
    location: "Lyon (69)",
    type: "Formation",
    description: "Formation intensive certifiante de Niveau 5 (Bac+2) axée sur le développement moderne et la gestion de projet logiciel.",
    achievements: [
      "Développement d'interfaces responsives, dynamiques et accessibles.",
      "Création de back-ends RESTful avec bases de données relationnelles sécurisées.",
      "Pratique approfondie des méthodologies Agiles, du versioning Git et de la modélisation Merise (MCD, MLD, MPD)."
    ],
    technologies: ["JavaScript", "TypeScript", "React", "Node.js", "SQL", "PostgreSQL", "API REST", "Merise"]
  },
  {
    period: "2018 — 2024",
    role: "Créateur Sonore, Compositeur & Direction Artistique",
    company: "Paguera Sound & Studio",
    location: "France",
    type: "Pro",
    description: "Gestion complète de projets artistiques et sonores, composition musicale et direction créative.",
    achievements: [
      "Composition, arrangements et mastering de pièces musicales originales.",
      "Direction artistique visuelle, création de visuels et dessins d'art contemporain.",
      "Rigueur de production, sens du détail et gestion autonome des livrables sous contraintes de délais."
    ],
    technologies: ["Sound Design", "Composition", "Création Graphique", "Gestion de Projet", "Direction Artistique"]
  }
];

const educationItems = [
  {
    title: "Titre Professionnel Développeur Web et Web Mobile (DWWM)",
    institution: "Ministère du Travail / Formation Certifiante",
    year: "2025",
    badge: "Niveau 5 (Bac+2)",
    details: "Développement front-end React/TypeScript, conception d'API back-end Node/Express, architecture de bases de données relationnelles PostgreSQL."
  },
  {
    title: "Spécialisation DevOps & Sécurité des Infrastructures",
    institution: "Auto-formation continue & Labs Pratiques",
    year: "2025 — 2026",
    badge: "DevOps & Cloud",
    details: "Docker, Podman, isolation réseau, tunnels sécurisés Tailscale/WireGuard, CI/CD GitHub Actions, gestion de serveurs Linux (AlmaLinux / Arch Linux)."
  },
  {
    title: "Parcours Créatif & Direction Artistique",
    institution: "Production Artistique & Pratique Libre",
    year: "2018 — 2024",
    badge: "Art & Son",
    details: "Expérience approfondie en conception visuelle, création musicale numérique et ergonomie des interfaces créatives."
  }
];

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
  const [showExperiences, setShowExperiences] = useState(true);
  const [showEducation, setShowEducation] = useState(true);
  const [showSkills, setShowSkills] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "Pro" | "Formation">("ALL");

  const filteredExperiences = experiences.filter((item) => {
    if (activeFilter === "ALL") return true;
    return item.type === activeFilter;
  });

  return (
    <>
      <Helmet>
        <title>Curriculum Vitæ & Parcours | Gabriel Fortier</title>
        <meta
          name="description"
          content="Curriculum Vitæ interactif de Gabriel Fortier (Paguera) - Développeur Full-Stack basé à Lyon. Expériences, formations, compétences et carte de mobilité."
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
            <a
              href="/cv.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-cyber-yellow text-black font-black uppercase text-xs tracking-widest hover:bg-yellow-300 transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Consulter le CV (PDF)
            </a>
            <Link
              to="/contact"
              className="px-6 py-3 border-2 border-white/20 hover:border-cyber-yellow text-white hover:text-cyber-yellow font-black uppercase text-xs tracking-widest transition-all bg-bg-panel/50"
            >
              Me Proposer une Mission →
            </Link>
          </div>
        </header>

        {/* ACCORDION 1: EXPÉRIENCES PROFESSIONNELLES */}
        <section className="w-full rounded-2xl bg-bg-panel/60 border border-white/10 overflow-hidden backdrop-blur-md transition-all duration-300 hover:border-cyber-yellow/40 shadow-xl">
          <button
            type="button"
            className="w-full flex items-center justify-between p-6 sm:p-8 cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-yellow"
            onClick={() => setShowExperiences(!showExperiences)}
            aria-expanded={showExperiences}
          >
            <div className="flex items-center gap-4 sm:gap-6">
              <span
                className={`text-2xl sm:text-3xl font-mono text-cyber-yellow transition-transform duration-300 ${
                  showExperiences ? "rotate-90" : "rotate-0"
                }`}
                aria-hidden="true"
              >
                ▶
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                  Expériences Professionnelles
                </h2>
                <p className="text-xs sm:text-sm font-mono text-gray-400">
                  Missions, réalisations concrètes & stacks déployées
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-xs font-mono font-bold uppercase tracking-widest text-cyber-yellow/80 bg-cyber-yellow/10 border border-cyber-yellow/20 px-3 py-1 rounded-full">
              {experiences.length} étapes
            </span>
          </button>

          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              showExperiences ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-6 sm:p-8 border-t border-white/10 space-y-8 bg-black/20">
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 pb-2">
                <span className="text-xs font-mono text-gray-400 uppercase mr-2">Filtrer:</span>
                {(["ALL", "Pro", "Formation"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`text-xs font-mono uppercase px-3 py-1 rounded transition-all cursor-pointer ${
                      activeFilter === filter
                        ? "bg-cyber-yellow text-black font-bold shadow-md"
                        : "bg-white/5 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    {filter === "ALL" ? "Tous" : filter === "Pro" ? "Expériences Pro" : "Parcours DWWM"}
                  </button>
                ))}
              </div>

              {/* Timeline Cards */}
              <div className="space-y-6">
                {filteredExperiences.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-6 sm:p-8 rounded-xl bg-bg-main/70 border border-white/10 hover:border-cyber-yellow/30 transition-all space-y-4 relative group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
                      <div>
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyber-yellow bg-cyber-yellow/10 border border-cyber-yellow/30 px-2 py-0.5 rounded mr-3">
                          {item.period}
                        </span>
                        <span className="text-xs font-mono text-gray-400">
                          📍 {item.location}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-2">
                          {item.role}
                        </h3>
                        <h4 className="text-sm font-bold text-cyber-blue font-mono">
                          {item.company}
                        </h4>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="space-y-2 pt-2">
                      <h5 className="text-xs font-mono uppercase text-gray-400 tracking-wider">
                        Principales réalisations :
                      </h5>
                      <ul className="space-y-2">
                        {item.achievements.map((ach, i) => (
                          <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-gray-200">
                            <span className="text-cyber-yellow font-mono text-sm leading-none mt-0.5">■</span>
                            <span>{ach}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">
                      {item.technologies.map((tech, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-gray-300 group-hover:border-cyber-yellow/20 transition-colors"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ACCORDION 2: FORMATIONS & DIPLÔMES */}
        <section className="w-full rounded-2xl bg-bg-panel/60 border border-white/10 overflow-hidden backdrop-blur-md transition-all duration-300 hover:border-cyber-yellow/40 shadow-xl">
          <button
            type="button"
            className="w-full flex items-center justify-between p-6 sm:p-8 cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-yellow"
            onClick={() => setShowEducation(!showEducation)}
            aria-expanded={showEducation}
          >
            <div className="flex items-center gap-4 sm:gap-6">
              <span
                className={`text-2xl sm:text-3xl font-mono text-cyber-yellow transition-transform duration-300 ${
                  showEducation ? "rotate-90" : "rotate-0"
                }`}
                aria-hidden="true"
              >
                ▶
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                  Formations & Certifications
                </h2>
                <p className="text-xs sm:text-sm font-mono text-gray-400">
                  Titres professionnels, certifications & cursus
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-xs font-mono font-bold uppercase tracking-widest text-cyber-yellow/80 bg-cyber-yellow/10 border border-cyber-yellow/20 px-3 py-1 rounded-full">
              {educationItems.length} titres
            </span>
          </button>

          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              showEducation ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-6 sm:p-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 bg-black/20">
              {educationItems.map((edu, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl bg-bg-main/80 border border-white/10 flex flex-col justify-between space-y-4 hover:border-cyber-yellow/40 transition-all shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-cyber-yellow bg-cyber-yellow/10 px-2.5 py-0.5 rounded border border-cyber-yellow/30">
                        {edu.year}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 uppercase bg-white/5 px-2 py-0.5 rounded">
                        {edu.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight leading-snug">
                      {edu.title}
                    </h3>
                    <h4 className="text-xs font-bold text-cyber-blue font-mono">
                      {edu.institution}
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans">
                      {edu.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

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
              <span>📍 Zone Principale : Lyon / Auvergne-Rhône-Alpes / Full Remote</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default CV;
