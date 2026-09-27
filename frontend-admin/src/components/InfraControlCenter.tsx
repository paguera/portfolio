import React, { useEffect, useState, useCallback } from 'react'

interface TelemetryData {
  cpuPercent: number
  ram: {
    usedGiB: number
    totalGiB: number
    freeGiB: number
    percent: number
  }
  disk: {
    usedGiB: number
    totalGiB: number
    availGiB: number
    percent: number
  }
  alarms: {
    normal: number
    warning: number
    critical: number
  }
  osName: string
}

interface ServiceStatus {
  id: string
  name: string
  category: 'public' | 'private'
  role: string
  mainUrl: string
  secondaryUrl?: { label: string; url: string }
  port?: number
  checkUrl: string
  status: 'checking' | 'online' | 'offline'
  latencyMs?: number
  version?: string
}

export const InfraControlCenter: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null)
  const [telemetryLoading, setTelemetryLoading] = useState(true)
  const [telemetryError, setTelemetryError] = useState<string | null>(null)
  const [lastCheck, setLastCheck] = useState<Date>(new Date())
  const [showGrafanaIframe, setShowGrafanaIframe] = useState(false)

  // Détermine dynamiquement l'hôte Tailscale (ou localhost en fallback)
  const tailscaleHost =
    typeof window !== 'undefined' && window.location.hostname
      ? window.location.hostname
      : '100.80.76.84'

  const [services, setServices] = useState<ServiceStatus[]>([
    // --- Services Privés (Tailscale) ---
    {
      id: 'nextcloud',
      name: 'Nextcloud Hub',
      category: 'private',
      role: 'Cloud privé, stockage de fichiers & synchronisation',
      port: 8088,
      mainUrl: `http://${tailscaleHost}:8088`,
      checkUrl: `http://${tailscaleHost}:8088/status.php`,
      status: 'checking'
    },
    {
      id: 'netdata',
      name: 'Netdata Real-Time',
      category: 'private',
      role: 'Télémétrie seconde par seconde & météo des capteurs du NAS',
      port: 19999,
      mainUrl: `http://${tailscaleHost}:19999`,
      checkUrl: `http://${tailscaleHost}:19999/api/v1/info`,
      status: 'checking'
    },
    {
      id: 'grafana',
      name: 'Grafana & Loki',
      category: 'private',
      role: 'Dashboards d\'observabilité & agrégation des logs conteneurs',
      port: 3000,
      mainUrl: `http://${tailscaleHost}:3000`,
      checkUrl: `http://${tailscaleHost}:3000/api/health`,
      status: 'checking'
    },

    // --- Projets Publics (Cloudflare) ---
    {
      id: 'portfolio',
      name: 'Portfolio Vitrine',
      category: 'public',
      role: 'Site vitrine officiel, musique, lecteur audio & galerie',
      mainUrl: 'https://paguera.fr',
      secondaryUrl: { label: 'API Backend', url: 'https://portfolio-api.paguera.fr' },
      checkUrl: 'https://paguera.fr',
      status: 'checking'
    },
    {
      id: 'marsai',
      name: 'MarsAI Platform',
      category: 'public',
      role: 'Génération & traitement vidéo par IA (Modèles Whisper & ClamAV)',
      mainUrl: 'https://marsai.paguera.fr',
      secondaryUrl: { label: 'API Backend', url: 'https://marsai-api.paguera.fr' },
      checkUrl: 'https://marsai.paguera.fr',
      status: 'checking'
    },
    {
      id: 'geaidubol',
      name: 'Geai du Bol',
      category: 'public',
      role: 'E-commerce atelier céramique (Next.js + Sylius Headless)',
      mainUrl: 'https://geaidubol.paguera.fr',
      secondaryUrl: { label: 'Admin Sylius', url: 'https://geaidubol-admin.paguera.fr/admin' },
      checkUrl: 'https://geaidubol.paguera.fr',
      status: 'checking'
    },
    {
      id: 'merise',
      name: 'Merise Forge',
      category: 'public',
      role: 'Studio visuel Cyberpunk de modélisation MCD / MLD / MPD SQL',
      mainUrl: 'https://merise-forge.paguera.fr',
      checkUrl: 'https://merise-forge.paguera.fr',
      status: 'checking'
    },
    {
      id: 'memo',
      name: 'Jeu du Memo',
      category: 'public',
      role: 'Application interactive React / Vite - Cartes & paires',
      mainUrl: 'https://memo.paguera.fr',
      checkUrl: 'https://memo.paguera.fr',
      status: 'checking'
    },
    {
      id: 'tictactoe',
      name: 'Morpion Tic-Tac-Toe',
      category: 'public',
      role: 'Jeu classique rétro interactif',
      mainUrl: 'https://tic-tac-toe.paguera.fr',
      checkUrl: 'https://tic-tac-toe.paguera.fr',
      status: 'checking'
    }
  ])

  // 1. Récupération de la télémétrie NAS via l'API Netdata (CORS activé nativement)
  const fetchTelemetry = useCallback(async () => {
    try {
      setTelemetryLoading(true)
      const baseUrl = `http://${tailscaleHost}:19999/api/v1`

      const [infoRes, cpuRes, ramRes, diskRes] = await Promise.all([
        fetch(`${baseUrl}/info`, { signal: AbortSignal.timeout(3000) }).then(r => r.json()),
        fetch(`${baseUrl}/data?chart=system.cpu&points=1`, { signal: AbortSignal.timeout(3000) }).then(r => r.json()),
        fetch(`${baseUrl}/data?chart=system.ram&points=1`, { signal: AbortSignal.timeout(3000) }).then(r => r.json()),
        fetch(`${baseUrl}/data?chart=disk_space.%2F&points=1`, { signal: AbortSignal.timeout(3000) }).then(r => r.json())
      ])

      // Calcul CPU
      // Labels: ["time","guest_nice","guest","steal","softirq","irq","user","system","nice","iowait"]
      const cpuData = cpuRes.data[0] || []
      const cpuActive = cpuData.slice(1).reduce((acc: number, val: number) => acc + (val || 0), 0)

      // Calcul RAM
      // Labels: ["time","free","used","cached","buffers"] (en MiB)
      const ramData = ramRes.data[0] || []
      const ramFree = (ramData[1] || 0) / 1024
      const ramUsed = (ramData[2] || 0) / 1024
      const ramCached = (ramData[3] || 0) / 1024
      const ramBuffers = (ramData[4] || 0) / 1024
      const ramTotal = ramFree + ramUsed + ramCached + ramBuffers
      const ramPercent = ramTotal > 0 ? (ramUsed / ramTotal) * 100 : 0

      // Calcul Disque /
      // Labels: ["time","avail","used","reserved for root"] (en GiB)
      const diskData = diskRes.data[0] || []
      const diskAvail = diskData[1] || 0
      const diskUsed = diskData[2] || 0
      const diskTotal = diskAvail + diskUsed
      const diskPercent = diskTotal > 0 ? (diskUsed / diskTotal) * 100 : 0

      setTelemetry({
        cpuPercent: Math.min(100, Math.round(cpuActive * 10) / 10),
        ram: {
          usedGiB: Math.round(ramUsed * 10) / 10,
          totalGiB: Math.round(ramTotal * 10) / 10,
          freeGiB: Math.round((ramFree + ramCached + ramBuffers) * 10) / 10,
          percent: Math.round(ramPercent)
        },
        disk: {
          usedGiB: Math.round(diskUsed),
          totalGiB: Math.round(diskTotal),
          availGiB: Math.round(diskAvail),
          percent: Math.round(diskPercent)
        },
        alarms: {
          normal: infoRes.alarms?.normal ?? 0,
          warning: infoRes.alarms?.warning ?? 0,
          critical: infoRes.alarms?.critical ?? 0
        },
        osName: infoRes.os_name || 'AlmaLinux'
      })
      setTelemetryError(null)
    } catch (err) {
      console.warn('Erreur télémétrie Netdata:', err)
      setTelemetryError('Télémétrie non joignable (Vérifiez la connexion Tailscale)')
    } finally {
      setTelemetryLoading(false)
    }
  }, [tailscaleHost])

  // 2. Healthcheck de chaque service (côté client / navigateur)
  const checkAllServices = useCallback(async () => {
    setLastCheck(new Date())

    setServices(prev =>
      prev.map(s => ({
        ...s,
        status: 'checking'
      }))
    )

    const updated = await Promise.all(
      services.map(async service => {
        const start = performance.now()
        try {
          if (service.id === 'nextcloud') {
            const res = await fetch(service.checkUrl, { signal: AbortSignal.timeout(3500) })
            const latency = Math.round(performance.now() - start)
            if (res.ok) {
              const data = await res.json().catch(() => ({}))
              return {
                ...service,
                status: 'online' as const,
                latencyMs: latency,
                version: data.version ? `v${data.version}` : undefined
              }
            }
          } else if (service.id === 'netdata') {
            const res = await fetch(service.checkUrl, { signal: AbortSignal.timeout(3000) })
            const latency = Math.round(performance.now() - start)
            if (res.ok) {
              return {
                ...service,
                status: 'online' as const,
                latencyMs: latency
              }
            }
          }

          // Pour les autres services ou en no-cors
          await fetch(service.checkUrl, {
            mode: 'no-cors',
            cache: 'no-cache',
            signal: AbortSignal.timeout(3500)
          })
          const latency = Math.round(performance.now() - start)
          return {
            ...service,
            status: 'online' as const,
            latencyMs: latency
          }
        } catch {
          return {
            ...service,
            status: 'offline' as const,
            latencyMs: undefined
          }
        }
      })
    )

    setServices(updated)
  }, [services])

  // Initialisation et rafraîchissement
  useEffect(() => {
    fetchTelemetry()
    checkAllServices()
    const timer = setInterval(() => {
      fetchTelemetry()
    }, 15000) // Rafraîchit les jauges toutes les 15 secondes
    return () => clearInterval(timer)
  }, [fetchTelemetry, checkAllServices])

  const privateServices = services.filter(s => s.category === 'private')
  const publicServices = services.filter(s => s.category === 'public')

  return (
    <div className='flex flex-col gap-8 font-mono text-text-main'>
      {/* Barre d'action supérieure */}
      <div className='flex flex-wrap items-center justify-between gap-4 bg-bg-panel border-2 border-border-subtle p-4 shadow-xl'>
        <div className='flex items-center gap-3'>
          <span className='inline-block w-3 h-3 rounded-full bg-emerald-400 animate-pulse' />
          <div>
            <h1 className='text-sm md:text-base font-black uppercase tracking-wider text-white'>
              TOUR_DE_CONTRÔLE_INFRA &amp; SERVICES
            </h1>
            <p className='text-xs text-text-muted'>
              Hôte Tailscale : <span className='text-cyber-cyan'>{tailscaleHost}</span> • Dernière vérification :{' '}
              {lastCheck.toLocaleTimeString()}
            </p>
          </div>
        </div>

        <button
          type='button'
          onClick={() => {
            fetchTelemetry()
            checkAllServices()
          }}
          className='bg-cyber-yellow/20 text-cyber-yellow border border-cyber-yellow/50 hover:bg-cyber-yellow hover:text-black px-4 py-2 text-xs font-bold uppercase transition-all cursor-pointer shadow flex items-center gap-2'
        >
          <span>↻</span> Actualiser Tout
        </button>
      </div>

      {/* 1. SECTION MÉTÉO DU NAS (NETDATA) */}
      <section className='bg-bg-panel border-2 border-border-subtle p-6 shadow-2xl'>
        <div className='flex items-center justify-between border-b border-border-subtle pb-3 mb-6'>
          <h2 className='text-xs md:text-sm font-black uppercase tracking-widest text-cyber-yellow flex items-center gap-2'>
            <span>⚡</span> MÉTÉO_SYSTÈME_NAS (TÉLÉMÉTRIE EN DIRECT)
          </h2>
          {telemetry && (
            <span className='text-[11px] text-text-muted hidden md:inline'>
              Système : <strong className='text-gray-300'>{telemetry.osName}</strong>
            </span>
          )}
        </div>

        {telemetryLoading && !telemetry ? (
          <div className='p-8 text-center text-text-muted animate-pulse text-xs uppercase tracking-widest'>
            &gt; INTERROGATION_DES_CAPTEURS_NETDATA...
          </div>
        ) : telemetryError ? (
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
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {/* CPU */}
            <div className='bg-black/40 border border-border-subtle p-4 flex flex-col justify-between'>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-xs uppercase text-text-muted font-bold'>CPU Global</span>
                <span className='text-xs text-cyber-cyan font-bold'>{telemetry.cpuPercent}%</span>
              </div>
              <div className='w-full bg-gray-800 h-2.5 overflow-hidden mb-3 border border-gray-700'>
                <div
                  className={`h-full transition-all duration-500 ${
                    telemetry.cpuPercent > 80
                      ? 'bg-red-500'
                      : telemetry.cpuPercent > 50
                      ? 'bg-amber-400'
                      : 'bg-cyber-cyan'
                  }`}
                  style={{ width: `${Math.max(2, telemetry.cpuPercent)}%` }}
                />
              </div>
              <span className='text-[10px] text-gray-400 uppercase'>
                Charge processeur instantanée
              </span>
            </div>

            {/* RAM */}
            <div className='bg-black/40 border border-border-subtle p-4 flex flex-col justify-between'>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-xs uppercase text-text-muted font-bold'>Mémoire RAM</span>
                <span className='text-xs text-emerald-400 font-bold'>
                  {telemetry.ram.percent}%
                </span>
              </div>
              <div className='w-full bg-gray-800 h-2.5 overflow-hidden mb-3 border border-gray-700'>
                <div
                  className={`h-full transition-all duration-500 ${
                    telemetry.ram.percent > 85 ? 'bg-red-500' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${telemetry.ram.percent}%` }}
                />
              </div>
              <div className='flex justify-between text-[10px] text-gray-400 uppercase'>
                <span>Utilisé: {telemetry.ram.usedGiB} Go</span>
                <span>Total: {telemetry.ram.totalGiB} Go</span>
              </div>
            </div>

            {/* Stockage Disque */}
            <div className='bg-black/40 border border-border-subtle p-4 flex flex-col justify-between'>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-xs uppercase text-text-muted font-bold'>Stockage Disque (/)</span>
                <span className='text-xs text-cyber-yellow font-bold'>
                  {telemetry.disk.percent}%
                </span>
              </div>
              <div className='w-full bg-gray-800 h-2.5 overflow-hidden mb-3 border border-gray-700'>
                <div
                  className={`h-full transition-all duration-500 ${
                    telemetry.disk.percent > 90 ? 'bg-red-500' : 'bg-cyber-yellow'
                  }`}
                  style={{ width: `${telemetry.disk.percent}%` }}
                />
              </div>
              <div className='flex justify-between text-[10px] text-gray-400 uppercase'>
                <span>Libre: {telemetry.disk.availGiB} Go</span>
                <span>Total: {telemetry.disk.totalGiB} Go</span>
              </div>
            </div>

            {/* Alarmes & Santé */}
            <div className='bg-black/40 border border-border-subtle p-4 flex flex-col justify-between'>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-xs uppercase text-text-muted font-bold'>Santé Capteurs</span>
                <span
                  className={`text-xs font-bold ${
                    telemetry.alarms.critical > 0
                      ? 'text-red-400'
                      : telemetry.alarms.warning > 0
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {telemetry.alarms.critical > 0
                    ? 'CRITIQUE'
                    : telemetry.alarms.warning > 0
                    ? 'ATTENTION'
                    : 'NOMINAL'}
                </span>
              </div>
              <div className='flex items-center gap-2 mb-2'>
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${
                    telemetry.alarms.critical > 0
                      ? 'bg-red-500 animate-ping'
                      : 'bg-emerald-400'
                  }`}
                />
                <span className='text-xs font-bold text-white'>
                  {telemetry.alarms.normal} sondes actives
                </span>
              </div>
              <div className='text-[10px] text-gray-400 uppercase'>
                {telemetry.alarms.warning} avertissements • {telemetry.alarms.critical} alertes
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* 2. SECTION SERVICES PRIVÉS (TAILSCALE) */}
      <section className='bg-bg-panel border-2 border-border-subtle p-6 shadow-2xl'>
        <div className='flex items-center justify-between border-b border-border-subtle pb-3 mb-6'>
          <div>
            <h2 className='text-xs md:text-sm font-black uppercase tracking-widest text-white flex items-center gap-2'>
              <span>🔒</span> TOURS_DE_CONTRÔLE_PRIVÉES (TAILSCALE EXCLUSIF)
            </h2>
            <p className='text-[11px] text-text-muted mt-0.5'>
              Services d'administration et de données personnelles isolés sur{' '}
              <span className='text-cyber-cyan'>{tailscaleHost}</span>
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {privateServices.map(srv => {
            const isOnline = srv.status === 'online'
            const isChecking = srv.status === 'checking'

            return (
              <div
                key={srv.id}
                className='bg-black/30 border border-border-subtle p-5 flex flex-col justify-between hover:border-cyber-cyan/50 transition-colors'
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
                        isChecking
                          ? 'border-gray-600 bg-gray-800 text-gray-400 animate-pulse'
                          : isOnline
                          ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-400'
                          : 'border-red-500/50 bg-red-950/40 text-red-400'
                      }`}
                    >
                      {isChecking ? 'Ping...' : isOnline ? 'En Ligne' : 'Inaccessible'}
                    </span>
                  </div>

                  <p className='text-xs text-text-muted mb-4 line-clamp-2 leading-relaxed'>
                    {srv.role}
                  </p>
                </div>

                <div className='pt-3 border-t border-border-subtle/60 flex items-center justify-between gap-2'>
                  <div className='text-[10px] text-gray-500'>
                    {srv.latencyMs !== undefined && (
                      <span>Latence : <strong className='text-gray-300'>{srv.latencyMs} ms</strong></span>
                    )}
                    {srv.version && (
                      <span className='ml-2 text-cyber-cyan'>{srv.version}</span>
                    )}
                  </div>

                  <a
                    href={srv.mainUrl}
                    target='_blank'
                    rel='noreferrer'
                    className='text-xs font-bold text-cyber-cyan hover:text-white hover:underline flex items-center gap-1 uppercase'
                  >
                    <span>Ouvrir</span> ↗
                  </a>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bouton pour basculer l'iframe Grafana */}
        <div className='mt-6 pt-4 border-t border-border-subtle flex flex-col gap-4'>
          <div className='flex items-center justify-between'>
            <span className='text-xs text-text-muted uppercase'>
              Aperçu en direct Grafana (logs Loki &amp; historiques)
            </span>
            <button
              type='button'
              onClick={() => setShowGrafanaIframe(prev => !prev)}
              className='bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/40 hover:bg-cyber-cyan hover:text-black px-3 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer'
            >
              {showGrafanaIframe ? 'Masquer l\'Aperçu Grafana ▲' : 'Afficher l\'Aperçu Grafana ▼'}
            </button>
          </div>

          {showGrafanaIframe && (
            <div className='border-2 border-cyber-cyan/40 overflow-hidden bg-black mt-2'>
              <iframe
                title='Grafana Dashboard'
                src={`http://${tailscaleHost}:3000/?orgId=1`}
                className='w-full h-[600px] border-0'
              />
            </div>
          )}
        </div>
      </section>

      {/* 3. SECTION PROJETS PUBLICS (CLOUDFLARE) */}
      <section className='bg-bg-panel border-2 border-border-subtle p-6 shadow-2xl'>
        <div className='flex items-center justify-between border-b border-border-subtle pb-3 mb-6'>
          <div>
            <h2 className='text-xs md:text-sm font-black uppercase tracking-widest text-white flex items-center gap-2'>
              <span>🌐</span> PROJETS_PUBLICS (SOUS-DOMAINES CLOUDFLARE *.PAGUERA.FR)
            </h2>
            <p className='text-[11px] text-text-muted mt-0.5'>
              Statut opérationnel en direct de vos applications web hébergées sur le NAS
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {publicServices.map(srv => {
            const isOnline = srv.status === 'online'
            const isChecking = srv.status === 'checking'

            return (
              <div
                key={srv.id}
                className='bg-black/30 border border-border-subtle p-5 flex flex-col justify-between hover:border-cyber-yellow/50 transition-colors'
              >
                <div>
                  <div className='flex items-start justify-between gap-2 mb-2'>
                    <h3 className='text-sm font-black text-white uppercase tracking-wider'>
                      {srv.name}
                    </h3>

                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                        isChecking
                          ? 'border-gray-600 bg-gray-800 text-gray-400 animate-pulse'
                          : isOnline
                          ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-400'
                          : 'border-red-500/50 bg-red-950/40 text-red-400'
                      }`}
                    >
                      {isChecking ? 'Ping...' : isOnline ? 'En Ligne' : 'Inaccessible'}
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
                      <span className='text-[10px] text-gray-500 font-mono'>
                        {srv.latencyMs} ms
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
      </section>
    </div>
  )
}

export default InfraControlCenter
