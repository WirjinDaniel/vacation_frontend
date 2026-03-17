'use client'
// src/components/layout/Header.tsx

import { Bell, Menu } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { notificacionesApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'

interface Props {
  onMenuClick?: () => void
}

export default function Header({ onMenuClick }: Props) {
  const { empleado } = useAuthStore()
  const [showNotifications, setShowNotifications] = useState(false)

  const { data: notificaciones = [] } = useQuery({
    queryKey: ['notificaciones'],
    queryFn: notificacionesApi.lista,
    refetchInterval: 30000, // Polling cada 30 segundos
  })

  const noLeidas = notificaciones.filter(n => !n.leida).length

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Sistema de Gestión de Vacaciones
          </h1>
          <p className="text-xs text-gray-500 hidden sm:block">
            Departamento de Recursos Humanos — INABIE
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition"
          >
            <Bell className="h-5 w-5" />
            {noLeidas > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                {noLeidas > 9 ? '9+' : noLeidas}
              </span>
            )}
          </button>

          {/* Dropdown de notificaciones */}
          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowNotifications(false)} 
              />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-auto">
                <div className="p-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Notificaciones</h3>
                </div>
                {notificaciones.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No tiene notificaciones
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notificaciones.slice(0, 5).map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-3 hover:bg-gray-50 cursor-pointer ${!n.leida ? 'bg-blue-50/50' : ''}`}
                      >
                        <p className="text-sm text-gray-900">{n.tipo_display}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(n.enviada_en).toLocaleDateString('es-DO', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {notificaciones.length > 5 && (
                  <div className="p-2 border-t border-gray-100">
                    <a 
                      href="/notificaciones" 
                      className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Ver todas ({notificaciones.length})
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* User avatar */}
        {empleado && (
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-blue-700">
                {empleado.nombre?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{empleado.nombre || ''}</p>
              <p className="text-xs text-gray-500">{empleado.departamento || ''}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
