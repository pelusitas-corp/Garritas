/**
 * Textos de interfaz compartidos por el adoptante y el albergue (spec F-13
 * §4.1 y §5, AF-17; 02 v1.4 N-3 y CA-14; decisión del equipo, no está en el
 * SRS). Los mensajes de error y de estado NO van aquí: están en mensajes.ts.
 */
const TEXTOS_COMPARTIDOS = {
  /** Botón de N-3 (02-navegacion) y botón principal del modal de confirmación. */
  cerrarSesion: 'Cerrar sesión',
  /** Pregunta del modal de confirmación (F-13 AF-17). */
  quieresCerrarSesion: '¿Quieres cerrar sesión?',
  /** Botón del modal que no hace nada (F-13 AF-17). */
  cancelar: 'Cancelar',
} as const;

export default TEXTOS_COMPARTIDOS;
