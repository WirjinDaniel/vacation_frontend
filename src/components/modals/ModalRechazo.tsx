'use client'
// src/components/modals/ModalRechazo.tsx
// Modal formal para rechazar solicitudes (reemplaza prompt)

import { useState } from 'react'
import { X, AlertTriangle, XCircle } from 'lucide-react'

interface Props {
  titulo?: string
  subtitulo?: string
  placeholder?: string
  minLength?: number
  onConfirm: (comentario: string) => Promise<void>
  onClose: () => void
  isLoading?: boolean
}

export default function ModalRechazo({
  titulo = 'Rechazar Solicitud',
  subtitulo = 'Esta acción notificará al empleado que su solicitud ha sido rechazada.',
  placeholder = 'Indique el motivo del rechazo...',
  minLength = 10,
  onConfirm,
  onClose,
  isLoading = false,
}: Props) {
  const [comentario, setComentario] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (comentario.trim().length < minLength) {
      setError(`El motivo debe tener al menos ${minLength} caracteres.`)
      return
    }

    try {
      await onConfirm(comentario.trim())
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al procesar la solicitud.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{titulo}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{subtitulo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Motivo del rechazo <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comentario}
              onChange={(e) => {
                setComentario(e.target.value)
                setError('')
              }}
              placeholder={placeholder}
              rows={4}
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm 
                       focus:border-red-500 focus:ring-1 focus:ring-red-500 
                       resize-none disabled:bg-gray-50 disabled:text-gray-500"
            />
            <div className="flex justify-between mt-1">
              <span className={`text-xs ${comentario.length < minLength ? 'text-gray-400' : 'text-green-600'}`}>
                {comentario.length}/{minLength} caracteres mínimo
              </span>
              {comentario.length >= minLength && (
                <span className="text-xs text-green-600">✓ Válido</span>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              <XCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium 
                       text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || comentario.trim().length < minLength}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg 
                       bg-red-600 text-sm font-medium text-white 
                       hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Procesando...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Confirmar Rechazo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
