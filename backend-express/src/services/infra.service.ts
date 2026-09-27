import os from 'os'
import fs from 'fs'
import db from '../config/database.js'

export interface TelemetryPoint {
  time: number
  value: number
}

export interface TelemetryData {
  source: 'netdata' | 'system'
  netdataOnline: boolean
  cpuPercent: number
  cpuHistory?: TelemetryPoint[]
  ram: {
    usedGiB: number
    totalGiB: number
    freeGiB: number
    percent: number
  }
  ramHistory?: TelemetryPoint[]
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
  uptimeSeconds: number
}

export interface ServiceHealth {
  id: string
  name: string
  category: 'public' | 'private'
  role: string
  mainUrl: string
  secondaryUrl?: { label: string; url: string } | undefined
  port?: number | undefined
  checkUrl?: string | undefined
  status: 'online' | 'offline'
  latencyMs?: number | undefined
  httpCode?: number | undefined
  version?: string | undefined
  lastChecked: string
}

const TAILSCALE_HOST = process.env.TAILSCALE_IP || '100.80.76.84'
const NETDATA_BASE_URL = process.env.NETDATA_URL || `http://${TAILSCALE_HOST}:19999`
const NEXTCLOUD_BASE_URL = process.env.NEXTCLOUD_URL || `http://${TAILSCALE_HOST}:8088`
const GRAFANA_BASE_URL = process.env.GRAFANA_URL || `http://${TAILSCALE_HOST}:3000`

/**
 * Récupération de la télémétrie complète (Netdata en priorité avec repli sur le système)
 */
