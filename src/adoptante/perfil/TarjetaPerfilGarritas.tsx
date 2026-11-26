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
 * F-11 AD-6 (decisión del equipo; no está en el SRS): círculo de 180, nombre
 * en negrita 32 y, alrededor del círculo, 2 estrellitas y 2 puntitos fijos
 * como en "Match.png". Las decoraciones son solo dibujo: el lector de
 * pantalla no las anuncia.
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

/** Diámetro del círculo de la ilustración (F-11: antes 160). */
const DIAMETRO = 180;

/** Zona de la ilustración: el círculo va al centro y las decoraciones alrededor. */
const ZONA = { ancho: 240, alto: 220 } as const;

/** Ícono de las estrellitas de contorno (F-11 §4.5). */
const ICONO_ESTRELLA = 'star-four-points-outline';

/**
 * Decoraciones confirmadas por Jennifer (plan de F-11): posición desde
 * arriba a la izquierda de la zona de 240 × 220.
 */
const ESTRELLAS = [
  { clave: 'estrella-arriba-izquierda', tamano: 20, left: 4, top: 24 },
  { clave: 'estrella-abajo-derecha', tamano: 18, left: 218, top: 168 },
] as const;

const PUNTITOS = [
  { clave: 'puntito-arriba-derecha', tamano: 10, left: 214, top: 10, color: COLORES.azulMarino },
  { clave: 'puntito-abajo-izquierda', tamano: 8, left: 14, top: 184, color: COLORES.azulGrisaceo },
] as const;

const estilos = StyleSheet.create({
  contenedor: { alignItems: 'center', gap: 16 },
  zona: { width: ZONA.ancho, height: ZONA.alto, alignItems: 'center', justifyContent: 'center' },
  circulo: {
    width: DIAMETRO,
    height: DIAMETRO,
    borderRadius: RADIOS.pildora,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.menta,
  },
  decoracion: { position: 'absolute' },
  nombre: { fontFamily: FUENTES.negrita, fontSize: 32, color: COLORES.cafe, textAlign: 'center' },
  frase: { fontFamily: FUENTES.regular, fontSize: 18, color: COLORES.cafe, textAlign: 'center' },
});

/** Las estrellitas y los puntitos (solo dibujo, ocultos al lector de pantalla). */
function Decoraciones() {
  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {ESTRELLAS.map(({ clave, tamano, left, top }) => (
        <MaterialCommunityIcons
          key={clave}
          name={ICONO_ESTRELLA}
          size={tamano}
          color={COLORES.cafe}
          style={[estilos.decoracion, { left, top }]}
        />
      ))}
      {PUNTITOS.map(({ clave, tamano, left, top, color }) => (
        <View
          key={clave}
          style={[
            estilos.decoracion,
            {
              left,
              top,
              width: tamano,
              height: tamano,
              borderRadius: RADIOS.pildora,
              backgroundColor: color,
            },
          ]}
        />
      ))}
    </View>
  );
}

interface Props {
  perfil: PerfilGarritas;
}

export default function TarjetaPerfilGarritas({ perfil }: Props) {
  const { nombre, frase } = PERFILES_GARRITAS[perfil];
  return (
    <View style={estilos.contenedor}>
      <View style={estilos.zona}>
        <Decoraciones />
        <View style={estilos.circulo} accessibilityLabel={`Ilustración del perfil ${nombre}`}>
          <MaterialCommunityIcons
            name={ICONOS_PERFIL[perfil]}
            size={88}
            color={COLORES.azulMarino}
          />
        </View>
      </View>
      <Text accessibilityRole="header" style={estilos.nombre}>
        {nombre}
      </Text>
      <Text style={estilos.frase}>{frase}</Text>
    </View>
  );
}
