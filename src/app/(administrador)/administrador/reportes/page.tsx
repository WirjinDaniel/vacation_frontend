'use client'
// src/app/(administrador)/administrador/reportes/page.tsx — Reportes y Exportación

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Download, FileSpreadsheet, Calendar, Filter, 
  TrendingUp, BarChart3, PieChart, Users
} from 'lucide-react'
import { format, subMonths, startOfYear } from 'date-fns'
import { es } from 'date-fns/locale'
import { solicitudesApi, empleadosApi, EstadisticasRRHH } from '@/lib/api'

export default function ReportesAdminPage() {
  const [filtroDesde, setFiltroDesde] = useState(format(startOfYear(new Date()), 'yyyy-MM-dd'))
  const [filtroHasta, setFiltroHasta] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroDepartamento, setFiltroDepartamento] = useState('')
  const [exportando, setExportando] = useState('')

  const { data: stats } = useQuery({
    queryKey: ['estadisticas-reportes'],
    queryFn: empleadosApi.estadisticas,
  })

  const { data: empleados = [] } = useQuery({
    queryKey: ['empleados-reportes'],
    queryFn: empleadosApi.lista,
  })

  // Departamentos únicos
  const departamentos = Array.from(new Set(empleados.map(e => e.departamento).filter(Boolean))).sort()

  const handleExportar = async (tipo: string) => {
    setExportando(tipo)
    try {
      await solicitudesApi.exportarExcel({
        estado: filtroEstado || undefined,
        desde: filtroDesde || undefined,
        hasta: filtroHasta || undefined,
        departamento: filtroDepartamento || undefined,
      })
    } finally {
      setExportando('')
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes y Exportación</h1>
        <p className="text-sm text-gray-500">Genera reportes y exporta datos del sistema</p>
      </div>

      {/* Filtros globales */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          Filtros para Exportación
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
            <input
              type="date"
              value={filtroDesde}
              onChange={(e) => setFiltroDesde(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
            <input
              type="date"
              value={filtroHasta}
              onChange={(e) => setFiltroHasta(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente_supervisor">Pendiente Supervisor</option>
              <option value="pendiente_rrhh">Pendiente RRHH</option>
              <option value="aprobada">Aprobadas</option>
              <option value="rechazada">Rechazadas</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Departamento</label>
            <select
              value={filtroDepartamento}
              onChange={(e) => setFiltroDepartamento(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            >
              <option value="">Todos los departamentos</option>
              {departamentos.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tipos de reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Reporte de Solicitudes */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileSpreadsheet className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="font-semibold text-gray-900">Solicitudes de Vacaciones</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Exporta todas las solicitudes con los filtros aplicados
          </p>
          <button
            onClick={() => handleExportar('solicitudes')}
            disabled={exportando === 'solicitudes'}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {exportando === 'solicitudes' ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Exportar Excel
              </>
            )}
          </button>
        </div>

        {/* Reporte de Empleados */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="font-semibold text-gray-900">Lista de Empleados</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Exporta la lista de empleados con sus días pendientes
          </p>
          <button
            onClick={() => handleExportar('empleados')}
            disabled={exportando === 'empleados'}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {exportando === 'empleados' ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Exportar Excel
              </>
            )}
          </button>
        </div>

        {/* Reporte Estadístico */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <h3 className="font-semibold text-gray-900">Resumen Estadístico</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Exporta un resumen con estadísticas por departamento
          </p>
          <button
            onClick={() => handleExportar('estadisticas')}
            disabled={exportando === 'estadisticas'}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {exportando === 'estadisticas' ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Exportar Excel
              </>
            )}
          </button>
        </div>
      </div>

      {/* Resumen visual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Por mes */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            Solicitudes por Mes (Últimos 6 meses)
          </h3>
          <div className="space-y-3">
            {stats?.por_mes?.length ? (
              stats.por_mes.map((m, idx) => {
                const maxCantidad = Math.max(...stats.por_mes.map(x => x.cantidad))
                const porcentaje = maxCantidad > 0 ? (m.cantidad / maxCantidad) * 100 : 0
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">
                        {format(new Date(m.mes + '-01'), 'MMMM yyyy', { locale: es })}
                      </span>
                      <span className="font-medium">{m.cantidad}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full transition-all" 
                        style={{ width: `${porcentaje}%` }} 
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-center text-gray-400 py-8">Sin datos</p>
            )}
          </div>
        </div>

        {/* Por departamento */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="h-4 w-4 text-gray-400" />
            Distribución por Departamento
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {stats?.por_departamento?.length ? (
              stats.por_departamento.map((d, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{d.departamento}</p>
                    <div className="flex gap-3 text-xs mt-1">
                      <span className="text-green-600">{d.aprobadas} aprobadas</span>
                      <span className="text-yellow-600">{d.pendientes} pendientes</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{d.total}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-8">Sin datos</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
