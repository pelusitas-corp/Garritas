/**
 * Huella grande de Match y de "¡Solicitud enviada!" (Figma, F-06 §4 y MS-3):
 * huella azul marino dentro de un círculo azul grisáceo de 110, con un
 * corazón de contorno en el centro. En la variante < 30 % va sin corazón.
 *
 * Recibe `conCorazon` (por defecto, sí). No devuelve datos: solo dibuja.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { COLORES, RADIOS } from '../../compartido/tema';
import ICONOS_MATCH from './iconosMatch';

const DIAMETRO = 110;

const estilos = StyleSheet.create({
  circulo: {
    width: DIAMETRO,
    height: DIAMETRO,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.azulGrisaceo,
  },
  // El corazón va encima de la almohadilla de la huella (la parte de abajo).
  corazon: { position: 'absolute', top: 58 },
});

export default function HuellaMatch({ conCorazon = true }: { conCorazon?: boolean }) {
  return (
    <View style={estilos.circulo} importantForAccessibility="no-hide-descendants">
      <MaterialCommunityIcons name={ICONOS_MATCH.huella} size={72} color={COLORES.azulMarino} />
      {conCorazon ? (
        <View style={estilos.corazon}>
          <MaterialCommunityIcons name={ICONOS_MATCH.corazon} size={20} color={COLORES.crema} />
        </View>
      ) : null}
    </View>
  );
}
