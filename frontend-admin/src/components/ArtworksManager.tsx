import React, { useEffect, useState, useCallback } from 'react'
import type { Artwork } from '../types'
import apiFetch from '../utils/api'
import FileUpload from './FileUpload'

const ArtworksManager: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)

  // Form State
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('GABRIEL VF')
  const [year, setYear] = useState('2026')
  const [medium, setMedium] = useState('Encre et graphite sur papier d\'art')
  const [dimensions, setDimensions] = useState('21 x 29.7 cm')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isPublished, setIsPublished] = useState(true)

  const fetchArtworks = useCallback(async () => {
    try {
      const data = await apiFetch<Artwork[]>('/artworks?all=true')
      setArtworks(data)
    } catch (err) {
      console.error('Erreur chargement artworks:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchArtworks()
  }, [fetchArtworks])

  const resetForm = () => {
    setTitle('')
    setArtist('GABRIEL VF')
    setYear('2026')
    setMedium('Technique mixte')
    setDimensions('21 x 29.7 cm')
    setDescription('')
    setImageUrl('')
    setIsPublished(true)
    setEditingId(null)
  }

  const handleEdit = (art: Artwork) => {
    setEditingId(art.id)
    setTitle(art.title)
    setArtist(art.artist || 'GABRIEL VF')
    setYear(art.year || '2026')
    setMedium(art.medium || '')
    setDimensions(art.dimensions || '')
    setDescription(art.description || '')
    setImageUrl(art.image_url)
    setIsPublished(art.is_published !== false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !imageUrl) {
      alert('Veuillez renseigner au moins le titre et l\'image')
      return
    }

    const payload = {
      title,
      artist,
      year,
      medium,
      dimensions,
      description,
      image_url: imageUrl,
      is_published: isPublished
    }

    try {
      if (editingId) {
        await apiFetch(`/artworks/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        })
      } else {
        await apiFetch('/artworks', {
          method: 'POST',
          body: JSON.stringify(payload)
        })
      }
      resetForm()
      fetchArtworks()
      alert('Œuvre enregistrée avec succès !')
    } catch (err) {
      alert(`Erreur: ${err instanceof Error ? err.message : 'Impossible d\'enregistrer'}`)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer définitivement cette œuvre de la galerie ?')) return
    try {
      await apiFetch(`/artworks/${id}`, { method: 'DELETE' })
      fetchArtworks()
    } catch (err) {
      alert(`Erreur lors de la suppression: ${err instanceof Error ? err.message : ''}`)
    }
  }

  const moveArtwork = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= artworks.length) return

    const newArtworks = [...artworks]
    const [moved] = newArtworks.splice(index, 1)
    newArtworks.splice(targetIndex, 0, moved)
    setArtworks(newArtworks)

    // Save reordered items
    try {
      const reorderPayload = newArtworks.map((art, idx) => ({
        id: art.id,
        display_order: idx + 1
      }))
      await apiFetch('/artworks/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ items: reorderPayload })
      })
    } catch (err) {
      console.error('Erreur réordonnancement:', err)
      fetchArtworks()
    }
  }

  if (loading) {
    return (
      <div className='bg-bg-panel border-2 border-border-subtle p-8 text-center text-text-muted font-mono animate-pulse uppercase'>
        &gt; CHARGEMENT_DES_ARTWORKS...
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-12 text-text-main'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-10'>
        {/* Form Section */}
        <section className='lg:col-span-1 bg-bg-panel border-2 border-border-subtle p-6 shadow-2xl'>
          <h2 className='text-lg font-black uppercase tracking-widest text-white mb-6 border-b border-border-subtle pb-3'>
            {editingId ? 'Modifier l\'œuvre' : 'Nouvelle œuvre d\'art'}
          </h2>

          <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-black uppercase tracking-widest text-gray-500 font-mono'>
                Titre de l&apos;œuvre *
              </label>
              <input
                type='text'
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder='ex: Le Commencement du Chaos'
                required
                className='bg-bg-main border border-border-subtle p-2.5 outline-none focus:border-secondary text-text-main font-mono text-sm'
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='flex flex-col gap-1.5'>
                <label className='text-xs font-black uppercase tracking-widest text-gray-500 font-mono'>
                  Artiste
                </label>
                <input
                  type='text'
                  value={artist}
                  onChange={e => setArtist(e.target.value)}
                  className='bg-bg-main border border-border-subtle p-2.5 outline-none text-text-main font-mono text-xs'
                />
              </div>

              <div className='flex flex-col gap-1.5'>
                <label className='text-xs font-black uppercase tracking-widest text-gray-500 font-mono'>
                  Année
                </label>
                <input
                  type='text'
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  className='bg-bg-main border border-border-subtle p-2.5 outline-none text-text-main font-mono text-xs'
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='flex flex-col gap-1.5'>
                <label className='text-xs font-black uppercase tracking-widest text-gray-500 font-mono'>
                  Technique / Medium
                </label>
                <input
                  type='text'
                  value={medium}
                  onChange={e => setMedium(e.target.value)}
                  placeholder='Encre et graphite'
                  className='bg-bg-main border border-border-subtle p-2.5 outline-none text-text-main font-mono text-xs'
                />
              </div>

              <div className='flex flex-col gap-1.5'>
                <label className='text-xs font-black uppercase tracking-widest text-gray-500 font-mono'>
                  Dimensions
                </label>
                <input
                  type='text'
                  value={dimensions}
                  onChange={e => setDimensions(e.target.value)}
                  placeholder='21 x 29.7 cm'
                  className='bg-bg-main border border-border-subtle p-2.5 outline-none text-text-main font-mono text-xs'
                />
              </div>
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-black uppercase tracking-widest text-gray-500 font-mono'>
                Description &amp; Démarche
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder='Quelques mots sur la composition, le geste...'
                className='bg-bg-main border border-border-subtle p-2.5 outline-none focus:border-secondary text-text-main font-mono text-xs min-h-20'
              />
            </div>

            {/* Media Upload */}
            <FileUpload
              label='Visuel de l&apos;œuvre (Upload direct)'
              currentUrl={imageUrl}
              onUploaded={url => setImageUrl(url)}
            />

            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-black uppercase tracking-widest text-gray-500 font-mono'>
                Ou URL d&apos;image manuelle
              </label>
              <input
                type='text'
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder='/dessins-salepropre/01.webp ou https://...'
                required
                className='bg-bg-main border border-border-subtle p-2 outline-none text-text-main font-mono text-xs'
              />
            </div>

            <label className='flex items-center gap-2 cursor-pointer font-mono text-xs font-bold text-gray-300 mt-2'>
              <input
                type='checkbox'
                checked={isPublished}
                onChange={e => setIsPublished(e.target.checked)}
                className='accent-secondary'
              />
              Visible dans la galerie publique
            </label>

            <div className='flex gap-3 pt-3'>
              <button
                type='submit'
                className='bg-secondary text-bg-main p-3 uppercase font-black tracking-widest hover:brightness-110 transition-all grow font-mono text-xs'
              >
                {editingId ? 'Mettre à jour' : 'Ajouter à la Galerie'}
              </button>
              {editingId && (
                <button
                  type='button'
                  onClick={resetForm}
                  className='border border-border-subtle text-gray-400 p-3 uppercase font-bold text-xs hover:text-white font-mono'
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </section>

        {/* List Section */}
        <section className='lg:col-span-2 bg-bg-panel border-2 border-border-subtle p-6 shadow-2xl flex flex-col'>
          <div className='flex justify-between items-center mb-6 border-b border-border-subtle pb-3'>
            <div>
              <h2 className='text-lg font-black uppercase tracking-widest text-white'>
                Galerie de Dessins ({artworks.length} œuvres)
              </h2>
              <p className='text-xs font-mono text-text-muted mt-0.5'>
                Utilisez les flèches pour réordonner l&apos;ordre d&apos;apparition dans le carrousel
              </p>
            </div>
          </div>

          <div className='flex flex-col gap-3 grow'>
            {artworks.map((art, idx) => (
              <div
                key={art.id}
                className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 bg-bg-main border border-border-subtle hover:border-secondary/50 transition-colors'
              >
                <div className='flex items-center gap-4 min-w-0'>
                  {/* Reorder Buttons */}
                  <div className='flex flex-col gap-1 shrink-0'>
                    <button
                      type='button'
                      disabled={idx === 0}
                      onClick={() => moveArtwork(idx, 'up')}
                      className='p-1 bg-bg-panel border border-border-subtle text-[10px] text-gray-300 hover:text-secondary disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed'
                      title='Monter'
                    >
                      ▲
                    </button>
                    <button
                      type='button'
                      disabled={idx === artworks.length - 1}
                      onClick={() => moveArtwork(idx, 'down')}
                      className='p-1 bg-bg-panel border border-border-subtle text-[10px] text-gray-300 hover:text-secondary disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed'
                      title='Descendre'
                    >
                      ▼
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className='w-16 h-16 bg-black border border-border-subtle shrink-0 overflow-hidden rounded'>
                    <img
                      src={art.image_url}
                      alt={art.title}
                      className='w-full h-full object-cover'
                      onError={e => ((e.target as HTMLImageElement).src = '/LOGO.avif')}
                    />
                  </div>

                  {/* Details */}
                  <div className='flex flex-col min-w-0'>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs font-mono font-bold text-secondary'>#{idx + 1}</span>
                      <span className='text-sm font-bold text-white truncate'>{art.title}</span>
                      {!art.is_published && (
                        <span className='text-[10px] font-mono uppercase bg-red-500/20 text-red-400 border border-red-500/40 px-1.5 py-0.5'>
                          Masqué
                        </span>
                      )}
                    </div>
                    <span className='text-[11px] font-mono text-gray-400 mt-0.5'>
                      {art.medium} ({art.dimensions}) · {art.year}
                    </span>
                    {art.description && (
                      <p className='text-xs font-sans text-gray-500 truncate mt-1 max-w-md'>
                        {art.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Operations */}
                <div className='flex items-center gap-3 shrink-0 self-end sm:self-center'>
                  <button
                    type='button'
                    onClick={() => handleEdit(art)}
                    className='text-secondary font-mono text-xs font-bold uppercase hover:underline cursor-pointer'
                  >
                    [ Modifier ]
                  </button>
                  <button
                    type='button'
                    onClick={() => handleDelete(art.id)}
                    className='text-red-400 font-mono text-xs font-bold uppercase hover:underline cursor-pointer'
                  >
                    [ Supprimer ]
                  </button>
                </div>
              </div>
            ))}

            {artworks.length === 0 && (
              <div className='text-xs font-mono text-gray-500 py-12 text-center italic'>
                AUCUNE_ŒUVRE_DANS_LA_GALERIE
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default ArtworksManager
