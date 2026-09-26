import React, { useEffect, useState, useCallback } from 'react'
import type { VisitorAdvancedStats } from '../types'
import apiFetch from '../utils/api'

const VisitorAnalytics: React.FC = () => {
  const [stats, setStats] = useState<VisitorAdvancedStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    setError(null)
    try {
      const data = await apiFetch<VisitorAdvancedStats>('/visitors/stats')
      setStats(data)
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de récupérer les statistiques visiteurs'
      )
    } finally {
      setLoading(false)
      if (isRefresh) setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (loading) {
    return (
      <div className='bg-bg-panel border-2 border-border-subtle p-8 text-center text-text-muted font-mono animate-pulse uppercase tracking-widest'>
        &gt; CHARGEMENT_DES_MÉTRIQUES_EN_COURS...
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className='bg-bg-panel border-2 border-red-500/50 p-6 flex flex-col md:flex-row items-center justify-between gap-4'>
        <div className='text-red-400 font-mono text-sm'>
          [ERREUR_TELEMETRIE] : {error || 'Données indisponibles'}
        </div>
        <button
          onClick={() => fetchStats(true)}
          className='bg-red-500/20 text-red-400 border border-red-500/40 px-4 py-2 uppercase font-mono text-xs font-bold hover:bg-red-500 hover:text-white transition-colors cursor-pointer'
        >
          Réessayer
        </button>
      </div>
    )
  }

  const {
    summary,
    history,
    topPages,
    topTracks = [],
    recentAudioPlays = [],
    devices,
    browsers,
    operatingSystems,
    recentVisits
  } = stats

  // Find max value in history for chart scaling
  const maxDaily = Math.max(
    ...history.map(h => Math.max(h.uniqueVisitors, h.pageViews, h.audioPlays || 0, 1)),
    5
  )

  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-')
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}`
      }
      return dateStr
    } catch {
      return dateStr
    }
  }

  const formatTimestamp = (ts: string) => {
    try {
      const date = new Date(ts)
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch {
      return ts
    }
  }

  const formatRelativeTime = (ts: string) => {
    try {
      const date = new Date(ts)
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return ts
    }
  }

  const formatPageDetails = (path: string) => {
    if (path === '/' || path === '') {
      return {
        label: "Page d'Accueil & Présentation",
        tag: 'ACCUEIL',
        tagBg: 'bg-secondary/15 text-secondary border-secondary/30'
      }
    }
    if (path === '/music' || path.startsWith('/productions') || path.startsWith('/audio')) {
      return {
        label: 'Laboratoire Musical (Soundwave & Playlists)',
        tag: 'MUSIQUE',
        tagBg: 'bg-amber-400/15 text-amber-400 border-amber-400/30'
      }
    }
    if (path === '/projects') {
      return {
        label: 'Projets Web & Développements',
        tag: 'DEV WEB',
        tagBg: 'bg-cyan-400/15 text-cyan-400 border-cyan-400/30'
      }
    }
    if (path === '/artwork') {
      return {
        label: "Galerie d'Art & Dessins",
        tag: 'GALERIE',
        tagBg: 'bg-pink-400/15 text-pink-400 border-pink-400/30'
      }
    }
    if (path === '/category/devops') {
      return {
        label: 'Espace Architecture & DevOps',
        tag: 'DEVOPS',
        tagBg: 'bg-purple-400/15 text-purple-400 border-purple-400/30'
      }
    }
    if (path.startsWith('/category/')) {
      const slug = decodeURIComponent(path.replace('/category/', ''))
      return {
        label: `Projets par Catégorie (${slug})`,
        tag: 'CATÉGORIE',
        tagBg: 'bg-blue-400/15 text-blue-400 border-blue-400/30'
      }
    }
    if (path === '/contact') {
      return {
        label: 'Formulaire de Contact & Infos',
        tag: 'CONTACT',
        tagBg: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30'
      }
    }
    if (path === '/liens') {
      return {
        label: 'Réseaux Sociaux & Liens Externes',
        tag: 'LIENS',
        tagBg: 'bg-gray-400/15 text-gray-300 border-gray-400/30'
      }
    }
    return {
      label: `Page ${path}`,
      tag: 'PAGE',
      tagBg: 'bg-gray-500/15 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className='flex flex-col gap-10'>
      {/* Header with Title and Refresh */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-panel border-2 border-border-subtle p-6 shadow-xl'>
        <div>
          <div className='flex items-center gap-2'>
            <span className='w-2.5 h-2.5 rounded-full bg-secondary animate-pulse'></span>
            <h2 className='text-xl font-black uppercase tracking-widest text-white'>
              Metrics_Terminal.sys
            </h2>
          </div>
          <p className='text-xs font-mono text-text-muted mt-1'>
            Statistiques de trafic, mesure d&apos;audience &amp; écoutes audio en temps réel
          </p>
        </div>

        <button
          type='button'
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className='border border-secondary text-secondary px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider hover:bg-secondary hover:text-bg-main transition-colors cursor-pointer disabled:opacity-50'
        >
          {refreshing ? '[ ACTUALISATION... ]' : '[ ↺ ACTUALISER ]'}
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
        {/* Total Unique Visitors */}
        <div className='bg-bg-panel border-2 border-secondary/50 p-4 flex flex-col justify-between shadow-lg relative overflow-hidden'>
          <div className='text-[10px] font-mono uppercase tracking-widest text-secondary font-black'>
            Visiteurs Uniques
          </div>
          <div className='text-3xl lg:text-4xl font-black font-mono text-white mt-3 mb-1'>
            {summary.totalUniqueVisitors}
          </div>
          <div className='text-[10px] font-mono text-text-muted uppercase'>
            Total cumulé
          </div>
          <div className='absolute -right-4 -bottom-4 w-14 h-14 bg-secondary/5 rounded-full pointer-events-none'></div>
        </div>

        {/* Total Page Views */}
        <div className='bg-bg-panel border-2 border-border-subtle p-4 flex flex-col justify-between shadow-lg'>
          <div className='text-[10px] font-mono uppercase tracking-widest text-primary font-black'>
            Pages Vues
          </div>
          <div className='text-3xl lg:text-4xl font-black font-mono text-white mt-3 mb-1'>
            {summary.totalPageViews}
          </div>
          <div className='text-[10px] font-mono text-text-muted uppercase'>
            Consultations
          </div>
        </div>

        {/* Total Audio Plays */}
        <div className='bg-bg-panel border-2 border-amber-500/40 p-4 flex flex-col justify-between shadow-lg relative overflow-hidden'>
          <div className='text-[10px] font-mono uppercase tracking-widest text-amber-400 font-black flex items-center gap-1'>
            <span>🎧</span> Écoutes Audio
          </div>
          <div className='text-3xl lg:text-4xl font-black font-mono text-amber-400 mt-3 mb-1'>
            {summary.totalAudioPlays || 0}
          </div>
          <div className='text-[10px] font-mono text-text-muted uppercase'>
            Pistes lancées
          </div>
          <div className='absolute -right-4 -bottom-4 w-14 h-14 bg-amber-400/5 rounded-full pointer-events-none'></div>
        </div>

        {/* Today */}
        <div className='bg-bg-panel border-2 border-border-subtle p-4 flex flex-col justify-between shadow-lg'>
          <div className='text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-black'>
            Aujourd&apos;hui
          </div>
          <div className='text-3xl lg:text-4xl font-black font-mono text-emerald-400 mt-3 mb-1'>
            {summary.todayVisitors}
          </div>
          <div className='text-[10px] font-mono text-text-muted uppercase'>
            Visites du jour
          </div>
        </div>

        {/* Last 7 Days */}
        <div className='bg-bg-panel border-2 border-border-subtle p-4 flex flex-col justify-between shadow-lg'>
          <div className='text-[10px] font-mono uppercase tracking-widest text-gray-300 font-black'>
            7 Derniers Jours
          </div>
          <div className='text-3xl lg:text-4xl font-black font-mono text-white mt-3 mb-1'>
            {summary.weekVisitors}
          </div>
          <div className='text-[10px] font-mono text-text-muted uppercase'>
            Activité récente
          </div>
        </div>

        {/* Last 30 Days */}
        <div className='bg-bg-panel border-2 border-border-subtle p-4 flex flex-col justify-between shadow-lg'>
          <div className='text-[10px] font-mono uppercase tracking-widest text-gray-300 font-black'>
            30 Derniers Jours
          </div>
          <div className='text-3xl lg:text-4xl font-black font-mono text-white mt-3 mb-1'>
            {summary.monthVisitors}
          </div>
          <div className='text-[10px] font-mono text-text-muted uppercase'>
            Mois en cours
          </div>
        </div>
      </div>

      {/* Daily Activity Chart (Last 14 Days) */}
      <div className='bg-bg-panel border-2 border-border-subtle p-6 md:p-8 shadow-xl'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6'>
          <div>
            <h3 className='text-base font-black uppercase tracking-widest text-white'>
              Fréquentation_Quotidienne (14 Derniers Jours)
            </h3>
            <p className='text-xs font-mono text-text-muted'>
              Activité journalière combinée : visiteurs uniques, consultations de pages et écoutes audio
            </p>
          </div>
          <div className='flex items-center gap-4 text-xs font-mono flex-wrap'>
            <div className='flex items-center gap-1.5'>
              <span className='w-3 h-3 bg-secondary inline-block'></span>
              <span className='text-gray-300'>Visiteurs</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='w-3 h-3 bg-primary inline-block'></span>
              <span className='text-gray-300'>Pages vues</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='w-3 h-3 bg-amber-400 inline-block'></span>
              <span className='text-amber-400 font-bold'>Écoutes audio</span>
            </div>
          </div>
        </div>

        <div className='pt-8 pb-4'>
          {/* Chart Bars Container */}
          <div className='flex items-end gap-1.5 md:gap-3 h-48 border-b border-border-subtle px-2'>
            {history.map((item, idx) => {
              const uniqueHeight = Math.max(Math.round((item.uniqueVisitors / maxDaily) * 100), 2)
              const viewsHeight = Math.max(Math.round((item.pageViews / maxDaily) * 100), 2)
              const audioHeight = Math.max(Math.round(((item.audioPlays || 0) / maxDaily) * 100), 2)

              return (
                <div key={idx} className='flex-1 flex flex-col items-center h-full justify-end group'>
                  {/* Values label visible on hover */}
                  <div className='opacity-0 group-hover:opacity-100 transition-opacity mb-1 flex flex-col items-center text-[9px] font-mono text-center pointer-events-none'>
                    <span className='text-secondary font-bold'>{item.uniqueVisitors}v</span>
                    <span className='text-primary'>{item.pageViews}p</span>
                    {item.audioPlays > 0 && <span className='text-amber-400 font-bold'>{item.audioPlays}s</span>}
                  </div>

                  <div className='w-full flex items-end justify-center gap-0.5 md:gap-1 h-36'>
                    {/* Unique Visitors Bar */}
                    <div
                      style={{ height: `${item.uniqueVisitors > 0 ? uniqueHeight : 0}%` }}
                      className='w-1/3 bg-secondary hover:brightness-125 transition-all rounded-t-sm relative'
                      title={`${item.date} : ${item.uniqueVisitors} visiteur(s) unique(s)`}
                    >
                      {item.uniqueVisitors > 0 && (
                        <span className='absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-secondary'>
                          {item.uniqueVisitors}
                        </span>
                      )}
                    </div>

                    {/* Page Views Bar */}
                    <div
                      style={{ height: `${item.pageViews > 0 ? viewsHeight : 0}%` }}
                      className='w-1/3 bg-primary/80 hover:bg-primary transition-all rounded-t-sm'
                      title={`${item.date} : ${item.pageViews} page(s) vue(s)`}
                    ></div>

                    {/* Audio Plays Bar */}
                    <div
                      style={{ height: `${(item.audioPlays || 0) > 0 ? audioHeight : 0}%` }}
                      className='w-1/3 bg-amber-400/80 hover:bg-amber-400 transition-all rounded-t-sm'
                      title={`${item.date} : ${item.audioPlays || 0} écoute(s) audio`}
                    ></div>
                  </div>

                  {/* Date label */}
                  <span className='text-[10px] font-mono text-gray-400 mt-2 truncate w-full text-center'>
                    {formatDate(item.date)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Two columns: Detailed Pages Breakdown & Top Audio Tracks */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Section 1: Précision & Détails des Pages Consultées */}
        <div className='bg-bg-panel border-2 border-border-subtle p-6 shadow-xl flex flex-col'>
          <div className='flex justify-between items-start mb-2'>
            <div>
              <h3 className='text-base font-black uppercase tracking-widest text-white'>
                Top_Pages_Consultées
              </h3>
              <p className='text-xs font-mono text-text-muted mt-0.5'>
                Détail des sections et parcours de navigation des visiteurs
              </p>
            </div>
            <span className='text-xs font-mono text-secondary font-bold px-2 py-0.5 bg-secondary/10 border border-secondary/20'>
              {topPages.reduce((acc, p) => acc + p.views, 0)} vues cumulées
            </span>
          </div>

          <div className='flex flex-col gap-3 grow mt-4'>
            {topPages.map((page, idx) => {
              const details = formatPageDetails(page.path)
              const maxViews = Math.max(...topPages.map(p => p.views), 1)
              const barWidth = Math.round((page.views / maxViews) * 100)

              return (
                <div key={idx} className='bg-bg-main p-3.5 border border-border-subtle flex flex-col gap-2 rounded-sm'>
                  <div className='flex justify-between items-start gap-2'>
                    <div className='flex flex-col min-w-0'>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs font-mono font-bold text-secondary'>#{idx + 1}</span>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 border rounded ${details.tagBg}`}>
                          {details.tag}
                        </span>
                        <span className='text-xs font-bold text-white truncate'>{details.label}</span>
                      </div>
                      <span className='text-[10px] font-mono text-gray-400 mt-0.5 ml-5'>
                        URL : <code className='text-gray-300 font-mono'>{page.path}</code>
                      </span>
                    </div>

                    <div className='text-right shrink-0'>
                      <span className='text-xs font-bold text-secondary font-mono'>{page.views} vues</span>
                      <span className='block text-[10px] font-mono text-text-muted'>{page.percentage}%</span>
                    </div>
                  </div>

                  <div className='w-full bg-bg-panel h-1.5 rounded-full overflow-hidden'>
                    <div
                      style={{ width: `${barWidth}%` }}
                      className='bg-secondary h-full rounded-full transition-all duration-500'
                    ></div>
                  </div>
                </div>
              )
            })}
            {topPages.length === 0 && (
              <div className='text-xs font-mono text-gray-500 py-6 text-center italic'>
                AUCUNE_DONNÉE_DE_PAGE_DISPONIBLE
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Métriques des Titres Audio & Compositions Écoutées */}
        <div className='bg-bg-panel border-2 border-border-subtle p-6 shadow-xl flex flex-col'>
          <div className='flex justify-between items-start mb-2'>
            <div>
              <h3 className='text-base font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5'>
                <span>⚡</span> Top_Compositions_Audio
              </h3>
              <p className='text-xs font-mono text-text-muted mt-0.5'>
                Titres originaux et sons les plus écoutés par les visiteurs
              </p>
            </div>
            <span className='text-xs font-mono text-amber-400 font-bold px-2 py-0.5 bg-amber-400/10 border border-amber-400/20'>
              {summary.totalAudioPlays || 0} écoutes
            </span>
          </div>

          <div className='flex flex-col gap-3 grow mt-4'>
            {topTracks.map((track, idx) => {
              const maxPlays = Math.max(...topTracks.map(t => t.plays), 1)
              const barWidth = Math.round((track.plays / maxPlays) * 100)

              return (
                <div key={idx} className='bg-bg-main p-3.5 border border-border-subtle flex flex-col gap-2 rounded-sm'>
                  <div className='flex justify-between items-start gap-2'>
                    <div className='flex flex-col min-w-0'>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs font-mono font-bold text-amber-400'>#{idx + 1}</span>
                        <span className='text-xs font-bold text-white truncate'>{track.title}</span>
                        <span className='text-[10px] font-mono text-amber-300 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded'>
                          {track.playlist}
                        </span>
                      </div>
                      <div className='flex items-center gap-2 mt-0.5 ml-5 text-[10px] font-mono text-gray-400'>
                        <span>Artiste : {track.artist}</span>
                        <span>•</span>
                        <span>Dernière écoute : {formatRelativeTime(track.lastPlayedAt)}</span>
                      </div>
                    </div>

                    <div className='text-right shrink-0'>
                      <span className='text-xs font-bold text-amber-400 font-mono'>{track.plays} écoutes</span>
                      <span className='block text-[10px] font-mono text-text-muted'>{track.percentage}%</span>
                    </div>
                  </div>

                  <div className='w-full bg-bg-panel h-1.5 rounded-full overflow-hidden'>
                    <div
                      style={{ width: `${barWidth}%` }}
                      className='bg-amber-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                    ></div>
                  </div>
                </div>
              )
            })}

            {topTracks.length === 0 && (
              <div className='text-xs font-mono text-gray-500 py-10 text-center italic border border-dashed border-border-subtle p-6'>
                <p>AUCUNE_ÉCOUTE_AUDIO_ENREGISTRÉE_POUR_LE_MOMENT</p>
                <p className='text-[10px] text-gray-600 mt-1'>
                  Les écoutes apparaîtront dès qu&apos;un visiteur lancera un morceau sur la page /music
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Devices, Browsers & Operating Systems Breakdown */}
      <div className='bg-bg-panel border-2 border-border-subtle p-6 shadow-xl flex flex-col gap-6'>
        <h3 className='text-base font-black uppercase tracking-widest text-white'>
          Environnement_&amp;_Appareils_Visiteurs
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Devices */}
          <div>
            <div className='text-xs font-black uppercase tracking-widest text-secondary font-mono mb-3'>
              Types d&apos;Appareils
            </div>
            <div className='grid grid-cols-3 gap-2'>
              {devices.map((dev, idx) => (
                <div key={idx} className='bg-bg-main border border-border-subtle p-3 text-center'>
                  <div className='text-lg font-black text-white font-mono'>
                    {dev.percentage}%
                  </div>
                  <div className='text-[10px] font-mono text-text-muted uppercase mt-1'>
                    {dev.name} ({dev.count})
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Browsers */}
          <div>
            <div className='text-xs font-black uppercase tracking-widest text-primary font-mono mb-3'>
              Navigateurs Web
            </div>
            <div className='flex flex-col gap-2'>
              {browsers.map((b, idx) => (
                <div key={idx} className='flex items-center justify-between text-xs font-mono bg-bg-main px-3 py-2 border border-border-subtle'>
                  <span className='text-gray-200'>{b.name}</span>
                  <div className='flex items-center gap-3'>
                    <span className='text-gray-400'>{b.count}</span>
                    <span className='text-primary font-bold w-12 text-right'>{b.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operating Systems */}
          <div>
            <div className='text-xs font-black uppercase tracking-widest text-gray-300 font-mono mb-3'>
              Systèmes d&apos;Exploitation
            </div>
            <div className='flex flex-col gap-2'>
              {operatingSystems.map((os, idx) => (
                <div key={idx} className='flex items-center justify-between text-xs font-mono bg-bg-main px-3 py-2 border border-border-subtle'>
                  <span className='text-gray-200'>{os.name}</span>
                  <div className='flex items-center gap-3'>
                    <span className='text-gray-400'>{os.count}</span>
                    <span className='text-gray-300 font-bold w-12 text-right'>{os.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Audio Plays Feed (Flux Écoutes Audio) */}
      {recentAudioPlays.length > 0 && (
        <div className='bg-bg-panel border-2 border-amber-500/30 p-6 shadow-xl'>
          <div className='flex justify-between items-center mb-6'>
            <div>
              <h3 className='text-base font-black uppercase tracking-widest text-amber-400 flex items-center gap-2'>
                <span>🎵</span> Journal_Des_Lectures_Audio (Flux Live)
              </h3>
              <p className='text-xs font-mono text-text-muted mt-0.5'>
                Derniers morceaux lancés avec adresse IP, genre et horodatage
              </p>
            </div>
            <span className='text-xs font-mono px-2.5 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold'>
              {recentAudioPlays.length} écoutes récentes
            </span>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full text-left border-collapse text-xs font-mono'>
              <thead>
                <tr className='bg-bg-main text-amber-400 uppercase border-b border-border-subtle'>
                  <th className='p-3'>Horodatage</th>
                  <th className='p-3'>IP &amp; ID Visiteur</th>
                  <th className='p-3'>Titre Écouté</th>
                  <th className='p-3'>Artiste</th>
                  <th className='p-3'>Playlist / Genre</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border-subtle'>
                {recentAudioPlays.map((item) => (
                  <tr key={item.id} className='hover:bg-bg-main/50 transition-colors'>
                    <td className='p-3 text-gray-300 whitespace-nowrap'>
                      {formatTimestamp(item.createdAt)}
                    </td>
                    <td className='p-3 whitespace-nowrap'>
                      <div className='flex flex-col gap-0.5'>
                        <span className='inline-flex items-center gap-1 font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded text-[11px] w-fit'>
                          <span className='w-1.5 h-1.5 rounded-full bg-amber-400'></span>
                          {item.ip || '127.0.0.1'}
                        </span>
                        <span className='text-[9px] text-gray-400 font-mono truncate max-w-[140px]'>
                          ID: {item.visitorUuid ? `${item.visitorUuid.slice(0, 8)}...` : 'Anonyme'}
                        </span>
                      </div>
                    </td>
                    <td className='p-3 font-bold text-white'>
                      <span className='bg-bg-main px-2 py-0.5 border border-border-subtle rounded text-amber-300'>
                        {item.title}
                      </span>
                    </td>
                    <td className='p-3 text-gray-400 whitespace-nowrap'>
                      {item.artist}
                    </td>
                    <td className='p-3 whitespace-nowrap'>
                      <span className='text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded'>
                        {item.playlist}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Live Recent Visits Table */}
      <div className='bg-bg-panel border-2 border-border-subtle p-6 shadow-xl'>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h3 className='text-base font-black uppercase tracking-widest text-white'>
              Journal_Des_Dernières_Visites (Flux Live)
            </h3>
            <p className='text-xs font-mono text-text-muted mt-0.5'>
              Dernières connexions horodatées avec informations de routage
            </p>
          </div>
          <span className='text-xs font-mono px-2.5 py-1 bg-secondary/10 border border-secondary/30 text-secondary'>
            {recentVisits.length} entrées
          </span>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse text-xs font-mono'>
            <thead>
              <tr className='bg-bg-main text-secondary uppercase border-b border-border-subtle'>
                <th className='p-3'>Horodatage</th>
                <th className='p-3'>IP &amp; ID Unique</th>
                <th className='p-3'>Section Consultée</th>
                <th className='p-3'>Appareil / OS</th>
                <th className='p-3'>Navigateur</th>
                <th className='p-3'>Référent / Source</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border-subtle'>
              {recentVisits.map((item) => {
                const pageInfo = formatPageDetails(item.path)
                return (
                  <tr key={item.id} className='hover:bg-bg-main/50 transition-colors'>
                    <td className='p-3 text-gray-300 whitespace-nowrap'>
                      {formatTimestamp(item.createdAt)}
                    </td>
                    <td className='p-3 whitespace-nowrap'>
                      <div className='flex flex-col gap-0.5'>
                        <span className='inline-flex items-center gap-1 font-bold text-secondary bg-secondary/10 border border-secondary/30 px-2 py-0.5 rounded text-[11px] w-fit'>
                          <span className='w-1.5 h-1.5 rounded-full bg-secondary'></span>
                          {item.ip || '127.0.0.1'}
                        </span>
                        <span
                          className='text-[9px] text-gray-400 font-mono truncate max-w-[140px]'
                          title={`Visiteur Unique UUID : ${item.visitorUuid}`}
                        >
                          ID: {item.visitorUuid ? `${item.visitorUuid.slice(0, 8)}...` : 'Anonyme'}
                        </span>
                      </div>
                    </td>
                    <td className='p-3 font-bold text-white'>
                      <div className='flex items-center gap-2'>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border rounded ${pageInfo.tagBg}`}>
                          {pageInfo.tag}
                        </span>
                        <span className='bg-bg-main px-2 py-0.5 border border-border-subtle rounded text-xs'>
                          {item.path}
                        </span>
                      </div>
                    </td>
                    <td className='p-3 text-gray-400 whitespace-nowrap'>
                      {item.device} · {item.os}
                    </td>
                    <td className='p-3 text-gray-400 whitespace-nowrap'>
                      {item.browser}
                    </td>
                    <td className='p-3 text-gray-500 max-w-[180px] truncate'>
                      {item.referrer || 'Direct / Aucun'}
                    </td>
                  </tr>
                )
              })}
              {recentVisits.length === 0 && (
                <tr>
                  <td colSpan={6} className='p-8 text-center text-gray-500 italic'>
                    AUCUNE_VISITE_ENREGISTRÉE
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default VisitorAnalytics
