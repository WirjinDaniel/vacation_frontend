'use client'
// src/app/auth/login/page.tsx

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Users, Shield, CalendarDays, CheckSquare, Lock } from 'lucide-react'
import { useAuthStore, ModoAcceso } from '@/store/authStore'

const schema = z.object({
  email:    z.string().email('Correo institucional inválido.'),
  password: z.string().min(1, 'La contraseña es obligatoria.'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, limpiarError, empleado, setModoAcceso, modoAcceso } = useAuthStore()
  const [mostrarSelector, setMostrarSelector] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // Si ya tiene modo seleccionado, redirigir
  useEffect(() => {
    if (empleado && modoAcceso) {
      if (modoAcceso === 'admin') {
        router.push('/administrador')
      } else {
        router.push('/')
      }
    }
  }, [empleado, modoAcceso, router])

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password)
      setMostrarSelector(true)
    } catch {}
  }

  const handleSeleccionarModo = (modo: ModoAcceso) => {
    setModoAcceso(modo)
    if (modo === 'admin') {
      router.push('/administrador')
    } else {
      router.push('/')
    }
  }

  // Opciones disponibles según rol
  const getOpcionesAcceso = () => {
    if (!empleado) return []
    
    const opciones: { modo: ModoAcceso; titulo: string; descripcion: string; icono: React.ReactNode; color: string; habilitado: boolean }[] = []
    
    // Todos pueden acceder como empleado
    opciones.push({
      modo: 'empleado',
      titulo: 'Empleado',
      descripcion: 'Solicita y consulta sus propias vacaciones',
      icono: <CalendarDays className="h-6 w-6" />,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      habilitado: true,
    })
    
    // Supervisor
    const esSupervisor = empleado.role === 'supervisor' || empleado.role === 'admin' || empleado.role === 'hr' || empleado.role === 'rrhh'
    opciones.push({
      modo: 'supervisor',
      titulo: 'Supervisor',
      descripcion: 'Aprueba o rechaza solicitudes de su equipo',
      icono: <CheckSquare className="h-6 w-6" />,
      color: esSupervisor
        ? 'bg-green-50 border-green-200 hover:bg-green-100' 
        : 'bg-gray-100 border-gray-200',
      habilitado: esSupervisor,
    })
    
    // Administrador
    const esAdmin = empleado.role === 'hr' || empleado.role === 'rrhh' || empleado.role === 'admin'
    opciones.push({
      modo: 'admin',
      titulo: 'Administrador',
      descripcion: 'Control total del sistema de vacaciones',
      icono: <Shield className="h-6 w-6" />,
      color: esAdmin 
        ? 'bg-purple-50 border-purple-200 hover:bg-purple-100' 
        : 'bg-gray-100 border-gray-200',
      habilitado: esAdmin,
    })
    
    return opciones
  }

  // Si debe mostrar selector de modo
  if (mostrarSelector && empleado) {
    const opciones = getOpcionesAcceso()
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-3xl rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          
          {/* Encabezado */}
          <div className="text-center mb-8">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Bienvenido/a
            </p>
            <h1 className="mt-2 text-xl font-bold text-gray-900">
              {empleado.nombre}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Seleccione el modo de acceso</p>
          </div>

          {/* Opciones de acceso */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {opciones.map((opcion) => (
              <button
                key={opcion.modo}
                onClick={() => opcion.habilitado && handleSeleccionarModo(opcion.modo)}
                disabled={!opcion.habilitado}
                className={`relative flex flex-col items-center p-6 rounded-xl border-2 transition-all ${
                  opcion.habilitado 
                    ? `${opcion.color} cursor-pointer` 
                    : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
                }`}
              >
                {!opcion.habilitado && (
                  <div className="absolute top-2 right-2">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                )}
                <div className={`p-3 rounded-full mb-3 ${
                  opcion.habilitado 
                    ? opcion.modo === 'empleado' ? 'bg-blue-100 text-blue-600'
                      : opcion.modo === 'supervisor' ? 'bg-green-100 text-green-600'
                      : 'bg-purple-100 text-purple-600'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {opcion.icono}
                </div>
                <h3 className="font-semibold text-gray-900">{opcion.titulo}</h3>
                <p className="text-xs text-gray-500 text-center mt-1">{opcion.descripcion}</p>
                <span className={`mt-3 text-xs px-2 py-0.5 rounded-full ${
                  opcion.habilitado 
                    ? opcion.modo === 'empleado' ? 'bg-blue-100 text-blue-700'
                      : opcion.modo === 'supervisor' ? 'bg-green-100 text-green-700'
                      : 'bg-purple-100 text-purple-700'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {opcion.modo === 'empleado' ? 'Nivel básico' 
                    : opcion.modo === 'supervisor' ? 'Nivel intermedio' 
                    : 'Nivel total'}
                </span>
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Rol base: <span className="font-medium">{empleado.role}</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">

        {/* Encabezado institucional */}
        <div className="text-center mb-8">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            República Dominicana — Ministerio de Educación
          </p>
          <h1 className="mt-2 text-xl font-bold text-gray-900">
            Instituto Nacional de Bienestar Estudiantil
          </h1>
          <p className="text-sm text-gray-500 mt-1">Sistema de Gestión de Vacaciones</p>
          <p className="text-xs text-gray-400 mt-0.5">Departamento de Recursos Humanos</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Correo institucional
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder="nombre@inabie.gob.do"
              onChange={() => limpiarError()}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              {...register('password')}
              onChange={() => limpiarError()}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {isLoading ? (
              <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Ingresando...</>
            ) : 'Ingresar al sistema'}
          </button>
        </form>
      </div>
    </div>
  )
}
