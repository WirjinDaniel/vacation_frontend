'use client'
// src/app/(administrador)/layout.tsx — Layout para el panel de administración

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, Users, Calendar, FileBarChart, 
  Settings, LogOut, Bell, ChevronDown, Shield
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function AdministradorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { empleado, modoAcceso, logout, setModoAcceso } = useAuthStore()

  useEffect(() => {
    // Verificar acceso
    if (!empleado) {
      router.push('/auth/login')
      return
    }
    if (modoAcceso !== 'admin') {
      router.push('/auth/login')
      return
    }
    if (empleado.role !== 'hr' && empleado.role !== 'rrhh' && empleado.role !== 'admin') {
      router.push('/')
    }
  }, [empleado, modoAcceso, router])

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  const handleCambiarModo = () => {
    setModoAcceso(null as any)
    router.push('/auth/login')
  }

  if (!empleado || modoAcceso !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold">INABIE</p>
              <p className="text-xs text-gray-400">Panel Administrativo</p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 space-y-1">
          <NavItem href="/administrador" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
          <NavItem href="/administrador/solicitudes" icon={<Calendar className="h-4 w-4" />} label="Solicitudes" />
          <NavItem href="/administrador/empleados" icon={<Users className="h-4 w-4" />} label="Empleados" />
          <NavItem href="/administrador/reportes" icon={<FileBarChart className="h-4 w-4" />} label="Reportes" />
          <NavItem href="/administrador/configuracion" icon={<Settings className="h-4 w-4" />} label="Configuración" />
        </nav>

        {/* Usuario */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">
              {empleado.nombre?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{empleado.nombre}</p>
              <p className="text-xs text-gray-400 truncate">{empleado.email}</p>
            </div>
          </div>
          <div className="space-y-1">
            <button
              onClick={handleCambiarModo}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-800 rounded-lg transition"
            >
              <ChevronDown className="h-3 w-3" />
              Cambiar modo de acceso
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-gray-800 rounded-lg transition"
            >
              <LogOut className="h-3 w-3" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition"
    >
      {icon}
      {label}
    </Link>
  )
}