export async function getTelemetry(): Promise<TelemetryData> {
  const urlsToTry = [
    NETDATA_BASE_URL,
    'http://127.0.0.1:19999',
    'http://localhost:19999',
    'http://host.docker.internal:19999',
  ]

  let workingNetdataUrl: string | null = null

  for (const baseUrl of urlsToTry) {
    try {
      const pingRes = await fetch(`${baseUrl}/api/v1/info`, {
        signal: AbortSignal.timeout(1500),
      })
      if (pingRes.ok) {
        workingNetdataUrl = baseUrl
        break
      }
    } catch {
      // continuer la boucle
    }
  }

  if (workingNetdataUrl) {
    try {
      const [infoRes, cpuRes, ramRes, diskRes] = await Promise.all([
        fetch(`${workingNetdataUrl}/api/v1/info`, { signal: AbortSignal.timeout(3000) }).then((r) => r.json() as Promise<any>),
        fetch(`${workingNetdataUrl}/api/v1/data?chart=system.cpu&points=20&after=-60`, {
          signal: AbortSignal.timeout(3000),
        }).then((r) => r.json() as Promise<any>),
        fetch(`${workingNetdataUrl}/api/v1/data?chart=system.ram&points=20&after=-60`, {
          signal: AbortSignal.timeout(3000),
        }).then((r) => r.json() as Promise<any>),
        fetch(`${workingNetdataUrl}/api/v1/data?chart=disk_space.%2F&points=1`, {
          signal: AbortSignal.timeout(3000),
        }).then((r) => r.json() as Promise<any>).catch(async () => {
          return fetch(`${workingNetdataUrl}/api/v1/data?chart=disk_space._&points=1`, {
            signal: AbortSignal.timeout(3000),
          }).then((r) => r.json() as Promise<any>).catch(() => null)
        }),
      ])

      // Calcul CPU
      const cpuRows: any[] = (cpuRes && cpuRes.data) || []
      const cpuHistory: TelemetryPoint[] = []
      let latestCpuActive = 0

      if (cpuRows.length > 0) {
        const ordered = [...cpuRows].reverse()
        ordered.forEach((row) => {
          const timestamp = row[0]
          const activeSum = row.slice(1).reduce((acc: number, val: number) => acc + (val || 0), 0)
          const clamped = Math.min(100, Math.max(0, Math.round(activeSum * 10) / 10))
          cpuHistory.push({ time: timestamp, value: clamped })
        })
        const latestRow = cpuRows[0]
        latestCpuActive = latestRow.slice(1).reduce((acc: number, val: number) => acc + (val || 0), 0)
      }

      // Calcul RAM
      const ramRows: any[] = (ramRes && ramRes.data) || []
      const ramHistory: TelemetryPoint[] = []
      let ramFree = 0
      let ramUsed = 0
      let ramCached = 0
      let ramBuffers = 0

      if (ramRows.length > 0) {
        const ordered = [...ramRows].reverse()
        ordered.forEach((row) => {
          const timestamp = row[0]
          const f = (row[1] || 0) / 1024
          const u = (row[2] || 0) / 1024
          const c = (row[3] || 0) / 1024
          const b = (row[4] || 0) / 1024
          const tot = f + u + c + b
          const pct = tot > 0 ? Math.round((u / tot) * 100) : 0
          ramHistory.push({ time: timestamp, value: pct })
        })

        const latestRam = ramRows[0]
        ramFree = (latestRam[1] || 0) / 1024
        ramUsed = (latestRam[2] || 0) / 1024
        ramCached = (latestRam[3] || 0) / 1024
        ramBuffers = (latestRam[4] || 0) / 1024
      }

      const ramTotal = ramFree + ramUsed + ramCached + ramBuffers
      const ramPercent = ramTotal > 0 ? (ramUsed / ramTotal) * 100 : 0

      // Calcul Disque /
      let diskAvail = 0
      let diskUsed = 0
      let diskTotalCalc = 0

      if (diskRes && diskRes.data && diskRes.data[0]) {
        const diskData = diskRes.data[0]
        diskAvail = diskData[1] || 0
        diskUsed = diskData[2] || 0
        diskTotalCalc = diskAvail + diskUsed
      } else {
        try {
          const stats = fs.statfsSync('/')
          const totalB = stats.blocks * stats.bsize
          const freeB = stats.bavail * stats.bsize
          const usedB = totalB - freeB
          diskTotalCalc = totalB / (1024 * 1024 * 1024)
          diskUsed = usedB / (1024 * 1024 * 1024)
          diskAvail = freeB / (1024 * 1024 * 1024)
        } catch {
          // ignorer
        }
      }

      const diskPercent = diskTotalCalc > 0 ? (diskUsed / diskTotalCalc) * 100 : 0

      return {
        source: 'netdata',
        netdataOnline: true,
        cpuPercent: Math.min(100, Math.round(latestCpuActive * 10) / 10),
        cpuHistory,
        ram: {
          usedGiB: Math.round(ramUsed * 10) / 10,
          totalGiB: Math.round(ramTotal * 10) / 10,
          freeGiB: Math.round((ramFree + ramCached + ramBuffers) * 10) / 10,
          percent: Math.round(ramPercent),
        },
        ramHistory,
        disk: {
          usedGiB: Math.round(diskUsed),
          totalGiB: Math.round(diskTotalCalc),
          availGiB: Math.round(diskAvail),
          percent: Math.round(diskPercent),
        },
        alarms: {
          normal: infoRes?.alarms?.normal ?? 0,
          warning: infoRes?.alarms?.warning ?? 0,
          critical: infoRes?.alarms?.critical ?? 0,
        },
        osName: infoRes?.os_name || 'AlmaLinux',
        uptimeSeconds: os.uptime(),
      }
    } catch (err) {
      console.warn('Erreur lors de la lecture Netdata, bascule sur les métriques système:', err)
    }
  }

  // Fallback direct sur les modules système Node.js
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const usedMem = totalMem - freeMem
  const ramPercent = totalMem > 0 ? (usedMem / totalMem) * 100 : 0

  const cpus = os.cpus()
  let cpuPercent = 0
  if (cpus && cpus.length > 0) {
    let totalIdle = 0
    let totalTick = 0
    cpus.forEach((cpu) => {
      for (const type in cpu.times) {
        totalTick += (cpu.times as any)[type]
      }
      totalIdle += cpu.times.idle
    })
    cpuPercent = totalTick > 0 ? Math.round(((totalTick - totalIdle) / totalTick) * 100) : 0
  }

  let diskAvail = 0
  let diskUsed = 0
  let diskTotal = 0
  let diskPercent = 0

  try {
    const stats = fs.statfsSync('/')
    const totalB = stats.blocks * stats.bsize
    const freeB = stats.bavail * stats.bsize
    const usedB = totalB - freeB
    diskTotal = totalB / (1024 * 1024 * 1024)
    diskUsed = usedB / (1024 * 1024 * 1024)
    diskAvail = freeB / (1024 * 1024 * 1024)
    diskPercent = diskTotal > 0 ? (diskUsed / diskTotal) * 100 : 0
  } catch {
    // Si statfs échoue
  }

  return {
    source: 'system',
    netdataOnline: false,
    cpuPercent,
    ram: {
      usedGiB: Math.round((usedMem / (1024 * 1024 * 1024)) * 10) / 10,
      totalGiB: Math.round((totalMem / (1024 * 1024 * 1024)) * 10) / 10,
      freeGiB: Math.round((freeMem / (1024 * 1024 * 1024)) * 10) / 10,
      percent: Math.round(ramPercent),
    },
    disk: {
      usedGiB: Math.round(diskUsed),
      totalGiB: Math.round(diskTotal),
      availGiB: Math.round(diskAvail),
      percent: Math.round(diskPercent),
    },
    alarms: {
      normal: 0,
      warning: 0,
      critical: 0,
    },
    osName: `${os.type()} ${os.release()}`,
    uptimeSeconds: os.uptime(),
  }
}

