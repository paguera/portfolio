import React, { useEffect, useState, useCallback, useRef } from 'react'
import type { TelemetryData, TelemetryPoint, ServiceHealth } from '../types'
import apiFetch from '../utils/api'

// Composant de mini graphique SVG interactif (Cyberpunk Sparkline)
const SparklineGraph: React.FC<{
  data: TelemetryPoint[]
  color: string
  fillGradientId: string
  unit?: string
  height?: number
}> = ({ data, color, fillGradientId, unit = '%', height = 60 }) => {
  if (!data || data.length < 2) {
    return (
      <div className='h-[60px] flex items-center justify-center text-[10px] text-text-muted/60 italic border border-border-subtle/30 bg-black/20'>
        Collecte des données en cours...
      </div>
    )
  }

  const width = 300
  const paddingY = 8
  const graphHeight = height - paddingY * 2

  const maxVal = Math.max(...data.map(d => d.value), 100)
  const minVal = 0

  const points = data.map((d, index) => {
    const x = (index / (data.length - 1)) * width
    const range = maxVal - minVal || 1
    const y = height - paddingY - ((d.value - minVal) / range) * graphHeight
    return { x, y, value: d.value, time: d.time }
  })

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`
  }, '')

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`

  const latest = data[data.length - 1]?.value ?? 0
  const minObserved = Math.min(...data.map(d => d.value))
  const maxObserved = Math.max(...data.map(d => d.value))
  const avgObserved = Math.round(data.reduce((a, b) => a + b.value, 0) / data.length)

  return (
    <div className='flex flex-col gap-1 w-full'>
      <div className='relative w-full h-[60px] overflow-hidden bg-black/40 border border-border-subtle/50 rounded'>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className='w-full h-full preserve-3d'
          preserveAspectRatio='none'
        >
          <defs>
            <linearGradient id={fillGradientId} x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor={color} stopOpacity='0.35' />
              <stop offset='100%' stopColor={color} stopOpacity='0.0' />
            </linearGradient>
          </defs>

          {/* Lignes de repères */}
          <line
            x1='0'
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke='rgba(255,255,255,0.06)'
            strokeDasharray='3,3'
          />

          {/* Zone remplie avec dégradé */}
          <path d={areaD} fill={`url(#${fillGradientId})`} />

          {/* Ligne principale */}
          <path
            d={pathD}
            fill='none'
            stroke={color}
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />

          {/* Point actif le plus récent */}
          {points.length > 0 && (
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r='3.5'
              fill={color}
              className='animate-pulse'
            />
          )}
        </svg>
      </div>

      <div className='flex justify-between items-center text-[9px] text-text-muted font-mono px-1'>
        <span>Min: <strong className='text-gray-300'>{minObserved}{unit}</strong></span>
        <span>Moy: <strong className='text-gray-300'>{avgObserved}{unit}</strong></span>
        <span>Max: <strong className='text-gray-300'>{maxObserved}{unit}</strong></span>
        <span>Actuel: <strong style={{ color }}>{latest}{unit}</strong></span>
      </div>
    </div>
  )
}

