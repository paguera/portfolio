import React, { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import type { Project, Category } from "../types";
import { apiFetch } from "../utils/api";

const getLinkBadge = (label: string): { tag: string; colorClass: string } => {
  const l = label.toLowerCase();
  if (l.includes("archi") || l.includes("schéma") || l.includes("schema") || l.includes("diagram")) {
    return { tag: "[archi]", colorClass: "text-cyber-blue border-cyber-blue/50" };
  }
  if (l.includes("ci/cd") || l.includes("cicd") || l.includes("pipeline") || l.includes("action") || l.includes("workflow")) {
    return { tag: "[ci/cd]", colorClass: "text-cyber-yellow border-cyber-yellow/50" };
  }
  if (l.includes("docker") || l.includes("infra") || l.includes("compose") || l.includes("k8s") || l.includes("terraform")) {
    return { tag: "[infra]", colorClass: "text-purple-400 border-purple-400/50" };
  }
  if (l.includes("doc") || l.includes("guide") || l.includes("spec") || l.includes("wiki") || l.includes("readme")) {
    return { tag: "[docs]", colorClass: "text-emerald-400 border-emerald-400/50" };
  }
  if (l.includes("git") || l.includes("source") || l.includes("code") || l.includes("repo")) {
    return { tag: "[code]", colorClass: "text-gray-300 border-gray-400/50" };
  }
  return { tag: "[link]", colorClass: "text-gray-300 border-gray-400/50" };
};

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectsData, categoriesData] = await Promise.all([
          apiFetch<Project[]>("/projects"),
          apiFetch<Category[]>("/categories")
        ]);
        setProjects(projectsData || []);
        setCategories(categoriesData || []);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        console.error("Erreur lors du chargement des projets :", message, error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fermer la lightbox avec la touche Échap
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setLightboxImage(null);
    }
  }, []);

  useEffect(() => {
    if (lightboxImage) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxImage, handleKeyDown]);

  // Ne conserver que les catégories Dev (exclure DevOps qui a sa page dédiée)
  const devCategories = categories.filter(
    (c) => c.name.toLowerCase() !== "devops"
  );

  // Projets Dev uniquement (hors devops)
  const devProjects = projects.filter(
    (p) => p.category_name?.toLowerCase() !== "devops"
  );

  const filteredProjects = devProjects.filter((project) => {
    if (activeFilter === "all") return true;
    return project.category_name?.toLowerCase() === activeFilter.toLowerCase();
  });

  if (loading) {
    return (
      <div className="text-center py-20 uppercase tracking-widest animate-pulse font-mono text-cyber-yellow">
        [ Scanning projects database... ]
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Projets Dev | Gabriel Fortier</title>
        <meta
          name="description"
          content="Découvrez mes projets en développement web, jeux, outils et architectures logicielles."
        />
      </Helmet>

      {/* Header */}
      <div className="border-b-2 border-border-subtle pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyber-yellow block mb-1">
            Galerie Portfolio
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
            Projets Dev
          </h1>
        </div>
        <p className="text-xs font-mono text-gray-400 max-w-md">
          Applications web full-stack, jeux, outils & architectures logicielles.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 items-center pb-2">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-4 py-2 font-mono text-xs uppercase tracking-wider font-bold transition-all border cursor-pointer ${
            activeFilter === "all"
              ? "bg-cyber-yellow text-black border-cyber-yellow shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)]"
              : "bg-bg-panel text-gray-300 border-border-subtle hover:border-cyber-yellow hover:text-white"
          }`}
        >
          [ Tous ({devProjects.length}) ]
        </button>

        {devCategories.map((cat) => {
          const count = devProjects.filter(
            (p) => p.category_name?.toLowerCase() === cat.name.toLowerCase()
          ).length;
          const isActive = activeFilter.toLowerCase() === cat.name.toLowerCase();

          return (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.name.toLowerCase())}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-wider font-bold transition-all border cursor-pointer ${
                isActive
                  ? "bg-cyber-yellow text-black border-cyber-yellow shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)]"
                  : "bg-bg-panel text-gray-300 border-border-subtle hover:border-cyber-yellow hover:text-white"
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {filteredProjects.map((article) => {
          return (
            <article
              key={article.id}
              className="bg-bg-panel border-2 border-border-subtle group hover:border-secondary transition-all duration-300 flex flex-col h-full shadow-[8px_8px_0px_0px_rgba(0,242,254,0.15)] hover:shadow-[8px_8px_0px_0px_rgba(0,242,254,0.35)]"
            >
              {article.image_url && (
                <div
                  className="aspect-video w-full overflow-hidden border-b-2 border-border-subtle group-hover:border-secondary relative cursor-zoom-in bg-[#181a20]"
                  onClick={() => {
                    if (article.image_url) {
                      setLightboxImage({
                        src: article.image_url,
                        title: article.title,
                      });
                    }
                  }}
                  title="Cliquer pour agrandir le schéma ou l'image"
                >
                  <img
                    src={article.image_url}
                    alt={article.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                  />
                  {/* Category Pill Tag */}
                  {article.category_name && (
                    <div className="absolute top-2 left-2 bg-black/85 backdrop-blur-sm border border-white/20 px-2 py-0.5 rounded text-[10px] font-mono text-cyber-yellow uppercase font-bold">
                      {article.category_name}
                    </div>
                  )}
                  {/* Badge d'agrandissement au survol */}
                  <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm border border-white/20 px-2 py-1 rounded text-[10px] font-mono text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 pointer-events-none">
                    <span>🔍</span>
                    <span>Agrandir</span>
                  </div>
                </div>
              )}

              <div className="p-6 md:p-8 flex flex-col grow">
                <h2 className="text-xl md:text-2xl font-black mb-3 uppercase tracking-tight text-white group-hover:text-cyber-yellow transition-colors">
                  {article.title}
                </h2>

                <p className="text-xs sm:text-sm leading-relaxed mb-6 font-mono text-text-muted">
                  {article.description}
                </p>

                <div className="space-y-5 pt-4 border-t border-border-subtle/50 mt-auto">
                  {/* Technologies */}
                  {article.technologies && article.technologies.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 text-secondary">
                        Stack & Outils
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {article.technologies.map((tech) => (
                          <span
                            key={tech.id}
                            className="text-[9px] font-mono uppercase bg-bg-main px-2 py-1 border border-border-subtle text-gray-300 font-bold"
                          >
                            {tech.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Liens Github / Architecture / Démo */}
                  <div className="flex flex-col gap-2 pt-2">
                    {article.demo_url && (
                      <a
                        href={article.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between border border-border-subtle p-2.5 text-xs font-black uppercase tracking-widest hover:border-secondary hover:text-secondary transition-all text-text-main bg-bg-main/40"
                      >
                        <span>Lancer la démo</span>
                        <span className="text-[10px] font-mono text-cyber-cyan">[demo]</span>
                      </a>
                    )}

                    {article.github_links && article.github_links.length > 0 ? (
                      article.github_links.map((link, idx) => {
                        const badge = getLinkBadge(link.label || "");
                        return (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between border border-border-subtle p-2.5 text-xs font-black uppercase tracking-widest hover:border-secondary hover:text-secondary transition-all text-text-main bg-bg-main/40"
                          >
                            <span className="truncate pr-2">{link.label || 'Code Source'}</span>
                            <span className={`text-[10px] font-mono shrink-0 ${badge.colorClass}`}>
                              {badge.tag}
                            </span>
                          </a>
                        );
                      })
                    ) : (
                      article.github_url && (
                        <a
                          href={article.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between border border-border-subtle p-2.5 text-xs font-black uppercase tracking-widest hover:border-secondary hover:text-secondary transition-all text-text-main bg-bg-main/40"
                        >
                          <span>Code Source</span>
                          <span className="text-[10px] font-mono text-gray-400">[code]</span>
                        </a>
                      )
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="col-span-full text-center py-20 border-2 border-dashed border-border-subtle rounded-xl p-8 space-y-4">
            <p className="font-mono text-sm text-gray-400 uppercase tracking-widest">
              404_PROJECTS_NOT_FOUND: no entries for current selection
            </p>
          </div>
        )}
      </div>

      {/* ================= LIGHTBOX MODAL ================= */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          {/* Top Bar Controls */}
          <div
            className="w-full max-w-6xl flex items-center justify-between text-white pb-3 mb-2 border-b border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="text-cyber-yellow font-mono text-xs uppercase">[ Aperçu Schéma / Image ]</span>
              <span className="text-white font-bold text-sm truncate max-w-md">
                {lightboxImage.title}
              </span>
            </div>
            <button
              onClick={() => setLightboxImage(null)}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/30 rounded text-xs font-mono font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
            >
              Fermer (Échap ✕)
            </button>
          </div>

          {/* Image Canvas Container */}
          <div
            className="relative max-w-6xl max-h-[85vh] w-full flex items-center justify-center overflow-auto p-2 bg-[#181a20] border-2 border-white/20 rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage.src}
              alt={lightboxImage.title}
              className="max-h-[80vh] w-auto max-w-full object-contain rounded select-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
