import { useState } from 'react'
import { X } from 'lucide-react'
import type { Empleado } from '@/types'

interface Props {
  empleado: Empleado
  onClose: () => void
  onSave: (roles: string[]) => void
}

const ROLES = [
  { key: 'employee', label: 'Empleado', alwaysActive: true },
  { key: 'supervisor', label: 'Supervisor' },
  { key: 'hr', label: 'RRHH' },
  { key: 'admin', label: 'Administrador' },
]

export default function ModalAsignarRoles({ empleado, onClose, onSave }: Props) {
  const [roles, setRoles] = useState<string[]>(() => {
    // Siempre incluir 'employee'
    const base = Array.isArray(empleado.roles) ? [...empleado.roles] : []
    if (!base.includes('employee')) base.push('employee')
    return base
  })

  const toggleRole = (role: string) => {
    if (role === 'employee') return // Siempre activo
    setRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    )
  }

  // Accesos
  const acceso = {
    puedeSolicitar: roles.includes('employee'),
    puedeAprobar: roles.includes('supervisor') || roles.includes('hr') || roles.includes('admin'),
    puedeVerReportes: roles.includes('hr') || roles.includes('admin'),
    puedeAsignarRoles: roles.includes('admin'),
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <div className="font-bold text-lg">Asignar roles — {empleado.nombre}</div>
            <div className="text-xs text-gray-500">{empleado.email}</div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-4">
          <div className="mb-4">
            {ROLES.map((r) => (
              <label key={r.key} className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={roles.includes(r.key) || r.alwaysActive}
                  disabled={!!r.alwaysActive}
                  onChange={() => toggleRole(r.key)}
                />
                <span className={r.alwaysActive ? 'font-semibold text-gray-700' : ''}>{r.label}</span>
                {r.alwaysActive && <span className="text-xs text-gray-400">(siempre activo)</span>}
              </label>
            ))}
          </div>
          <hr className="my-4" />
          <div className="mb-2 font-semibold text-sm text-gray-700">Acceso actual:</div>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span>Puede solicitar vacaciones</span>
              <span className="ml-auto">{acceso.puedeSolicitar ? '✓' : '✗'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Puede aprobar solicitudes</span>
              <span className="ml-auto">{acceso.puedeAprobar ? '✓' : '✗'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Puede ver reportes</span>
              <span className="ml-auto">{acceso.puedeVerReportes ? '✓' : '✗'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Puede asignar roles</span>
              <span className="ml-auto">{acceso.puedeAsignarRoles ? '✓' : '✗'}</span>
            </div>
          </div>
        </div>
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
