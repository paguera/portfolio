import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import type { SiteSettings } from "../types";
import { apiFetch } from "../utils/api";
import profilePhoto from "../assets/gab.jpeg";

const DEFAULT_HERO_BIO =
  "Amoureux de la vie, créatif et bon vivant avant d'être un intitulé de poste, j'aborde le code en artisan appliqué et soucieux du moindre détail. J'aime le backend pour la rigueur de sa logique carrée autant que le frontend pour la satisfaction de toucher à tout « juste pour voir » — avec l'envie d'évoluer chaque jour vers un profil toujours plus complet et humain.";

const LEGACY_HERO_BIO =
  "Passionné par la conception d'applications web robustes, l'architecture logicielle et l'automatisation des déploiements. Je construis des solutions complètes de la base de données jusqu'à l'infrastructure.";

const Home: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    availability_status: "Disponible",
    is_available: "true",
    hero_title_accent: "Développeur Full-Stack & candidat CDA en alternance",
    hero_bio: DEFAULT_HERO_BIO
  });
  
  const skillCategories = [
    {
      title: "Frontend & UI/UX",
      icon: "💻",
      skills: ["React 19", "TypeScript", "Vite", "Tailwind CSS", "Responsive Design", "Accessibilité (a11y)", "Framer Motion", "Context API"]
    },
    {
      title: "Backend & Données",
      icon: "⚙️",
      skills: ["Node.js", "Express 5", "PostgreSQL", "MariaDB", "APIs RESTful", "JWT / Sécurité Auth", "Bcrypt/Argon2id & RBAC"]
    },
    {
      title: "DevOps & Infrastructure",
      icon: "🐳",
      skills: ["Docker & Podman", "AlmaLinux", "Arch Linux", "Docker Compose", "Nginx Reverse-Proxy", "Cloudflare Tunnels","Tailscale VPN", "GitHub Actions CI/CD", "Télémétrie"]
    },
    {
      title: "Méthodes & Soft Skills",
      icon: "💪",
      skills: ["Méthodes Agiles / Scrum", "Git / GitHub Flow","Modélisation Merise", "Clean Code & Rigueur", "Autonomie & Veille Tech", "Créativité & Polyvalence"]
    }
  ];
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiFetch<SiteSettings>("/settings");
        if (data && Object.keys(data).length > 0) {
          setSettings(prev => ({
            ...prev,
            ...data,
            hero_bio:
              !data.hero_bio || data.hero_bio === LEGACY_HERO_BIO
                ? DEFAULT_HERO_BIO
                : data.hero_bio
          }));
        }
      } catch (err) {
        console.debug("Paramètres locaux par défaut utilisés:", err);
      }
    };
    fetchSettings();
  }, []);
  
  const [showJourney, setShowJourney] = useState(true);
  const [showSkills, setShowSkills] = useState(true);
  const isAvailable = settings.is_available !== "false";
  const availabilityText = settings.availability_status || "Disponible";
  const heroSubtitle = settings.hero_title_accent || "Développeur Full-Stack & candidat CDA en alternance";
  const heroBio = settings.hero_bio || DEFAULT_HERO_BIO;

  return (
    <>
      <Helmet>
        <title>Gabriel Fortier | Développeur Full-Stack & DevOps</title>
        <meta
          name="description"
          content="Portfolio de Gabriel Fortier (Paguera) - Développeur Full-Stack & DevOps. Parcours, projets, compétences et univers créatif."
        />
      </Helmet>

      <div className="space-y-16 md:space-y-24 max-w-5xl mx-auto py-4">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden rounded-2xl border border-border-subtle p-8 sm:p-10 md:p-14 shadow-2xl flex flex-col-reverse md:flex-row items-center justify-between gap-10 md:gap-14">
          {/* Background Banner Image & Readability Overlays */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-700 pointer-events-none"
            style={{ backgroundImage: "url('/paguera-banner.png')" }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#0b0d12]/90 via-[#0b0d12]/65 to-[#0b0d12]/75 pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#0b0d12]/80 via-transparent to-[#0b0d12]/40 pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 flex-1 text-center md:text-left space-y-6">
            {isAvailable && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-cyber-yellow/50 text-cyber-yellow text-xs font-mono tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-cyber-yellow animate-pulse"></span>
                {availabilityText}
              </div>
            )}

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-none drop-shadow-lg">
              Gabriel <span className="text-cyber-yellow">Fortier</span>
            </h1>

            <p className="text-xl sm:text-2xl font-bold text-cyber-blue font-mono drop-shadow">
              {heroSubtitle}
            </p>

            <p className="text-gray-200 text-base sm:text-lg leading-relaxed font-sans max-w-2xl drop-shadow">
              {heroBio}
            </p>


            {/* CTA BUTTONS */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <Link
                to="/projects"
                className="px-6 py-3 bg-cyber-yellow text-black font-black uppercase text-xs tracking-widest hover:bg-yellow-300 transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
              >
                Explorer mes projets Dev
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3 border-2 border-transparent hover:underline text-gray-200 hover:text-white font-black uppercase text-xs tracking-widest transition-all"
              >
                Me Contacter →
              </Link>
            </div>
          </div>

          {/* Profile Photo */}
          <div className="relative z-10 group shrink-0">
            <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-4 border-cyber-yellow/50 shadow-2xl relative z-10 bg-bg-panel group-hover:scale-105 transition-transform duration-500">
              <img
                src={profilePhoto}
                alt="Gabriel Fortier"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/LOGO.avif";
                }}
              />
            </div>
            {/* Cyber Backing glow/border decoration */}
            <div className="absolute -inset-2 bg-gradient-to-r from-cyber-yellow/25 via-cyber-blue/25 to-purple-500/25 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 -z-0" />
            <div className="absolute -bottom-3 -right-3 w-full h-full border-2 border-cyber-blue/50 rounded-2xl -z-0 pointer-events-none" />
          </div>
        </section>

        {/* PARCOURS & ADN TECHNIQUE EN 3 TEMPS (ACCORDÉON) */}
        <section className="relative group bg-bg-panel/50 border border-border-subtle hover:border-cyber-yellow/50 rounded-2xl overflow-hidden shadow-xl transition-all duration-500">
          <div className="w-1.5 h-16 bg-cyber-yellow absolute top-6 left-0 z-10 pointer-events-none"></div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyber-yellow/5 rounded-full blur-3xl pointer-events-none group-hover:bg-cyber-yellow/15 transition-all duration-500" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-cyber-blue/5 rounded-full blur-3xl pointer-events-none group-hover:bg-cyber-blue/15 transition-all duration-500" />

          <button
            type="button"
            className="relative z-10 w-full flex items-center justify-between p-6 sm:p-8 md:px-10 cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-yellow"
            onClick={() => setShowJourney(!showJourney)}
            aria-expanded={showJourney}
          >
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyber-yellow">
                  <span>●</span> Genèse & Trajectoire
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
                  D'autodidacte passionné à l'ingénierie Full-Stack & DevOps
                </h2>
              </div>
            </div>
          </button>

          <div
            className={`relative z-10 transition-all duration-500 ease-in-out overflow-hidden ${
              showJourney ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-6 pb-8 sm:px-8 sm:pb-10 md:px-10 md:pb-12 pt-4 border-t border-white/10 space-y-8">
              {/* PRÉAMBULE */}
              <div className="border-l-2 border-cyber-yellow/70 bg-black/25 p-4 sm:p-5 rounded-r-xl space-y-2 max-w-4xl">
                <div className="text-xs font-mono uppercase tracking-widest text-cyber-yellow font-bold">
                  00 // Préambule — Premiers compilateurs & harmonie classique
                </div>
                <p className="text-white/90 text-sm sm:text-base leading-relaxed font-sans">
                  Tout commence dès le collège par deux écoles de la rigueur. Côté musique : l'apprentissage exigeant du{" "}
                  <span className="text-white font-semibold">violon alto</span>, du solfège, du jeu en orchestre et de la musique de chambre, couronné par un{" "}
                  <span className="text-white font-semibold">diplôme de fin de 1er cycle</span>. Côté machine : le montage PC, la découverte d'
                  <span className="text-cyber-yellow font-mono text-xs">Ubuntu</span> et mes premières lignes de code en{" "}
                  <span className="text-cyber-yellow font-mono text-xs">C</span> et{" "}
                  <span className="text-cyber-yellow font-mono text-xs">Lua</span> au cœur de la scène homebrew PSP. Deux univers qui m'ont appris très tôt que la créativité repose toujours sur la maîtrise technique.
                </p>
              </div>

            {/* FRISE CHRONOLOGIQUE : 3 ÉTAPES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* 01. EXPLORATION SCIENTIFIQUE */}
              <div className="hover:bg-gradient-to-br from-black/40 via-black/30 to-cyber-yellow/5 from-cyber-yellow/15 via-cyber-blue/10 to-purple-500/10 border border-white/10 border-cyber-yellow/60 p-6 rounded-xl space-y-3 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(250,204,21,0.12)] flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-cyber-yellow font-bold uppercase tracking-widest">
                      01 // Exploration
                    </span>
                    <span className="text-gray-400">Sciences & Vivant</span>
                  </div>
                  <h3 className="text-lg font-black uppercase text-white tracking-tight">
                    La culture de la recherche
                  </h3>
                  <p className="text-sm font-sans text-text-muted leading-relaxed">
                    Animé par une forte curiosité pour la démarche scientifique, j'explore après le bac plusieurs disciplines universitaires :{" "}
                    <span className="text-white/90">
                      médecine, biologie, génétique, biochimie, sciences cognitives et anthropologie
                    </span>
                    . Si le format académique théorique ne répondait pas encore à mon besoin de bâtir du concret, ces passages ont façonné un esprit analytique rigoureux et une méthodologie de recherche qui me servent chaque jour face à des problématiques techniques complexes.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-mono text-cyber-yellow/80 uppercase tracking-wider">
                  ▹ Esprit d'analyse & veille méthodique
                </div>
              </div>

              {/* 02. INGÉNIERIE SONORE & RÉSILIENCE */}
              <div className="hover:bg-gradient-to-br from-black/40 via-black/30 to-cyber-blue/5 from-cyber-blue/15 via-purple-500/10 to-cyber-yellow/10 border border-white/10 border-cyber-blue/60 p-6 rounded-xl space-y-3 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(56,189,248,0.12)] flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-cyber-blue font-bold uppercase tracking-widest">
                      02 // Transition
                    </span>
                    <span className="text-gray-400">Son & Résilience</span>
                  </div>
                  <h3 className="text-lg font-black uppercase text-white tracking-tight">
                    De l'acoustique à l'introspection
                  </h3>
                  <p className="text-sm font-sans text-text-muted leading-relaxed">
                    Je m'oriente ensuite vers la haute technicité d'un{" "}
                    <span className="text-white/90">BTS Métiers de l'Audiovisuel (option Son)</span>. Bien qu'interrompu à l'aube des examens finaux de 2e année pour des raisons de santé, ce chapitre ouvre une période essentielle de recul, de maturité personnelle et de productions audiovisuelles expérimentales. Sans attrait pour le modèle de l'intermittence, je réalise alors que mon véritable terrain d'expression se trouve dans l'architecture logicielle.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-mono text-cyber-blue/80 uppercase tracking-wider">
                  ▹ Maturité, résilience & exigence
                </div>
              </div>

              {/* 03. RECONVERSION DEV & SYSADMIN */}
              <div className="hover:bg-gradient-to-br from-black/40 via-black/30 to-purple-500/5 from-purple-500/15 via-cyber-blue/10 to-cyber-yellow/10 border border-white/10 border-purple-400/60 p-6 rounded-xl space-y-3 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(192,132,252,0.12)] flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-purple-400 font-bold uppercase tracking-widest">
                      03 // Consolidation
                    </span>
                    <span className="text-gray-400">DevWeb & Linux</span>
                  </div>
                  <h3 className="text-lg font-black uppercase text-white tracking-tight">
                    16 mois d'immersion & Open Source
                  </h3>
                  <p className="text-sm font-sans text-text-muted leading-relaxed">
                    Reconversion menée à plus de 100 % (<span className="text-white/90">La Plateforme / Eurêka</span>) et validation du{" "}
                    <span className="text-white/90 font-semibold">Titre Professionnel DWWM</span>. Fort de 15 ans de veille et convaincu par la philosophie et la sécurité auditable du{" "}
                    <span className="text-white/90">Logiciel Libre</span> (de l'engouement communautaire autour d'<span className="font-mono text-xs text-purple-300">Hyprland</span> jusqu'au hardening de serveurs de zéro sous <span className="font-mono text-xs text-purple-300">Arch Linux</span> puis <span className="font-mono text-xs text-purple-300">AlmaLinux / RHEL</span>), j'administre aujourd'hui mon propre serveur en{" "}
                    <span className="text-white/90">Podman rootless</span> avec sauvegardes DB et mises à jour automatisées, tout en expérimentant l'inférence IA locale sur GPU.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-mono text-purple-400/80 uppercase tracking-wider">
                  ▹ Transversalité Dev, Sec & Ops
                </div>
              </div>
            </div>

            {/* CAP SUR LA SUITE : BACHELOR 3 & C# .NET / ANGULAR */}
            <div className="hover:bg-gradient-to-r hover:from-cyber-yellow/10 hover:via-cyber-blue/10 hover:to-purple-500/10 from-cyber-yellow/20 via-cyber-blue/20 to-purple-500/20 border border-white/15 border-cyber-blue/50 p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-500">
              <div className="space-y-2 max-w-3xl">
                <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyber-blue font-bold">
                  Prochaine étape // Bachelor 3
                </div>
                <p className="text-sm sm:text-base font-sans text-gray-200 leading-relaxed">
                  Loin d'être éparpillées, ces compétences convergent vers une vision globale du cycle de vie d'une application. Je poursuis aujourd'hui en{" "}
                  <span className="text-white font-bold">Bachelor 3 Développement Web</span> avec une grande sérénité — le socle de cette année à venir étant déjà largement acquis grâce à l'excellence pédagogique de ma formatrice{" "}
                  <span className="text-cyber-yellow font-semibold">Amina Chakir</span>. Mon objectif : élargir mon spectre industriel vers une nouvelle stack robuste, avec une forte appétence pour{" "}
                  <span className="text-white font-mono text-xs bg-white/10 px-2 py-0.5 rounded border border-white/20">
                    C# / .NET
                  </span>{" "}
                  et{" "}
                  <span className="text-white font-mono text-xs bg-white/10 px-2 py-0.5 rounded border border-white/20">
                    Angular
                  </span>
                  ou encore                    
                  <span className="text-white font-mono text-xs bg-white/10 px-2 py-0.5 rounded border border-white/20">Symfony/React                  
                  </span>{" "}
                   que je maîtrise déjà en partie.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto">
                <Link
                  to="/contact"
                  className="px-4 py-2.5 border border-white/20 hover:border-cyber-blue text-white hover:text-cyber-blue font-mono font-bold uppercase text-xs tracking-wider text-center transition-all"
                >
                  Échanger sur une opportunité
                </Link>
              </div>
            </div>
            </div>
          </div>
        </section>
        
        {/* ACCORDION 3: COMPÉTENCES TECHNIQUES */}
        <section className="relative group w-full rounded-2xl hover:from-cyber-yellow/15 hover:via-cyber-blue/15 hover:to-purple-500/15 border border-white/15 overflow-hidden transition-all duration-500 hover:border-cyber-yellow/50 shadow-xl hover:shadow-[0_0_35px_rgba(250,204,21,0.12)]">
          <div className="w-1.5 h-12 bg-cyber-yellow absolute top-5 left-0 z-10 pointer-events-none" />
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyber-yellow/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyber-yellow/20 transition-all duration-500" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-cyber-blue/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyber-blue/20 transition-all duration-500" />

          <button
            type="button"
            className="relative z-10 w-full flex items-center justify-between p-6 sm:p-8 cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-yellow"
            onClick={() => setShowSkills(!showSkills)}
            aria-expanded={showSkills}
          >
            <div className="flex items-center gap-4 sm:gap-6">

              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                  Compétences & Outils Clés
                </h2>
                <p className="text-xs sm:text-sm font-mono text-gray-300">
                  Technologies maîtrisées, bases de données, DevOps & méthodologies
                </p>
              </div>
            </div>
          </button>

          <div
            className={`relative z-10 transition-all duration-500 ease-in-out overflow-hidden ${
              showSkills ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-6 sm:p-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 bg-black/25">
              {skillCategories.map((cat, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl bg-gradient-to-br from-black/50 via-[#151821]/80 to-cyber-blue/10 hover:from-cyber-yellow/15 hover:via-cyber-blue/15 hover:to-purple-500/20 border border-white/10 hover:border-cyber-yellow/60 space-y-4 transition-all duration-500 hover:-translate-y-1 shadow-md hover:shadow-[0_0_25px_rgba(250,204,21,0.15)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      {cat.title}
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {cat.skills.map((skill, sIdx) => (
                      <li key={sIdx} className="text-xs font-mono text-gray-200 flex items-center gap-2">
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
            <div className="relative overflow-hidden group p-6 rounded-2xl bg-gradient-to-br from-cyber-yellow/10 via-bg-panel/80 to-cyber-blue/10 hover:from-cyber-yellow/20 hover:via-cyber-blue/15 hover:to-purple-500/20 border border-white/15 hover:border-cyber-yellow/60 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(250,204,21,0.15)] flex flex-col space-y-3">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyber-yellow/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyber-yellow/25 transition-all duration-500" />
              <span className="text-3xl relative z-10">🏢</span>
              <h3 className="text-lg font-black text-white uppercase tracking-tight relative z-10">
                Base Opérationnelle
              </h3>
              <h4 className="text-xs font-mono font-bold text-cyber-yellow uppercase relative z-10">
                Lyon & Auvergne-Rhône-Alpes
              </h4>
              <p className="text-xs text-gray-200 leading-relaxed font-sans relative z-10">
                Disponible pour des rencontres en présentiel, réunions de cadrage et interventions sur site à Lyon et en région AURA.
              </p>
            </div>

            <div className="relative overflow-hidden group p-6 rounded-2xl bg-gradient-to-br from-cyber-blue/10 via-bg-panel/80 to-purple-500/10 hover:from-cyber-blue/20 hover:via-purple-500/15 hover:to-cyber-yellow/20 border border-white/15 hover:border-cyber-blue/60 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(56,189,248,0.15)] flex flex-col space-y-3">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyber-blue/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyber-blue/25 transition-all duration-500" />
              <span className="text-3xl relative z-10">💻</span>
              <h3 className="text-lg font-black text-white uppercase tracking-tight relative z-10">
                Télétravail & Full Remote
              </h3>
              <h4 className="text-xs font-mono font-bold text-cyber-blue uppercase relative z-10">
                France & International
              </h4>
              <p className="text-xs text-gray-200 leading-relaxed font-sans relative z-10">
                Environnement de développement et infrastructure personnelle entièrement configurés sous AlmaLinux / Arch Linux (VPN Tailscale, conteneurs, observabilité).
              </p>
            </div>

            <div className="relative overflow-hidden group p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-bg-panel/80 to-cyber-yellow/10 hover:from-purple-500/20 hover:via-cyber-blue/15 hover:to-cyber-yellow/20 border border-white/15 hover:border-purple-400/60 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(192,132,252,0.15)] flex flex-col space-y-3">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/25 transition-all duration-500" />
              <span className="text-3xl relative z-10">🚀</span>
              <h3 className="text-lg font-black text-white uppercase tracking-tight relative z-10">
                Disponibilité & Contrats
              </h3>
              <h4 className="text-xs font-mono font-bold text-purple-300 uppercase relative z-10">
                CDI · Freelance · Missions
              </h4>
              <p className="text-xs text-gray-200 leading-relaxed font-sans relative z-10">
                Ouvert aux opportunités d'embauche et prestations techniques de développement full-stack et d'automatisation DevOps.
              </p>
            </div>
          </div>

          {/* Interactive Map Frame with Cyber/Dark styling */}
          {/* <div className="h-96 w-full overflow-hidden rounded-2xl border-2 border-white/15 hover:border-cyber-blue/50 shadow-2xl hover:shadow-[0_0_35px_rgba(56,189,248,0.15)] transition-all duration-500 relative group bg-[#13161f]">
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
          </div> */}
        </section>
      
        {/* LAB CRÉATIF BANNER */}
        <section className="relative group overflow-hidden  hover:from-cyber-yellow/20 hover:via-cyber-blue/20 hover:to-purple-500/25 border border-white/20 hover:border-cyber-yellow/60 p-8 md:p-10 rounded-2xl shadow-xl hover:shadow-[0_0_40px_rgba(56,189,248,0.18)] transition-all duration-500">
          <div className="w-1.5 h-14 bg-cyber-yellow absolute top-7 left-0 pointer-events-none" />
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyber-yellow/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyber-yellow/25 transition-all duration-500" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyber-blue/25 transition-all duration-500" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyber-yellow">
                <span>●</span> Univers & Passions
              </div>
              <h3 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight">
                Curieux d'en voir plus ? Découvrez le Lab Créatif
              </h3>
              <p className="text-sm text-gray-200 max-w-xl">
                L'art contemporain et la musique font partie intégrante de ma créativité. Retrouvez mes expositions de dessins et mon visualiseur audio interactif Soundwave.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/artwork"
                className="px-5 py-2.5 bg-black/40 hover:bg-cyber-yellow hover:text-black border border-white/20 hover:border-cyber-yellow text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all duration-300"
              >
                Galerie Dessins
              </Link>
              <Link
                to="/music"
                className="px-5 py-2.5 bg-black/40 hover:bg-cyber-blue hover:text-black border border-white/20 hover:border-cyber-blue text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all duration-300"
              >
                Créations sonores
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
