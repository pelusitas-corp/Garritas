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

  // ── Acceso y privacidad (specs/features/F-01-acceso-privacidad.md) ─────
  // RF-24 y RNF-02 (no válidos) reutilizan SIN_PERMISO, y CA-12 reutiliza
  // ERROR_CONEXION, de navegación.
  /** RF-25 (no válido): "Continuar" sin marcar la casilla del aviso. */
  AVISO_SIN_ACEPTAR:
    'Para continuar, acepta el aviso de privacidad y confirma que eres mayor de edad',
  /** RF-23 (no válido): el correo ya pertenece a una cuenta. */
  CORREO_YA_REGISTRADO: 'Este correo ya tiene una cuenta. Inicia sesión.',
  /** RF-09 (no válido): contraseña incorrecta o correo no registrado. */
  CREDENCIALES_INVALIDAS: 'Correo o contraseña inválidos',
  /** F-01 CA-11 (P-03, decisión del equipo; no está en el SRS): contraseña corta. */
  CONTRASENA_CORTA: 'Tu contraseña debe tener al menos 6 caracteres',
  /** F-01 CA-13 (A-2, decisión del equipo; no está en el SRS): correo inválido al registrarse. */
  CORREO_INVALIDO: 'Escribe un correo electrónico válido',

  // ── Alta del animal (specs/features/F-02-alta-animal.md) ───────────────
  // Sin conexión al publicar reutiliza ERROR_CONEXION y el rechazo de las
  // reglas, SIN_PERMISO.
  /** RF-01 (no válido): falta nombre, especie, edad o tamaño. */
  CAMPOS_OBLIGATORIOS: 'Completa los campos obligatorios marcados con asterisco',
  /** RF-13 (no válido): publicar sin ninguna foto. */
  FOTO_OBLIGATORIA: 'Añade al menos una foto de la mascota',
  /** RF-14 (no válido): falta alguna dimensión del perfil de compatibilidad. */
  PERFIL_INCOMPLETO: 'Completa el perfil de compatibilidad para publicar a la mascota',
  /** RI-02 (no válido): el sistema negó el permiso de la cámara. */
  CAMARA_SIN_PERMISO:
    'Habilita el acceso a la cámara desde los ajustes de tu teléfono o elige una foto de tu galería',

  // ── Descubrir y detalle (specs/features/F-03-descubrir-detalle.md) ─────
  // RF-10, RF-26, RF-28 y RNF-01 usan los mensajes de navegación.
  /** F-03 DE-1 (decisión del equipo; no está en el SRS): el adoptante pasó todas las tarjetas. */
  MAZO_TERMINADO: 'Ya viste a todas tus mascotas compatibles. ¡Vuelve pronto para conocer nuevas!',

  // ── Panel de solicitudes (specs/features/F-07-panel-solicitudes.md) ────
  // RF-04 (no válido) usa SIN_SOLICITUDES_ANIMAL, RF-18 usa ETIQUETA_NO_APTO,
  // y los errores reutilizan ERROR_CONEXION y SIN_PERMISO.
  /** F-07 PS-4 (decisión del equipo; no está en el SRS): el albergue aún no tiene animales. */
  SIN_ANIMALES_ALBERGUE: 'Aún no tienes mascotas publicadas. Agrégalas en la pestaña Mascotas',

  // ── Pre-aprobar, rechazar y contacto (specs/features/F-08-preaprobar-rechazar.md) ──
  // Sin conexión reutiliza ERROR_CONEXION y el rechazo de las reglas, SIN_PERMISO.
  /** RF-05 y RF-21 (no válidos): la solicitud ya no está "Pendiente". */
  SOLICITUD_YA_ATENDIDA: 'Esta solicitud ya fue atendida',
  /** RF-22 (no válido): el animal ya tiene una solicitud "Pre-aprobada". */
  PREADOPCION_EN_CURSO: 'Este animal ya cuenta con una pre-adopción en curso',
  /** RF-12 (no válido): solicitud "Pendiente" o "Rechazada"; el contacto sigue oculto. */
  CONTACTO_OCULTO: 'Pre-aprueba la solicitud para ver los datos de contacto',
} as const;

export type ClaveMensaje = keyof typeof MENSAJES;

export default MENSAJES;
