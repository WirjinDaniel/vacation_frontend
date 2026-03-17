'use client'
// src/components/modals/ModalSolicitudVacaciones.tsx
// Modal para CREAR una nueva solicitud — diseño idéntico al formulario físico INABIE
// Con selector visual multi-año

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, addDays, isWeekend, nextMonday } from 'date-fns'
import { es } from 'date-fns/locale'
import { X, CalendarDays, AlertCircle, Send, Calendar, Minus, Plus, Info } from 'lucide-react'
import type { Empleado, CrearSolicitudInput } from '@/types'

// ── Validación ────────────────────────────────────────────────────────────────
const schema = z.object({
  dias_solicitados: z.coerce.number().min(1, 'Mínimo 1 día').max(60, 'Máximo 60 días'),
  fecha_inicio:     z.string().min(1, 'Fecha de inicio obligatoria'),
  ano_aplica:       z.coerce.number().min(2020, 'Año inválido').max(2050, 'Año inválido'),
})
type FormData = z.infer<typeof schema>

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  empleado:   Empleado
  onClose:    () => void
  onSubmit:   (data: CrearSolicitudInput) => Promise<unknown>
  isLoading?: boolean
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function ModalSolicitudVacaciones({ empleado, onClose, onSubmit, isLoading }: Props) {
  const anoActual = new Date().getFullYear()
  const anoAnterior = anoActual - 1

  // Estado para selección multi-año
  const [diasPorAno, setDiasPorAno] = useState<Record<number, number>>({
    [anoAnterior]: 0,
    [anoActual]: 0,
  })

  // Estado para error del backend
  const [error, setError] = useState<string | null>(null)
  
  // Simular días disponibles por año (esto vendría del backend idealmente)
  // Por ahora asignamos los días pendientes al año actual
  const diasDisponiblesPorAno: Record<number, number> = useMemo(() => ({
    [anoAnterior]: Math.min(15, Math.floor(empleado.dias_pendientes * 0.3)), // 30% al año anterior (ejemplo)
    [anoActual]: Math.ceil(empleado.dias_pendientes * 0.7), // 70% al año actual
  }), [empleado.dias_pendientes, anoActual, anoAnterior])
  
  const totalDiasSeleccionados = Object.values(diasPorAno).reduce((a, b) => a + b, 0)
  const anoConMasDias = Object.entries(diasPorAno).sort((a, b) => b[1] - a[1])[0]?.[0] || anoActual
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      dias_solicitados: 0,
      fecha_inicio: '',
      ano_aplica: anoActual,
    },
  })

  // Actualizar formulario cuando cambian los días por año
  const actualizarDias = (ano: number, incremento: number) => {
    const nuevoDias = Math.max(0, Math.min(
      diasDisponiblesPorAno[ano] || 0,
      (diasPorAno[ano] || 0) + incremento
    ))
    
    const nuevosDiasPorAno = {
      ...diasPorAno,
      [ano]: nuevoDias,
    }
    setDiasPorAno(nuevosDiasPorAno)
    
    const total = Object.values(nuevosDiasPorAno).reduce((a, b) => a + b, 0)
    setValue('dias_solicitados', total)
    
    // Determinar el año principal (el que tiene más días)
    const [anoPrincipal] = Object.entries(nuevosDiasPorAno)
      .filter(([_, d]) => d > 0)
      .sort((a, b) => b[1] - a[1])[0] || [anoActual, 0]
    setValue('ano_aplica', Number(anoPrincipal))
  }

  const sinDiasDisponibles = empleado.dias_pendientes <= 0
  const excedeDias = totalDiasSeleccionados > empleado.dias_pendientes
  
  // Calcular fecha de retorno
  const fechaInicio = watch('fecha_inicio')
  const fechaRetorno = useMemo(() => {
    if (!fechaInicio || totalDiasSeleccionados <= 0) return null
    let fecha = addDays(new Date(fechaInicio), totalDiasSeleccionados)
    // Si cae en fin de semana, mover al siguiente lunes
    if (isWeekend(fecha)) {
      fecha = nextMonday(fecha)
    }
    return fecha
  }, [fechaInicio, totalDiasSeleccionados])

  const handleFormSubmit = (data: FormData) => {
    const input: CrearSolicitudInput = {
      dias_solicitados: totalDiasSeleccionados,
      fecha_inicio: data.fecha_inicio,
      ano_aplica: Number(data.ano_aplica),
    }
    setError(null)
    return onSubmit(input)
      .catch((err: any) => {
        // AxiosError: err.response.data.detail
        const msg = err?.response?.data?.detail || 'Error inesperado al crear la solicitud.'
        setError(msg)
      })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">

        {/* ═══════════════════════════════════════════════════════════════════
            ENCABEZADO OFICIAL
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="sticky top-0 bg-white border-b-2 border-gray-300 px-6 py-4 text-center">
          {/* Escudo */}
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-gradient-to-b from-blue-600 via-red-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">RD</span>
            </div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">
            República Dominicana
          </p>
          <p className="text-xs text-gray-500 uppercase">
            Ministerio de Educación
          </p>
          <p className="text-sm font-bold text-gray-900 mt-1">
            INSTITUTO NACIONAL DE BIENESTAR ESTUDIANTIL
          </p>
          <p className="text-xs text-gray-600">
            Departamento de Recursos Humanos
          </p>
          <p className="text-sm font-medium italic text-gray-700 mt-1">
            Formulario de Solicitud de Disfrute de Vacaciones
          </p>
          <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Alerta de error del backend */}
        {error && (
          <div className="mx-6 mt-4 mb-2 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="px-6 py-5 space-y-5">

          {/* ═══════════════════════════════════════════════════════════════════
              DATOS GENERALES — solo lectura
          ═══════════════════════════════════════════════════════════════════ */}
          <section className="border border-gray-300 rounded-lg overflow-hidden">
            <h3 className="bg-gray-100 text-center text-sm font-semibold text-gray-700 py-2 border-b border-gray-300">
              Datos Generales
            </h3>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {/* Fila 1: Cédula | Fecha de Solicitud */}
                <Campo label="Cédula:" valor={empleado.cedula} />
                <Campo label="Fecha de Solicitud:" valor={format(new Date(), 'dd/MM/yyyy')} />
                
                {/* Fila 2: Nombre completo */}
                <div className="col-span-2">
                  <Campo label="Nombre y Apellido:" valor={empleado.nombre} destacado />
                </div>
                
                {/* Fila 3: Departamento | Cargo */}
                <Campo label="Departamento:" valor={empleado.departamento} />
                <Campo label="Cargo:" valor={empleado.cargo} />
                
                {/* Fila 4: Años de servicio */}
                <Campo 
                  label="Años de Servicios en el MINERD:" 
                  valor={`${empleado.anos_servicio_institucion} años`} 
                />
                <Campo 
                  label="Años de Servicios en otra Institución del Estado (CGR):" 
                  valor={empleado.anos_servicio_estado > empleado.anos_servicio_institucion 
                    ? `${empleado.anos_servicio_estado - empleado.anos_servicio_institucion} años`
                    : '0 (cero)'
                  } 
                  small
                />
                
                {/* Fila 5: Fecha ingreso | Total años */}
                <Campo 
                  label="Fecha de Ingreso a la Institución:" 
                  valor={empleado.fecha_ingreso 
                    ? format(new Date(empleado.fecha_ingreso), 'dd/MM/yyyy')
                    : 'No disponible'
                  } 
                />
                <Campo 
                  label="Total de años de servicios en el Estado:" 
                  valor={`${empleado.anos_servicio_estado} años`}
                  destacado
                />
              </div>
            </div>
          </section>

          {/* Alerta elegibilidad */}
          {!empleado.puede_solicitar_vacaciones && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              No cumple 1 año en la institución. No puede solicitar vacaciones aún.
            </div>
          )}

          {/* Alerta sin días disponibles */}
          {empleado.puede_solicitar_vacaciones && sinDiasDisponibles && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              No tiene días de vacaciones disponibles.
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              SELECTOR MULTI-AÑO VISUAL
          ═══════════════════════════════════════════════════════════════════ */}
          <section className="border border-gray-300 rounded-lg overflow-hidden">
            <h3 className="bg-gradient-to-r from-blue-600 to-indigo-600 text-center text-sm font-semibold text-white py-2 flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              Selección de Días por Año
            </h3>
            <div className="p-4 space-y-4 bg-gradient-to-br from-blue-50 to-indigo-50">
              {/* Info box */}
              <div className="flex items-start gap-2 bg-white rounded-lg p-3 border border-blue-100">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600">
                  Puede combinar días de diferentes años. Use los controles para seleccionar 
                  cuántos días desea tomar de cada período.
                </p>
              </div>
              
              {/* Selector para cada año */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[anoAnterior, anoActual].map((ano) => {
                  const disponibles = diasDisponiblesPorAno[ano] || 0
                  const seleccionados = diasPorAno[ano] || 0
                  const porcentaje = disponibles > 0 ? (seleccionados / disponibles) * 100 : 0
                  
                  return (
                    <div 
                      key={ano}
                      className={`bg-white rounded-xl border-2 p-4 transition-all ${
                        seleccionados > 0 
                          ? 'border-blue-400 shadow-md' 
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{ano}</p>
                          <p className="text-xs text-gray-500">
                            {disponibles} días disponibles
                          </p>
                        </div>
                        <div className={`text-2xl font-bold ${
                          seleccionados > 0 ? 'text-blue-600' : 'text-gray-300'
                        }`}>
                          {seleccionados}
                        </div>
                      </div>
                      
                      {/* Barra de progreso */}
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                      
                      {/* Controles de incremento/decremento */}
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => actualizarDias(ano, -5)}
                          disabled={seleccionados === 0}
                          className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-30"
                        >
                          -5
                        </button>
                        <button
                          type="button"
                          onClick={() => actualizarDias(ano, -1)}
                          disabled={seleccionados === 0}
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-30 transition"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-bold text-lg text-gray-900">
                          {seleccionados}
                        </span>
                        <button
                          type="button"
                          onClick={() => actualizarDias(ano, 1)}
                          disabled={seleccionados >= disponibles}
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-30 transition"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => actualizarDias(ano, 5)}
                          disabled={seleccionados >= disponibles}
                          className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-30"
                        >
                          +5
                        </button>
                      </div>
                      
                      {/* Botón para seleccionar todos */}
                      {disponibles > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setDiasPorAno(prev => ({ ...prev, [ano]: disponibles }))
                            const total = Object.entries({ ...diasPorAno, [ano]: disponibles })
                              .reduce((sum, [_, d]) => sum + d, 0)
                            setValue('dias_solicitados', total)
                            setValue('ano_aplica', ano)
                          }}
                          className="w-full mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Seleccionar todos ({disponibles})
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
              
              {/* Total seleccionado */}
              <div className="bg-white rounded-xl border-2 border-blue-400 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de días seleccionados:</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {diasPorAno[anoAnterior] > 0 && `${diasPorAno[anoAnterior]} de ${anoAnterior}`}
                      {diasPorAno[anoAnterior] > 0 && diasPorAno[anoActual] > 0 && ' + '}
                      {diasPorAno[anoActual] > 0 && `${diasPorAno[anoActual]} de ${anoActual}`}
                    </p>
                  </div>
                  <div className={`text-4xl font-bold ${
                    totalDiasSeleccionados > 0 
                      ? excedeDias ? 'text-red-600' : 'text-blue-600' 
                      : 'text-gray-300'
                  }`}>
                    {totalDiasSeleccionados}
                  </div>
                </div>
                {excedeDias && (
                  <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Excede los {empleado.dias_pendientes} días disponibles
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════════
              DATOS DE LA SOLICITUD
          ═══════════════════════════════════════════════════════════════════ */}
          <section className="border border-gray-300 rounded-lg overflow-hidden">
            <h3 className="bg-gray-100 text-center text-sm font-semibold text-gray-700 py-2 border-b border-gray-300">
              Fechas de Vacaciones
            </h3>
            <div className="p-4 space-y-4">
              {/* Inputs ocultos para el formulario */}
              <input type="hidden" {...register('dias_solicitados')} />
              <input type="hidden" {...register('ano_aplica')} />
              
              <div className="grid grid-cols-2 gap-4">
                {/* Fecha inicio */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Fecha de inicio: *
                  </label>
                  <input
                    type="date"
                    {...register('fecha_inicio')}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  {errors.fecha_inicio && (
                    <p className="mt-1 text-xs text-red-600">{errors.fecha_inicio.message}</p>
                  )}
                </div>
                
                {/* Fecha retorno (calculada) */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Fecha de retorno:
                  </label>
                  <div className={`rounded border px-3 py-2 text-sm ${
                    fechaRetorno 
                      ? 'bg-green-50 border-green-200 text-green-700 font-medium' 
                      : 'bg-gray-100 border-gray-200 text-gray-400'
                  }`}>
                    {fechaRetorno 
                      ? format(fechaRetorno, "EEEE, d 'de' MMMM yyyy", { locale: es })
                      : 'Seleccione fecha de inicio y días'
                    }
                  </div>
                </div>
              </div>

              {/* Resumen */}
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Días correspondientes</p>
                    <p className="font-bold text-gray-900">{empleado.dias_vacaciones_correspondientes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Días disponibles</p>
                    <p className="font-bold text-blue-600">{empleado.dias_pendientes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Solicitando</p>
                    <p className={`font-bold ${excedeDias ? 'text-red-600' : 'text-green-600'}`}>
                      {totalDiasSeleccionados}
                    </p>
                  </div>
                </div>
              </div>

              {/* Comentario RRHH (solo lectura en este formulario) */}
              <div>
                <span className="block text-xs font-medium text-gray-600 mb-1">
                  Comentario (para uso de Recursos Humanos):
                </span>
                <div className="bg-gray-100 border border-gray-200 rounded px-3 py-2 text-sm text-gray-400 italic min-h-[60px]">
                  Este campo será completado por Recursos Humanos
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════════
              ACCIONES
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                isLoading ||
                !empleado.puede_solicitar_vacaciones ||
                totalDiasSeleccionados <= 0 ||
                excedeDias ||
                sinDiasDisponibles ||
                !fechaInicio
              }
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar Solicitud ({totalDiasSeleccionados} días)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Componente auxiliar para campos de solo lectura ────────────────────────────
function Campo({ 
  label, 
  valor, 
  destacado = false,
  small = false 
}: { 
  label: string
  valor: string
  destacado?: boolean
  small?: boolean
}) {
  return (
    <div>
      <p className={`text-gray-500 ${small ? 'text-[10px]' : 'text-xs'}`}>{label}</p>
      <p className={`${destacado ? 'font-semibold text-blue-700' : 'font-medium text-gray-900'} border-b border-gray-300 pb-1`}>
        {valor}
      </p>
    </div>
  )
}
