'use client'
// src/app/(dashboard)/estadisticas/page.tsx
// Panel de estadísticas para RRHH/Admin

import { useQuery } from '@tanstack/react-query'
import { empleadosApi, EstadisticasRRHH } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Building2,
} from 'lucide-react'

export default function EstadisticasPage() {
  const { empleado } = useAuthStore()
  const router = useRouter()

  // Verificar permisos
  useEffect(() => {
    if (empleado && !empleado.roles.some(r => r.slug === 'hr' || r.slug === 'admin')) {
      router.push('/')
    }
  }, [empleado, router])

  const { data: stats, isLoading, error } = useQuery<EstadisticasRRHH>({
    queryKey: ['estadisticas'],
    queryFn: empleadosApi.estadisticas,
    enabled: !!empleado && empleado.roles.some(r => r.slug === 'hr' || r.slug === 'admin'),
  })

  if (!empleado || !empleado.roles.some(r => r.slug === 'hr' || r.slug === 'admin')) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error al cargar las estadísticas
      </div>
    )
  }

  // Calcular máximo para barras de gráfico
  const maxMes = Math.max(...stats.por_mes.map((m) => m.cantidad), 1)

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Estadísticas RRHH
        </h1>
        <p className="text-gray-600">
          Resumen general del sistema de vacaciones
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Empleados"
          value={stats.total_empleados}
          icon={<Users className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Solicitudes Totales"
          value={stats.total_solicitudes}
          icon={<FileText className="h-6 w-6" />}
          color="gray"
        />
        <StatCard
          title="Solicitudes Este Año"
          value={stats.solicitudes_anio}
          icon={<TrendingUp className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="Pendientes RRHH"
          value={stats.por_estado.pendiente_rrhh}
          icon={<Clock className="h-6 w-6" />}
          color="yellow"
        />
      </div>

      {/* Estado de solicitudes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Estado de Solicitudes
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatusCard
            label="Pend. Supervisor"
            value={stats.por_estado.pendiente_supervisor}
            icon={<Clock className="h-5 w-5 text-orange-500" />}
            bgColor="bg-orange-50"
          />
          <StatusCard
            label="Pend. RRHH"
            value={stats.por_estado.pendiente_rrhh}
            icon={<Clock className="h-5 w-5 text-yellow-500" />}
            bgColor="bg-yellow-50"
          />
          <StatusCard
            label="Aprobadas"
            value={stats.por_estado.aprobada}
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            bgColor="bg-green-50"
          />
          <StatusCard
            label="Rechazadas"
            value={stats.por_estado.rechazada}
            icon={<XCircle className="h-5 w-5 text-red-500" />}
            bgColor="bg-red-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico por mes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Solicitudes por Mes (Últimos 6 meses)
          </h2>
          <div className="space-y-3">
            {stats.por_mes.map((item) => (
              <div key={item.mes} className="flex items-center gap-3">
                <span className="w-16 text-sm text-gray-600 text-right">
                  {item.mes}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${(item.cantidad / maxMes) * 100}%` }}
                  >
                    {item.cantidad > 0 && (
                      <span className="text-xs text-white font-medium">
                        {item.cantidad}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Por departamento */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-gray-500" />
            Solicitudes por Departamento
          </h2>
          {stats.por_departamento.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay datos de departamentos</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 font-medium">Departamento</th>
                    <th className="pb-2 font-medium text-center">Total</th>
                    <th className="pb-2 font-medium text-center">Aprobadas</th>
                    <th className="pb-2 font-medium text-center">Pendientes</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.por_departamento.map((dept) => (
                    <tr key={dept.departamento} className="border-b border-gray-50">
                      <td className="py-2 font-medium text-gray-900">
                        {dept.departamento || 'Sin asignar'}
                      </td>
                      <td className="py-2 text-center text-gray-700">
                        {dept.total}
                      </td>
                      <td className="py-2 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {dept.aprobadas}
                        </span>
                      </td>
                      <td className="py-2 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {dept.pendientes}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Empleados con días pendientes acumulados */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Empleados con Días Pendientes Acumulados (&gt;20 días)
        </h2>
        {stats.empleados_con_pendientes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-400" />
            <p>No hay empleados con días pendientes excesivos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 font-medium">Empleado</th>
                  <th className="pb-2 font-medium">Departamento</th>
                  <th className="pb-2 font-medium text-right">Días Pendientes</th>
                </tr>
              </thead>
              <tbody>
                {stats.empleados_con_pendientes.map((emp) => (
                  <tr key={emp.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">
                      {emp.nombre}
                    </td>
                    <td className="py-3 text-gray-600">
                      {emp.departamento || 'Sin asignar'}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`
                        inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold
                        ${emp.dias_pendientes > 30 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-amber-100 text-amber-800'
                        }
                      `}>
                        {emp.dias_pendientes} días
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Componentes auxiliares ──────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'yellow' | 'gray'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    gray: 'bg-gray-50 text-gray-600',
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

function StatusCard({
  label,
  value,
  icon,
  bgColor,
}: {
  label: string
  value: number
  icon: React.ReactNode
  bgColor: string
}) {
  return (
    <div className={`${bgColor} rounded-lg p-4 text-center`}>
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  )
}
