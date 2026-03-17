// src/types/index.ts — Tipos TypeScript del sistema de vacaciones INABIE
// Estructura simplificada según formulario oficial

export type Rol = 'employee' | 'supervisor' | 'hr' | 'rrhh' | 'admin'

export type EstadoSolicitud =
  | 'pendiente_supervisor'
  | 'pendiente_rrhh'
  | 'aprobada'
  | 'rechazada'

// ══════════════════════════════════════════════════════════════════════════════
// Tabla 1: EMPLEADO
// ══════════════════════════════════════════════════════════════════════════════
export interface Empleado {
  id: string
  cedula: string
  nombre: string
  departamento: string
  cargo: string
  fecha_ingreso: string
  anos_servicio_estado: number
  anos_servicio_institucion: number
  dias_vacaciones_correspondientes: number
  puede_solicitar_vacaciones: boolean
  dias_pendientes: number
  email: string
  roles: Rol[]
  supervisor?: string
  supervisor_nombre?: string
}

// ══════════════════════════════════════════════════════════════════════════════
// Tabla 3: APROBACIÓN
// ══════════════════════════════════════════════════════════════════════════════
export interface Aprobacion {
  id: string
  aprobado_supervisor: boolean | null
  aprobado_rrhh: boolean | null
  fecha_aprobacion: string | null
  firma_supervisor: string
  firma_rrhh: string
  comentario_rechazo: string
  supervisor_revisor?: string
  supervisor_nombre?: string
  rrhh_revisor?: string
  rrhh_nombre?: string
  fecha_revision_supervisor?: string
  fecha_revision_rrhh?: string
}

// ══════════════════════════════════════════════════════════════════════════════
// Tabla 2: SOLICITUD DE VACACIONES
// ══════════════════════════════════════════════════════════════════════════════
export interface SolicitudVacaciones {
  id: string
  empleado: string
  empleado_detalle: Pick<Empleado, 'id' | 'cedula' | 'nombre' | 'cargo' | 'departamento' | 'fecha_ingreso' | 'anos_servicio_estado' | 'anos_servicio_institucion'>
  fecha_solicitud: string
  dias_solicitados: number
  total_dias: number
  dias_pendientes: number
  fecha_inicio: string
  fecha_retorno?: string | null
  ano_aplica: number
  estado: EstadoSolicitud
  estado_display: string
  comentario_rrhh: string
  aprobacion?: Aprobacion
  creada_en: string
  actualizada_en: string
}

// ══════════════════════════════════════════════════════════════════════════════
// INPUTS PARA LA API
// ══════════════════════════════════════════════════════════════════════════════
export interface CrearSolicitudInput {
  dias_solicitados: number
  fecha_inicio: string
  ano_aplica: number
}

export interface AprobarRRHHInput {
  comentario_rrhh: string
  fecha_retorno: string
}

export interface RechazarInput {
  comentario: string
}

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
export interface DashboardEmpleado {
  cedula: string
  nombre: string
  departamento: string
  cargo: string
  fecha_ingreso: string
  anos_servicio_estado: number
  anos_servicio_institucion: number
  dias_vacaciones_correspondientes: number
  puede_solicitar_vacaciones: boolean
  dias_pendientes: number
  total_solicitudes: number
  aprobadas: number
  rechazadas: number
  pendientes: number
  // Para supervisores
  solicitudes_subordinados_pendientes?: number
  // Para RRHH/Admin
  solicitudes_rrhh_pendientes?: number
}

// ══════════════════════════════════════════════════════════════════════════════
// NOTIFICACIÓN
// ══════════════════════════════════════════════════════════════════════════════
export interface SolicitudResumen {
  id: string
  empleado: string
  empleado_nombre: string
  empleado_cedula: string
  dias_solicitados: number
  fecha_inicio: string
  ano_aplica: number
  estado: EstadoSolicitud
  estado_display: string
  fecha_solicitud: string
}

export interface Notificacion {
  id: string
  tipo: string
  tipo_display: string
  leida: boolean
  enviada_en: string
  solicitud: string
  solicitud_detalle: SolicitudResumen
}
