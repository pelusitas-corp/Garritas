/**
 * Tarjeta del porqué del match (Figma, F-06 §4, MS-3 y MS-12): azul
 * grisáceo de radio 28 con su título en negrita 16 y una fila por dimensión.
 * - 30 % o más: "¿Por qué hacen match?" y las 3 dimensiones de mayor aporte,
 *   cada una con un círculo menta y una palomita (RF-20 válido).
 * - Menos de 30 %: "Dimensiones con menor coincidencia" y las 2 dimensiones,
 *   cada una con un círculo crema y una ✕ (RF-20 no válido).
 * Los nombres vienen del motor (`NOMBRES_DIMENSION`, F-05 RN-07).
 *
 * Recibe la explicación del motor. No devuelve datos: solo dibuja.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { COLORES, FUENTES, RADIOS } from '../../compartido/tema';
import type { Explicacion } from '../../matchmaking';
import ICONOS_MATCH from './iconosMatch';
import { TEXTOS_MATCH } from './textos';

/** Radio de la tarjeta en Figma (28, por encima del mínimo de 24 de Soft UI). */
const RADIO_TARJETA = 28;
const CIRCULO = 28;

const estilos = StyleSheet.create({
  tarjeta: {
    gap: 12,
    padding: 20,
    borderRadius: RADIO_TARJETA,
    backgroundColor: COLORES.azulGrisaceo,
  },
  titulo: { fontFamily: FUENTES.negrita, fontSize: 16, color: COLORES.cafe },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  circulo: {
    width: CIRCULO,
    height: CIRCULO,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.pildora,
  },
  circuloMenta: { backgroundColor: COLORES.menta },
  circuloCrema: { backgroundColor: COLORES.crema },
  dimension: { fontFamily: FUENTES.regular, fontSize: 16, color: COLORES.cafe },
});

export default function TarjetaDimensiones({ explicacion }: { explicacion: Explicacion }) {
  const menor = explicacion.tipo === 'menorCoincidencia';
  const titulo = menor ? TEXTOS_MATCH.menorCoincidencia : TEXTOS_MATCH.porQueHacenMatch;
  return (
    <View style={estilos.tarjeta}>
      <Text accessibilityRole="header" style={estilos.titulo}>
        {titulo}
      </Text>
      {explicacion.dimensiones.map((dimension) => (
        <View key={dimension} style={estilos.fila}>
          <View style={[estilos.circulo, menor ? estilos.circuloCrema : estilos.circuloMenta]}>
            <MaterialCommunityIcons
              name={menor ? ICONOS_MATCH.tache : ICONOS_MATCH.palomita}
              size={18}
              color={COLORES.cafe}
            />
          </View>
          <Text style={estilos.dimension}>{dimension}</Text>
        </View>
      ))}
    </View>
  );
}