export const InfraControlCenter: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null)
  const [telemetryLoading, setTelemetryLoading] = useState(true)
  const [telemetryError, setTelemetryError] = useState<string | null>(null)

  const [services, setServices] = useState<ServiceHealth[]>([])
  const [servicesLoading, setServicesLoading] = useState(true)
  const [servicesError, setServicesError] = useState<string | null>(null)

  const [lastCheck, setLastCheck] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showGrafanaIframe, setShowGrafanaIframe] = useState(false)

  // Accumulateur d'historique local pour les graphiques si l'API n'a pas tout l'historique
  const cpuHistoryRef = useRef<TelemetryPoint[]>([])
  const ramHistoryRef = useRef<TelemetryPoint[]>([])

  // Hôte Tailscale détecté ou par défaut
  const tailscaleHost =
    typeof window !== 'undefined' &&
    window.location.hostname &&
    !window.location.hostname.includes('paguera.fr') &&
    window.location.hostname !== 'localhost'
      ? window.location.hostname
      : '100.80.76.84'

  // 1. Récupération de la télémétrie depuis le backend
  const fetchTelemetry = useCallback(async () => {
    try {
      const data = await apiFetch<TelemetryData>('/infra/telemetry')
      
      // Mise à jour de l'historique CPU
      if (data.cpuHistory && data.cpuHistory.length > 0) {
        cpuHistoryRef.current = data.cpuHistory
      } else {
        const newPoint: TelemetryPoint = {
          time: Math.floor(Date.now() / 1000),
          value: data.cpuPercent
        }
        cpuHistoryRef.current = [...cpuHistoryRef.current.slice(-19), newPoint]
      }

      // Mise à jour de l'historique RAM
      if (data.ramHistory && data.ramHistory.length > 0) {
        ramHistoryRef.current = data.ramHistory
      } else {
        const newPoint: TelemetryPoint = {
          time: Math.floor(Date.now() / 1000),
          value: data.ram.percent
        }
        ramHistoryRef.current = [...ramHistoryRef.current.slice(-19), newPoint]
      }

      setTelemetry(data)
      setTelemetryError(null)
    } catch (err: any) {
      console.warn('Erreur télémétrie infra:', err)
      setTelemetryError(err.message || 'Impossible de contacter le service de télémétrie')
    } finally {
      setTelemetryLoading(false)
    }
  }, [])

  // 2. Récupération de la santé des services depuis le backend
  const fetchHealth = useCallback(async () => {
    try {
      const data = await apiFetch<ServiceHealth[]>('/infra/health')
      setServices(data)
      setServicesError(null)
      setLastCheck(new Date())
    } catch (err: any) {
      console.warn('Erreur health check infra:', err)
      setServicesError(err.message || 'Impossible de vérifier la santé des services')
    } finally {
      setServicesLoading(false)
    }
  }, [])

  // Actualisation manuelle globale
  const handleRefreshAll = async () => {
    setIsRefreshing(true)
    await Promise.all([fetchTelemetry(), fetchHealth()])
    setIsRefreshing(false)
  }

  // Initialisation et boucles de rafraîchissement périodique
  useEffect(() => {
    fetchTelemetry()
    fetchHealth()

    // Télémétrie rafraîchie toutes les 10 secondes
    const telemetryTimer = setInterval(() => {
      fetchTelemetry()
    }, 10000)

    // Healthchecks rafraîchis toutes les 30 secondes
    const healthTimer = setInterval(() => {
      fetchHealth()
    }, 30000)

    return () => {
      clearInterval(telemetryTimer)
      clearInterval(healthTimer)
    }
  }, [fetchTelemetry, fetchHealth])

  const privateServices = services.filter(s => s.category === 'private')
  const publicServices = services.filter(s => s.category === 'public')

  return (
    <div className='flex flex-col gap-8 font-mono text-text-main'>
      {/* Barre d'action supérieure */}
      <div className='flex flex-wrap items-center justify-between gap-4 bg-bg-panel border-2 border-border-subtle p-4 shadow-xl'>
        <div className='flex items-center gap-3'>
          <span
            className={`inline-block w-3.5 h-3.5 rounded-full ${
              telemetry?.netdataOnline
                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse'
                : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
            }`}
          />
          <div>
            <h1 className='text-sm md:text-base font-black uppercase tracking-wider text-white flex items-center gap-2'>
              <span>⚡</span> TOUR_DE_CONTRÔLE_INFRA &amp; SERVICES
            </h1>
            <p className='text-xs text-text-muted mt-0.5'>
              Hôte Tailscale NAS : <span className='text-cyber-cyan font-bold'>{tailscaleHost}</span> •
              Sondes :{' '}
              <span className={telemetry?.netdataOnline ? 'text-emerald-400' : 'text-amber-400'}>
                {telemetry?.netdataOnline ? 'Netdata v2 Connecté' : 'Mode Système Local'}
              </span>{' '}
              • Dernière vérification : {lastCheck.toLocaleTimeString()}
            </p>
          </div>
        </div>

        <button
          type='button'
          onClick={handleRefreshAll}
          disabled={isRefreshing}
          className='bg-cyber-yellow/20 text-cyber-yellow border border-cyber-yellow/50 hover:bg-cyber-yellow hover:text-black px-4 py-2 text-xs font-bold uppercase transition-all cursor-pointer shadow flex items-center gap-2 disabled:opacity-50'
        >
          <span className={`inline-block ${isRefreshing ? 'animate-spin' : ''}`}>↻</span>
          <span>{isRefreshing ? 'Vérification...' : 'Actualiser Tout'}</span>
        </button>
      </div>

      {/* 1. SECTION MÉTÉO DU NAS (TÉLÉMÉTRIE & GRAPHIQUES) */}
      <section className='bg-bg-panel border-2 border-border-subtle p-6 shadow-2xl'>
        <div className='flex flex-wrap items-center justify-between border-b border-border-subtle pb-3 mb-6 gap-2'>
          <div className='flex items-center gap-2'>
            <h2 className='text-xs md:text-sm font-black uppercase tracking-widest text-cyber-yellow flex items-center gap-2'>
              <span>📊</span> MÉTÉO_SYSTÈME_NAS (GRAPHIQUES &amp; CAPTEURS TEMPS RÉEL)
            </h2>
            {telemetry?.source === 'netdata' && (
              <span className='px-1.5 py-0.5 text-[9px] font-bold uppercase bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 rounded'>
                Flux Netdata Actif
              </span>
            )}
          </div>
          {telemetry && (
            <div className='text-[11px] text-text-muted flex items-center gap-3'>
              <span>
                OS : <strong className='text-gray-300'>{telemetry.osName}</strong>
              </span>
              <span>
                Uptime :{' '}
                <strong className='text-gray-300'>
                  {Math.floor(telemetry.uptimeSeconds / 86400)}j{' '}
                  {Math.floor((telemetry.uptimeSeconds % 86400) / 3600)}h
                </strong>
              </span>
            </div>
          )}
        </div>

        {telemetryLoading && !telemetry ? (
          <div className='p-8 text-center text-text-muted animate-pulse text-xs uppercase tracking-widest bg-black/20 border border-border-subtle'>
            &gt; INTERROGATION_DES_CAPTEURS_INFRASTRUCTURE...
          </div>
        ) : telemetryError && !telemetry ? (
          <div className='p-4 border border-red-500/40 bg-red-950/20 text-red-400 text-xs flex items-center justify-between'>
            <span>⚠ {telemetryError}</span>
            <button
              onClick={fetchTelemetry}
              className='underline hover:text-white uppercase font-bold cursor-pointer'
            >
              Réessayer
            </button>
          </div>
        ) : telemetry ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
            {/* 1. CPU Global + Graphique */}
            <div className='bg-black/40 border border-border-subtle p-4 flex flex-col justify-between gap-3'>
              <div>
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-xs uppercase text-text-muted font-bold flex items-center gap-1.5'>
                    <span className='w-2 h-2 rounded-full bg-cyber-cyan' />
                    CPU Global
                  </span>
                  <span className='text-xs text-cyber-cyan font-bold'>{telemetry.cpuPercent}%</span>
                </div>

                <div className='w-full bg-gray-900 h-2 overflow-hidden mb-3 border border-gray-800 rounded'>
                  <div
                    className={`h-full transition-all duration-500 ${
                      telemetry.cpuPercent > 80
                        ? 'bg-red-500 shadow-[0_0_6px_#ef4444]'
                        : telemetry.cpuPercent > 50
                        ? 'bg-amber-400'
                        : 'bg-cyber-cyan shadow-[0_0_6px_#00f0ff]'
                    }`}
                    style={{ width: `${Math.max(3, telemetry.cpuPercent)}%` }}
                  />
                </div>
              </div>

              {/* Mini Graphique d'historique CPU */}
              <div>
                <span className='text-[10px] text-text-muted uppercase block mb-1'>
                  Historique d'activité processeur (60s)
                </span>
                <SparklineGraph
                  data={cpuHistoryRef.current}
                  color='#00f0ff'
                  fillGradientId='cpuGradient'
                  unit='%'
                />
              </div>
            </div>

            {/* 2. Mémoire RAM + Graphique */}
            <div className='bg-black/40 border border-border-subtle p-4 flex flex-col justify-between gap-3'>
              <div>
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-xs uppercase text-text-muted font-bold flex items-center gap-1.5'>
                    <span className='w-2 h-2 rounded-full bg-emerald-400' />
                    Mémoire RAM
                  </span>
                  <span className='text-xs text-emerald-400 font-bold'>
                    {telemetry.ram.percent}%
                  </span>
                </div>

                <div className='w-full bg-gray-900 h-2 overflow-hidden mb-2 border border-gray-800 rounded'>
                  <div
                    className={`h-full transition-all duration-500 ${
                      telemetry.ram.percent > 85 ? 'bg-red-500' : 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                    }`}
                    style={{ width: `${Math.max(3, telemetry.ram.percent)}%` }}
                  />
                </div>

                <div className='flex justify-between text-[10px] text-gray-400 uppercase mb-2'>
                  <span>Utilisé: {telemetry.ram.usedGiB} Go</span>
                  <span>Total: {telemetry.ram.totalGiB} Go</span>
                </div>
              </div>

              {/* Mini Graphique d'historique RAM */}
              <div>
                <span className='text-[10px] text-text-muted uppercase block mb-1'>
                  Saturation mémoire vive (60s)
                </span>
                <SparklineGraph
                  data={ramHistoryRef.current}
                  color='#10b981'
                  fillGradientId='ramGradient'
                  unit='%'
                />
              </div>
            </div>

            {/* 3. Stockage Disque (/) */}
            <div className='bg-black/40 border border-border-subtle p-4 flex flex-col justify-between'>
              <div>
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-xs uppercase text-text-muted font-bold flex items-center gap-1.5'>
                    <span className='w-2 h-2 rounded-full bg-cyber-yellow' />
                    Stockage Disque (/)
                  </span>
                  <span className='text-xs text-cyber-yellow font-bold'>
                    {telemetry.disk.percent}%
                  </span>
                </div>

                <div className='w-full bg-gray-900 h-2 overflow-hidden mb-3 border border-gray-800 rounded'>
                  <div
                    className={`h-full transition-all duration-500 ${
                      telemetry.disk.percent > 90 ? 'bg-red-500' : 'bg-cyber-yellow shadow-[0_0_6px_#fbbf24]'
                    }`}
                    style={{ width: `${Math.max(3, telemetry.disk.percent)}%` }}
                  />
                </div>

                <div className='flex justify-between text-[10px] text-gray-400 uppercase mb-4'>
                  <span>Libre: {telemetry.disk.availGiB} Go</span>
                  <span>Total: {telemetry.disk.totalGiB} Go</span>
                </div>
              </div>

              <div className='bg-black/60 border border-border-subtle/40 p-2.5 text-[10px] text-text-muted flex flex-col gap-1 rounded'>
                <div className='flex justify-between'>
                  <span>Espace utilisé :</span>
                  <strong className='text-white'>{telemetry.disk.usedGiB} Go</strong>
                </div>
                <div className='flex justify-between'>
                  <span>Espace disponible :</span>
                  <strong className='text-emerald-400'>{telemetry.disk.availGiB} Go</strong>
                </div>
                <div className='flex justify-between'>
                  <span>Partition :</span>
                  <strong className='text-cyber-cyan'>Root Mount (/)</strong>
                </div>
              </div>
            </div>

            {/* 4. Alarmes & Santé des Capteurs */}
            <div className='bg-black/40 border border-border-subtle p-4 flex flex-col justify-between'>
              <div>
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-xs uppercase text-text-muted font-bold'>Santé Capteurs</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      telemetry.alarms.critical > 0
                        ? 'bg-red-950 text-red-400 border border-red-500/50'
                        : telemetry.alarms.warning > 0
                        ? 'bg-amber-950 text-amber-400 border border-amber-500/50'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
                    }`}
                  >
                    {telemetry.alarms.critical > 0
                      ? 'CRITIQUE'
                      : telemetry.alarms.warning > 0
                      ? 'ATTENTION'
                      : 'NOMINAL'}
                  </span>
                </div>

                <div className='flex items-center gap-2 mb-3 mt-2'>
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      telemetry.alarms.critical > 0
                        ? 'bg-red-500 animate-ping'
                        : telemetry.alarms.warning > 0
                        ? 'bg-amber-400'
                        : 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                    }`}
                  />
                  <span className='text-xs font-bold text-white'>
                    {telemetry.alarms.normal > 0 ? `${telemetry.alarms.normal} sondes actives` : 'Système opérationnel'}
                  </span>
                </div>

                <div className='text-[10px] text-gray-400 uppercase leading-relaxed'>
                  {telemetry.alarms.warning} avertissements • {telemetry.alarms.critical} alertes critiques
                </div>
              </div>

              <div className='bg-black/60 border border-border-subtle/40 p-2.5 text-[10px] text-text-muted flex flex-col gap-1 rounded mt-3'>
                <div className='flex justify-between'>
                  <span>Moteur de métriques :</span>
                  <strong className='text-white'>
                    {telemetry.source === 'netdata' ? 'Netdata v2 Daemon' : 'Node Core Subsystem'}
                  </strong>
                </div>
                <div className='flex justify-between'>
                  <span>Statut sonde :</span>
                  <strong className={telemetry.netdataOnline ? 'text-emerald-400' : 'text-amber-400'}>
                    {telemetry.netdataOnline ? 'En Ligne (Port 19999)' : 'Mode Dégradé'}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* 2. SECTION SERVICES PRIVÉS (TAILSCALE) */}
      <section className='bg-bg-panel border-2 border-border-subtle p-6 shadow-2xl'>
        <div className='flex flex-wrap items-center justify-between border-b border-border-subtle pb-3 mb-6 gap-2'>
          <div>
            <h2 className='text-xs md:text-sm font-black uppercase tracking-widest text-white flex items-center gap-2'>
              <span>🔒</span> TOURS_DE_CONTRÔLE_PRIVÉES (TAILSCALE EXCLUSIF)
            </h2>
            <p className='text-[11px] text-text-muted mt-0.5'>
              Services d'administration, d'observabilité et bases de données isolés sur{' '}
              <span className='text-cyber-cyan font-bold'>{tailscaleHost}</span>
            </p>
          </div>
          <span className='text-[10px] text-gray-400 bg-black/40 px-2 py-1 border border-border-subtle'>
            {privateServices.filter(s => s.status === 'online').length} / {privateServices.length} en ligne
          </span>
        </div>

        {servicesLoading && services.length === 0 ? (
          <div className='p-8 text-center text-text-muted animate-pulse text-xs uppercase tracking-widest bg-black/20'>
            &gt; PING_DES_SERVICES_PRIVÉS_EN_COURS...
          </div>
        ) : servicesError && services.length === 0 ? (
          <div className='p-4 border border-red-500/40 bg-red-950/20 text-red-400 text-xs'>
            ⚠ {servicesError}
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
            {privateServices.map(srv => {
              const isOnline = srv.status === 'online'

              return (
                <div
                  key={srv.id}
                  className={`bg-black/30 border p-5 flex flex-col justify-between transition-colors ${
                    isOnline ? 'border-border-subtle hover:border-cyber-cyan/50' : 'border-red-500/30'
                  }`}
                >
                  <div>
                    <div className='flex items-start justify-between gap-2 mb-2'>
                      <div>
                        <h3 className='text-sm font-black text-white uppercase tracking-wider'>
                          {srv.name}
                        </h3>
                        {srv.port && (
                          <span className='inline-block text-[11px] text-cyber-cyan font-bold'>
                            Port :{srv.port}
                          </span>
                        )}
                      </div>

                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                          isOnline
                            ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-400'
                            : 'border-red-500/50 bg-red-950/40 text-red-400'
                        }`}
                      >
                        {isOnline ? 'En Ligne' : 'Inaccessible'}
                      </span>
                    </div>

                    <p className='text-xs text-text-muted mb-4 line-clamp-2 leading-relaxed'>
                      {srv.role}
                    </p>
                  </div>

                  <div className='pt-3 border-t border-border-subtle/60 flex items-center justify-between gap-2'>
                    <div className='text-[10px] text-gray-500'>
                      {srv.latencyMs !== undefined && (
                        <span>
                          Latence : <strong className='text-gray-300'>{srv.latencyMs} ms</strong>
                        </span>
                      )}
                      {srv.version && (
                        <span className='ml-2 text-cyber-cyan font-semibold'>{srv.version}</span>
                      )}
                    </div>

                    {srv.mainUrl && srv.mainUrl !== '#' ? (
                      <a
                        href={srv.mainUrl}
                        target='_blank'
                        rel='noreferrer'
                        className='text-xs font-bold text-cyber-cyan hover:text-white hover:underline flex items-center gap-1 uppercase'
                      >
                        <span>Ouvrir</span> ↗
                      </a>
                    ) : (
                      <span className='text-[10px] text-emerald-400 font-bold uppercase'>
                        Interne ✓
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Panneau Grafana & Observabilité */}
        <div className='mt-6 pt-4 border-t border-border-subtle flex flex-col gap-4'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='flex items-center gap-2'>
              <span className='text-xs text-text-muted uppercase'>
                Dashboards Grafana (Loki Logs &amp; Métriques PromQL)
              </span>
              <a
                href={`http://${tailscaleHost}:3000`}
                target='_blank'
                rel='noreferrer'
                className='text-xs text-cyber-cyan hover:underline font-bold'
              >
                Ouvrir Grafana (:3000) ↗
              </a>
            </div>

            <button
              type='button'
              onClick={() => setShowGrafanaIframe(prev => !prev)}
              className='bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/40 hover:bg-cyber-cyan hover:text-black px-3 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer'
            >
              {showGrafanaIframe ? "Masquer l'Aperçu Grafana ▲" : "Afficher l'Aperçu Grafana ▼"}
            </button>
          </div>

          {showGrafanaIframe && (
            <div className='border-2 border-cyber-cyan/40 overflow-hidden bg-black mt-2 p-2'>
              <div className='p-2 bg-gray-900/60 text-[11px] text-text-muted mb-2 flex justify-between items-center'>
                <span>
                  Source Grafana : <strong className='text-white'>http://{tailscaleHost}:3000</strong>
                </span>
                <span className='text-gray-400'>
                  (Nécessite d'être connecté au réseau Tailscale sur votre appareil)
                </span>
              </div>
              <iframe
                title='Grafana Dashboard'
                src={`http://${tailscaleHost}:3000/?orgId=1`}
                className='w-full h-[600px] border-0 bg-neutral-950'
              />
            </div>
          )}
        </div>
      </section>

      {/* 3. SECTION PROJETS PUBLICS (CLOUDFLARE) */}
      <section className='bg-bg-panel border-2 border-border-subtle p-6 shadow-2xl'>
        <div className='flex flex-wrap items-center justify-between border-b border-border-subtle pb-3 mb-6 gap-2'>
          <div>
            <h2 className='text-xs md:text-sm font-black uppercase tracking-widest text-white flex items-center gap-2'>
              <span>🌐</span> PROJETS_PUBLICS (SOUS-DOMAINES CLOUDFLARE *.PAGUERA.FR)
            </h2>
            <p className='text-[11px] text-text-muted mt-0.5'>
              Statut opérationnel en direct de vos applications web hébergées sur le NAS
            </p>
          </div>
          <span className='text-[10px] text-gray-400 bg-black/40 px-2 py-1 border border-border-subtle'>
            {publicServices.filter(s => s.status === 'online').length} / {publicServices.length} opérationnels
          </span>
        </div>

        {servicesLoading && services.length === 0 ? (
          <div className='p-8 text-center text-text-muted animate-pulse text-xs uppercase tracking-widest bg-black/20'>
            &gt; INTERROGATION_DES_ENDPOINTS_PUBLICS...
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {publicServices.map(srv => {
              const isOnline = srv.status === 'online'

              return (
                <div
                  key={srv.id}
                  className={`bg-black/30 border p-5 flex flex-col justify-between transition-colors ${
                    isOnline
                      ? 'border-border-subtle hover:border-cyber-yellow/50'
                      : 'border-red-500/40 bg-red-950/10'
                  }`}
                >
                  <div>
                    <div className='flex items-start justify-between gap-2 mb-2'>
                      <h3 className='text-sm font-black text-white uppercase tracking-wider'>
                        {srv.name}
                      </h3>

                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                          isOnline
                            ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-400'
                            : 'border-red-500/50 bg-red-950/40 text-red-400'
                        }`}
                      >
                        {isOnline ? 'En Ligne' : 'Inaccessible'}
                      </span>
                    </div>

                    <p className='text-xs text-text-muted mb-4 line-clamp-2 leading-relaxed'>
                      {srv.role}
                    </p>
                  </div>

                  <div className='pt-3 border-t border-border-subtle/60 flex flex-col gap-2'>
                    <div className='flex items-center justify-between'>
                      <a
                        href={srv.mainUrl}
                        target='_blank'
                        rel='noreferrer'
                        className='text-xs font-bold text-cyber-yellow hover:text-white hover:underline flex items-center gap-1'
                      >
                        <span>{srv.mainUrl.replace('https://', '')}</span> ↗
                      </a>

                      {srv.latencyMs !== undefined && (
                        <span className='text-[10px] text-gray-400 font-mono'>
                          Latence : <strong className='text-gray-300'>{srv.latencyMs} ms</strong>
                        </span>
                      )}
                    </div>

                    {srv.secondaryUrl && (
                      <div className='flex items-center justify-between text-[11px] text-gray-400 pt-1'>
                        <span className='text-text-muted'>{srv.secondaryUrl.label} :</span>
                        <a
                          href={srv.secondaryUrl.url}
                          target='_blank'
                          rel='noreferrer'
                          className='text-cyber-cyan hover:underline flex items-center gap-0.5'
                        >
                          Accéder ↗
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default InfraControlCenter
