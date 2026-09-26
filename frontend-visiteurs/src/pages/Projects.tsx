import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
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
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
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

  const devCategories = categories.filter(
    (c) => c.name.toLowerCase() !== "devops"
  );

  const devProjects = projects.filter(
    (p) => p.category_name?.toLowerCase() !== "devops"
  );

  // Extract all unique technologies present in dev projects
  const availableTechnologies = useMemo(() => {
    const map = new Map<string, number>();
    devProjects.forEach((p) => {
      p.technologies?.forEach((t) => {
        map.set(t.name, (map.get(t.name) || 0) + 1);
      });
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [devProjects]);

  const filteredProjects = devProjects.filter((project) => {
    // Category filter
    if (activeCategory !== "all" && project.category_name?.toLowerCase() !== activeCategory.toLowerCase()) {
      return false;
    }

    // Technology pill filter
    if (selectedTech) {
      const hasTech = project.technologies?.some(
        (t) => t.name.toLowerCase() === selectedTech.toLowerCase()
      );
      if (!hasTech) return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = project.title.toLowerCase().includes(q);
      const matchDesc = project.description?.toLowerCase().includes(q) || false;
      const matchTech = project.technologies?.some((t) => t.name.toLowerCase().includes(q)) || false;
      if (!matchTitle && !matchDesc && !matchTech) return false;
    }

    return true;
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

      {/* Search Bar & Filters */}
      <div className="bg-bg-panel/60 border border-border-subtle p-4 rounded-xl space-y-4 shadow-lg">
        {/* Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative grow">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-xs">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par mot-clé, techno (React, PostgreSQL, Docker)..."
              className="w-full bg-bg-main border border-border-subtle pl-9 pr-4 py-2.5 outline-none focus:border-cyber-yellow text-text-main font-mono text-xs rounded"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {(selectedTech || searchQuery || activeCategory !== "all") && (
            <button
              type="button"
              onClick={() => {
                setActiveCategory("all");
                setSelectedTech(null);
                setSearchQuery("");
              }}
              className="px-3 py-2 text-xs font-mono font-bold text-red-400 hover:text-red-300 border border-red-500/30 rounded uppercase tracking-wider"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider font-bold transition-all border rounded cursor-pointer ${
              activeCategory === "all"
                ? "bg-cyber-yellow text-black border-cyber-yellow shadow"
                : "bg-bg-main text-gray-300 border-border-subtle hover:border-cyber-yellow hover:text-white"
            }`}
          >
            Tous ({devProjects.length})
          </button>

          {devCategories.map((cat) => {
            const count = devProjects.filter(
              (p) => p.category_name?.toLowerCase() === cat.name.toLowerCase()
            ).length;
            const isActive = activeCategory.toLowerCase() === cat.name.toLowerCase();

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name.toLowerCase())}
                className={`px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider font-bold transition-all border rounded cursor-pointer ${
                  isActive
                    ? "bg-cyber-yellow text-black border-cyber-yellow shadow"
                    : "bg-bg-main text-gray-300 border-border-subtle hover:border-cyber-yellow hover:text-white"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Technology Filter Pills */}
        {availableTechnologies.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border-subtle/50">
            <span className="text-[10px] font-mono uppercase text-gray-500 mr-1 font-bold">
              Filtrer par stack :
            </span>
            {availableTechnologies.map((tech) => {
              const isSelected = selectedTech?.toLowerCase() === tech.name.toLowerCase();
              return (
                <button
                  key={tech.name}
                  onClick={() => setSelectedTech(isSelected ? null : tech.name)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-all cursor-pointer ${
                    isSelected
                      ? "bg-cyber-blue text-black font-black border border-cyber-blue shadow"
                      : "bg-bg-main text-gray-400 border border-border-subtle hover:border-cyber-blue hover:text-white"
                  }`}
                >
                  {tech.name} ({tech.count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {filteredProjects.map((article) => {
          const detailUrl = `/projects/${article.slug || article.id}`;

          return (
            <article
              key={article.id}
              className="bg-bg-panel border-2 border-border-subtle group hover:border-secondary transition-all duration-300 flex flex-col h-full shadow-[8px_8px_0px_0px_rgba(0,242,254,0.15)] hover:shadow-[8px_8px_0px_0px_rgba(0,242,254,0.35)] rounded-sm overflow-hidden"
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

                  {article.is_featured && (
                    <div className="absolute top-2 right-2 bg-cyber-yellow text-black px-2 py-0.5 rounded text-[10px] font-mono uppercase font-black">
                      ★ Vedette
                    </div>
                  )}

                  <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm border border-white/20 px-2 py-1 rounded text-[10px] font-mono text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 pointer-events-none">
                    <span>🔍</span>
                    <span>Agrandir</span>
                  </div>
                </div>
              )}

              <div className="p-6 flex flex-col grow">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Link to={detailUrl}>
                    <h2 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-cyber-yellow transition-colors">
                      {article.title}
                    </h2>
                  </Link>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed mb-6 font-mono text-text-muted">
                  {article.description}
                </p>

                <div className="space-y-4 pt-4 border-t border-border-subtle/50 mt-auto">
                  {/* Technologies */}
                  {article.technologies && article.technologies.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 text-secondary font-mono">
                        Stack &amp; Outils
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {article.technologies.map((tech) => (
                          <button
                            type="button"
                            key={tech.id}
                            onClick={() => setSelectedTech(tech.name)}
                            className="text-[9px] font-mono uppercase bg-bg-main px-2 py-0.5 border border-border-subtle text-gray-300 font-bold hover:border-cyber-blue hover:text-white transition-colors cursor-pointer"
                            title={`Filtrer par ${tech.name}`}
                          >
                            {tech.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Links Row: Details + Demo + GitHub */}
                  <div className="flex flex-col gap-2 pt-2">
                    <Link
                      to={detailUrl}
                      className="flex items-center justify-between border-2 border-cyber-yellow text-cyber-yellow hover:bg-cyber-yellow hover:text-black p-2.5 text-xs font-black uppercase tracking-widest transition-all font-mono"
                    >
                      <span>Fiche Détaillée &amp; Architecture</span>
                      <span>📖 →</span>
                    </Link>

                    {article.demo_url && (
                      <a
                        href={article.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between border border-border-subtle p-2 text-xs font-black uppercase tracking-widest hover:border-secondary hover:text-secondary transition-all text-text-main bg-bg-main/40 font-mono"
                      >
                        <span>Lancer la démo</span>
                        <span className="text-[10px] text-cyber-cyan">[demo]</span>
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
                            className="flex items-center justify-between border border-border-subtle p-2 text-xs font-black uppercase tracking-widest hover:border-secondary hover:text-secondary transition-all text-text-main bg-bg-main/40 font-mono"
                          >
                            <span className="truncate pr-2">{link.label || "Code Source"}</span>
                            <span className={`text-[10px] ${badge.colorClass}`}>
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
                          className="flex items-center justify-between border border-border-subtle p-2 text-xs font-black uppercase tracking-widest hover:border-secondary hover:text-secondary transition-all text-text-main bg-bg-main/40 font-mono"
                        >
                          <span>Code Source</span>
                          <span className="text-[10px] text-gray-400">[code]</span>
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
              404_PROJECTS_NOT_FOUND: Aucun projet ne correspond à votre recherche
            </p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setSelectedTech(null);
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-cyber-yellow text-black font-mono font-bold text-xs uppercase rounded"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* ================= LIGHTBOX MODAL ================= */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
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
