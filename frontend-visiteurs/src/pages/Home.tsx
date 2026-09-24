import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const Home: React.FC = () => {
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
        <section className="flex flex-col-reverse md:flex-row items-center justify-between gap-10 md:gap-14 border-b-2 border-border-subtle pb-14">
          <div className="flex-1 text-center md:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-cyan/40 border border-cyber-yellow/40 text-cyber-yellow text-xs font-mono tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-cyber-yellow animate-pulse"></span>
              Disponible pour de nouvelles opportunités
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-none">
              Gabriel <span className="text-cyber-yellow">Fortier</span>
            </h1>

            <p className="text-xl sm:text-2xl font-bold text-cyber-blue font-mono">
              Développeur Full-Stack & futur DevOps
            </p>

            <p className="text-text-muted text-base sm:text-lg leading-relaxed font-sans max-w-2xl">
              Passionné par la conception d'applications web robustes, l'architecture logicielle et l'automatisation des déploiements. Je construis des solutions complètes de la base de données jusqu'à l'infrastructure.
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
                to="/category/devops"
                className="px-6 py-3 border-2 border-white/20 hover:border-cyber-blue text-white hover:text-cyber-blue font-black uppercase text-xs tracking-widest transition-all bg-bg-panel/50"
              >
                Espace DevOps
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3 border-2 border-transparent hover:underline text-text-muted hover:text-white font-black uppercase text-xs tracking-widest transition-all"
              >
                Me Contacter →
              </Link>
            </div>
          </div>

          {/* Profile Photo */}
          <div className="relative group shrink-0">
            <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-4 border-cyber-yellow/40 shadow-2xl relative z-10 bg-bg-panel group-hover:scale-105 transition-transform duration-500">
              <img
                src="/gab.jpeg"
                alt="Gabriel Fortier"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/LOGO.avif";
                }}
              />
            </div>
            {/* Cyber Backing glow/border decoration */}
            <div className="absolute -inset-2 bg-gradient-to-r from-cyber-yellow/20 via-cyber-blue/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 -z-0" />
            <div className="absolute -bottom-3 -right-3 w-full h-full border-2 border-cyber-blue/40 rounded-2xl -z-0 pointer-events-none" />
          </div>
        </section>

        {/* PARCOURS & MOTIVATION */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-bg-panel/40 border border-border-subtle p-8 rounded-xl space-y-4 relative overflow-hidden">
            <div className="w-1.5 h-8 bg-cyber-yellow absolute top-8 left-0"></div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              Mon Parcours
            </h2>
            <div className="text-sm font-sans text-text-muted leading-relaxed space-y-3">
              <p>
                Issu d'un univers où la créativité et la rigueur se croisent (musique, art contemporain, conception), j'ai orienté mon expertise vers le <strong>développement web et logiciel</strong>.
              </p>
              <p>
                Formé sur les stacks modernes (React, TypeScript, Node.js, PostgreSQL), j'ai développé une sensibilité poussée pour la qualité de code, l'architecture d'API REST sécurisée et l'optimisation des performances.
              </p>
              <p>
                Aujourd'hui, j'approfondis naturellement ma démarche vers l'<strong>écosystème DevOps & Cloud</strong> afin de maîtriser le cycle de vie applicatif de bout en bout.
              </p>
            </div>
          </div>

          <div className="bg-bg-panel/40 border border-border-subtle p-8 rounded-xl space-y-4 relative overflow-hidden">
            <div className="w-1.5 h-8 bg-cyber-blue absolute top-8 left-0"></div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              Ce qui m'anime
            </h2>
            <div className="text-sm font-sans text-text-muted leading-relaxed space-y-3">
              <p>
                <strong className="text-white">L'automatisation & la fiabilité :</strong> Rien n'est plus gratifiant que de concevoir des pipelines CI/CD fluides, des conteneurs légers et des infrastructures reproductibles sans friction.
              </p>
              <p>
                <strong className="text-white">La curiosité & la veille constante :</strong> Le monde du développement évolue vite. Explorer de nouveaux paradigmes, tester des outils d'observabilité et optimiser le tooling quotidien font partie intégrante de ma routine.
              </p>
              <p>
                <strong className="text-white">Le sens du détail :</strong> Qu'il s'agisse d'une interface réactive à la milliseconde près ou d'un Dockerfile optimisé en multi-stage, chaque détail compte.
              </p>
            </div>
          </div>
        </section>

        {/* STACK & COMPÉTENCES */}
        <section className="space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black uppercase tracking-tight text-white">
              Stack & Compétences
            </h2>
            <p className="text-sm font-mono text-gray-400 uppercase tracking-widest mt-1">
              Les technologies que j'utilise et approfondis au quotidien
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* FRONTEND */}
            <div className="bg-bg-panel border-2 border-border-subtle p-6 hover:border-cyber-yellow transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black uppercase tracking-wider text-sm text-cyber-yellow">
                  Frontend
                </h3>
                <span className="text-xs font-mono text-gray-400">[UI / UX]</span>
              </div>
              <ul className="space-y-2 text-xs font-mono text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-cyber-yellow">▹</span> React 19 / Next.js
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyber-yellow">▹</span> TypeScript / JavaScript ES6+
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyber-yellow">▹</span> Tailwind CSS / PostCSS
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyber-yellow">▹</span> Vite / Responsive Web
                </li>
              </ul>
            </div>

            {/* BACKEND & DATA */}
            <div className="bg-bg-panel border-2 border-border-subtle p-6 hover:border-cyber-blue transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black uppercase tracking-wider text-sm text-cyber-blue">
                  Backend & Data
                </h3>
                <span className="text-xs font-mono text-gray-400">[API / DB]</span>
              </div>
              <ul className="space-y-2 text-xs font-mono text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-cyber-blue">▹</span> Node.js / Express 5
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyber-blue">▹</span> PostgreSQL & Modélisation relationnelle
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyber-blue">▹</span> API REST, JWT, Sécurité & RBAC
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyber-blue">▹</span> Validation (Zod), Mailer SMTP
                </li>
              </ul>
            </div>

            {/* DEVOPS & INFRA */}
            <div className="bg-bg-panel border-2 border-border-subtle p-6 hover:border-purple-400 transition-all duration-300 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black uppercase tracking-wider text-sm text-purple-400">
                  DevOps & Infra
                </h3>
                <span className="text-xs font-mono text-gray-400">[Ops / CI]</span>
              </div>
              <ul className="space-y-2 text-xs font-mono text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">▹</span> Docker & Docker Compose
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">▹</span> Linux (Debian / Alma / Arch)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">▹</span> CI/CD GitHub Actions & Déploiement
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">▹</span> Nginx Reverse Proxy, SSL, Git
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* LAB CRÉATIF BANNER */}
        <section className="relative overflow-hidden bg-linear-to-r from-[#1f2128] via-[#282b35] to-[#1f2128] border-2 border-dashed border-white/20 p-8 md:p-10 rounded-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyber-yellow">
                Univers & Passions
              </div>
              <h3 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight">
                Curieux d'en voir plus ? Découvrez le Lab Créatif
              </h3>
              <p className="text-sm text-text-muted max-w-xl">
                L'art contemporain et la musique font partie intégrante de ma créativité. Retrouvez mes expositions de dessins et mon visualiseur audio interactif Soundwave.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/artwork"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-wider rounded transition-all"
              >
                Galerie Dessins
              </Link>
              <Link
                to="/music"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-wider rounded transition-all"
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
