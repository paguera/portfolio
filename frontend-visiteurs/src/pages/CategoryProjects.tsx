import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import type { Project } from "../types";
import { apiFetch } from "../utils/api";

const CategoryProjects: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [articles, setArticles] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const data: Project[] = await apiFetch<Project[]>(`/projects/category/${slug}`);
        setArticles(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        console.error("Erreur lors du chargement des projets :", message, error);
      } finally {
        setLoading(false);
      }
    };
    loadArticles();
  }, [slug]);

  if (loading)
    return (
      <div className="text-center py-20 uppercase tracking-widest animate-pulse">
        [ Scanning database for {slug}... ]
      </div>
    );

  return (
    <div>
      <Helmet>
        <title>{`${slug?.toUpperCase()} | GVF Portfolio`}</title>
        <meta name="description" content={`Découvrez tous mes projets dans la catégorie ${slug}.`} />
      </Helmet>
      <h1 className="text-4xl font-bold mb-12 uppercase tracking-tighter border-b-2 border-text-main pb-4 inline-block">
        {slug}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 items-start">
        {articles.map((article) => {
          return (
            <article
              key={article.id}
              className="bg-bg-panel border-2 border-border-subtle group hover:border-secondary transition-all duration-300 flex flex-col h-full shadow-[8px_8px_0px_0px_rgba(0,242,254,0.15)] hover:shadow-[8px_8px_0px_0px_rgba(0,242,254,0.35)]"
            >
              {article.image_url && (
                <div className="aspect-video w-full overflow-hidden border-b-2 border-border-subtle group-hover:border-secondary">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              )}
              <div className="p-8 flex flex-col grow">
                <h2 className="text-2xl font-bold mb-4 uppercase tracking-tight text-text-main">
                  {article.title}
                </h2>

                <p className="text-sm leading-relaxed mb-6 font-mono text-text-muted">
                  {article.description}
                </p>

                <div className="space-y-6 pt-4 border-t border-border-subtle/50">
                  {/* Technologies */}
                  {article.technologies && article.technologies.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 text-secondary">
                        Stack Technique
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {article.technologies.map((tech) => (
                          <span
                            key={tech.id}
                            className="text-[9px] font-mono uppercase bg-bg-main px-2 py-1 border border-border-subtle text-text-main"
                          >
                            {tech.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Liens Github / Démo */}
                  <div className="flex flex-col gap-2 pt-2">
                    {article.demo_url && (
                      <a
                        href={article.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between bg-primary text-cyber-yellow px-4 py-3 text-xs font-black uppercase tracking-widest hover:bg-bg-panel hover:text-white border border-primary transition-all"
                      >
                        <span>Lancer la démo</span>
                        <span>→</span>
                      </a>
                    )}

                    {article.github_links && article.github_links.length > 0 ? (
                      article.github_links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between border border-border-subtle p-3 text-xs font-black uppercase tracking-widest hover:border-secondary hover:text-secondary transition-all text-text-main bg-bg-main/30"
                        >
                          <span>{link.label || 'Code Source'}</span>
                        </a>
                      ))
                    ) : (
                      article.github_url && (
                        <a
                          href={article.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between border border-border-subtle p-3 text-xs font-black uppercase tracking-widest hover:border-secondary hover:text-secondary transition-all text-text-main bg-bg-main/30"
                        >
                          <span>Source Code</span>
                          <span>[git]</span>
                        </a>
                      )
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
        {articles.length === 0 && (
          <p className="col-span-full text-center py-24 uppercase tracking-widest border-2 border-dashed border-border-subtle font-mono text-gray-500">
            404_PROJECTS_NOT_FOUND: no entries for category "{slug}"
          </p>
        )}
      </div>
    </div>
  );
};

export default CategoryProjects;
