import React, { useEffect, useState } from 'react'
import type { Project, Category, Technology } from '../types'
import apiFetch from '../utils/api'
import VisitorAnalytics from '../components/VisitorAnalytics'

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'projects'>('analytics')
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [technologies, setTechnologies] = useState<Technology[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    return await Promise.all([
      apiFetch<Project[]>('/projects'),
      apiFetch<Category[]>('/categories'),
      apiFetch<Technology[]>('/technologies')
    ])
  }

  const refresh = async () => {
    try {
      const [projectsData, categoriesData, techData] = await loadData()
      setProjects(projectsData)
      setCategories(categoriesData)
      setTechnologies(techData)
    } catch (err) {
      console.error('Erreur lors de la mise a jour des données', err)
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const [projectsData, categoriesData, techData] = await loadData()
        setProjects(projectsData)
        setCategories(categoriesData)
        setTechnologies(techData)
      } catch (err) {
        console.error('La récupération initiale des données a échoué', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Project Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTechIds, setSelectedTechIds] = useState<number[]>([])
  const [githubLinks, setGithubLinks] = useState<{ id?: number; label: string; url: string }[]>([])
  const [demoUrl, setDemoUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [categoryId, setCategoryId] = useState('')

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
    setDescription('')
    setSelectedTechIds([])
    setGithubLinks([])
    setDemoUrl('')
    setImageUrl('')
    setCategoryId('')
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
      description,
      category_id: parseInt(categoryId),
      technology_ids: selectedTechIds,
      github_links: githubLinks,
      demo_url: demoUrl || '',
      image_url: imageUrl || '/LOGO.png'
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
    setDescription(project.description || '')
    setSelectedTechIds(project.technologies?.map(t => t.id) || [])
    setGithubLinks(project.github_links || [])
    setDemoUrl(project.demo_url || '')
    setImageUrl(project.image_url || '')
    setCategoryId(project.category_id.toString())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteProject = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    try {
      await apiFetch(`/projects/${id}`, { method: 'DELETE' })
      refresh()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erreur lors de la suppression'
      alert('Impossible de supprimer ce projet: ' + message)
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
    if (!confirm('Are you sure? This might affect projects in this category.'))
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
      <div className='text-center py-20 uppercase tracking-widest'>
        Loading Admin...
      </div>
    )

  return (
    <div className='flex flex-col gap-16 pb-20 text-text-main'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-2 border-border-subtle pb-6'>
        <div>
          <h1 className='text-4xl md:text-5xl font-black uppercase tracking-tighter'>
            Admin_Dashboard.sys
          </h1>
          <p className='text-xs font-mono text-text-muted mt-2'>
            Session administrateur sécurisée via Tailscale [100.80.76.84]
          </p>
        </div>

        {/* Tab Switcher */}
        <div className='flex gap-2 bg-bg-panel border border-border-subtle p-1 font-mono text-xs font-bold uppercase'>
          <button
            type='button'
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-secondary text-bg-main font-black shadow'
                : 'text-text-muted hover:text-white'
            }`}
          >
            [ 📊 MÉTRIQUES &amp; TRAFIC ]
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2.5 transition-all cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-primary text-bg-main font-black shadow'
                : 'text-text-muted hover:text-white'
            }`}
          >
            [ ⚙ GESTION DU CONTENU ]
          </button>
        </div>
      </div>

      {activeTab === 'analytics' && <VisitorAnalytics />}

      {activeTab === 'projects' && (
        <div className='flex flex-col gap-16'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-12'>
        {/* Project Form Section */}
        <section className='lg:col-span-2'>
          <div className='bg-bg-panel border-2 border-border-subtle p-8 shadow-2xl'>
            <h2 className='text-xl font-black mb-8 uppercase tracking-widest text-white'>
              {editingProjectId ? 'Modify_Project' : 'Initialize_New_Project'}
            </h2>
            <form
              onSubmit={handleProjectSubmit}
              className='flex flex-col gap-6'
            >
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='flex flex-col gap-2'>
                  <label className='text-xs font-black uppercase tracking-widest text-gray-500'>
                    Title_Header
                  </label>
                  <input
                    type='text'
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className='bg-bg-main border border-border-subtle p-3 outline-none focus:border-secondary text-text-main font-mono'
                    required
                  />
                </div>
                <div className='flex flex-col gap-2'>
                  <label className='text-xs font-black uppercase tracking-widest text-gray-500'>
                    Node_Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className='bg-bg-main border border-border-subtle p-3 outline-none text-text-main font-mono'
                    required
                  >
                    <option value=''>Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className='flex flex-col gap-2'>
                <label className='text-xs font-black uppercase tracking-widest text-gray-500'>
                  System_Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className='bg-bg-main border border-border-subtle p-3 outline-none focus:border-secondary text-text-main font-mono min-h-25'
                  required
                />
              </div>

              <div className='flex flex-col gap-2'>
                <label className='text-xs font-black uppercase tracking-widest text-gray-500'>
                  Tech_Stack_Module (Select Technologies)
                </label>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-4 bg-bg-main border border-border-subtle p-4 font-mono text-xs'>
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

              <div className='flex flex-col gap-4'>
                <label className='text-xs font-black uppercase tracking-widest text-gray-500'>
                  Source_URL_Modules (Dynamic Links)
                </label>
                
                <div className='flex flex-col gap-3'>
                  {githubLinks.map((link, index) => (
                    <div key={index} className='flex flex-col md:flex-row gap-3 items-end md:items-center bg-bg-main border border-border-subtle p-4'>
                      <div className='flex flex-col gap-1 grow w-full md:w-1/3'>
                        <span className='text-[10px] font-bold uppercase text-gray-500 font-mono'>Label</span>
                        <input
                          type='text'
                          value={link.label}
                          onChange={e => updateLink(index, 'label', e.target.value)}
                          placeholder='e.g. GitHub Frontend'
                          className='bg-bg-panel border border-border-subtle p-2 outline-none focus:border-secondary text-text-main font-mono text-sm w-full'
                          required
                        />
                      </div>
                      <div className='flex flex-col gap-1 grow w-full md:w-2/3'>
                        <span className='text-[10px] font-bold uppercase text-gray-500 font-mono'>URL</span>
                        <input
                          type='url'
                          value={link.url}
                          onChange={e => updateLink(index, 'url', e.target.value)}
                          placeholder='https://...'
                          className='bg-bg-panel border border-border-subtle p-2 outline-none focus:border-secondary text-text-main font-mono text-sm w-full'
                          required
                        />
                      </div>
                      <button
                        type='button'
                        onClick={() => removeLink(index)}
                        className='bg-red-500/20 text-red-500 border border-red-500/40 px-3 py-2 text-xs font-black uppercase tracking-wider hover:bg-red-500 hover:text-white transition-colors cursor-pointer w-full md:w-auto h-[38px] flex items-center justify-center mt-3 md:mt-0'
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type='button'
                    onClick={addLink}
                    className='border border-primary text-primary p-3 uppercase font-black tracking-widest hover:bg-primary hover:text-bg-main transition-colors text-xs text-center cursor-pointer w-full md:w-auto self-start'
                  >
                    + Add_Link_Module
                  </button>
                </div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='flex flex-col gap-2'>
                  <label className='text-xs font-black uppercase tracking-widest text-gray-500'>
                    Image_Asset_URL
                  </label>
                  <input
                    type='url'
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    className='bg-bg-main border border-border-subtle p-3 outline-none focus:border-secondary text-text-main font-mono'
                    placeholder='https://...'
                  />
                </div>
                <div className='flex flex-col gap-2'>
                  <label className='text-xs font-black uppercase tracking-widest text-gray-500'>
                    Project URL
                  </label>
                  <input
                    type='url'
                    value={demoUrl}
                    onChange={e => setDemoUrl(e.target.value)}
                    className='bg-bg-main border border-border-subtle p-3 outline-none focus:border-secondary text-text-main font-mono'
                    placeholder='https://...'
                    required
                  />
                </div>
              </div>

              <div className='flex gap-4'>
                <button
                  type='submit'
                  className='bg-primary text-bg-main p-4 uppercase font-black tracking-widest hover:bg-bg-panel hover:text-white transition-colors grow md:flex-none md:px-12 shadow-xl'
                >
                  {editingProjectId ? 'Execute_Update' : 'Deploy_Project'}
                </button>
                {editingProjectId && (
                  <button
                    type='button'
                    onClick={resetProjectForm}
                    className='border-2 border-border-subtle text-text-main p-4 uppercase font-black tracking-widest hover:border-primary transition-colors'
                  >
                    Abort
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        {/* Category Management Section */}
        <section className='flex flex-col gap-12'>
          <div className='bg-bg-panel border-2 border-border-subtle p-8 shadow-2xl'>
            <h2 className='text-xl font-black mb-8 uppercase tracking-widest text-white'>
              Node_Categories
            </h2>
            <form
              onSubmit={handleCreateCategory}
              className='flex flex-col gap-4 mb-8'
            >
              <div className='flex flex-col gap-2'>
                <label className='text-xs font-black uppercase tracking-widest text-gray-500'>
                  New_Entry
                </label>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    className='bg-bg-main border border-border-subtle p-2 outline-none grow text-text-main font-mono'
                    required
                  />
                  <button
                    type='submit'
                    className='bg-primary text-bg-main px-4 font-black uppercase text-xs hover:bg-bg-panel hover:text-white transition-colors'
                  >
                    Add
                  </button>
                </div>
              </div>
            </form>
            <div className='flex flex-col gap-2'>
              {categories.map(cat => (
                <div
                  key={cat.id}
                  className='flex justify-between items-center p-3 border border-border-subtle bg-bg-main'
                >
                  <span className='text-sm font-black uppercase text-gray-300'>
                    {cat.name}
                  </span>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className='text-red-500 text-xs font-black hover:underline uppercase'
                  >
                    [ Delete ]
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Technology Management Section */}
          <div className='bg-bg-panel border-2 border-border-subtle p-8 shadow-2xl'>
            <h2 className='text-xl font-black mb-8 uppercase tracking-widest text-white'>
              Tech_Stack_Dict
            </h2>
            <form
              onSubmit={handleCreateTechnology}
              className='flex flex-col gap-4 mb-8'
            >
              <div className='flex flex-col gap-2'>
                <label className='text-xs font-black uppercase tracking-widest text-gray-500'>
                  New_Technology
                </label>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={newTechName}
                    onChange={e => setNewTechName(e.target.value)}
                    className='bg-bg-main border border-border-subtle p-2 outline-none grow text-text-main font-mono'
                    placeholder='React, Docker...'
                    required
                  />
                  <button
                    type='submit'
                    className='bg-primary text-bg-main px-4 font-black uppercase text-xs hover:bg-bg-panel hover:text-white transition-colors'
                  >
                    Add
                  </button>
                </div>
              </div>
            </form>
            <div className='flex flex-col gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar'>
              {technologies.map(tech => (
                <div
                  key={tech.id}
                  className='flex justify-between items-center p-3 border border-border-subtle bg-bg-main'
                >
                  <span className='text-sm font-black uppercase text-gray-300'>
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Projects Table Section */}
      <section>
        <h2 className='text-xl font-black mb-6 uppercase tracking-widest text-white'>
          Manage_System_Entries
        </h2>
        <div className='bg-bg-panel border-2 border-border-subtle overflow-x-auto shadow-2xl'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-bg-main text-secondary uppercase text-xs tracking-widest'>
                <th className='p-4 border border-border-subtle'>
                  Project_Title
                </th>
                <th className='p-4 border border-border-subtle hidden md:table-cell'>
                  Node
                </th>
                <th className='p-4 border border-border-subtle hidden lg:table-cell'>
                  Module_Stack
                </th>
                <th className='p-4 border border-border-subtle text-right'>
                  Operations
                </th>
              </tr>
            </thead>
            <tbody className='text-sm uppercase tracking-tight'>
              {projects.map(project => (
                <tr
                  key={project.id}
                  className='hover:bg-bg-main/40 transition-colors border-b border-border-subtle'
                >
                  <td className='p-4 border-r border-border-subtle font-black text-text-main'>
                    {project.title}
                  </td>
                  <td className='p-4 border-r border-border-subtle hidden md:table-cell text-gray-400'>
                    {categories.find(c => c.id === project.category_id)?.name ||
                      'N/A'}
                  </td>
                  <td className='p-4 border-r border-border-subtle hidden lg:table-cell text-gray-500 font-mono text-xs'>
                    {project.technologies?.map(t => t.name).join(', ') || '-'}
                  </td>
                  <td className='p-4 text-right'>
                    <div className='flex justify-end gap-6'>
                      <button
                        onClick={() => handleEditProject(project)}
                        className='text-primary font-black hover:underline cursor-pointer uppercase text-xs'
                      >
                        [ Edit ]
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className='text-red-500 font-black hover:underline cursor-pointer uppercase text-xs'
                      >
                        [ Delete ]
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className='p-12 text-center text-gray-600 font-mono italic'
                  >
                    SYSTEM_EMPTY: NO ENTRIES FOUND
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
