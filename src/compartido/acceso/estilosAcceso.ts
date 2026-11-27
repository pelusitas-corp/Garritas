/**
 * Estilos comunes de las pantallas de acceso (F-01; Soft UI de tema.ts).
 * Así las 6 pantallas se ven iguales y los colores salen solo de tema.ts.
 */
import { StyleSheet } from 'react-native';

import { COLORES, FUENTES } from '../tema';

const estilosAcceso = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.crema },
  /** `KeyboardAvoidingView` que ocupa el espacio debajo del encabezado (F-13 AF-21). */
  teclado: { flex: 1 },
  contenido: { flexGrow: 1, gap: 16, paddingHorizontal: 24, paddingBottom: 24 },
  titulo: { fontFamily: FUENTES.negrita, fontSize: 28, color: COLORES.cafe },
  subtitulo: { fontFamily: FUENTES.regular, fontSize: 16, color: COLORES.cafe },
  pregunta: {
    fontFamily: FUENTES.regular,
    fontSize: 16,
    color: COLORES.cafe,
    textAlign: 'center',
  },
});

export default estilosAcceso;
