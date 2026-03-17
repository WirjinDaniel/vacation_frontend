'use client'
// src/app/(administrador)/administrador/empleados/page.tsx — Gestión de empleados

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Search, Filter, Download, User, Calendar, 
  Building2, ChevronDown, AlertTriangle, CheckCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { empleadosApi } from '@/lib/api'
import type { Empleado } from '@/types'

const ROLES = [
  { value: '', label: 'Todos los roles' },
  { value: 'employee', label: 'Empleado' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'hr', label: 'RRHH' },
  { value: 'admin', label: 'Administrador' },
]

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  employee:   { label: 'Empleado', color: 'bg-blue-100 text-blue-700' },
  supervisor: { label: 'Supervisor', color: 'bg-green-100 text-green-700' },
  hr:         { label: 'RRHH', color: 'bg-purple-100 text-purple-700' },
  admin:      { label: 'Admin', color: 'bg-red-100 text-red-700' },
}

export default function EmpleadosAdminPage() {
  const [filtroRol, setFiltroRol] = useState('')
  const [filtroBusqueda, setFiltroBusqueda] = useState('')
  const [filtroDepartamento, setFiltroDepartamento] = useState('')

  const { data: empleados = [], isLoading } = useQuery({
    queryKey: ['empleados-admin'],
    queryFn: empleadosApi.lista,
  })

  // Obtener departamentos únicos
  const departamentos = Array.from(new Set(empleados.map(e => e.departamento).filter(Boolean))).sort()

  // Filtrar empleados
  const empleadosFiltrados = empleados.filter((emp) => {
    const matchRol = !filtroRol || emp.role === filtroRol
    const matchDept = !filtroDepartamento || emp.departamento === filtroDepartamento
    const matchBusqueda = !filtroBusqueda || 
      emp.nombre?.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
      emp.cedula?.includes(filtroBusqueda) ||
      emp.email?.toLowerCase().includes(filtroBusqueda.toLowerCase())
    return matchRol && matchDept && matchBusqueda
  })

  const fmt = (d: string) => {
    try { return format(new Date(d), 'dd/MM/yyyy', { locale: es }) }
    catch { return d }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Empleados</h1>
          <p className="text-sm text-gray-500">Consulta y administra los empleados del sistema</p>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{empleados.length}</p>
              <p className="text-xs text-gray-500">Total empleados</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {empleados.filter(e => e.puede_solicitar_vacaciones).length}
              </p>
              <p className="text-xs text-gray-500">Pueden solicitar</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {empleados.filter(e => e.dias_pendientes > 20).length}
              </p>
              <p className="text-xs text-gray-500">+20 días pendientes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{departamentos.length}</p>
              <p className="text-xs text-gray-500">Departamentos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, cédula o correo..."
              value={filtroBusqueda}
              onChange={(e) => setFiltroBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
          
          {/* Filtro por rol */}
          <div className="relative">
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="pl-4 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 appearance-none bg-white"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Filtro por departamento */}
          <div className="relative">
            <select
              value={filtroDepartamento}
              onChange={(e) => setFiltroDepartamento(e.target.value)}
              className="pl-4 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 appearance-none bg-white"
            >
              <option value="">Todos los departamentos</option>
              {departamentos.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
        
        {/* Resumen */}
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
          <span>Mostrando {empleadosFiltrados.length} de {empleados.length} empleados</span>
          {(filtroRol || filtroBusqueda || filtroDepartamento) && (
            <button
              onClick={() => { setFiltroRol(''); setFiltroBusqueda(''); setFiltroDepartamento(''); }}
              className="text-purple-600 hover:text-purple-700"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mx-auto" />
            <p className="mt-2 text-gray-500">Cargando empleados...</p>
          </div>
        ) : empleadosFiltrados.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No se encontraron empleados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-5 py-3 font-medium text-gray-500">Empleado</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Departamento / Cargo</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Fecha Ingreso</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-center">Años Serv.</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-center">Días Corresp.</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-center">Días Pend.</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {empleadosFiltrados.map((emp) => {
                  const roleConfig = ROLE_CONFIG[emp.role] || { label: emp.role, color: 'bg-gray-100 text-gray-700' }
                  const diasAltos = emp.dias_pendientes > 20
                  
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                            {emp.nombre?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{emp.nombre}</p>
                            <p className="text-xs text-gray-500">{emp.cedula} · {emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-gray-900">{emp.departamento}</p>
                        <p className="text-xs text-gray-500">{emp.cargo}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {emp.fecha_ingreso ? fmt(emp.fecha_ingreso) : '—'}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center justify-center h-7 min-w-[28px] px-2 rounded-full bg-gray-100 text-gray-700 font-medium">
                          {emp.anos_servicio_institucion}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center justify-center h-7 min-w-[28px] px-2 rounded-full bg-blue-100 text-blue-700 font-medium">
                          {emp.dias_vacaciones_correspondientes}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center justify-center h-7 min-w-[28px] px-2 rounded-full font-medium ${
                          diasAltos 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {emp.dias_pendientes}
                          {diasAltos && <AlertTriangle className="h-3 w-3 ml-1" />}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${roleConfig.color}`}>
                          {roleConfig.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
