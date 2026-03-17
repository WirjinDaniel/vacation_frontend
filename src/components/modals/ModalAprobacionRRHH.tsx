'use client'
// src/components/modals/ModalAprobacionRRHH.tsx
// Modal exclusivo para RRHH — aprobar o rechazar una solicitud

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { X, CheckCircle, XCircle, Stamp, CalendarCheck } from 'lucide-react'
import type { SolicitudVacaciones, AprobarRRHHInput } from '@/types'

const schemaAprobar = z.object({
  comentario_rrhh: z.string().min(5, 'El comentario es obligatorio.').max(500),
  fecha_retorno: z.string().min(1, 'La fecha de retorno es obligatoria.'),
})
const schemaRechazar = z.object({
  comentario: z.string().min(5, 'Debe indicar el motivo del rechazo.').max(500),
})

type FormAprobar  = z.infer<typeof schemaAprobar>
type FormRechazar = z.infer<typeof schemaRechazar>

interface Props {
  solicitud:  SolicitudVacaciones
  onClose:    () => void
  onAprobar:  (data: AprobarRRHHInput) => Promise<void>
  onRechazar: (comentario: string) => Promise<void>
  isLoading?: boolean
}

export default function ModalAprobacionRRHH({ solicitud, onClose, onAprobar, onRechazar, isLoading }: Props) {
  const fmt = (d: string) => {
    try { return format(new Date(d), 'dd/MM/yyyy', { locale: es }) }
    catch { return d }
  }

  // Calcular fecha de retorno sugerida (fecha_inicio + dias_solicitados)
  const calcFechaRetorno = () => {
    try {
      const fechaInicio = new Date(solicitud.fecha_inicio)
      const fechaRetorno = addDays(fechaInicio, solicitud.dias_solicitados)
      return format(fechaRetorno, 'yyyy-MM-dd')
    } catch {
      return ''
    }
  }

  const formAprobar = useForm<FormAprobar>({
    resolver: zodResolver(schemaAprobar),
    defaultValues: { comentario_rrhh: '', fecha_retorno: calcFechaRetorno() },
  })
  const formRechazar = useForm<FormRechazar>({
    resolver: zodResolver(schemaRechazar),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">

        {/* ═══════════════════════════════════════════════════════════════════
            ENCABEZADO
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Stamp className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Departamento de Recursos Humanos
              </p>
            </div>
            <h2 className="mt-1 text-base font-semibold text-gray-900">
              Validación de Solicitud de Vacaciones
            </h2>
          </div>
          <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* ═══════════════════════════════════════════════════════════════════
              DATOS GENERALES — lectura
          ═══════════════════════════════════════════════════════════════════ */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <h3 className="bg-gray-100 text-center text-xs font-semibold uppercase text-gray-600 py-2 border-b border-gray-200">
              Datos Generales
            </h3>
            <div className="p-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400">Cédula</p>
                <p className="font-medium">{solicitud.empleado_detalle.cedula}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Fecha de Solicitud</p>
                <p className="font-medium">{fmt(solicitud.fecha_solicitud)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-400">Nombre y Apellido</p>
                <p className="font-semibold text-gray-900">{solicitud.empleado_detalle.nombre}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Departamento</p>
                <p className="font-medium">{solicitud.empleado_detalle.departamento}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Cargo</p>
                <p className="font-medium">{solicitud.empleado_detalle.cargo}</p>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════════
              DATOS DE LA SOLICITUD — lectura
          ═══════════════════════════════════════════════════════════════════ */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <h3 className="bg-gray-100 text-center text-xs font-semibold uppercase text-gray-600 py-2 border-b border-gray-200">
              Datos de la Solicitud
            </h3>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Días solicitados</p>
                  <p className="font-semibold text-lg">{solicitud.dias_solicitados}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Año que aplica</p>
                  <p className="font-semibold text-lg">{solicitud.ano_aplica}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Total de días</p>
                  <p className="font-medium">{solicitud.total_dias}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Días pendientes (al crear)</p>
                  <p className="font-medium text-blue-700">{solicitud.dias_pendientes}</p>
                </div>
              </div>
              <div className="text-sm">
                <p className="text-xs text-gray-400">Fecha de inicio de disfrute</p>
                <p className="font-medium">{fmt(solicitud.fecha_inicio)}</p>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════════
              FORMULARIO APROBAR
          ═══════════════════════════════════════════════════════════════════ */}
          <section className="border border-green-200 bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Aprobar Solicitud
            </h3>
            <form onSubmit={formAprobar.handleSubmit(d => onAprobar({ comentario_rrhh: d.comentario_rrhh, fecha_retorno: d.fecha_retorno }))} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <CalendarCheck className="inline h-3 w-3 mr-1" />
                  Fecha de Retorno *
                </label>
                <input
                  type="date"
                  {...formAprobar.register('fecha_retorno')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                />
                {formAprobar.formState.errors.fecha_retorno && (
                  <p className="mt-1 text-xs text-red-600">{formAprobar.formState.errors.fecha_retorno.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Comentario (para uso de Recursos Humanos) *
                </label>
                <textarea
                  {...formAprobar.register('comentario_rrhh')}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  placeholder="Ej: Autorizado conforme a disponibilidad del departamento..."
                />
                {formAprobar.formState.errors.comentario_rrhh && (
                  <p className="mt-1 text-xs text-red-600">{formAprobar.formState.errors.comentario_rrhh.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                {isLoading ? 'Procesando...' : 'Aprobar Solicitud'}
              </button>
            </form>
          </section>

          {/* ═══════════════════════════════════════════════════════════════════
              FORMULARIO RECHAZAR
          ═══════════════════════════════════════════════════════════════════ */}
          <section className="border border-red-200 bg-red-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Rechazar Solicitud
            </h3>
            <form onSubmit={formRechazar.handleSubmit(d => onRechazar(d.comentario))} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Motivo del rechazo *
                </label>
                <textarea
                  {...formRechazar.register('comentario')}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  placeholder="Indique el motivo del rechazo..."
                />
                {formRechazar.formState.errors.comentario && (
                  <p className="mt-1 text-xs text-red-600">{formRechazar.formState.errors.comentario.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                {isLoading ? 'Procesando...' : 'Rechazar Solicitud'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
