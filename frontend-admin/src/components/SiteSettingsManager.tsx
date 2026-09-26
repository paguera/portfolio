import React, { useEffect, useState } from 'react'
import type { SiteSettings } from '../types'
import apiFetch from '../utils/api'

const SiteSettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<SiteSettings>('/settings')
        setSettings(data)
      } catch (err) {
        console.error('Erreur chargement paramètres:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    try {
      await apiFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    } catch (err) {
      console.error('Erreur sauvegarde paramètres:', err)
      alert(`Erreur: ${err instanceof Error ? err.message : 'Impossible d\'enregistrer'}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className='bg-bg-panel border-2 border-border-subtle p-8 text-center text-text-muted font-mono animate-pulse uppercase'>
        &gt; CHARGEMENT_DES_PARAMÈTRES...
      </div>
    )
  }

  return (
    <div className='bg-bg-panel border-2 border-border-subtle p-8 shadow-2xl max-w-3xl font-mono text-text-main'>
      <div className='flex justify-between items-center mb-8 border-b border-border-subtle pb-4'>
        <div>
          <h2 className='text-lg font-black uppercase tracking-widest text-white'>
            Configuration_Globale.sys
          </h2>
          <p className='text-xs text-text-muted mt-1'>
            Personnalisation des textes dynamiques affichés sur l&apos;accueil du portfolio
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
        {/* Availability Badge */}
        <div className='flex flex-col gap-3 bg-bg-main border border-border-subtle p-4'>
          <div className='flex items-center justify-between'>
            <label className='text-xs font-black uppercase tracking-widest text-secondary'>
              Disponibilité / Statut d&apos;embauche
            </label>
            <label className='flex items-center gap-2 cursor-pointer text-xs'>
              <input
                type='checkbox'
                checked={settings.is_available === 'true'}
                onChange={e => handleChange('is_available', e.target.checked ? 'true' : 'false')}
                className='accent-secondary'
              />
              <span className='font-bold text-white'>Afficher le badge vert "Disponible"</span>
            </label>
          </div>

          <input
            type='text'
            value={settings.availability_status || ''}
            onChange={e => handleChange('availability_status', e.target.value)}
            placeholder='Disponible pour de nouvelles opportunités'
            className='bg-bg-panel border border-border-subtle p-3 outline-none focus:border-secondary text-text-main text-sm'
          />
        </div>

        {/* Hero Title Accent */}
        <div className='flex flex-col gap-2'>
          <label className='text-xs font-black uppercase tracking-widest text-gray-400'>
            Sous-titre / Accroche principale
          </label>
          <input
            type='text'
            value={settings.hero_title_accent || ''}
            onChange={e => handleChange('hero_title_accent', e.target.value)}
            placeholder='Développeur Full-Stack & futur DevOps'
            className='bg-bg-main border border-border-subtle p-3 outline-none focus:border-secondary text-text-main text-sm'
          />
        </div>

        {/* Hero Bio Pitch */}
        <div className='flex flex-col gap-2'>
          <label className='text-xs font-black uppercase tracking-widest text-gray-400'>
            Paragraphe de présentation (Accueil)
          </label>
          <textarea
            value={settings.hero_bio || ''}
            onChange={e => handleChange('hero_bio', e.target.value)}
            rows={4}
            placeholder="Passionné par la conception d'applications web robustes..."
            className='bg-bg-main border border-border-subtle p-3 outline-none focus:border-secondary text-text-main text-sm font-sans'
          />
        </div>

        {success && (
          <div className='bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs p-3 font-bold'>
            ✓ Paramètres enregistrés et appliqués en direct sur le portfolio !
          </div>
        )}

        <div className='pt-4'>
          <button
            type='submit'
            disabled={saving}
            className='bg-primary text-bg-main px-8 py-3.5 uppercase font-black tracking-widest hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 text-xs'
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SiteSettingsManager
