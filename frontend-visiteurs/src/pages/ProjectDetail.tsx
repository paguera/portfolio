import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import type { Project } from '../types';
import { apiFetch } from '../utils/api';
import MarkdownView from '../components/MarkdownView';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) return;
        const data = await apiFetch<Project>(`/projects/${id}`);
        setProject(data);
      } catch (err) {
        console.error('Erreur chargement projet:', err);
        setError('Projet introuvable ou indisponible');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[50vh]'>
        <div className='font-mono text-sm tracking-widest uppercase text-cyber-yellow animate-pulse'>
          &gt; CHARGEMENT_FICHE_PROJET.SYS...
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className='max-w-3xl mx-auto py-12 text-center space-y-6'>
        <div className='p-8 bg-bg-panel border-2 border-red-500/50 rounded-xl space-y-4 font-mono'>
          <h2 className='text-xl font-black text-red-400 uppercase'>Projet Non Trouvé</h2>
          <p className='text-sm text-gray-400'>
            Le projet demandé n&apos;existe pas ou a été déplacé.
          </p>
          <button
            onClick={() => navigate('/projects')}
            className='px-6 py-2.5 bg-cyber-yellow text-black font-black uppercase text-xs tracking-wider rounded'
          >
            ← Retour à tous les projets
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{project.title} | Gabriel Fortier Portfolio</title>
        <meta name='description' content={project.description || `Détails et architecture du projet ${project.title}`} />
      </Helmet>

      <div className='max-w-4xl mx-auto space-y-10 py-4'>
        {/* Navigation & Breadcrumb */}
        <div className='flex items-center justify-between gap-4 border-b border-border-subtle pb-4'>
          <Link
            to='/projects'
            className='inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-text-muted hover:text-cyber-yellow transition-colors'
          >
            ← Tous les projets
          </Link>

          {project.category_name && (
            <Link
              to={`/category/${project.category_name.toLowerCase()}`}
              className='font-mono text-xs uppercase px-3 py-1 rounded bg-cyber-blue/15 border border-cyber-blue/30 text-cyber-blue font-bold hover:bg-cyber-blue/25 transition-colors'
            >
              {project.category_name}
            </Link>
          )}
        </div>

        {/* Hero Section */}
        <div className='space-y-6'>
          <div className='space-y-3'>
            <div className='flex flex-wrap items-center gap-3'>
              <h1 className='text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white'>
                {project.title}
              </h1>
              {project.is_featured && (
                <span className='px-2.5 py-1 bg-cyber-yellow/20 border border-cyber-yellow/40 text-cyber-yellow text-xs font-mono font-bold rounded flex items-center gap-1'>
                  ★ Projet Phare
                </span>
              )}
            </div>

            {project.description && (
              <p className='text-base sm:text-lg text-text-muted font-sans leading-relaxed'>
                {project.description}
              </p>
            )}
          </div>

          {/* Action Links & Tech Stack */}
          <div className='flex flex-wrap items-center justify-between gap-4 pt-2'>
            {/* Tech Tags */}
            <div className='flex flex-wrap gap-2'>
              {project.technologies?.map(tech => (
                <span
                  key={tech.id}
                  className='px-3 py-1 rounded bg-bg-panel border border-border-subtle text-xs font-mono text-gray-300 font-bold'
                >
                  {tech.name}
                </span>
              ))}
            </div>

            {/* Buttons */}
            <div className='flex flex-wrap items-center gap-3'>
              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='px-5 py-2.5 bg-cyber-yellow text-black font-black uppercase text-xs tracking-wider rounded hover:bg-yellow-300 transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)] flex items-center gap-1.5'
                >
                  <span>🚀 Démo en ligne</span>
                </a>
              )}

              {project.github_links?.map(link => (
                <a
                  key={link.id || link.url}
                  href={link.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='px-4 py-2.5 bg-bg-panel hover:bg-bg-panel/80 border-2 border-white/20 hover:border-white text-white font-mono font-bold text-xs uppercase tracking-wider rounded transition-all flex items-center gap-1.5'
                >
                  <span>💻 {link.label || 'Code Source'} ↗</span>
                </a>
              ))}
            </div>
          </div>

          {/* Project Banner / Image */}
          {project.image_url && (
            <div className='relative overflow-hidden rounded-xl border-2 border-border-subtle bg-black shadow-2xl max-h-[480px] group'>
              <img
                src={project.image_url}
                alt={project.title}
                className='w-full h-full object-cover group-hover:scale-102 transition-transform duration-500'
                onError={e => {
                  (e.target as HTMLImageElement).src = '/LOGO.avif';
                }}
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none' />
            </div>
          )}
        </div>

        {/* Detailed Markdown Documentation Section */}
        {project.content_markdown ? (
          <section className='bg-bg-panel/40 border border-border-subtle p-6 sm:p-10 rounded-2xl space-y-6 shadow-xl'>
            <div className='flex items-center gap-2 border-b border-border-subtle pb-4'>
              <span className='w-2 h-2 rounded-full bg-cyber-yellow'></span>
              <h2 className='text-sm font-mono uppercase tracking-widest text-cyber-yellow font-black'>
                Détails_Architecture_&amp;_Documentation.md
              </h2>
            </div>

            <MarkdownView content={project.content_markdown} />
          </section>
        ) : (
          <section className='bg-bg-panel/20 border border-dashed border-border-subtle p-8 rounded-xl text-center font-mono text-xs text-text-muted'>
            Documentation technique détaillée en cours de rédaction.
          </section>
        )}

        {/* Footer Navigation */}
        <div className='flex justify-between items-center pt-8 border-t border-border-subtle'>
          <Link
            to='/projects'
            className='px-5 py-2.5 border border-border-subtle hover:border-cyber-yellow text-white font-mono text-xs uppercase font-bold rounded transition-colors'
          >
            ← Explorer d&apos;autres projets
          </Link>

          <Link
            to='/contact'
            className='px-5 py-2.5 bg-cyber-yellow text-black font-mono text-xs uppercase font-black rounded hover:bg-yellow-300 transition-colors'
          >
            Discuter de ce projet →
          </Link>
        </div>
      </div>
    </>
  );
};

export default ProjectDetail;
