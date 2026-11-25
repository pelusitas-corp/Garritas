/**
 * Perfil Garritas del adoptante: ilustración, nombre y frase (spec F-04,
 * RF-19, RN-10). La usan Perfil Garritas y Mi perfil, para que se vean igual.
 *
 * Analogía: es la credencial del perfil. El motor F-05 decide QUÉ perfil
 * eres (`asignarPerfilGarritas`); esta tarjeta solo lo dibuja.
 *
 * Ilustración del MVP (D-44): ícono grande de @expo/vector-icons
 * (MaterialCommunityIcons) dentro de un círculo Soft UI.
 *
 * Recibe el `perfil` (caminante, espirituExplorador, nidoTranquilo o
 * puertasAbiertas). No devuelve datos: solo dibuja.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { COLORES, FUENTES, RADIOS } from '../../compartido/tema';
import { PERFILES_GARRITAS } from '../../matchmaking';
import type { PerfilGarritas } from '../../matchmaking';
import { ICONOS_PERFIL } from './iconosPerfil';

/** Diámetro del círculo de la ilustración. */
const DIAMETRO = 160;

const estilos = StyleSheet.create({
  contenedor: { alignItems: 'center', gap: 16 },
  circulo: {
    width: DIAMETRO,
    height: DIAMETRO,
    borderRadius: RADIOS.pildora,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.menta,
  },
  nombre: { fontFamily: FUENTES.negrita, fontSize: 30, color: COLORES.cafe, textAlign: 'center' },
  frase: { fontFamily: FUENTES.regular, fontSize: 18, color: COLORES.cafe, textAlign: 'center' },
});

interface Props {
  perfil: PerfilGarritas;
}

export default function TarjetaPerfilGarritas({ perfil }: Props) {
  const { nombre, frase } = PERFILES_GARRITAS[perfil];
  return (
    <View style={estilos.contenedor}>
      <View style={estilos.circulo} accessibilityLabel={`Ilustración del perfil ${nombre}`}>
        <MaterialCommunityIcons name={ICONOS_PERFIL[perfil]} size={88} color={COLORES.azulMarino} />
      </View>
      <Text accessibilityRole="header" style={estilos.nombre}>
        {nombre}
      </Text>
      <Text style={estilos.frase}>{frase}</Text>
    </View>
  );
}
