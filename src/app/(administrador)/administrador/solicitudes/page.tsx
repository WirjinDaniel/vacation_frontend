'use client'
// src/app/(administrador)/administrador/solicitudes/page.tsx — Gestión de solicitudes

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Search, Filter, Download, Eye, CheckCircle, XCircle, 
  Calendar, ChevronDown, RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { solicitudesApi } from '@/lib/api'
import type { SolicitudVacaciones, AprobarRRHHInput } from '@/types'
import ModalAprobacionRRHH from '@/components/modals/ModalAprobacionRRHH'
import ModalSeguimiento from '@/components/modals/ModalSeguimiento'
import ReporteSolicitud from '@/components/reports/ReporteSolicitud'

const ESTADOS = [
  { value: '', label: 'Todos los estados' },
  { value: 'pendiente_supervisor', label: 'Pendiente Supervisor' },
  { value: 'pendiente_rrhh', label: 'Pendiente RRHH' },
  { value: 'aprobada', label: 'Aprobadas' },
  { value: 'rechazada', label: 'Rechazadas' },
]

const ESTADO_CONFIG: Record<string, { label: string; color: string }> = {
  pendiente_supervisor: { label: 'Pend. Supervisor', color: 'bg-orange-100 text-orange-700' },
  pendiente_rrhh:       { label: 'Pend. RRHH', color: 'bg-yellow-100 text-yellow-700' },
  aprobada:             { label: 'Aprobada', color: 'bg-green-100 text-green-700' },
  rechazada:            { label: 'Rechazada', color: 'bg-red-100 text-red-700' },
}

export default function SolicitudesAdminPage() {
  const queryClient = useQueryClient()
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroBusqueda, setFiltroBusqueda] = useState('')
  const [solicitudModal, setSolicitudModal] = useState<SolicitudVacaciones | null>(null)
  const [solicitudVer, setSolicitudVer] = useState<SolicitudVacaciones | null>(null)
  const [solicitudReporte, setSolicitudReporte] = useState<SolicitudVacaciones | null>(null)
  const [exportando, setExportando] = useState(false)

  const { data: solicitudes = [], isLoading, refetch } = useQuery({
    queryKey: ['solicitudes-admin'],
    queryFn: solicitudesApi.lista,
  })

  const { mutateAsync: aprobarRRHH, isPending: aprobando } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AprobarRRHHInput }) => 
      solicitudesApi.aprobarRRHH(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes-admin'] })
      setSolicitudModal(null)
    },
  })

  const { mutateAsync: rechazarRRHH, isPending: rechazando } = useMutation({
    mutationFn: ({ id, comentario }: { id: string; comentario: string }) => 
      solicitudesApi.rechazarRRHH(id, { comentario }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes-admin'] })
      setSolicitudModal(null)
    },
  })

  // Filtrar solicitudes
  const solicitudesFiltradas = solicitudes.filter((sol) => {
    const matchEstado = !filtroEstado || sol.estado === filtroEstado
    const matchBusqueda = !filtroBusqueda || 
      sol.empleado_detalle?.nombre?.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
      sol.empleado_detalle?.cedula?.includes(filtroBusqueda) ||
      sol.empleado_detalle?.departamento?.toLowerCase().includes(filtroBusqueda.toLowerCase())
    return matchEstado && matchBusqueda
  })

  const handleExportar = async () => {
    setExportando(true)
    try {
      await solicitudesApi.exportarExcel({ estado: filtroEstado || undefined })
    } finally {
      setExportando(false)
    }
  }

  const fmt = (d: string) => {
    try { return format(new Date(d), 'dd/MM/yyyy', { locale: es }) }
    catch { return d }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Solicitudes</h1>
          <p className="text-sm text-gray-500">Administra todas las solicitudes de vacaciones</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleExportar}
            disabled={exportando}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {exportando ? 'Exportando...' : 'Exportar'}
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, cédula o departamento..."
              value={filtroBusqueda}
              onChange={(e) => setFiltroBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
          
          {/* Filtro por estado */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 appearance-none bg-white"
            >
              {ESTADOS.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
        
        {/* Resumen de filtros */}
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
          <span>Mostrando {solicitudesFiltradas.length} de {solicitudes.length} solicitudes</span>
          {(filtroEstado || filtroBusqueda) && (
            <button
              onClick={() => { setFiltroEstado(''); setFiltroBusqueda(''); }}
              className="text-purple-600 hover:text-purple-700"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mx-auto" />
            <p className="mt-2 text-gray-500">Cargando solicitudes...</p>
          </div>
        ) : solicitudesFiltradas.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No se encontraron solicitudes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-5 py-3 font-medium text-gray-500">Empleado</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Departamento</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-center">Días</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Fecha Inicio</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Fecha Retorno</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Año</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Estado</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {solicitudesFiltradas.map((sol) => {
                  const config = ESTADO_CONFIG[sol.estado] || { label: sol.estado, color: 'bg-gray-100 text-gray-700' }
                  return (
                    <tr key={sol.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                            {sol.empleado_detalle?.nombre?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{sol.empleado_detalle?.nombre}</p>
                            <p className="text-xs text-gray-500">{sol.empleado_detalle?.cedula}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-gray-900">{sol.empleado_detalle?.departamento}</p>
                        <p className="text-xs text-gray-500">{sol.empleado_detalle?.cargo}</p>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-700 font-bold">
                          {sol.dias_solicitados}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{fmt(sol.fecha_inicio)}</td>
                      <td className="px-5 py-4 text-gray-600">
                        {sol.fecha_retorno ? fmt(sol.fecha_retorno) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-5 py-4 text-gray-600">{sol.ano_aplica}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${config.color}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSolicitudVer(sol)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            title="Ver detalle"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {sol.estado === 'pendiente_rrhh' && (
                            <>
                              <button
                                onClick={() => setSolicitudModal(sol)}
                                className="p-2 text-green-600 hover:text-green-700 rounded-lg hover:bg-green-50"
                                title="Aprobar"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
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
