'use client'
// src/app/(dashboard)/empleados/page.tsx — Gestión de Empleados

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus, Search, Edit2, Users, Shield } from 'lucide-react'
import { empleadosApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { Empleado } from '@/types'

const ROL_LABELS: Record<string, string> = {
  employee: 'Empleado',
  supervisor: 'Supervisor',
  hr: 'Recursos Humanos',
  admin: 'Administrador',
}

const ROL_COLORS: Record<string, string> = {
  employee: 'bg-gray-100 text-gray-700',
  supervisor: 'bg-blue-100 text-blue-700',
  hr: 'bg-green-100 text-green-700',
  admin: 'bg-purple-100 text-purple-700',
}

export default function EmpleadosPage() {
  const { empleado: currentUser } = useAuthStore()
  const queryClient = useQueryClient()
  const [busqueda, setBusqueda] = useState('')
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [supervisorSeleccionado, setSupervisorSeleccionado] = useState<string>('')

  // Solo HR y Admin pueden acceder
  if (currentUser && !['hr', 'admin'].includes(currentUser.role)) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-gray-600">No tiene permisos para acceder a esta sección.</p>
        </div>
      </div>
    )
  }

  const { data: empleados = [], isLoading } = useQuery({
    queryKey: ['empleados'],
    queryFn: empleadosApi.lista,
  })

  const { mutateAsync: actualizarEmpleado, isPending: actualizando } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Empleado> }) =>
      empleadosApi.actualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] })
      setEditandoId(null)
    },
  })

  const empleadosFiltrados = empleados.filter(emp =>
    emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    emp.cedula.includes(busqueda) ||
    emp.departamento.toLowerCase().includes(busqueda.toLowerCase())
  )

  const supervisores = empleados.filter(e => ['supervisor', 'hr', 'admin'].includes(e.role))

  const handleAsignarSupervisor = async (empleadoId: string) => {
    if (!supervisorSeleccionado) return
    await actualizarEmpleado({
      id: empleadoId,
      data: { supervisor: supervisorSeleccionado }
    })
    setSupervisorSeleccionado('')
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Gestión de Empleados</h1>
            <p className="text-sm text-gray-500">{empleados.length} empleados registrados</p>
          </div>
          <button
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            <UserPlus className="h-4 w-4" />
            Nuevo Empleado
          </button>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, cédula o departamento..."
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Tabla */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {empleadosFiltrados.length === 0 ? (
            <div className="p-10 text-center">
              <Users className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">No se encontraron empleados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Empleado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Departamento</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Cargo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Rol</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Supervisor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Días Vacaciones</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {empleadosFiltrados.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-700">
                              {emp.nombre.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{emp.nombre}</p>
                            <p className="text-xs text-gray-500">{emp.cedula}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{emp.departamento}</td>
                      <td className="px-4 py-3 text-gray-700">{emp.cargo}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROL_COLORS[emp.role]}`}>
                          {ROL_LABELS[emp.role]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {editandoId === emp.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={supervisorSeleccionado}
                              onChange={(e) => setSupervisorSeleccionado(e.target.value)}
                              className="rounded border border-gray-300 px-2 py-1 text-xs"
                            >
                              <option value="">Seleccionar...</option>
                              {supervisores
                                .filter(s => s.id !== emp.id)
                                .map(s => (
                                  <option key={s.id} value={s.id}>{s.nombre}</option>
                                ))}
                            </select>
                            <button
                              onClick={() => handleAsignarSupervisor(emp.id)}
                              disabled={actualizando || !supervisorSeleccionado}
                              className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                              OK
                            </button>
                            <button
                              onClick={() => {
                                setEditandoId(null)
                                setSupervisorSeleccionado('')
                              }}
                              className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700">
                              {supervisores.find(s => s.id === emp.supervisor)?.nombre || '—'}
                            </span>
                            <button
                              onClick={() => setEditandoId(emp.id)}
                              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-blue-700">{emp.dias_vacaciones_correspondientes}</span>
                        <span className="text-gray-400 text-xs ml-1">días</span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="rounded-lg border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-100"
                        >
                          Ver Períodos
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
