'use client'
// src/app/(administrador)/administrador/configuracion/page.tsx — Configuración del sistema

import { useState } from 'react'
import { 
  Settings, Calendar, Lock, Users, Bell, 
  Save, AlertTriangle, CheckCircle, Info
} from 'lucide-react'

export default function ConfiguracionAdminPage() {
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null)

  // Configuraciones (simuladas por ahora)
  const [config, setConfig] = useState({
    diasMaximosSolicitud: 30,
    diasMinimoAnticipacion: 7,
    permitirSolicitudesRetroactivas: false,
    requiereAprobacionSupervisor: true,
    requiereAprobacionRRHH: true,
    notificarSupervisor: true,
    notificarRRHH: true,
    notificarEmpleado: true,
  })

  const handleGuardar = async () => {
    setGuardando(true)
    setMensaje(null)
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMensaje({ tipo: 'success', texto: 'Configuración guardada correctamente' })
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al guardar la configuración' })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p className="text-sm text-gray-500">Ajusta los parámetros del sistema de vacaciones</p>
        </div>
        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {guardando ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </button>
      </div>

      {/* Mensaje */}
      {mensaje && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          mensaje.tipo === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {mensaje.tipo === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          {mensaje.texto}
        </div>
      )}

      {/* Secciones de configuración */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Parámetros de Solicitudes */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Parámetros de Solicitudes
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Días máximos por solicitud
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={config.diasMaximosSolicitud}
                onChange={(e) => setConfig({ ...config, diasMaximosSolicitud: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              <p className="mt-1 text-xs text-gray-500">Máximo de días que un empleado puede solicitar</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Días mínimos de anticipación
              </label>
              <input
                type="number"
                min={0}
                max={30}
                value={config.diasMinimoAnticipacion}
                onChange={(e) => setConfig({ ...config, diasMinimoAnticipacion: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              <p className="mt-1 text-xs text-gray-500">Días de anticipación requeridos para solicitar</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Permitir solicitudes retroactivas</p>
                <p className="text-xs text-gray-500">Permite fechas de inicio en el pasado</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.permitirSolicitudesRetroactivas}
                  onChange={(e) => setConfig({ ...config, permitirSolicitudesRetroactivas: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Flujo de Aprobación */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-purple-600" />
            Flujo de Aprobación
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Requiere aprobación del Supervisor</p>
                <p className="text-xs text-gray-500">Primera instancia de aprobación</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.requiereAprobacionSupervisor}
                  onChange={(e) => setConfig({ ...config, requiereAprobacionSupervisor: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Requiere aprobación de RRHH</p>
                <p className="text-xs text-gray-500">Aprobación final de Recursos Humanos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.requiereAprobacionRRHH}
                  onChange={(e) => setConfig({ ...config, requiereAprobacionRRHH: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                El flujo actual es: Empleado → Supervisor → RRHH. Desactivar una etapa saltará directamente a la siguiente.
              </p>
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-purple-600" />
            Notificaciones
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Notificar al Supervisor</p>
                <p className="text-xs text-gray-500">Al recibir nuevas solicitudes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.notificarSupervisor}
                  onChange={(e) => setConfig({ ...config, notificarSupervisor: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Notificar a RRHH</p>
                <p className="text-xs text-gray-500">Al aprobar el supervisor</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.notificarRRHH}
                  onChange={(e) => setConfig({ ...config, notificarRRHH: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Notificar al Empleado</p>
                <p className="text-xs text-gray-500">Al aprobar o rechazar solicitudes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.notificarEmpleado}
                  onChange={(e) => setConfig({ ...config, notificarEmpleado: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Información del Sistema */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            Información del Sistema
          </h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Versión</span>
              <span className="font-medium text-gray-900">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Institución</span>
              <span className="font-medium text-gray-900">INABIE</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Departamento</span>
              <span className="font-medium text-gray-900">Recursos Humanos</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Base de datos</span>
              <span className="font-medium text-green-600">Conectada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
