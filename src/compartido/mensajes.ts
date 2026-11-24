/**
 * Mensajes de la app (errores y estados que ve el usuario).
 *
 * Reglas:
 * - Cada mensaje se copia LITERAL del SRS v3.0, tal como aparece en la spec
 *   de su feature (specs/features/F-XX-*.md): mismas mayúsculas, signos y
 *   acentos.
 * - Se agregan aquí solo cuando se implementa la spec que los usa, con un
 *   comentario del RF de donde salen.
 * - Las pantallas y las pruebas importan el mensaje de este archivo; nunca
 *   escriben el texto directamente.
 */

const MENSAJES = {
  // ── Navegación (specs/02-navegacion.md §9) ─────────────────────────────
  /** RF-24 (no válido) y RNF-02: pantalla de otro rol o lectura rechazada. */
  SIN_PERMISO: 'No tienes permiso para ver esta sección',
  /** F-01 CA-12 (decisión del equipo; no está en el SRS): sin conexión. */
  ERROR_CONEXION: 'Error de conexión, verifica tu conexión a internet',
  /** RF-02 (no válido): abrir "Descubrir" sin terminar el cuestionario. */
  CUESTIONARIO_INCOMPLETO: 'Termina tu cuestionario para ver tus matches',
  /** RF-19 (no válido): abrir "Mi perfil" sin terminar el cuestionario. */
  PERFIL_SIN_CUESTIONARIO: 'Termina tu cuestionario para descubrir tu perfil Garritas',
  /** RF-28 y RF-11 (no válidos): el animal dejó de estar "Disponible". */
  MASCOTA_NO_DISPONIBLE: 'Esta mascota ya no está disponible para adopción',
  /** RF-10 (no válido): error de conexión al cargar "Descubrir". */
  ERROR_CARGAR_MASCOTAS: 'Error al cargar las mascotas, verifica tu conexión a internet',
  /** RF-26 (no válido): ningún animal pasa los filtros no negociables. */
  SIN_MASCOTAS_COMPATIBLES: 'Por ahora no hay mascotas compatibles con tu hogar. Vuelve pronto',
  /** RNF-01: el cálculo tarda más de 3 segundos. */
  CALCULANDO_COMPATIBILIDAD: 'Calculando compatibilidad, verifica tu conexión a internet',
  /** RF-27 (no válido): el adoptante no ha enviado solicitudes. */
  SIN_SOLICITUDES_ADOPTANTE: 'Aún no has enviado solicitudes. Encuentra a tu match en Descubrir',
  /** RF-04 (no válido): el animal no tiene solicitudes. */
  SIN_SOLICITUDES_ANIMAL: 'Aún no hay solicitudes de adopción para este perfil',

  // ── Motor de match (specs/features/F-05-motor-match.md) ────────────────
  // RF-19 (no válido) reutiliza PERFIL_SIN_CUESTIONARIO, de navegación.
  /** RF-17 (no válido): solicitud a un animal excluido por un filtro. */
  MASCOTA_NO_COMPATIBLE: 'Esta mascota no es compatible con las condiciones de tu hogar',
  /** RF-18: etiqueta de la solicitud con menos de 30 %. */
  ETIQUETA_NO_APTO: 'No Apto',
  /** RF-20 (no válido): match con menos de 30 %. */
  MASCOTA_PODRIA_NO_ADAPTARSE: 'Esta mascota podría no adaptarse a tu estilo de vida',

  // ── Cuestionario (specs/features/F-04-cuestionario.md) ─────────────────
  // RF-02 (no válido) usa CUESTIONARIO_INCOMPLETO y RF-19 (no válido) usa
  // PERFIL_SIN_CUESTIONARIO, de navegación.
  /** RF-16 (válido): al volver a abrir la app a mitad del cuestionario. */
  CUESTIONARIO_RECUPERADO: 'Recuperamos tu cuestionario en progreso',
  /** RF-16 (no válido): no hay avance guardado. */
  CUESTIONARIO_SIN_AVANCE: 'No encontramos tu avance. Empecemos desde el inicio',
} as const;

export type ClaveMensaje = keyof typeof MENSAJES;

export default MENSAJES;
