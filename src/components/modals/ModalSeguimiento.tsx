'use client'
// src/components/modals/ModalSeguimiento.tsx
// Modal de seguimiento — estado de solicitud + aprobaciones

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { X, CheckCircle2, XCircle, Clock, User, Building2, Printer } from 'lucide-react'
import type { SolicitudVacaciones } from '@/types'

// Configuración de estados
const ESTADO_CONFIG = {
  pendiente_supervisor: { label: 'Pendiente Supervisor', color: 'bg-orange-100 text-orange-700' },
  pendiente_rrhh:       { label: 'Pendiente RRHH', color: 'bg-yellow-100 text-yellow-700' },
  aprobada:             { label: 'Aprobada', color: 'bg-green-100 text-green-700' },
  rechazada:            { label: 'Rechazada', color: 'bg-red-100 text-red-700' },
}

interface Props {
  solicitud: SolicitudVacaciones
  onClose:   () => void
  onPrint?:  () => void
}

export default function ModalSeguimiento({ solicitud, onClose, onPrint }: Props) {
  const fmt = (d: string) => {
    try { return format(new Date(d), 'dd/MM/yyyy', { locale: es }) }
    catch { return d }
  }

  const config = ESTADO_CONFIG[solicitud.estado] || { label: solicitud.estado, color: 'bg-gray-100 text-gray-700' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">

        {/* ═══════════════════════════════════════════════════════════════════
            ENCABEZADO
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Instituto Nacional de Bienestar Estudiantil
            </p>
            <h2 className="mt-0.5 text-base font-semibold text-gray-900">
              Seguimiento de Solicitud de Vacaciones
            </h2>
            <div className="mt-2 flex justify-center">
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${config.color}`}>
                {config.label}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* ═══════════════════════════════════════════════════════════════════
              DATOS GENERALES
          ═══════════════════════════════════════════════════════════════════ */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <h3 className="bg-gray-100 text-center text-xs font-semibold uppercase text-gray-600 py-2 border-b border-gray-200">
              Datos Generales
            </h3>
            <div className="p-4 grid grid-cols-2 gap-4 text-sm">
              <Field label="Cédula"             value={solicitud.empleado_detalle.cedula} />
              <Field label="Fecha de Solicitud" value={fmt(solicitud.fecha_solicitud)} />
              <Field label="Nombre y Apellido"  value={solicitud.empleado_detalle.nombre} span />
              <Field label="Departamento"       value={solicitud.empleado_detalle.departamento} />
              <Field label="Cargo"              value={solicitud.empleado_detalle.cargo} />
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════════
              DATOS DE LA SOLICITUD
          ═══════════════════════════════════════════════════════════════════ */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <h3 className="bg-gray-100 text-center text-xs font-semibold uppercase text-gray-600 py-2 border-b border-gray-200">
              Datos de la Solicitud
            </h3>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Días solicitados</p>
                  <p className="font-semibold text-gray-900 text-lg">{solicitud.dias_solicitados}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Año que aplica</p>
                  <p className="font-semibold text-gray-900 text-lg">{solicitud.ano_aplica}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Total de días</p>
                  <p className="font-medium text-gray-900">{solicitud.total_dias}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Días pendientes (al crear)</p>
                  <p className="font-medium text-blue-700">{solicitud.dias_pendientes}</p>
                </div>
              </div>

              <div className="text-sm">
                <p className="text-xs text-gray-500">Fecha de inicio de disfrute</p>
                <p className="font-medium text-gray-900">{fmt(solicitud.fecha_inicio)}</p>
              </div>

              {/* Fecha de retorno (si está aprobada) */}
              {solicitud.fecha_retorno && (
                <div className="text-sm rounded-lg bg-green-50 border border-green-200 p-3">
                  <p className="text-xs text-green-700 font-medium">Fecha de retorno</p>
                  <p className="font-semibold text-green-900 text-lg">{fmt(solicitud.fecha_retorno)}</p>
                </div>
              )}

              {/* Comentario de RRHH */}
              {solicitud.comentario_rrhh && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p className="mb-1 text-xs font-semibold uppercase text-blue-700">
                    Comentario (Recursos Humanos)
                  </p>
                  <p className="text-sm text-blue-900">{solicitud.comentario_rrhh}</p>
                </div>
              )}
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════════
              APROBACIONES
          ═══════════════════════════════════════════════════════════════════ */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <h3 className="bg-gray-100 text-center text-xs font-semibold uppercase text-gray-600 py-2 border-b border-gray-200">
              Estado de Aprobaciones
            </h3>
            <div className="p-4 space-y-3">
              {/* Supervisor */}
              <AprobacionRow
                titulo="Superior Inmediato"
                icono={<User className="h-4 w-4" />}
                aprobado={solicitud.aprobacion?.aprobado_supervisor ?? null}
                firma={solicitud.aprobacion?.firma_supervisor}
                fecha={solicitud.aprobacion?.fecha_revision_supervisor}
              />

              {/* RRHH */}
              <AprobacionRow
                titulo="Recursos Humanos"
                icono={<Building2 className="h-4 w-4" />}
                aprobado={solicitud.aprobacion?.aprobado_rrhh ?? null}
                firma={solicitud.aprobacion?.firma_rrhh}
                fecha={solicitud.aprobacion?.fecha_revision_rrhh}
              />

              {/* Motivo de rechazo */}
              {solicitud.aprobacion?.comentario_rechazo && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 mt-3">
                  <p className="mb-1 text-xs font-semibold uppercase text-red-700">
                    Motivo del Rechazo
                  </p>
                  <p className="text-sm text-red-900">{solicitud.aprobacion.comentario_rechazo}</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            ACCIONES
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between">
          <div>
            {solicitud.estado === 'aprobada' && onPrint && (
              <button
                onClick={onPrint}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Printer className="h-4 w-4" />
                Imprimir Solicitud
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Componentes auxiliares ─────────────────────────────────────────────────────

function Field({ label, value, span = false }: { label: string; value: string; span?: boolean }) {
  return (
    <div className={span ? 'col-span-2' : ''}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-900 border-b border-gray-200 pb-1">{value}</p>
    </div>
  )
}

function AprobacionRow({
  titulo,
  icono,
  aprobado,
  firma,
  fecha,
}: {
  titulo: string
  icono: React.ReactNode
  aprobado: boolean | null
  firma?: string
  fecha?: string
}) {
  const formatFecha = (d?: string) => {
    if (!d) return ''
    try { return format(new Date(d), 'dd/MM/yyyy HH:mm', { locale: es }) }
    catch { return d }
  }

  return (
    <div className={`flex items-center justify-between rounded-lg p-3 ${
      aprobado === null 
        ? 'bg-gray-50 border border-gray-200' 
        : aprobado 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${
          aprobado === null ? 'bg-gray-200 text-gray-500' : aprobado ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
        }`}>
          {icono}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{titulo}</p>
          {firma && <p className="text-xs text-gray-500">Firma: {firma}</p>}
          {fecha && <p className="text-xs text-gray-400">{formatFecha(fecha)}</p>}
        </div>
      </div>
      <div>
        {aprobado === null ? (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-4 w-4" /> Pendiente
          </span>
        ) : aprobado ? (
          <span className="flex items-center gap-1 text-xs text-green-700">
            <CheckCircle2 className="h-4 w-4" /> Aprobado
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-red-700">
            <XCircle className="h-4 w-4" /> Rechazado
          </span>
        )}
      </div>
    </div>
  )
}
