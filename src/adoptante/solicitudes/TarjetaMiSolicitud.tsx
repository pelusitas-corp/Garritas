/**
 * Tarjeta de una solicitud en Mis solicitudes (Figma, F-06 flujo D, RF-27):
 * azul grisáceo de radio 32 con la miniatura cuadrada (112, radio 16), el
 * nombre del animal en negrita 28, el albergue en negrita 16 (dato, F-12
 * AE-1) y, debajo, el estado. Con "Pre-aprobada" lleva debajo "El
 * albergue te contactará para conocerse." (regular 14, centrado; F-12 AE-1).
 * No lleva a ninguna parte (N-4): no es un botón.
 *
 * F-12 AE-12 (decisión del equipo, no está en el SRS): la miniatura pasa de
 * 76 a 112 (mismo radio 16) y el nombre ya no se corta: si no cabe en una
 * línea, sigue en la siguiente. Tocar la tarjeta sigue sin abrir nada (F-06 §10).
 *
 * F-13 AF-3 (decisión del equipo, no está en el SRS): el estado deja de ser
 * píldora y es texto con un puntito de color (`EstadoConPuntito`). La tarjeta
 * es una `View`, no un botón: no reacciona al toque (RN-03).
 *
 * Recibe la solicitud. No devuelve datos: solo dibuja.
 */
import { Image, StyleSheet, Text, View } from 'react-native';

import { COLORES, FUENTES, RADIOS, TAMANOS_TEXTO } from '../../compartido/tema';
import EstadoConPuntito from './EstadoConPuntito';
import { apoyoDelEstado } from './misSolicitudes';
import type { MiSolicitud } from './misSolicitudes';

/** Lado de la miniatura cuadrada (F-12 AE-12; antes 76). */
const MINIATURA = 112;
/** Radio de la miniatura en Figma. Es una imagen, no una tarjeta (el mínimo de 24 es para tarjetas). */
const RADIO_MINIATURA = 16;

const estilos = StyleSheet.create({
  tarjeta: {
    gap: 12,
    padding: 16,
    borderRadius: RADIOS.tarjetaGrande,
    backgroundColor: COLORES.azulGrisaceo,
  },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  miniatura: { width: MINIATURA, height: MINIATURA, borderRadius: RADIO_MINIATURA },
  datos: { flexShrink: 1 },
  nombre: { fontFamily: FUENTES.negrita, fontSize: 28, color: COLORES.cafe },
  albergue: { fontFamily: FUENTES.negrita, fontSize: TAMANOS_TEXTO.dato, color: COLORES.cafe },
  apoyo: {
    fontFamily: FUENTES.regular,
    fontSize: TAMANOS_TEXTO.minimo,
    color: COLORES.cafe,
    textAlign: 'center',
  },
});

export default function TarjetaMiSolicitud({ solicitud }: { solicitud: MiSolicitud }) {
  const apoyo = apoyoDelEstado(solicitud.estado);
  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.fila}>
        <Image source={{ uri: solicitud.miniaturaAnimal }} style={estilos.miniatura} />
        <View style={estilos.datos}>
          <Text style={estilos.nombre}>{solicitud.nombreAnimal}</Text>
          <Text style={estilos.albergue}>{solicitud.nombreAlbergue}</Text>
        </View>
      </View>
      <EstadoConPuntito estado={solicitud.estado} />
      {apoyo ? <Text style={estilos.apoyo}>{apoyo}</Text> : null}
    </View>
  );
}