/**
 * Healthcheck de tous les services (effectué côté serveur de façon fiable)
 */
export async function getServicesHealth(): Promise<ServiceHealth[]> {
  const serviceDefinitions: Array<{
    id: string
    name: string
    category: 'public' | 'private'
    role: string
    mainUrl: string
    secondaryUrl?: { label: string; url: string }
    port?: number
    checkUrl?: string
    fallbackCheckUrls?: string[]
    isDatabase?: boolean
  }> = [
    // --- Services Privés (Tailscale) ---
    {
      id: 'nextcloud',
      name: 'Nextcloud Hub',
      category: 'private',
      role: 'Cloud privé, stockage de fichiers & synchronisation',
      port: 8088,
      mainUrl: `http://${TAILSCALE_HOST}:8088`,
      checkUrl: `${NEXTCLOUD_BASE_URL}/status.php`,
      fallbackCheckUrls: ['http://127.0.0.1:8088/status.php', 'http://localhost:8088/status.php'],
    },
    {
      id: 'netdata',
      name: 'Netdata Real-Time',
      category: 'private',
      role: 'Télémétrie seconde par seconde & météo des capteurs du NAS',
      port: 19999,
      mainUrl: `http://${TAILSCALE_HOST}:19999`,
      checkUrl: `${NETDATA_BASE_URL}/api/v1/info`,
      fallbackCheckUrls: ['http://127.0.0.1:19999/api/v1/info', 'http://localhost:19999/api/v1/info'],
    },
    {
      id: 'grafana',
      name: 'Grafana & Loki',
      category: 'private',
      role: "Dashboards d'observabilité & agrégation des logs conteneurs",
      port: 3000,
      mainUrl: `http://${TAILSCALE_HOST}:3000`,
      checkUrl: `${GRAFANA_BASE_URL}/api/health`,
      fallbackCheckUrls: ['http://127.0.0.1:3000/api/health', 'http://localhost:3000/api/health'],
    },
    {
      id: 'postgres',
      name: 'Base de données PostgreSQL',
      category: 'private',
      role: 'Stockage persistant Portfolio (visiteurs, projets, messages)',
      port: Number(process.env.DB_PORT) || 5432,
      mainUrl: '#',
      isDatabase: true,
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
    },
    {
      id: 'marsai',
      name: 'MarsAI Platform',
      category: 'public',
      role: 'Génération & traitement vidéo par IA (Modèles Whisper & ClamAV)',
      mainUrl: 'https://marsai.paguera.fr',
      secondaryUrl: { label: 'API Backend', url: 'https://marsai-api.paguera.fr' },
      checkUrl: 'https://marsai.paguera.fr',
    },
    {
      id: 'geaidubol',
      name: 'Geai du Bol',
      category: 'public',
      role: 'E-commerce atelier céramique (Next.js + Sylius Headless)',
      mainUrl: 'https://geaidubol.paguera.fr',
      secondaryUrl: { label: 'Admin Sylius', url: 'https://geaidubol-admin.paguera.fr/admin' },
      checkUrl: 'https://geaidubol.paguera.fr',
    },
    {
      id: 'merise',
      name: 'Merise Forge',
      category: 'public',
      role: 'Studio visuel Cyberpunk de modélisation MCD / MLD / MPD SQL',
      mainUrl: 'https://merise-forge.paguera.fr',
      checkUrl: 'https://merise-forge.paguera.fr',
    },
    {
      id: 'memo',
      name: 'Jeu du Memo',
      category: 'public',
      role: 'Application interactive React / Vite - Cartes & paires',
      mainUrl: 'https://memo.paguera.fr',
      checkUrl: 'https://memo.paguera.fr',
    },
    {
      id: 'tictactoe',
      name: 'Morpion Tic-Tac-Toe',
      category: 'public',
      role: 'Jeu classique rétro interactif',
      mainUrl: 'https://tic-tac-toe.paguera.fr',
      checkUrl: 'https://tic-tac-toe.paguera.fr',
    },
  ]

  const now = new Date().toISOString()

  const results: ServiceHealth[] = await Promise.all(
    serviceDefinitions.map(async (srv): Promise<ServiceHealth> => {
      const start = performance.now()

      // Cas spécifique pour PostgreSQL
      if (srv.isDatabase) {
        try {
          const dbRes = await db.pool.query('SELECT version()')
          const latency = Math.round(performance.now() - start)
          const versionString = dbRes.rows[0]?.version || ''
          const shortVersion = versionString.split(' ')[1] || '15.x'
          return {
            id: srv.id,
            name: srv.name,
            category: srv.category,
            role: srv.role,
            mainUrl: srv.mainUrl,
            port: srv.port,
            status: 'online',
            latencyMs: latency,
            httpCode: 200,
            version: `PostgreSQL ${shortVersion}`,
            lastChecked: now,
          }
        } catch {
          return {
            id: srv.id,
            name: srv.name,
            category: srv.category,
            role: srv.role,
            mainUrl: srv.mainUrl,
            port: srv.port,
            status: 'offline',
            latencyMs: undefined,
            lastChecked: now,
          }
        }
      }

      const urlsToCheck = [srv.checkUrl, ...(srv.fallbackCheckUrls || [])].filter(Boolean) as string[]

      for (const url of urlsToCheck) {
        const pingStart = performance.now()
        try {
          const res = await fetch(url, {
            signal: AbortSignal.timeout(3500),
            headers: {
              'User-Agent': 'Portfolio-Infra-Monitor/1.0',
            },
          })

          const latency = Math.round(performance.now() - pingStart)
          let version: string | undefined

          if (srv.id === 'nextcloud') {
            try {
              const data: any = await res.clone().json()
              if (data?.versionstring) {
                version = `v${data.versionstring}`
              } else if (data?.version) {
                version = `v${data.version}`
              }
            } catch {
              // ignorer
            }
          } else if (srv.id === 'netdata') {
            try {
              const data: any = await res.clone().json()
              if (data?.version) {
                version = `${data.version.split('-')[0]}`
              }
            } catch {
              // ignorer
            }
          }

          // Statut < 500 considéré en ligne (ex: 200, 301, 302, 401, 403)
          if (res.status < 500) {
            return {
              id: srv.id,
              name: srv.name,
              category: srv.category,
              role: srv.role,
              mainUrl: srv.mainUrl,
              secondaryUrl: srv.secondaryUrl,
              port: srv.port,
              checkUrl: url,
              status: 'online',
              latencyMs: latency,
              httpCode: res.status,
              version,
              lastChecked: now,
            }
          }
        } catch {
          // Continuer au fallback suivant
        }
      }

      return {
        id: srv.id,
        name: srv.name,
        category: srv.category,
        role: srv.role,
        mainUrl: srv.mainUrl,
        secondaryUrl: srv.secondaryUrl,
        port: srv.port,
        checkUrl: srv.checkUrl,
        status: 'offline',
        latencyMs: undefined,
        lastChecked: now,
      }
    })
  )

  return results
}
