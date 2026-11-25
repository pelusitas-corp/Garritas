/**
 * Mensaje de error con el ícono de alerta (F-01 A1, estado "1b error", y
 * errores de los formularios, §3.1).
 *
 * Recibe `texto`: SIEMPRE un mensaje de src/compartido/mensajes.ts.
 * No devuelve datos: solo dibuja el mensaje.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { COLORES, FUENTES } from '../tema';

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  texto: { flex: 1, fontFamily: FUENTES.negrita, fontSize: 15, color: COLORES.cafe },
});

export default function MensajeError({ texto }: { texto: string }) {
  return (
    <View style={estilos.fila}>
      <Ionicons name="alert-circle" size={22} color={COLORES.cafe} />
      <Text accessibilityRole="alert" style={estilos.texto}>
        {texto}
      </Text>
    </View>
  );
}
