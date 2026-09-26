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

  const { summary, history, topPages, devices, browsers, operatingSystems, recentVisits } = stats

  // Find max value in history for chart scaling
  const maxDaily = Math.max(...history.map(h => Math.max(h.uniqueVisitors, h.pageViews, 1)), 5)

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
            Statistiques de trafic en temps réel & analyse des visiteurs
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
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
        {/* Total Unique Visitors */}
        <div className='bg-bg-panel border-2 border-secondary/50 p-5 flex flex-col justify-between shadow-lg relative overflow-hidden'>
          <div className='text-[10px] font-mono uppercase tracking-widest text-secondary font-black'>
            Visiteurs Uniques
          </div>
          <div className='text-4xl lg:text-5xl font-black font-mono text-white mt-3 mb-1'>
            {summary.totalUniqueVisitors}
          </div>
          <div className='text-[10px] font-mono text-text-muted uppercase'>
            Total cumulé
          </div>
          <div className='absolute -right-4 -bottom-4 w-16 h-16 bg-secondary/5 rounded-full pointer-events-none'></div>
        </div>

        {/* Total Page Views */}
        <div className='bg-bg-panel border-2 border-border-subtle p-5 flex flex-col justify-between shadow-lg'>
          <div className='text-[10px] font-mono uppercase tracking-widest text-primary font-black'>
            Pages Vues
          </div>
          <div className='text-4xl lg:text-5xl font-black font-mono text-white mt-3 mb-1'>
            {summary.totalPageViews}
          </div>
          <div className='text-[10px] font-mono text-text-muted uppercase'>
            Consultations
          </div>
        </div>

        {/* Today */}
        <div className='bg-bg-panel border-2 border-border-subtle p-5 flex flex-col justify-between shadow-lg'>
          <div className='text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-black'>
            Aujourd&apos;hui
          </div>
          <div className='text-4xl lg:text-5xl font-black font-mono text-emerald-400 mt-3 mb-1'>
            {summary.todayVisitors}
          </div>
          <div className='text-[10px] font-mono text-text-muted uppercase'>
            Visites du jour
          </div>
        </div>

        {/* Last 7 Days */}
        <div className='bg-bg-panel border-2 border-border-subtle p-5 flex flex-col justify-between shadow-lg'>
          <div className='text-[10px] font-mono uppercase tracking-widest text-gray-300 font-black'>
            7 Derniers Jours
          </div>
          <div className='text-4xl lg:text-5xl font-black font-mono text-white mt-3 mb-1'>
            {summary.weekVisitors}
          </div>
          <div className='text-[10px] font-mono text-text-muted uppercase'>
            Activité récente
          </div>
        </div>

        {/* Last 30 Days */}
        <div className='bg-bg-panel border-2 border-border-subtle p-5 flex flex-col justify-between shadow-lg col-span-2 md:col-span-1'>
          <div className='text-[10px] font-mono uppercase tracking-widest text-gray-300 font-black'>
            30 Derniers Jours
          </div>
          <div className='text-4xl lg:text-5xl font-black font-mono text-white mt-3 mb-1'>
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
              Barre bleue = Visiteurs Uniques | Barre orange = Pages Vues
            </p>
          </div>
          <div className='flex items-center gap-4 text-xs font-mono'>
            <div className='flex items-center gap-1.5'>
              <span className='w-3 h-3 bg-secondary inline-block'></span>
              <span className='text-gray-300'>Visiteurs</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='w-3 h-3 bg-primary inline-block'></span>
              <span className='text-gray-300'>Pages vues</span>
            </div>
          </div>
        </div>

        <div className='pt-8 pb-4'>
          {/* Chart Bars Container */}
          <div className='flex items-end gap-1.5 md:gap-3 h-48 border-b border-border-subtle px-2'>
            {history.map((item, idx) => {
              const uniqueHeight = Math.max(Math.round((item.uniqueVisitors / maxDaily) * 100), 2)
              const viewsHeight = Math.max(Math.round((item.pageViews / maxDaily) * 100), 2)

              return (
                <div key={idx} className='flex-1 flex flex-col items-center h-full justify-end group'>
                  {/* Values label visible on hover */}
                  <div className='opacity-0 group-hover:opacity-100 transition-opacity mb-1 flex flex-col items-center text-[10px] font-mono text-center pointer-events-none'>
                    <span className='text-secondary font-bold'>{item.uniqueVisitors}v</span>
                    <span className='text-primary'>{item.pageViews}p</span>
                  </div>

                  <div className='w-full flex items-end justify-center gap-1 h-36'>
                    {/* Unique Visitors Bar */}
                    <div
                      style={{ height: `${item.uniqueVisitors > 0 ? uniqueHeight : 0}%` }}
                      className='w-1/2 bg-secondary hover:brightness-125 transition-all rounded-t-sm relative'
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
                      className='w-1/2 bg-primary/80 hover:bg-primary transition-all rounded-t-sm'
                      title={`${item.date} : ${item.pageViews} page(s) vue(s)`}
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

      {/* Two columns: Top Pages + Breakdown */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Top Visited Pages */}
        <div className='bg-bg-panel border-2 border-border-subtle p-6 shadow-xl flex flex-col'>
          <h3 className='text-base font-black uppercase tracking-widest text-white mb-4'>
            Top_Pages_Consultées
          </h3>
          <p className='text-xs font-mono text-text-muted mb-6'>
            Pages les plus fréquemment parcourues par les visiteurs
          </p>

          <div className='flex flex-col gap-3 grow'>
            {topPages.map((page, idx) => {
              const maxViews = Math.max(...topPages.map(p => p.views), 1)
              const pct = Math.round((page.views / maxViews) * 100)

              return (
                <div key={idx} className='bg-bg-main p-3 border border-border-subtle flex flex-col gap-1.5'>
                  <div className='flex justify-between items-center text-xs font-mono'>
                    <span className='font-bold text-white flex items-center gap-2 truncate'>
                      <span className='text-secondary'>#{idx + 1}</span> {page.path}
                    </span>
                    <span className='text-secondary font-bold shrink-0'>{page.views} vues</span>
                  </div>
                  <div className='w-full bg-bg-panel h-1.5 rounded-full overflow-hidden'>
                    <div
                      style={{ width: `${pct}%` }}
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

        {/* Devices, Browsers & OS Breakdown */}
        <div className='bg-bg-panel border-2 border-border-subtle p-6 shadow-xl flex flex-col gap-6'>
          <h3 className='text-base font-black uppercase tracking-widest text-white'>
            Environnement_&amp;_Appareils
          </h3>

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
              Navigateurs
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
                <th className='p-3'>Page</th>
                <th className='p-3'>Appareil / OS</th>
                <th className='p-3'>Navigateur</th>
                <th className='p-3'>Référent / Source</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border-subtle'>
              {recentVisits.map((item) => (
                <tr key={item.id} className='hover:bg-bg-main/50 transition-colors'>
                  <td className='p-3 text-gray-300 whitespace-nowrap'>
                    {formatTimestamp(item.createdAt)}
                  </td>
                  <td className='p-3 font-bold text-white'>
                    <span className='bg-bg-main px-2 py-0.5 border border-border-subtle rounded'>
                      {item.path}
                    </span>
                  </td>
                  <td className='p-3 text-gray-400 whitespace-nowrap'>
                    {item.device} · {item.os}
                  </td>
                  <td className='p-3 text-gray-400 whitespace-nowrap'>
                    {item.browser}
                  </td>
                  <td className='p-3 text-gray-500 max-w-[200px] truncate'>
                    {item.referrer || 'Direct / Aucun'}
                  </td>
                </tr>
              ))}
              {recentVisits.length === 0 && (
                <tr>
                  <td colSpan={5} className='p-8 text-center text-gray-500 italic'>
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
