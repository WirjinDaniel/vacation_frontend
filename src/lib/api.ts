// src/lib/api.ts — Cliente Axios con interceptors JWT

import axios from 'axios'
import type {
  Empleado, DashboardEmpleado, SolicitudVacaciones,
  CrearSolicitudInput, AprobarRRHHInput,
  RechazarInput, Notificacion,
} from '@/types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Interceptor: adjunta el token JWT a cada request ─────────────────────────
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('access_token')
    : null
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Interceptor: renueva el token si expiró ───────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'}/auth/refresh/`,
            { refresh }
          )
          localStorage.setItem('access_token', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login/', { email, password })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    return data
  },
  logout: async () => {
    const refresh = localStorage.getItem('refresh_token')
    await api.post('/auth/logout/', { refresh }).catch(() => {})
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },
}

// ══════════════════════════════════════════════════════════════════════════════
// EMPLEADOS
// ══════════════════════════════════════════════════════════════════════════════

export interface EstadisticasRRHH {
  total_empleados: number
  total_solicitudes: number
  solicitudes_anio: number
  por_estado: {
    pendiente_supervisor: number
    pendiente_rrhh: number
    aprobada: number
    rechazada: number
  }
  por_mes: Array<{ mes: string; cantidad: number }>
  por_departamento: Array<{
    departamento: string
    total: number
    aprobadas: number
    pendientes: number
  }>
  empleados_con_pendientes: Array<{
    id: string
    nombre: string
    departamento: string
    dias_pendientes: number
  }>
}

export const empleadosApi = {
  perfil: async (): Promise<Empleado> => {
    const { data } = await api.get('/empleados/yo/')
    return data
  },
  dashboard: async (): Promise<DashboardEmpleado> => {
    const { data } = await api.get('/empleados/yo/dashboard/')
    return data
  },
  lista: async (): Promise<Empleado[]> => {
    const { data } = await api.get('/empleados/')
    return data.results ?? data
  },
  actualizar: async (id: string, datos: Partial<Empleado>): Promise<Empleado> => {
    const { data } = await api.patch(`/empleados/${id}/`, datos)
    return data
  },
  crear: async (datos: Partial<Empleado>): Promise<Empleado> => {
    const { data } = await api.post('/empleados/', datos)
    return data
  },
  estadisticas: async (): Promise<EstadisticasRRHH> => {
    const { data } = await api.get('/empleados/estadisticas/')
    return data
  },
}

// ══════════════════════════════════════════════════════════════════════════════
// SOLICITUDES
// ══════════════════════════════════════════════════════════════════════════════

export const solicitudesApi = {
  lista: async (): Promise<SolicitudVacaciones[]> => {
    const { data } = await api.get('/solicitudes/')
    return data.results ?? data
  },
  detalle: async (id: string): Promise<SolicitudVacaciones> => {
    const { data } = await api.get(`/solicitudes/${id}/`)
    return data
  },
  crear: async (input: CrearSolicitudInput): Promise<SolicitudVacaciones> => {
    const { data } = await api.post('/solicitudes/', input)
    return data
  },
  editar: async (id: string, input: Partial<CrearSolicitudInput>): Promise<SolicitudVacaciones> => {
    const { data } = await api.patch(`/solicitudes/${id}/`, input)
    return data
  },
  // Flujo de aprobación
  aprobarSupervisor: async (id: string, comentario?: string) =>
    api.post(`/solicitudes/${id}/aprobar-supervisor/`, { comentario }),
  rechazarSupervisor: async (id: string, input: RechazarInput) =>
    api.post(`/solicitudes/${id}/rechazar-supervisor/`, input),
  aprobarRRHH: async (id: string, input: AprobarRRHHInput) =>
    api.post(`/solicitudes/${id}/aprobar-rrhh/`, input),
  rechazarRRHH: async (id: string, input: RechazarInput) =>
    api.post(`/solicitudes/${id}/rechazar-rrhh/`, input),
  exportarExcel: async (filtros?: { estado?: string; desde?: string; hasta?: string; departamento?: string }) => {
    const params = new URLSearchParams()
    if (filtros?.estado) params.append('estado', filtros.estado)
    if (filtros?.desde) params.append('desde', filtros.desde)
    if (filtros?.hasta) params.append('hasta', filtros.hasta)
    if (filtros?.departamento) params.append('departamento', filtros.departamento)
    
    const response = await api.get(`/solicitudes/exportar-excel/?${params.toString()}`, {
      responseType: 'blob'
    })
    
    // Descargar archivo
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'solicitudes_vacaciones.xlsx')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}

// ══════════════════════════════════════════════════════════════════════════════
// NOTIFICACIONES
// ══════════════════════════════════════════════════════════════════════════════

export const notificacionesApi = {
  lista: async (): Promise<Notificacion[]> => {
    const { data } = await api.get('/notificaciones/')
    return data.results ?? data
  },
  leer: async (id: string) => {
    await api.post(`/notificaciones/${id}/leer/`)
  },
  leerTodas: async () => {
    await api.post('/notificaciones/leer-todas/')
  },
}

export default api
