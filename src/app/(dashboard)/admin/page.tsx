'use client'
// src/app/(dashboard)/admin/page.tsx — Panel RRHH y Supervisores

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { solicitudesApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { SolicitudVacaciones, AprobarRRHHInput } from '@/types'
import ModalSeguimiento from '@/components/modals/ModalSeguimiento'
import ModalAprobacionRRHH from '@/components/modals/ModalAprobacionRRHH'
import ModalRechazo from '@/components/modals/ModalRechazo'
import ReporteSolicitud from '@/components/reports/ReporteSolicitud'

// ── Helper: verificar roles ────────────────────────────────────────────────
// empleado.roles es un array: ['empleado', 'hr', 'admin']
const tieneRol = (empleado: any, ...keys: string[]) =>
  Array.isArray(empleado?.roles) && keys.some(k => empleado.roles.includes(k))

// Configuración de estados
const ESTADO_CONFIG: Record<string, { label: string; color: string }> = {
  pendiente_supervisor: { label: 'Pendiente Supervisor', color: 'bg-orange-100 text-orange-700' },
  pendiente_rrhh:       { label: 'Pendiente RRHH',       color: 'bg-yellow-100 text-yellow-700' },
  aprobada:             { label: 'Aprobada',              color: 'bg-green-100 text-green-700'  },
  rechazada:            { label: 'Rechazada',             color: 'bg-red-100 text-red-700'      },
}

export default function AdminPage() {
  const { empleado } = useAuthStore()
  const [exportando,       setExportando]       = useState(false)
  const queryClient = useQueryClient()
  const [solicitudVer,     setSolicitudVer]     = useState<SolicitudVacaciones | null>(null)
  const [solicitudRRHH,    setSolicitudRRHH]    = useState<SolicitudVacaciones | null>(null)
  const [solicitudRechazo, setSolicitudRechazo] = useState<SolicitudVacaciones | null>(null)
  const [solicitudReporte, setSolicitudReporte] = useState<SolicitudVacaciones | null>(null)
  const [filtroEstado,     setFiltroEstado]     = useState('')

  // ── Roles del usuario actual ─────────────────────────────────────────────
  const esAdmin      = tieneRol(empleado, 'admin')
  const esRRHH       = tieneRol(empleado, 'hr', 'admin')
  const esSupervisor = tieneRol(empleado, 'supervisor', 'admin')

  // Título del panel según rol
  const tituloPabel = esRRHH && !esAdmin
    ? 'Recursos Humanos'
    : esAdmin
    ? 'Administración'
    : 'Supervisión'

  // ── Queries ───────────────────────────────────────────────────────────────
  const { data: solicitudes = [], isLoading } = useQuery({
    queryKey: ['solicitudes-admin'],
    queryFn:  solicitudesApi.lista,
  })

  const { mutateAsync: aprobarSupervisor, isPending: aprobandoSup } = useMutation({
    mutationFn: ({ id, comentario }: { id: string; comentario?: string }) =>
      solicitudesApi.aprobarSupervisor(id, comentario),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['solicitudes-admin'] }),
  })

  const { mutateAsync: rechazarSupervisor, isPending: rechazandoSup } = useMutation({
    mutationFn: ({ id, comentario }: { id: string; comentario: string }) =>
      solicitudesApi.rechazarSupervisor(id, { comentario }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['solicitudes-admin'] }),
  })

  const { mutateAsync: aprobarRRHH, isPending: aprobandoRRHH } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AprobarRRHHInput }) =>
      solicitudesApi.aprobarRRHH(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes-admin'] })
      setSolicitudRRHH(null)
    },
  })

  const { mutateAsync: rechazarRRHH, isPending: rechazandoRRHH } = useMutation({
    mutationFn: ({ id, comentario }: { id: string; comentario: string }) =>
      solicitudesApi.rechazarRRHH(id, { comentario }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes-admin'] })
      setSolicitudRRHH(null)
    },
  })

  const solicitudesFiltradas = filtroEstado
    ? solicitudes.filter((s: SolicitudVacaciones) => s.estado === filtroEstado)
    : solicitudes

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Encabezado */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h1 className="text-lg font-bold text-gray-900">
            Panel de {tituloPabel}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestione las solicitudes de vacaciones de su área
          </p>
          {/* Mostrar roles activos del usuario */}
          <div className="mt-2 flex gap-2 flex-wrap">
            {Array.isArray(empleado?.roles) && empleado.roles.map((r: string) => (
              <span
                key={r}
                className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
              >
                {r === 'hr' ? 'RRHH' : r.charAt(0).toUpperCase() + r.slice(1)}
              </span>
            ))}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente_supervisor">Pendiente — Supervisor</option>
              <option value="pendiente_rrhh">Pendiente — RRHH</option>
              <option value="aprobada">Aprobadas</option>
              <option value="rechazada">Rechazadas</option>
            </select>
            <span className="text-sm text-gray-500">{solicitudesFiltradas.length} solicitudes</span>
          </div>

          {/* ✅ CORREGIDO: era empleado.role ahora es tieneRol() */}
          {esRRHH && (
            <button
              onClick={async () => {
                setExportando(true)
                try {
                  await solicitudesApi.exportarExcel({ estado: filtroEstado || undefined })
                } catch (err) {
                  console.error('Error al exportar:', err)
                } finally {
                  setExportando(false)
                }
              }}
              disabled={exportando}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {exportando ? 'Exportando...' : 'Exportar Excel'}
            </button>
          )}
        </div>

        {/* Tabla de solicitudes */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {solicitudesFiltradas.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No hay solicitudes.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Empleado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Días</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Año</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Inicio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {solicitudesFiltradas.map((sol: SolicitudVacaciones) => {
                  const config = ESTADO_CONFIG[sol.estado] ?? { label: sol.estado, color: 'bg-gray-100 text-gray-700' }
                  return (
                    <tr key={sol.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{sol.empleado_detalle.nombre}</p>
                        <p className="text-xs text-gray-500">{sol.empleado_detalle.departamento}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{sol.dias_solicitados}</td>
                      <td className="px-4 py-3 text-gray-700">{sol.ano_aplica}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {format(new Date(sol.fecha_inicio), 'dd MMM', { locale: es })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">

                          {/* Ver siempre disponible */}
                          <button
                            onClick={() => setSolicitudVer(sol)}
                            className="rounded-lg border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-100"
                          >
                            Ver
                          </button>

                          {/* ✅ CORREGIDO: Botones supervisor — era empleado?.role === 'supervisor' */}
                          {esSupervisor && sol.estado === 'pendiente_supervisor' && (
                            <>
                              <button
                                onClick={() => aprobarSupervisor({ id: sol.id })}
                                disabled={aprobandoSup}
                                className="rounded-lg bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                              >
                                Aprobar
                              </button>
                              <button
                                onClick={() => setSolicitudRechazo(sol)}
                                disabled={rechazandoSup}
                                className="rounded-lg border border-red-300 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                              >
                                Rechazar
                              </button>
                            </>
                          )}

                          {/* ✅ CORREGIDO: Botón RRHH — era empleado?.role === 'hr' */}
                          {esRRHH && sol.estado === 'pendiente_rrhh' && (
                            <button
                              onClick={() => setSolicitudRRHH(sol)}
                              className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                            >
                              Validar
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal ver/seguimiento */}
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

      {/* Modal reporte para imprimir */}
      {solicitudReporte && (
        <ReporteSolicitud
          solicitud={solicitudReporte}
          onClose={() => setSolicitudReporte(null)}
        />
      )}

      {/* Modal aprobación RRHH */}
      {solicitudRRHH && (
        <ModalAprobacionRRHH
          solicitud={solicitudRRHH}
          onClose={() => setSolicitudRRHH(null)}
          isLoading={aprobandoRRHH || rechazandoRRHH}
          onAprobar={async (data) => { await aprobarRRHH({ id: solicitudRRHH.id, data }) }}
          onRechazar={async (comentario) => { await rechazarRRHH({ id: solicitudRRHH.id, comentario }) }}
        />
      )}

      {/* Modal rechazo supervisor */}
      {solicitudRechazo && (
        <ModalRechazo
          titulo="Rechazar Solicitud"
          subtitulo={`Rechazar solicitud de ${solicitudRechazo.empleado_detalle.nombre}`}
          placeholder="Indique el motivo del rechazo."
          minLength={10}
          isLoading={rechazandoSup}
          onClose={() => setSolicitudRechazo(null)}
          onConfirm={async (comentario) => {
            await rechazarSupervisor({ id: solicitudRechazo.id, comentario })
            setSolicitudRechazo(null)
          }}
        />
      )}
    </div>
  )
}