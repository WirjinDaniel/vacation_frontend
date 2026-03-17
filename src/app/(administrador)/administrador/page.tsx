'use client'
// src/app/(administrador)/administrador/page.tsx — Dashboard principal del administrador

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Users, Calendar, CheckCircle, XCircle, Clock, TrendingUp, 
  Building2, AlertTriangle, Download, RefreshCw, Eye
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { empleadosApi, solicitudesApi, EstadisticasRRHH } from '@/lib/api'
import type { SolicitudVacaciones, AprobarRRHHInput } from '@/types'
import ModalAprobacionRRHH from '@/components/modals/ModalAprobacionRRHH'
import ModalSeguimiento from '@/components/modals/ModalSeguimiento'
import ReporteSolicitud from '@/components/reports/ReporteSolicitud'

// Configuración de estados
const ESTADO_CONFIG = {
  pendiente_supervisor: { label: 'Pend. Supervisor', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  pendiente_rrhh:       { label: 'Pend. RRHH', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  aprobada:             { label: 'Aprobada', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  rechazada:            { label: 'Rechazada', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
}

export default function AdminDashboardPage() {
  const queryClient = useQueryClient()
  const [solicitudModal, setSolicitudModal] = useState<SolicitudVacaciones | null>(null)
  const [solicitudVer, setSolicitudVer] = useState<SolicitudVacaciones | null>(null)
  const [solicitudReporte, setSolicitudReporte] = useState<SolicitudVacaciones | null>(null)
  const [exportando, setExportando] = useState(false)

  // Datos
  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useQuery({
    queryKey: ['estadisticas-admin'],
    queryFn: empleadosApi.estadisticas,
  })

  const { data: solicitudes = [], isLoading: loadingSolicitudes } = useQuery({
    queryKey: ['solicitudes-admin'],
    queryFn: solicitudesApi.lista,
  })

  // Mutations
  const { mutateAsync: aprobarRRHH, isPending: aprobando } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AprobarRRHHInput }) => 
      solicitudesApi.aprobarRRHH(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes-admin'] })
      queryClient.invalidateQueries({ queryKey: ['estadisticas-admin'] })
      setSolicitudModal(null)
    },
  })

  const { mutateAsync: rechazarRRHH, isPending: rechazando } = useMutation({
    mutationFn: ({ id, comentario }: { id: string; comentario: string }) => 
      solicitudesApi.rechazarRRHH(id, { comentario }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes-admin'] })
      queryClient.invalidateQueries({ queryKey: ['estadisticas-admin'] })
      setSolicitudModal(null)
    },
  })

  // Solicitudes pendientes de RRHH
  const solicitudesPendientes = solicitudes.filter(s => s.estado === 'pendiente_rrhh')

  // Exportar Excel
  const handleExportar = async () => {
    setExportando(true)
    try {
      await solicitudesApi.exportarExcel({})
    } finally {
      setExportando(false)
    }
  }

  const fmt = (d: string) => {
    try { return format(new Date(d), 'dd/MM/yyyy', { locale: es }) }
    catch { return d }
  }

  if (loadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-sm text-gray-500">Vista general del sistema de vacaciones</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetchStats()}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
          <button
            onClick={handleExportar}
            disabled={exportando}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {exportando ? 'Exportando...' : 'Exportar Excel'}
          </button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          titulo="Total Empleados"
          valor={stats?.total_empleados || 0}
          icono={<Users className="h-5 w-5 text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard
          titulo="Solicitudes del Año"
          valor={stats?.solicitudes_anio || 0}
          icono={<Calendar className="h-5 w-5 text-purple-600" />}
          color="bg-purple-50"
        />
        <StatCard
          titulo="Pendientes RRHH"
          valor={stats?.por_estado?.pendiente_rrhh || 0}
          icono={<Clock className="h-5 w-5 text-yellow-600" />}
          color="bg-yellow-50"
          destacar
        />
        <StatCard
          titulo="Aprobadas"
          valor={stats?.por_estado?.aprobada || 0}
          icono={<CheckCircle className="h-5 w-5 text-green-600" />}
          color="bg-green-50"
        />
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Solicitudes pendientes de aprobar */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Solicitudes Pendientes de RRHH</h2>
              <p className="text-xs text-gray-500">Requieren aprobación de Recursos Humanos</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
              {solicitudesPendientes.length} pendientes
            </span>
          </div>
          
          <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
            {loadingSolicitudes ? (
              <div className="p-8 text-center text-gray-400">Cargando...</div>
            ) : solicitudesPendientes.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-300" />
                <p>No hay solicitudes pendientes</p>
              </div>
            ) : (
              solicitudesPendientes.map((sol) => (
                <div key={sol.id} className="px-5 py-4 hover:bg-gray-50 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                        {sol.empleado_detalle?.nombre?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 truncate">{sol.empleado_detalle?.nombre}</p>
                        <p className="text-xs text-gray-500">{sol.empleado_detalle?.departamento} · {sol.empleado_detalle?.cargo}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-lg font-bold text-gray-900">{sol.dias_solicitados}</p>
                    <p className="text-xs text-gray-500">días</p>
                  </div>
                  <div className="text-right px-4">
                    <p className="text-sm text-gray-900">{fmt(sol.fecha_inicio)}</p>
                    <p className="text-xs text-gray-500">Año {sol.ano_aplica}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSolicitudVer(sol)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title="Ver detalle"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setSolicitudModal(sol)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      Procesar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Estadísticas por estado */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Estado de Solicitudes</h2>
            <p className="text-xs text-gray-500">Distribución del año actual</p>
          </div>
          <div className="p-5 space-y-4">
            <EstadoBar 
              label="Pendiente Supervisor"
              valor={stats?.por_estado?.pendiente_supervisor || 0}
              total={stats?.solicitudes_anio || 1}
              color="bg-orange-500"
            />
            <EstadoBar 
              label="Pendiente RRHH"
              valor={stats?.por_estado?.pendiente_rrhh || 0}
              total={stats?.solicitudes_anio || 1}
              color="bg-yellow-500"
            />
            <EstadoBar 
              label="Aprobadas"
              valor={stats?.por_estado?.aprobada || 0}
              total={stats?.solicitudes_anio || 1}
              color="bg-green-500"
            />
            <EstadoBar 
              label="Rechazadas"
              valor={stats?.por_estado?.rechazada || 0}
              total={stats?.solicitudes_anio || 1}
              color="bg-red-500"
            />
          </div>
        </div>
      </div>

      {/* Segunda fila */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Por departamento */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              Solicitudes por Departamento
            </h2>
          </div>
          <div className="p-5">
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {stats?.por_departamento?.map((dept, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{dept.departamento}</p>
                    <div className="flex gap-3 text-xs mt-1">
                      <span className="text-green-600">{dept.aprobadas} aprobadas</span>
                      <span className="text-yellow-600">{dept.pendientes} pendientes</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{dept.total}</p>
                    <p className="text-xs text-gray-500">total</p>
                  </div>
                </div>
              )) || (
                <p className="text-center text-gray-400 py-8">Sin datos</p>
              )}
            </div>
          </div>
        </div>

        {/* Empleados con muchos días pendientes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Empleados con Días Pendientes
            </h2>
            <p className="text-xs text-gray-500">Más de 20 días sin disfrutar</p>
          </div>
          <div className="p-5">
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {stats?.empleados_con_pendientes?.length ? (
                stats.empleados_con_pendientes.map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div>
                      <p className="font-medium text-gray-900">{emp.nombre}</p>
                      <p className="text-xs text-gray-500">{emp.departamento}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-600">{emp.dias_pendientes}</p>
                      <p className="text-xs text-gray-500">días</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-8">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-300" />
                  Todos los empleados al día
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla completa de solicitudes recientes */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Solicitudes Recientes</h2>
          <p className="text-xs text-gray-500">Últimas 20 solicitudes del sistema</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500">Empleado</th>
                <th className="px-5 py-3 font-medium text-gray-500">Departamento</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-center">Días</th>
                <th className="px-5 py-3 font-medium text-gray-500">Fecha Inicio</th>
                <th className="px-5 py-3 font-medium text-gray-500">Estado</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {solicitudes.slice(0, 20).map((sol) => {
                const config = ESTADO_CONFIG[sol.estado] || { label: sol.estado, color: 'bg-gray-100 text-gray-700' }
                return (
                  <tr key={sol.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                          {sol.empleado_detalle?.nombre?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{sol.empleado_detalle?.nombre}</p>
                          <p className="text-xs text-gray-500">{sol.empleado_detalle?.cedula}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{sol.empleado_detalle?.departamento}</td>
                    <td className="px-5 py-3 text-center font-semibold">{sol.dias_solicitados}</td>
                    <td className="px-5 py-3 text-gray-600">{fmt(sol.fecha_inicio)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${config.color}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setSolicitudVer(sol)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                          title="Ver"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {sol.estado === 'pendiente_rrhh' && (
                          <button
                            onClick={() => setSolicitudModal(sol)}
                            className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded hover:bg-green-100"
                          >
                            Procesar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales */}
      {solicitudVer && (
        <ModalSeguimiento
          solicitud={solicitudVer}
          onClose={() => setSolicitudVer(null)}
          onPrint={() => {
            setSolicitudReporte(solicitudVer)
            setSolicitudVer(null)
          }}
        />
      )}

      {solicitudReporte && (
        <ReporteSolicitud
          solicitud={solicitudReporte}
          onClose={() => setSolicitudReporte(null)}
        />
      )}

      {solicitudModal && (
        <ModalAprobacionRRHH
          solicitud={solicitudModal}
          onClose={() => setSolicitudModal(null)}
          isLoading={aprobando || rechazando}
          onAprobar={async (data) => {
            await aprobarRRHH({ id: solicitudModal.id, data })
          }}
          onRechazar={async (comentario) => {
            await rechazarRRHH({ id: solicitudModal.id, comentario })
          }}
        />
      )}
    </div>
  )
}

// Componentes auxiliares
function StatCard({ titulo, valor, icono, color, destacar = false }: {
  titulo: string
  valor: number
  icono: React.ReactNode
  color: string
  destacar?: boolean
}) {
  return (
    <div className={`rounded-xl p-5 ${color} ${destacar ? 'ring-2 ring-yellow-400' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-white/60 rounded-lg">{icono}</div>
        {destacar && <span className="text-xs font-medium text-yellow-700 bg-yellow-200 px-2 py-0.5 rounded-full">Requiere acción</span>}
      </div>
      <p className="text-3xl font-bold text-gray-900">{valor}</p>
      <p className="text-sm text-gray-600 mt-1">{titulo}</p>
    </div>
  )
}

function EstadoBar({ label, valor, total, color }: {
  label: string
  valor: number
  total: number
  color: string
}) {
  const porcentaje = total > 0 ? Math.round((valor / total) * 100) : 0
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{valor} ({porcentaje}%)</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${porcentaje}%` }} />
      </div>
    </div>
  )
}
