'use client'
// src/components/reports/ReporteSolicitud.tsx
// Reporte imprimible de solicitud de vacaciones — similar al formulario físico del INABIE

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { SolicitudVacaciones } from '@/types'

interface Props {
  solicitud: SolicitudVacaciones
  onClose: () => void
}

const formatFecha = (fecha: string | null | undefined) => {
  if (!fecha) return ''
  try {
    return format(new Date(fecha), 'dd/MM/yyyy', { locale: es })
  } catch {
    return fecha
  }
}

export default function ReporteSolicitud({ solicitud, onClose }: Props) {
  const empleado = solicitud.empleado_detalle
  const aprobacion = solicitud.aprobacion

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:bg-white print:p-0">
      <div className="w-full max-w-3xl max-h-[95vh] overflow-y-auto bg-white shadow-2xl print:shadow-none print:max-h-none print:overflow-visible">
        
        {/* Botones de acción - NO imprimir */}
        <div className="sticky top-0 bg-gray-50 border-b px-4 py-3 flex justify-between print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            ← Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            🖨️ Imprimir
          </button>
        </div>

        {/* Contenido del reporte */}
        <div className="p-8 print:p-12">
          
          {/* Encabezado institucional */}
          <div className="text-center mb-6">
            <p className="text-xs text-red-700 font-medium">REPÚBLICA DOMINICANA</p>
            <p className="text-xs text-red-700">MINISTERIO DE EDUCACIÓN</p>
            <h1 className="text-sm font-bold mt-1">INSTITUTO NACIONAL DE BIENESTAR ESTUDIANTIL</h1>
            <p className="text-xs">Departamento de Recursos Humanos</p>
            <p className="text-sm italic mt-1">Formulario de Solicitud de Disfrute de Vacaciones</p>
          </div>

          {/* Datos Generales */}
          <section className="mb-6">
            <h2 className="text-center font-bold border-b-2 border-black pb-1 mb-3">Datos Generales</h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-2 w-1/2">
                    <span className="text-xs text-gray-600">Cédula:</span><br />
                    <span className="font-medium">{empleado?.cedula || ''}</span>
                  </td>
                  <td className="border border-gray-400 p-2 w-1/2">
                    <span className="text-xs text-gray-600">Fecha de Solicitud:</span><br />
                    <span className="font-medium">{formatFecha(solicitud.fecha_solicitud)}</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2" colSpan={2}>
                    <span className="text-xs text-gray-600">Nombre y Apellido:</span><br />
                    <span className="font-medium">{empleado?.nombre || ''}</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2">
                    <span className="text-xs text-gray-600">Departamento:</span><br />
                    <span className="font-medium">{empleado?.departamento || ''}</span>
                  </td>
                  <td className="border border-gray-400 p-2">
                    <span className="text-xs text-gray-600">Cargo:</span><br />
                    <span className="font-medium">{empleado?.cargo || ''}</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2">
                    <span className="text-xs text-gray-600">Años de Servicios en el MINERD/INABIE:</span><br />
                    <span className="font-medium">{empleado?.anos_servicio_institucion || 0}</span>
                  </td>
                  <td className="border border-gray-400 p-2">
                    <span className="text-xs text-gray-600">Años de Servicios en el Estado:</span><br />
                    <span className="font-medium">{empleado?.anos_servicio_estado || 0}</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2" colSpan={2}>
                    <span className="text-xs text-gray-600">Fecha de Ingreso a la Institución:</span><br />
                    <span className="font-medium">{formatFecha(empleado?.fecha_ingreso)}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Datos de la Solicitud */}
          <section className="mb-6">
            <h2 className="text-center font-bold border-b-2 border-black pb-1 mb-3">Datos de la Solicitud</h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-2">
                    <span className="text-xs text-gray-600">Días solicitados:</span><br />
                    <span className="font-medium">{solicitud.dias_solicitados}</span>
                  </td>
                  <td className="border border-gray-400 p-2">
                    <span className="text-xs text-gray-600">Año que aplica:</span><br />
                    <span className="font-medium">{solicitud.ano_aplica}</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2">
                    <span className="text-xs text-gray-600">Total de días de vacaciones correspondientes:</span><br />
                    <span className="font-medium">{solicitud.total_dias}</span>
                  </td>
                  <td className="border border-gray-400 p-2">
                    <span className="text-xs text-gray-600">Días pendientes:</span><br />
                    <span className="font-medium">{solicitud.dias_pendientes}</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2">
                    <span className="text-xs text-gray-600">Fecha de inicio de disfrute de vacaciones:</span><br />
                    <span className="font-medium">{formatFecha(solicitud.fecha_inicio)}</span>
                  </td>
                  <td className="border border-gray-400 p-2">
                    <span className="text-xs text-gray-600">Fecha de retorno:</span><br />
                    <span className="font-medium">{solicitud.fecha_retorno ? formatFecha(solicitud.fecha_retorno) : 'Pendiente'}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Comentario RRHH */}
          <section className="mb-8">
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-3" colSpan={2}>
                    <span className="text-xs text-gray-600">Comentario (para uso de Recursos Humanos):</span>
                    <div className="mt-2 min-h-[60px]">
                      {solicitud.comentario_rrhh || ''}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Firmas */}
          <section className="mt-12">
            <div className="grid grid-cols-2 gap-8">
              {/* Firma del Interesado */}
              <div className="text-center">
                <div className="border-b border-black mb-2 h-8">&nbsp;</div>
                <p className="text-sm font-medium">Firma del Interesado</p>
                <p className="text-xs text-gray-600 mt-1">{empleado?.nombre}</p>
              </div>
              
              {/* Firma Superior Inmediato */}
              <div className="text-center">
                <div className="border-b border-black mb-2 h-8">
                  {aprobacion?.aprobado_supervisor && (
                    <span className="text-xs text-green-600">✓ Aprobado {formatFecha(aprobacion.fecha_revision_supervisor)}</span>
                  )}
                </div>
                <p className="text-sm font-medium">Firma Superior Inmediato</p>
                <p className="text-xs text-gray-600 mt-1">{aprobacion?.supervisor_nombre || ''}</p>
              </div>
            </div>

            {/* Firma RRHH */}
            <div className="mt-8 flex justify-end">
              <div className="text-center w-1/2">
                <div className="border-b border-black mb-2 h-8">
                  {aprobacion?.aprobado_rrhh && (
                    <span className="text-xs text-green-600">✓ Autorizado {formatFecha(aprobacion.fecha_revision_rrhh)}</span>
                  )}
                </div>
                <p className="text-sm font-medium">Firma Autorización RR. HH.</p>
                {aprobacion?.rrhh_nombre && (
                  <p className="text-xs text-gray-600 mt-1">{aprobacion.rrhh_nombre}</p>
                )}
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
