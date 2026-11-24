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
  // F-05 · RF-17 no válido: solicitud a un animal excluido por un filtro.
  mascotaNoCompatible: 'Esta mascota no es compatible con las condiciones de tu hogar',
  // F-05 · RF-18: etiqueta de la solicitud con menos de 30 %.
  etiquetaNoApto: 'No Apto',
  // F-05 · RF-19 no válido: "Mi perfil" sin terminar el cuestionario.
  terminaCuestionarioPerfil: 'Termina tu cuestionario para descubrir tu perfil Garritas',
  // F-05 · RF-20 no válido: match con menos de 30 %.
  mascotaPodriaNoAdaptarse: 'Esta mascota podría no adaptarse a tu estilo de vida',
} as const;

export default MENSAJES;
