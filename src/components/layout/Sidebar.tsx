'use client'
// src/components/layout/Sidebar.tsx

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ClipboardList, 
  Bell, 
  Users, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  roles?: string[]
}

const navItems: NavItem[] = [
  { 
    href: '/', 
    label: 'Mi Dashboard', 
    icon: <LayoutDashboard className="h-5 w-5" /> 
  },
  { 
    href: '/admin', 
    label: 'Panel Admin', 
    icon: <ClipboardList className="h-5 w-5" />,
    roles: ['supervisor', 'hr', 'admin']
  },
  { 
    href: '/empleados', 
    label: 'Empleados', 
    icon: <Users className="h-5 w-5" />,
    roles: ['hr', 'admin']
  },
  { 
    href: '/estadisticas', 
    label: 'Estadísticas', 
    icon: <BarChart3 className="h-5 w-5" />,
    roles: ['hr', 'admin']
  },
  { 
    href: '/notificaciones', 
    label: 'Notificaciones', 
    icon: <Bell className="h-5 w-5" /> 
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { empleado, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    await logout()
    window.location.href = '/auth/login'
  }

  const filteredItems = navItems.filter(item => {
    if (!item.roles) return true
    return empleado && item.roles.includes(empleado.role)
  })

  return (
    <aside className={`
      flex flex-col bg-white border-r border-gray-200 transition-all duration-300
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider truncate">
              INABIE
            </p>
            <p className="text-sm font-semibold text-gray-900 truncate">
              Gestión Vacaciones
            </p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                ${isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
              title={collapsed ? item.label : undefined}
            >
              <span className={isActive ? 'text-blue-600' : 'text-gray-400'}>
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-gray-100">
        {empleado && !collapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {empleado.nombre}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {empleado.cargo}
            </p>
            <span className={`
              inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium
              ${empleado.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                empleado.role === 'hr' || empleado.role === 'rrhh' ? 'bg-green-100 text-green-700' :
                empleado.role === 'supervisor' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-600'}
            `}>
              {empleado.role === 'admin' ? 'Administrador' :
               empleado.role === 'hr' || empleado.role === 'rrhh' ? 'Recursos Humanos' :
               empleado.role === 'supervisor' ? 'Supervisor' : 'Empleado'}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`
            flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium
            text-red-600 hover:bg-red-50 transition
          `}
          title={collapsed ? 'Cerrar sesión' : undefined}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  )
}
