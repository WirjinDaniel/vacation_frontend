'use client'
// src/app/(dashboard)/page.tsx — Dashboard del empleado mejorado con barras de progreso

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarPlus, CalendarCheck2, CalendarX, Clock, AlertTriangle, TrendingUp, Calendar, Users, Stamp, ChevronRight, CheckCircle, XCircle, UserCheck } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { empleadosApi, solicitudesApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { SolicitudVacaciones } from '@/types'
import ModalSolicitudVacaciones from '@/components/modals/ModalSolicitudVacaciones'
import ModalSeguimiento from '@/components/modals/ModalSeguimiento'
import ModalAprobacionRRHH from '@/components/modals/ModalAprobacionRRHH'
import ReporteSolicitud from '@/components/reports/ReporteSolicitud'

// Mapeo de estados a colores y labels
const ESTADO_CONFIG = {
  pendiente_supervisor: { label: 'Pendiente Supervisor', color: 'bg-orange-100 text-orange-700', iconColor: 'text-orange-500' },
  pendiente_rrhh:       { label: 'Pendiente RRHH', color: 'bg-yellow-100 text-yellow-700', iconColor: 'text-yellow-500' },
  aprobada:             { label: 'Aprobada', color: 'bg-green-100 text-green-700', iconColor: 'text-green-500' },
  rechazada:            { label: 'Rechazada', color: 'bg-red-100 text-red-700', iconColor: 'text-red-500' },
}

export default function DashboardPage() {
  const queryClient = useQueryClient()
  const { empleado: currentUser, modoAcceso } = useAuthStore()
  const [showModalCrear,   setShowModalCrear]   = useState(false)
  const [solicitudActiva,  setSolicitudActiva]  = useState<SolicitudVacaciones | null>(null)
  const [solicitudReporte, setSolicitudReporte] = useState<SolicitudVacaciones | null>(null)
  const [solicitudAprobar, setSolicitudAprobar] = useState<SolicitudVacaciones | null>(null)

  const esSupervisor = currentUser?.role === 'supervisor' || currentUser?.role === 'admin' || currentUser?.role === 'hr' || currentUser?.role === 'rrhh'
  const esRRHH = currentUser?.role === 'hr' || currentUser?.role === 'rrhh' || currentUser?.role === 'admin'
  
  // Vista según modo de acceso
  const vistaEmpleado = modoAcceso === 'empleado'
  const vistaSupervisor = modoAcceso === 'supervisor'

  // Datos
  const { data: dashboard, isLoading: loadingDash, error: errorDash } = useQuery({
    queryKey: ['dashboard'],
    queryFn:  empleadosApi.dashboard,
    retry: false,
  })

  const { data: perfil } = useQuery({
    queryKey: ['perfil'],
    queryFn:  empleadosApi.perfil,
    retry: false,
  })

  const { data: solicitudes = [], isLoading: loadingSols } = useQuery({
    queryKey: ['solicitudes'],
    queryFn:  solicitudesApi.lista,
    retry: false,
  })
  
  // Solicitudes de subordinados (para modo supervisor)
  const { data: solicitudesSubordinados = [] } = useQuery({
    queryKey: ['solicitudes', 'subordinados'],
    queryFn:  solicitudesApi.lista,
    enabled: vistaSupervisor && esSupervisor,
  })

  // Crear solicitud
  const { mutateAsync: crearSolicitud, isPending: creando } = useMutation({
    mutationFn: solicitudesApi.crear,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setShowModalCrear(false)
    },
  })
  
  // Aprobar solicitud (supervisor)
  const { mutateAsync: aprobarSolicitud } = useMutation({
    mutationFn: ({ id, comentario }: { id: string; comentario?: string }) =>
      solicitudesApi.aprobarSupervisor(id, comentario),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setSolicitudAprobar(null)
    },
  })
  
  // Rechazar solicitud (supervisor)
  const { mutateAsync: rechazarSolicitud } = useMutation({
    mutationFn: ({ id, comentario }: { id: string; comentario: string }) =>
      solicitudesApi.rechazarSupervisor(id, { comentario }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  if (loadingDash || loadingSols) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (errorDash) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-2 text-gray-600">Error al cargar datos.</p>
        </div>
      </div>
    )
  }

  if (!dashboard) return null

  // Calcular porcentaje para barra de progreso
  const diasUsados = dashboard.dias_vacaciones_correspondientes - dashboard.dias_pendientes
  const porcentajeUsado = dashboard.dias_vacaciones_correspondientes > 0 
    ? (diasUsados / dashboard.dias_vacaciones_correspondientes) * 100 
    : 0
  
  // Filtrar solicitudes pendientes de subordinados
  const solicitudesPendientesEquipo = solicitudesSubordinados.filter(
    s => s.estado === 'pendiente_supervisor' && s.empleado_detalle?.id !== currentUser?.id
  )

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* ═══════════════════════════════════════════════════════════════════
            INDICADOR DE MODO DE ACCESO
        ═══════════════════════════════════════════════════════════════════ */}
        <div className={`rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 ${
          vistaSupervisor 
            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
            : 'bg-purple-50 text-purple-700 border border-purple-200'
        }`}>
          {vistaSupervisor ? (
            <>
              <Users className="h-4 w-4" />
              Modo Supervisor — Gestión de equipo
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4" />
              Modo Empleado — Mis vacaciones
            </>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            ENCABEZADO — Datos Generales del formulario INABIE
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-center mb-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Instituto Nacional de Bienestar Estudiantil
            </p>
            <p className="text-xs text-gray-400">Departamento de Recursos Humanos</p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <p className="text-xs text-gray-400">Cédula</p>
              <p className="font-semibold text-gray-900">{dashboard.cedula}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Departamento</p>
              <p className="font-medium text-gray-900">{dashboard.departamento}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-400">Nombre y Apellido</p>
              <p className="text-lg font-bold text-gray-900">{dashboard.nombre}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Cargo</p>
              <p className="font-medium text-gray-900">{dashboard.cargo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Fecha de Ingreso</p>
              <p className="font-medium text-gray-900">
                {dashboard.fecha_ingreso 
                  ? format(new Date(dashboard.fecha_ingreso), 'dd/MM/yyyy')
                  : 'No disponible'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Años de Servicios en la Institución</p>
              <p className="font-medium text-gray-900">{dashboard.anos_servicio_institucion} años</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total de años de servicios en el Estado</p>
              <p className="font-semibold text-blue-700">{dashboard.anos_servicio_estado} años</p>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            BALANCE DE VACACIONES — BARRA DE PROGRESO MEJORADA
        ═══════════════════════════════════════════════════════════════════ */}
        {vistaEmpleado && (
          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Balance de Vacaciones {new Date().getFullYear()}
              </h2>
              {dashboard.puede_solicitar_vacaciones && (
                <button
                  onClick={() => setShowModalCrear(true)}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm"
                >
                  <CalendarPlus className="h-4 w-4" />
                  Nueva solicitud
                </button>
              )}
            </div>
            
            {!dashboard.puede_solicitar_vacaciones ? (
              <div className="flex items-center gap-2 rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-700">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">No cumple requisitos</p>
                  <p className="text-xs mt-0.5">Debe completar 1 año en la institución para solicitar vacaciones.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Barra de progreso principal */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {diasUsados} días usados de {dashboard.dias_vacaciones_correspondientes}
                    </span>
                    <span className="font-bold text-blue-700">
                      {dashboard.dias_pendientes} disponibles
                    </span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${porcentajeUsado}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0 días</span>
                    <span>{Math.round(porcentajeUsado)}% utilizado</span>
                    <span>{dashboard.dias_vacaciones_correspondientes} días</span>
                  </div>
                </div>

                {/* Cards de detalle */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
                    <p className="text-2xl font-bold text-gray-900">{dashboard.dias_vacaciones_correspondientes}</p>
                    <p className="text-xs text-gray-500">Correspondientes</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
                    <p className="text-2xl font-bold text-blue-600">{diasUsados}</p>
                    <p className="text-xs text-gray-500">Utilizados</p>
                  </div>
                  <div className="rounded-lg p-3 text-center border border-green-200 bg-green-50">
                    <p className="text-2xl font-bold text-green-600">{dashboard.dias_pendientes}</p>
                    <p className="text-xs text-green-600">Disponibles</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            PANEL SUPERVISOR — SOLICITUDES DEL EQUIPO
        ═══════════════════════════════════════════════════════════════════ */}
        {vistaSupervisor && esSupervisor && (
          <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Solicitudes Pendientes de Mi Equipo
              </h2>
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {dashboard.solicitudes_subordinados_pendientes || 0}
              </span>
            </div>
            
            {solicitudesPendientesEquipo.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No hay solicitudes pendientes de aprobación</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {solicitudesPendientesEquipo.map((sol) => (
                  <div
                    key={sol.id}
                    className="bg-white rounded-lg border border-blue-100 p-4 hover:border-blue-300 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {sol.empleado_detalle?.nombre || 'Nombre no disponible'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {sol.empleado_detalle?.departamento} · {sol.empleado_detalle?.cargo}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          <span className="text-gray-600">
                            {sol.dias_solicitados} días
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">
                            Desde {format(new Date(sol.fecha_inicio), 'dd MMM yyyy', { locale: es })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => rechazarSolicitud({ id: sol.id, comentario: 'Rechazado por supervisor' })}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Rechazar"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => aprobarSolicitud({ id: sol.id })}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Aprobar"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setSolicitudActiva(sol)}
                          className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition"
                          title="Ver detalles"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TARJETAS DE ESTADÍSTICAS (Modo empleado)
        ═══════════════════════════════════════════════════════════════════ */}
        {vistaEmpleado && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="Total"
              value={dashboard.total_solicitudes}
              icon={<CalendarPlus className="h-5 w-5 text-gray-500" />}
              bg="bg-gray-100"
            />
            <StatCard
              label="Aprobadas"
              value={dashboard.aprobadas}
              icon={<CalendarCheck2 className="h-5 w-5 text-green-600" />}
              bg="bg-green-50"
              color="text-green-700"
            />
            <StatCard
              label="Pendientes"
              value={dashboard.pendientes}
              icon={<Clock className="h-5 w-5 text-yellow-600" />}
              bg="bg-yellow-50"
              color="text-yellow-700"
            />
            <StatCard
              label="Rechazadas"
              value={dashboard.rechazadas}
              icon={<CalendarX className="h-5 w-5 text-red-500" />}
              bg="bg-red-50"
              color="text-red-700"
            />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TARJETAS DE ROL ESPECIAL (Supervisor / RRHH) - solo en modo empleado
        ═══════════════════════════════════════════════════════════════════ */}
        {vistaEmpleado && (esSupervisor || esRRHH) && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {esSupervisor && dashboard.solicitudes_subordinados_pendientes !== undefined && (
              <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-blue-700">
                      {dashboard.solicitudes_subordinados_pendientes}
                    </p>
                    <p className="text-sm text-blue-600">
                      Solicitudes de subordinados pendientes
                    </p>
                  </div>
                </div>
                {dashboard.solicitudes_subordinados_pendientes > 0 && (
                  <p className="mt-3 text-xs text-blue-500">
                    Tienes solicitudes de tus empleados esperando tu aprobación.
                  </p>
                )}
              </div>
            )}

            {esRRHH && dashboard.solicitudes_rrhh_pendientes !== undefined && (
              <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <Stamp className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-amber-700">
                      {dashboard.solicitudes_rrhh_pendientes}
                    </p>
                    <p className="text-sm text-amber-600">
                      Solicitudes pendientes de RRHH
                    </p>
                  </div>
                </div>
                {dashboard.solicitudes_rrhh_pendientes > 0 && (
                  <p className="mt-3 text-xs text-amber-500">
                    Solicitudes aprobadas por supervisor que requieren tu autorización.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            MIS SOLICITUDES (Modo empleado)
        ═══════════════════════════════════════════════════════════════════ */}
        {vistaEmpleado && (
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              Mis Solicitudes
            </h2>
            {solicitudes.length === 0 ? (
              <div className="py-8 text-center">
                <CalendarPlus className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No tiene solicitudes aún.</p>
                <p className="text-xs text-gray-400 mt-1">Haga clic en "Nueva solicitud" para crear una.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {solicitudes.map((sol) => {
                  const config = ESTADO_CONFIG[sol.estado] || { label: sol.estado, color: 'bg-gray-100 text-gray-700', iconColor: 'text-gray-500' }
                  return (
                    <button
                      key={sol.id}
                      onClick={() => setSolicitudActiva(sol)}
                      className="w-full flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-left hover:border-blue-200 hover:bg-blue-50 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {sol.dias_solicitados} días — Año {sol.ano_aplica}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Desde {format(new Date(sol.fecha_inicio), 'dd MMM yyyy', { locale: es })}
                            {sol.fecha_retorno && ` - Retorno: ${format(new Date(sol.fecha_retorno), 'dd MMM yyyy', { locale: es })}`}
                            {' · '}
                            Solicitado: {format(new Date(sol.fecha_solicitud), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${config.color}`}>
                          {config.label}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition" />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MODALES
      ═══════════════════════════════════════════════════════════════════ */}
      {showModalCrear && perfil && (
        <ModalSolicitudVacaciones
          empleado={perfil}
          onClose={() => setShowModalCrear(false)}
          onSubmit={crearSolicitud}
          isLoading={creando}
        />
      )}

      {solicitudActiva && (
        <ModalSeguimiento
          solicitud={solicitudActiva}
          onClose={() => setSolicitudActiva(null)}
          onPrint={() => {
            setSolicitudReporte(solicitudActiva)
            setSolicitudActiva(null)
          }}
        />
      )}

      {solicitudReporte && (
        <ReporteSolicitud
          solicitud={solicitudReporte}
          onClose={() => setSolicitudReporte(null)}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, icon, bg, color = 'text-gray-900' }: {
  label: string; value: number; icon: React.ReactNode; bg: string; color?: string
}) {
  return (
    <div className={`rounded-xl p-4 ${bg}`}>
      <div className="mb-1">{icon}</div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}
