import { useState } from 'react'
import { X } from 'lucide-react'
import type { Empleado } from '@/types'

interface Props {
  empleado: Empleado
  onClose:  () => void
  onSave:   (roles: string[]) => void
}

// ✅ CORREGIDO: 'employee' → 'empleado' para coincidir con el backend
const ROLES = [
  { key: 'empleado',   label: 'Empleado',        alwaysActive: true },
  { key: 'supervisor', label: 'Supervisor' },
  { key: 'hr',         label: 'RRHH' },
  { key: 'admin',      label: 'Administrador' },
]

export default function ModalAsignarRoles({ empleado, onClose, onSave }: Props) {
  const [roles, setRoles] = useState<string[]>(() => {
    // ✅ CORREGIDO: base siempre incluye 'empleado' (no 'employee')
    const base = Array.isArray(empleado.roles) ? [...empleado.roles] : []
    if (!base.includes('empleado')) base.push('empleado')
    return base
  })

  const toggleRole = (key: string) => {
    if (key === 'empleado') return // Siempre activo, no se puede quitar
    setRoles((prev) =>
      prev.includes(key)
        ? prev.filter((r) => r !== key)
        : [...prev, key]
    )
  }

  // Accesos calculados según roles seleccionados
  const acceso = {
    puedeSolicitar:   roles.includes('empleado'),
    puedeAprobar:     roles.includes('supervisor') || roles.includes('hr') || roles.includes('admin'),
    puedeVerReportes: roles.includes('hr') || roles.includes('admin'),
    puedeAsignarRoles: roles.includes('admin'),
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <div className="font-bold text-lg">Asignar roles — {empleado.nombre}</div>
            <div className="text-xs text-gray-500">{empleado.email}</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Roles */}
        <div className="px-6 py-4">
          <div className="mb-4 space-y-2">
            {ROLES.map((r) => (
              <label
                key={r.key}
                className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition ${
                  roles.includes(r.key)
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                } ${r.alwaysActive ? 'cursor-not-allowed opacity-80' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={roles.includes(r.key)}
                  disabled={!!r.alwaysActive}
                  onChange={() => toggleRole(r.key)}
                  className="h-4 w-4 accent-blue-600"
                />
                <span className={`text-sm ${r.alwaysActive ? 'font-semibold text-gray-700' : 'text-gray-700'}`}>
                  {r.label}
                </span>
                {r.alwaysActive && (
                  <span className="ml-auto text-xs text-gray-400">siempre activo</span>
                )}
              </label>
            ))}
          </div>

          <hr className="my-4" />

          {/* Accesos */}
          <div className="mb-2 text-sm font-semibold text-gray-700">Acceso actual:</div>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Puede solicitar vacaciones',  valor: acceso.puedeSolicitar   },
              { label: 'Puede aprobar solicitudes',   valor: acceso.puedeAprobar     },
              { label: 'Puede ver reportes',          valor: acceso.puedeVerReportes  },
              { label: 'Puede asignar roles',         valor: acceso.puedeAsignarRoles },
            ].map(({ label, valor }) => (
              <div key={label} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-gray-600">{label}</span>
                <span className={`font-medium ${valor ? 'text-green-600' : 'text-gray-400'}`}>
                  {valor ? '✓' : '✗'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onSave(roles)}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}