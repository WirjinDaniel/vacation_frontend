'use client'
// src/app/(dashboard)/notificaciones/page.tsx — Lista de Notificaciones con acciones

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Check, CheckCheck, Clock, AlertCircle, CheckCircle, XCircle, Eye, Stamp } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { notificacionesApi, solicitudesApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { Notificacion, AprobarRRHHInput, SolicitudVacaciones } from '@/types'
import ModalAprobacionRRHH from '@/components/modals/ModalAprobacionRRHH'
import ModalSeguimiento from '@/components/modals/ModalSeguimiento'
import ReporteSolicitud from '@/components/reports/ReporteSolicitud'

const TIPO_ICONS: Record<string, React.ReactNode> = {
  nueva_solicitud: <Clock className="h-5 w-5 text-blue-500" />,
  aprobada_supervisor: <CheckCircle className="h-5 w-5 text-amber-500" />,
  aprobada_rrhh: <CheckCircle className="h-5 w-5 text-green-600" />,
  rechazada_supervisor: <XCircle className="h-5 w-5 text-red-500" />,
  rechazada_rrhh: <XCircle className="h-5 w-5 text-red-600" />,
  reenviada: <AlertCircle className="h-5 w-5 text-amber-500" />,
}

const TIPO_LABELS: Record<string, string> = {
  nueva_solicitud: 'Nueva solicitud recibida',
  aprobada_supervisor: 'Aprobada por supervisor — Pendiente RRHH',
  aprobada_rrhh: 'Aprobada por Recursos Humanos',
  rechazada_supervisor: 'Rechazada por supervisor',
  rechazada_rrhh: 'Rechazada por Recursos Humanos',
  reenviada: 'Solicitud reenviada',
}

export default function NotificacionesPage() {
  const queryClient = useQueryClient()
  const { empleado } = useAuthStore()
  const esRRHH = empleado?.role === 'hr' || empleado?.role === 'rrhh' || empleado?.role === 'admin'

  const [solicitudParaAprobar, setSolicitudParaAprobar] = useState<SolicitudVacaciones | null>(null)
  const [solicitudParaVer, setSolicitudParaVer] = useState<SolicitudVacaciones | null>(null)
  const [solicitudReporte, setSolicitudReporte] = useState<SolicitudVacaciones | null>(null)

  const { data: notificaciones = [], isLoading } = useQuery({
    queryKey: ['notificaciones'],
    queryFn: notificacionesApi.lista,
  })

  const { mutateAsync: marcarLeida, isPending: marcando } = useMutation({
    mutationFn: notificacionesApi.leer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificaciones'] }),
  })

  const { mutateAsync: marcarTodas, isPending: marcandoTodas } = useMutation({
    mutationFn: notificacionesApi.leerTodas,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificaciones'] }),
  })

  // Mutaciones para aprobar/rechazar RRHH
  const { mutateAsync: aprobarRRHH, isPending: aprobandoRRHH } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AprobarRRHHInput }) =>
      solicitudesApi.aprobarRRHH(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] })
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] })
      setSolicitudParaAprobar(null)
    },
  })

  const { mutateAsync: rechazarRRHH, isPending: rechazandoRRHH } = useMutation({
    mutationFn: ({ id, comentario }: { id: string; comentario: string }) =>
      solicitudesApi.rechazarRRHH(id, { comentario }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] })
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] })
      setSolicitudParaAprobar(null)
    },
  })

  // Cargar solicitud completa para ver/aprobar
  const handleVerSolicitud = async (notif: Notificacion) => {
    try {
      const solicitud = await solicitudesApi.detalle(notif.solicitud)
      setSolicitudParaVer(solicitud)
      if (!notif.leida) {
        marcarLeida(notif.id)
      }
    } catch (error) {
      console.error('Error cargando solicitud:', error)
    }
  }

  const handleAprobar = async (notif: Notificacion) => {
    try {
      const solicitud = await solicitudesApi.detalle(notif.solicitud)
      setSolicitudParaAprobar(solicitud)
      if (!notif.leida) {
        marcarLeida(notif.id)
      }
    } catch (error) {
      console.error('Error cargando solicitud:', error)
    }
  }

  const noLeidas = notificaciones.filter(n => !n.leida).length
  const pendientesRRHH = notificaciones.filter(n => 
    n.tipo === 'aprobada_supervisor' && 
    n.solicitud_detalle?.estado === 'pendiente_rrhh'
  )

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Notificaciones</h1>
            <p className="text-sm text-gray-500">
              {noLeidas > 0 ? `${noLeidas} sin leer` : 'Todas leídas'}
              {esRRHH && pendientesRRHH.length > 0 && (
                <span className="ml-2 text-amber-600 font-medium">
                  • {pendientesRRHH.length} pendientes de aprobación
                </span>
              )}
            </p>
          </div>
          {noLeidas > 0 && (
            <button
              onClick={() => marcarTodas()}
              disabled={marcandoTodas}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas como leídas
            </button>
          )}
        </div>

        {/* Alerta para RRHH si hay pendientes */}
        {esRRHH && pendientesRRHH.length > 0 && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <div className="flex items-center gap-3">
              <Stamp className="h-6 w-6 text-amber-600" />
              <div>
                <h3 className="text-sm font-semibold text-amber-800">
                  Solicitudes pendientes de su aprobación
                </h3>
                <p className="text-sm text-amber-700">
                  Hay {pendientesRRHH.length} solicitud(es) aprobadas por supervisor que requieren su autorización.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Lista de notificaciones */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {notificaciones.length === 0 ? (
            <div className="p-10 text-center">
              <Bell className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">No tiene notificaciones</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notificaciones.map((notif) => {
                const esPendienteRRHH = notif.tipo === 'aprobada_supervisor' && 
                                        notif.solicitud_detalle?.estado === 'pendiente_rrhh'
                
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition ${
                      !notif.leida ? 'bg-blue-50/50' : ''
                    } ${esPendienteRRHH && esRRHH ? 'border-l-4 border-amber-400' : ''}`}
                  >
                    {/* Icono */}
                    <div className="flex-shrink-0 mt-0.5">
                      {TIPO_ICONS[notif.tipo] || <Bell className="h-5 w-5 text-gray-400" />}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notif.leida ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                        {TIPO_LABELS[notif.tipo] || notif.tipo_display}
                      </p>
                      
                      {/* Detalles de la solicitud */}
                      {notif.solicitud_detalle && (
                        <div className="mt-1 text-xs text-gray-500 space-y-0.5">
                          <p>
                            <span className="font-medium">{notif.solicitud_detalle.empleado_nombre}</span>
                            {' — '}{notif.solicitud_detalle.dias_solicitados} días desde{' '}
                            {format(new Date(notif.solicitud_detalle.fecha_inicio), 'dd/MM/yyyy', { locale: es })}
                          </p>
                          <p className="text-gray-400">
                            Año: {notif.solicitud_detalle.ano_aplica} | 
                            Solicitado: {format(new Date(notif.solicitud_detalle.fecha_solicitud), 'dd/MM/yyyy', { locale: es })}
                          </p>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(notif.enviada_en), "EEEE, d 'de' MMMM yyyy 'a las' HH:mm", { locale: es })}
                      </p>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Ver detalles */}
                      <button
                        onClick={() => handleVerSolicitud(notif)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* Botón aprobar para RRHH */}
                      {esRRHH && esPendienteRRHH && (
                        <button
                          onClick={() => handleAprobar(notif)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition"
                        >
                          <Stamp className="h-3.5 w-3.5" />
                          Aprobar
                        </button>
                      )}

                      {/* Marcar como leída */}
                      {!notif.leida && (
                        <button
                          onClick={() => marcarLeida(notif.id)}
                          disabled={marcando}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                          title="Marcar como leída"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal ver solicitud */}
      {solicitudParaVer && (
        <ModalSeguimiento
          solicitud={solicitudParaVer}
          onClose={() => setSolicitudParaVer(null)}
          onPrint={() => {
            setSolicitudReporte(solicitudParaVer)
            setSolicitudParaVer(null)
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
      {solicitudParaAprobar && (
        <ModalAprobacionRRHH
          solicitud={solicitudParaAprobar}
          onClose={() => setSolicitudParaAprobar(null)}
          isLoading={aprobandoRRHH || rechazandoRRHH}
          onAprobar={async (data) => { await aprobarRRHH({ id: solicitudParaAprobar.id, data }) }}
          onRechazar={async (comentario) => { await rechazarRRHH({ id: solicitudParaAprobar.id, comentario }) }}
        />
      )}
    </div>
  )
}
