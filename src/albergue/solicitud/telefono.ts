/**
 * Enlace para llamar al adoptante desde el Detalle de Solicitud (spec F-12
 * AE-10; decisión del equipo, no está en el SRS; el teléfono es el que ya
 * muestra RF-12 al pre-aprobar).
 *
 * Es una FUNCIÓN PURA: recibe texto y devuelve texto, sin React ni Firebase.
 * La pantalla abre el enlace con `Linking.openURL` de React Native, que pide
 * al celular abrir el marcador con ese número.
 */

/**
 * Recibe el teléfono guardado (o ya con formato, p. ej. "646 000 0001").
 * Devuelve `tel:` seguido solo de sus dígitos ("tel:6460000001"), o `null`
 * si no tiene ningún dígito (entonces no se puede tocar para llamar).
 */
export function enlaceTelefono(telefono: string): string | null {
  const digitos = telefono.replace(/\D/g, '');
  return digitos ? `tel:${digitos}` : null;
}

export default enlaceTelefono;
