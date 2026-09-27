import React, { useEffect, useState } from 'react'
import type { Project, Category, Technology, ContactMessagesResponse } from '../types'
import apiFetch from '../utils/api'
import VisitorAnalytics from '../components/VisitorAnalytics'
import ArtworksManager from '../components/ArtworksManager'
import ContactInbox from '../components/ContactInbox'
import SiteSettingsManager from '../components/SiteSettingsManager'
import InfraControlCenter from '../components/InfraControlCenter'
import FileUpload from '../components/FileUpload'
import MarkdownEditor from '../components/MarkdownEditor'

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'projects' | 'artworks' | 'messages' | 'settings' | 'infra'>('analytics')
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [technologies, setTechnologies] = useState<Technology[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    return await Promise.all([
      apiFetch<Project[]>('/projects?all=true'),
      apiFetch<Category[]>('/categories'),
      apiFetch<Technology[]>('/technologies'),
      apiFetch<ContactMessagesResponse>('/contact/messages?status=unread').catch(() => ({ messages: [], counts: { total: 0, unread: 0, archived: 0 } }))
    ])
  }

  const refresh = async () => {
    try {
      const [projectsData, categoriesData, techData, messagesData] = await loadData()
      setProjects(projectsData)
      setCategories(categoriesData)
      setTechnologies(techData)
      setUnreadCount(messagesData.counts.unread)
    } catch (err) {
      console.error('Erreur lors de la mise à jour des données', err)
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const [projectsData, categoriesData, techData, messagesData] = await loadData()
        setProjects(projectsData)
        setCategories(categoriesData)
        setTechnologies(techData)
        setUnreadCount(messagesData.counts.unread)
      } catch (err) {
        console.error('La récupération initiale des données a échoué', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Project Form State
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [contentMarkdown, setContentMarkdown] = useState('')
  const [selectedTechIds, setSelectedTechIds] = useState<number[]>([])
  const [githubLinks, setGithubLinks] = useState<{ id?: number; label: string; url: string }[]>([])
  const [demoUrl, setDemoUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isPublished, setIsPublished] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)

  // Link Helpers
  const addLink = () => setGithubLinks(prev => [...prev, { label: '', url: '' }])
  const removeLink = (index: number) => setGithubLinks(prev => prev.filter((_, i) => i !== index))
  const updateLink = (index: number, key: 'label' | 'url', value: string) => {
    setGithubLinks(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [key]: value }
      return copy
    })
  }

  // Category Form State
  const [newCategoryName, setNewCategoryName] = useState('')

  // Technology Form State
  const [newTechName, setNewTechName] = useState('')

  // UI State
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null)

  const resetProjectForm = () => {
    setTitle('')
    setSlug('')
    setDescription('')
    setContentMarkdown('')
    setSelectedTechIds([])
    setGithubLinks([])
    setDemoUrl('')
    setImageUrl('')
    setCategoryId('')
    setIsPublished(true)
    setIsFeatured(false)
    setEditingProjectId(null)
  }

  const handleTechToggle = (id: number) => {
    setSelectedTechIds(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    )
  }

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const projectData = {
      title,
      slug: slug || undefined,
      description,
      content_markdown: contentMarkdown,
      category_id: parseInt(categoryId),
      technology_ids: selectedTechIds,
      github_links: githubLinks,
      demo_url: demoUrl || '',
      image_url: imageUrl || '/LOGO.png',
      is_published: isPublished,
      is_featured: isFeatured
    }

    try {
      if (editingProjectId) {
        await apiFetch(`/projects/${editingProjectId}`, {
          method: 'PUT',
          body: JSON.stringify(projectData)
        })
      } else {
        await apiFetch('/projects', {
          method: 'POST',
          body: JSON.stringify(projectData)
        })
      }
      resetProjectForm()
      refresh()
      alert('Projet enregistré avec succès !')
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer le projet"
      console.error(message, err)
      alert(`Erreur : ${message}`)
    }
  }

  const handleEditProject = (project: Project) => {
    setActiveTab('projects')
    setEditingProjectId(project.id)
    setTitle(project.title)
    setSlug(project.slug || '')
    setDescription(project.description || '')
    setContentMarkdown(project.content_markdown || '')
    setSelectedTechIds(project.technologies?.map(t => t.id) || [])
    setGithubLinks(project.github_links || [])
    setDemoUrl(project.demo_url || '')
    setImageUrl(project.image_url || '')
    setCategoryId(project.category_id.toString())
    setIsPublished(project.is_published !== false)
    setIsFeatured(project.is_featured === true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteProject = async (id: number) => {
    if (!confirm('Supprimer définitivement ce projet ?')) return
    try {
      await apiFetch(`/projects/${id}`, { method: 'DELETE' })
      refresh()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erreur lors de la suppression'
      alert('Impossible de supprimer ce projet: ' + message)
    }
  }

  const moveProject = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= projects.length) return

    const newProjects = [...projects]
    const [moved] = newProjects.splice(index, 1)
    newProjects.splice(targetIndex, 0, moved)
    setProjects(newProjects)

    try {
      const items = newProjects.map((p, idx) => ({
        id: p.id,
        display_order: idx + 1
      }))
      await apiFetch('/projects/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ items })
      })
    } catch (err) {
      console.error('Erreur réordonnancement:', err)
      refresh()
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName) return

    try {
      await apiFetch('/categories', {
        method: 'POST',
        body: JSON.stringify({ name: newCategoryName })
      })
      setNewCategoryName('')
      refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de création'
      alert('Failed to create category: ' + message)
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Êtes-vous sûr ? Cela pourrait affecter les projets liés.'))
      return
    try {
      await apiFetch(`/categories/${id}`, { method: 'DELETE' })
      refresh()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erreur de suppression'
      alert('Impossible de supprimer cette catégorie: ' + message)
    }
  }

  const handleCreateTechnology = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTechName) return

    try {
      await apiFetch('/technologies', {
        method: 'POST',
        body: JSON.stringify({ name: newTechName })
      })
      setNewTechName('')
      refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de création'
      alert('Failed to create technology: ' + message)
    }
  }

  if (loading)
    return (
      <div className='text-center py-20 uppercase tracking-widest font-mono text-secondary animate-pulse'>
        &gt; CHARGEMENT_ADMIN_PANEL...
      </div>
    )

  return (
    <div className='flex flex-col gap-12 pb-20 text-text-main'>
      {/* Header */}
      <div className='flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b-2 border-border-subtle pb-6'>
        <div>
          <h1 className='text-3xl md:text-5xl font-black uppercase tracking-tighter'>
            Admin_Dashboard.sys
          </h1>
          <p className='text-xs font-mono text-text-muted mt-2'>
            Session administrateur sécurisée via Tailscale
          </p>
        </div>

        {/* Tab Switcher */}
        <div className='flex flex-wrap gap-1.5 bg-bg-panel border border-border-subtle p-1 font-mono text-xs font-bold uppercase'>
          <button
            type='button'
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-cyber-blue text-black font-black shadow'
                : 'text-text-muted hover:text-white'
            }`}
          >
            📊 Trafic
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('projects')}
            className={`px-3.5 py-2 transition-all cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-cyber-yellow text-black font-black shadow'
                : 'text-text-muted hover:text-white'
            }`}
          >
            ⚙ Projets
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('artworks')}
            className={`px-3.5 py-2 transition-all cursor-pointer ${
              activeTab === 'artworks'
                ? 'bg-cyber-purple text-white font-black shadow'
                : 'text-text-muted hover:text-white'
            }`}
          >
            🎨 Galerie
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('messages')}
            className={`px-3.5 py-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'messages'
                ? 'bg-emerald-400 text-black font-black shadow'
                : 'text-text-muted hover:text-white'
            }`}
          >
            <span>✉ Messages</span>
            {unreadCount > 0 && (
              <span className='bg-red-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black animate-pulse'>
                {unreadCount}
              </span>
            )}
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-gray-300 text-black font-black shadow'
                : 'text-text-muted hover:text-white'
            }`}
          >
            🔧 Paramètres
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('infra')}
            className={`px-3.5 py-2 transition-all cursor-pointer ${
              activeTab === 'infra'
                ? 'bg-cyber-yellow text-black font-black shadow'
                : 'text-text-muted hover:text-white'
            }`}
          >
            🖥 Infra &amp; Services
          </button>
        </div>
      </div>

      {/* Tab: Infra & Services */}
      {activeTab === 'infra' && <InfraControlCenter />}

      {/* Tab: Analytics */}
      {activeTab === 'analytics' && <VisitorAnalytics />}

      {/* Tab: Artworks */}
      {activeTab === 'artworks' && <ArtworksManager />}

      {/* Tab: Messages */}
      {activeTab === 'messages' && (
        <ContactInbox onUnreadCountChange={count => setUnreadCount(count)} />
      )}

      {/* Tab: Settings */}
      {activeTab === 'settings' && <SiteSettingsManager />}

      {/* Tab: Projects Management */}
      {activeTab === 'projects' && (
        <div className='flex flex-col gap-16'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-12'>
            {/* Project Form Section */}
            <section className='lg:col-span-2'>
              <div className='bg-bg-panel border-2 border-border-subtle p-8 shadow-2xl'>
                <h2 className='text-xl font-black mb-8 uppercase tracking-widest text-white border-b border-border-subtle pb-3'>
                  {editingProjectId ? 'Modifier_Projet' : 'Initialiser_Nouveau_Projet'}
                </h2>
                <form
                  onSubmit={handleProjectSubmit}
                  className='flex flex-col gap-6'
                >
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='flex flex-col gap-2'>
                      <label className='text-xs font-black uppercase tracking-widest text-gray-500 font-mono'>
                        Titre du Projet *
                      </label>
                      <input
                        type='text'
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder='ex: Soundwave Visualizer'
                        className='bg-bg-main border border-border-subtle p-3 outline-none focus:border-secondary text-text-main font-mono text-sm'
                        required
                      />
                    </div>

                    <div className='flex flex-col gap-2'>
                      <label className='text-xs font-black uppercase tracking-widest text-gray-500 font-mono'>
                        Slug d&apos;URL (Optionnel)
                      </label>
                      <input
                        type='text'
                        value={slug}
                        onChange={e => setSlug(e.target.value)}
                        placeholder='ex: soundwave-visualizer'
                        className='bg-bg-main border border-border-subtle p-3 outline-none focus:border-secondary text-text-main font-mono text-sm'
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='flex flex-col gap-2'>
                      <label className='text-xs font-black uppercase tracking-widest text-gray-500 font-mono'>
                        Catégorie *
                      </label>
                      <select
                        value={categoryId}
                        onChange={e => setCategoryId(e.target.value)}
                        className='bg-bg-main border border-border-subtle p-3 outline-none text-text-main font-mono text-sm'
                        required
                      >
                        <option value=''>Sélectionner une catégorie</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className='flex items-center gap-6 pt-6 font-mono text-xs'>
                      <label className='flex items-center gap-2 cursor-pointer font-bold text-white'>
                        <input
                          type='checkbox'
                          checked={isPublished}
                          onChange={e => setIsPublished(e.target.checked)}
                          className='accent-secondary'
                        />
                        Publié (En ligne)
                      </label>
                      <label className='flex items-center gap-2 cursor-pointer font-bold text-secondary'>
                        <input
                          type='checkbox'
                          checked={isFeatured}
                          onChange={e => setIsFeatured(e.target.checked)}
                          className='accent-secondary'
                        />
                        ★ Projet Vedette
                      </label>
                    </div>
                  </div>

                  <div className='flex flex-col gap-2'>
                    <label className='text-xs font-black uppercase tracking-widest text-gray-500 font-mono'>
                      Résumé Court (Card &amp; Aperçu) *
                    </label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder='Courte présentation synthétique visible sur la carte...'
                      className='bg-bg-main border border-border-subtle p-3 outline-none focus:border-secondary text-text-main font-mono text-sm min-h-20'
                      required
                    />
                  </div>

                  {/* Rich Markdown Detailed Description */}
                  <MarkdownEditor
                    value={contentMarkdown}
                    onChange={val => setContentMarkdown(val)}
                    label='Présentation Détaillée & Architecture (Markdown)'
                  />

                  <div className='flex flex-col gap-2'>
                    <label className='text-xs font-black uppercase tracking-widest text-gray-500 font-mono'>
                      Stack Technique (Sélectionner les technologies)
                    </label>
                    <div className='grid grid-cols-2 md:grid-cols-3 gap-3 bg-bg-main border border-border-subtle p-4 font-mono text-xs max-h-48 overflow-y-auto custom-scrollbar'>
                      {technologies.map(tech => (
                        <label key={tech.id} className='flex items-center gap-2 cursor-pointer hover:text-secondary'>
                          <input
                            type='checkbox'
                            checked={selectedTechIds.includes(tech.id)}
                            onChange={() => handleTechToggle(tech.id)}
                            className='accent-secondary'
                          />
                          {tech.name}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Upload Image for Project */}
                  <FileUpload
                    label='Visuel du Projet (Téléversement direct)'
                    currentUrl={imageUrl}
                    onUploaded={url => setImageUrl(url)}
                  />

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='flex flex-col gap-2'>
                      <label className='text-xs font-black uppercase tracking-widest text-gray-500 font-mono'>
                        Ou URL Image manuelle
                      </label>
                      <input
                        type='text'
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                        className='bg-bg-main border border-border-subtle p-3 outline-none focus:border-secondary text-text-main font-mono text-sm'
                        placeholder='/LOGO.png ou https://...'
                      />
                    </div>
                    <div className='flex flex-col gap-2'>
                      <label className='text-xs font-black uppercase tracking-widest text-gray-500 font-mono'>
                        Lien Démo / Live URL
                      </label>
                      <input
                        type='url'
                        value={demoUrl}
                        onChange={e => setDemoUrl(e.target.value)}
                        className='bg-bg-main border border-border-subtle p-3 outline-none focus:border-secondary text-text-main font-mono text-sm'
                        placeholder='https://...'
                      />
                    </div>
                  </div>

                  {/* Dynamic Repository Links */}
                  <div className='flex flex-col gap-4'>
                    <label className='text-xs font-black uppercase tracking-widest text-gray-500 font-mono'>
                      Liens Dépôts &amp; Ressources (GitHub, etc.)
                    </label>
                    
                    <div className='flex flex-col gap-3'>
                      {githubLinks.map((link, index) => (
                        <div key={index} className='flex flex-col md:flex-row gap-3 items-end md:items-center bg-bg-main border border-border-subtle p-4'>
                          <div className='flex flex-col gap-1 grow w-full md:w-1/3'>
                            <span className='text-[10px] font-bold uppercase text-gray-500 font-mono'>Libellé</span>
                            <input
                              type='text'
                              value={link.label}
                              onChange={e => updateLink(index, 'label', e.target.value)}
                              placeholder='GitHub Frontend'
                              className='bg-bg-panel border border-border-subtle p-2 outline-none focus:border-secondary text-text-main font-mono text-xs w-full'
                              required
                            />
                          </div>
                          <div className='flex flex-col gap-1 grow w-full md:w-2/3'>
                            <span className='text-[10px] font-bold uppercase text-gray-500 font-mono'>URL</span>
                            <input
                              type='url'
                              value={link.url}
                              onChange={e => updateLink(index, 'url', e.target.value)}
                              placeholder='https://github.com/...'
                              className='bg-bg-panel border border-border-subtle p-2 outline-none focus:border-secondary text-text-main font-mono text-xs w-full'
                              required
                            />
                          </div>
                          <button
                            type='button'
                            onClick={() => removeLink(index)}
                            className='bg-red-500/20 text-red-500 border border-red-500/40 px-3 py-2 text-xs font-black uppercase tracking-wider hover:bg-red-500 hover:text-white transition-colors cursor-pointer w-full md:w-auto mt-3 md:mt-0'
                          >
                            Supprimer
                          </button>
                        </div>
                      ))}
                      
                      <button
                        type='button'
                        onClick={addLink}
                        className='border border-primary text-primary p-2.5 uppercase font-black tracking-widest hover:bg-primary hover:text-bg-main transition-colors text-xs text-center cursor-pointer w-full md:w-auto self-start font-mono'
                      >
                        + Ajouter un lien de dépôt
                      </button>
                    </div>
                  </div>

                  <div className='flex gap-4 pt-4'>
                    <button
                      type='submit'
                      className='bg-primary text-bg-main p-4 uppercase font-black tracking-widest hover:brightness-110 transition-colors grow md:flex-none md:px-12 shadow-xl font-mono text-xs cursor-pointer'
                    >
                      {editingProjectId ? 'Mettre à jour le projet' : 'Déployer le projet'}
                    </button>
                    {editingProjectId && (
                      <button
                        type='button'
                        onClick={resetProjectForm}
                        className='border-2 border-border-subtle text-text-main p-4 uppercase font-black tracking-widest hover:border-primary transition-colors font-mono text-xs cursor-pointer'
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </section>

            {/* Category & Tech Management Sections */}
            <section className='flex flex-col gap-12'>
              {/* Category Management */}
              <div className='bg-bg-panel border-2 border-border-subtle p-8 shadow-2xl'>
                <h2 className='text-lg font-black mb-6 uppercase tracking-widest text-white border-b border-border-subtle pb-3'>
                  Catégories
                </h2>
                <form
                  onSubmit={handleCreateCategory}
                  className='flex flex-col gap-4 mb-6'
                >
                  <div className='flex flex-col gap-2'>
                    <div className='flex gap-2'>
                      <input
                        type='text'
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        placeholder='ex: DevOps, Full-Stack...'
                        className='bg-bg-main border border-border-subtle p-2 outline-none grow text-text-main font-mono text-xs'
                        required
                      />
                      <button
                        type='submit'
                        className='bg-primary text-bg-main px-4 font-black uppercase text-xs hover:brightness-110 transition-colors font-mono cursor-pointer'
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                </form>
                <div className='flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1'>
                  {categories.map(cat => (
                    <div
                      key={cat.id}
                      className='flex justify-between items-center p-2.5 border border-border-subtle bg-bg-main'
                    >
                      <span className='text-xs font-black uppercase text-gray-300 font-mono'>
                        {cat.name}
                      </span>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className='text-red-500 text-[11px] font-black hover:underline uppercase font-mono cursor-pointer'
                      >
                        [ Supprimer ]
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technology Management */}
              <div className='bg-bg-panel border-2 border-border-subtle p-8 shadow-2xl'>
                <h2 className='text-lg font-black mb-6 uppercase tracking-widest text-white border-b border-border-subtle pb-3'>
                  Technologies
                </h2>
                <form
                  onSubmit={handleCreateTechnology}
                  className='flex flex-col gap-4 mb-6'
                >
                  <div className='flex flex-col gap-2'>
                    <div className='flex gap-2'>
                      <input
                        type='text'
                        value={newTechName}
                        onChange={e => setNewTechName(e.target.value)}
                        className='bg-bg-main border border-border-subtle p-2 outline-none grow text-text-main font-mono text-xs'
                        placeholder='React, Docker, PostgreSQL...'
                        required
                      />
                      <button
                        type='submit'
                        className='bg-primary text-bg-main px-4 font-black uppercase text-xs hover:brightness-110 transition-colors font-mono cursor-pointer'
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                </form>
                <div className='flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar'>
                  {technologies.map(tech => (
                    <div
                      key={tech.id}
                      className='flex justify-between items-center p-2.5 border border-border-subtle bg-bg-main'
                    >
                      <span className='text-xs font-black uppercase text-gray-300 font-mono'>
                        {tech.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Projects Table Section with Drag & Drop / Reordering */}
          <section>
            <div className='flex justify-between items-center mb-6'>
              <div>
                <h2 className='text-xl font-black uppercase tracking-widest text-white'>
                  Entrées_Système ({projects.length} projets)
                </h2>
                <p className='text-xs font-mono text-text-muted mt-0.5'>
                  Ordre d&apos;affichage personnalisable via les boutons de déplacement
                </p>
              </div>
            </div>

            <div className='bg-bg-panel border-2 border-border-subtle overflow-x-auto shadow-2xl'>
              <table className='w-full text-left border-collapse font-mono'>
                <thead>
                  <tr className='bg-bg-main text-secondary uppercase text-xs tracking-widest'>
                    <th className='p-3 border border-border-subtle w-16 text-center'>Ordre</th>
                    <th className='p-3 border border-border-subtle'>Titre</th>
                    <th className='p-3 border border-border-subtle hidden md:table-cell'>Catégorie</th>
                    <th className='p-3 border border-border-subtle hidden lg:table-cell'>Stack</th>
                    <th className='p-3 border border-border-subtle text-center'>Statut</th>
                    <th className='p-3 border border-border-subtle text-right'>Actions</th>
                  </tr>
                </thead>
                <tbody className='text-xs'>
                  {projects.map((project, idx) => (
                    <tr
                      key={project.id}
                      className='hover:bg-bg-main/40 transition-colors border-b border-border-subtle'
                    >
                      {/* Move buttons */}
                      <td className='p-2 border-r border-border-subtle text-center'>
                        <div className='flex items-center justify-center gap-1'>
                          <button
                            type='button'
                            disabled={idx === 0}
                            onClick={() => moveProject(idx, 'up')}
                            className='px-1.5 py-0.5 bg-bg-main border border-border-subtle text-[10px] text-gray-300 hover:text-secondary disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed'
                            title='Monter'
                          >
                            ▲
                          </button>
                          <button
                            type='button'
                            disabled={idx === projects.length - 1}
                            onClick={() => moveProject(idx, 'down')}
                            className='px-1.5 py-0.5 bg-bg-main border border-border-subtle text-[10px] text-gray-300 hover:text-secondary disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed'
                            title='Descendre'
                          >
                            ▼
                          </button>
                        </div>
                      </td>

                      <td className='p-3 border-r border-border-subtle font-black text-text-main'>
                        <div className='flex items-center gap-2'>
                          <span>{project.title}</span>
                          {project.is_featured && (
                            <span className='text-amber-400 text-[10px] font-bold' title='Vedette'>★</span>
                          )}
                        </div>
                      </td>

                      <td className='p-3 border-r border-border-subtle hidden md:table-cell text-gray-400 uppercase'>
                        {categories.find(c => c.id === project.category_id)?.name || 'N/A'}
                      </td>

                      <td className='p-3 border-r border-border-subtle hidden lg:table-cell text-gray-500 text-[11px]'>
                        {project.technologies?.map(t => t.name).join(', ') || '-'}
                      </td>

                      <td className='p-3 border-r border-border-subtle text-center'>
                        {project.is_published !== false ? (
                          <span className='text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px]'>
                            Public
                          </span>
                        ) : (
                          <span className='text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded text-[10px]'>
                            Brouillon
                          </span>
                        )}
                      </td>

                      <td className='p-3 text-right'>
                        <div className='flex justify-end gap-4'>
                          <button
                            onClick={() => handleEditProject(project)}
                            className='text-primary font-black hover:underline cursor-pointer uppercase text-xs'
                          >
                            [ Modifier ]
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className='text-red-500 font-black hover:underline cursor-pointer uppercase text-xs'
                          >
                            [ Supprimer ]
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {projects.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className='p-12 text-center text-gray-600 font-mono italic'
                      >
                        AUCUN_PROJET_ENREGISTRÉ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default Admin
