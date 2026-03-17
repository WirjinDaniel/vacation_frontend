// src/store/authStore.ts — Estado global de autenticación

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Empleado } from '@/types'
import { authApi, empleadosApi } from '@/lib/api'

export type ModoAcceso = 'empleado' | 'supervisor' | 'admin'

interface AuthState {
  empleado:     Empleado | null
  modoAcceso:   ModoAcceso | null
  isLoading:    boolean
  error:        string | null
  login:        (email: string, password: string) => Promise<void>
  logout:       () => Promise<void>
  cargarPerfil: () => Promise<void>
  limpiarError: () => void
  setModoAcceso:(modo: ModoAcceso) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      empleado:   null,
      modoAcceso: null,
      isLoading:  false,
      error:      null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          await authApi.login(email, password)
          const empleado = await empleadosApi.perfil()
          set({ empleado, isLoading: false, modoAcceso: null })
        } catch (err: any) {
          set({
            error: err.response?.data?.detail ?? 'Credenciales incorrectas.',
            isLoading: false,
          })
          throw err
        }
      },

      logout: async () => {
        await authApi.logout()
        set({ empleado: null, modoAcceso: null, error: null })
      },

      cargarPerfil: async () => {
        set({ isLoading: true })
        try {
          const empleado = await empleadosApi.perfil()
          set({ empleado, isLoading: false })
        } catch {
          set({ empleado: null, modoAcceso: null, isLoading: false })
        }
      },

      limpiarError: () => set({ error: null }),
      
      setModoAcceso: (modo: ModoAcceso) => set({ modoAcceso: modo }),
    }),
    {
      name: 'auth-inabie',
      partialize: (state) => ({ empleado: state.empleado, modoAcceso: state.modoAcceso }),
    }
  )
)
