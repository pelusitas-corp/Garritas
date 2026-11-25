/**
 * Botones "Rechazar" y "✓ Pre-aprobar" con su confirmación (spec F-08:
 * RF-05, RF-21, RC-05; PA-1, PA-3, PA-4). Se usan en la tarjeta de F-07
 * y en el Detalle de Solicitud.
 *
 * Al tocar un botón se abre `ConfirmarDecision` (toque 2). Al confirmar
 * (toque 3) llama a `alDecidir` con la acción; "Cancelar" no hace nada (A1).
 * Con `guardando`, los dos botones muestran el indicador y no responden
 * (F-08 flujo principal paso 5). "Pre-aprobar" nunca se ve gris (PA-4).
 * El mensaje de error NO va aquí: lo dibuja quien usa los botones, porque
 * va en un lugar distinto en la tarjeta y en el Detalle (PA-11).
 *
 * Recibe el nombre del adoptante (para la pregunta), `guardando`,
 * `alDecidir(accion)` y la variante. No devuelve datos.
 *
 * Diseño de Figma (plan de F-08):
 * - `tarjeta`: una fila, cada botón de la mitad del ancho, alto 56, 12 entre
 *   ellos. "✕ Rechazar" crema con el ícono `close`; "✓ Pre-aprobar" menta
 *   con el ícono `check`. Negrita 16 café.
 * - `detalle`: uno encima del otro, a lo ancho, alto 60, 12 entre ellos.
 *   Primero "Rechazar" azul grisáceo sin ícono; debajo "✓ Pre-aprobar" menta.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { COLORES, FUENTES, RADIOS } from '../../compartido/tema';
import ConfirmarDecision from './ConfirmarDecision';
import { ICONOS_DECISION } from './iconosDecision';
import type { NombreIcono } from './iconosDecision';
import { TEXTOS_DECISION } from './textos';
import type { AccionDecision } from './textos';

/** Dónde se usan los botones: en la tarjeta de F-07 o en el Detalle. */
export type VarianteBotones = 'tarjeta' | 'detalle';

const estilos = StyleSheet.create({
  filaTarjeta: { flexDirection: 'row', gap: 12 },
  columnaDetalle: { gap: 12 },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: RADIOS.pildora,
  },
  enTarjeta: { flex: 1, height: 56 },
  enDetalle: { height: 60 },
  crema: { backgroundColor: COLORES.crema },
  menta: { backgroundColor: COLORES.menta },
  azulGrisaceo: { backgroundColor: COLORES.azulGrisaceo },
  presionado: { opacity: 0.8 },
  texto: { fontFamily: FUENTES.negrita, fontSize: 16, color: COLORES.cafe },
});

/** Un botón de decisión: ícono opcional y texto, o el indicador mientras se guarda. */
function BotonDecision({
  texto,
  icono,
  estilo,
  guardando,
  alPresionar,
}: {
  texto: string;
  icono: NombreIcono | null;
  estilo: StyleProp<ViewStyle>;
  guardando: boolean;
  alPresionar: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={texto}
      accessibilityState={{ disabled: guardando, busy: guardando }}
      disabled={guardando}
      onPress={alPresionar}
      style={({ pressed }) => [estilos.boton, estilo, pressed && estilos.presionado]}
    >
      {guardando ? (
        <ActivityIndicator color={COLORES.cafe} />
      ) : (
        <>
          {icono ? <MaterialCommunityIcons name={icono} size={20} color={COLORES.cafe} /> : null}
          <Text style={estilos.texto}>{texto}</Text>
        </>
      )}
    </Pressable>
  );
}

interface Props {
  nombreAdoptante: string;
  guardando: boolean;
  alDecidir: (accion: AccionDecision) => void;
  variante: VarianteBotones;
}

export default function BotonesDecision({
  nombreAdoptante,
  guardando,
  alDecidir,
  variante,
}: Props) {
  /** Acción que se está confirmando; `null` = confirmación cerrada. */
  const [porConfirmar, setPorConfirmar] = useState<AccionDecision | null>(null);
  const enTarjeta = variante === 'tarjeta';
  const tamano = enTarjeta ? estilos.enTarjeta : estilos.enDetalle;

  const confirmar = () => {
    if (porConfirmar) {
      alDecidir(porConfirmar);
    }
    setPorConfirmar(null);
  };

  return (
    <View style={enTarjeta ? estilos.filaTarjeta : estilos.columnaDetalle}>
      <BotonDecision
        texto={TEXTOS_DECISION.rechazar}
        icono={enTarjeta ? ICONOS_DECISION.rechazar : null}
        estilo={[tamano, enTarjeta ? estilos.crema : estilos.azulGrisaceo]}
        guardando={guardando}
        alPresionar={() => setPorConfirmar('rechazar')}
      />
      <BotonDecision
        texto={TEXTOS_DECISION.preAprobar}
        icono={ICONOS_DECISION.preAprobar}
        estilo={[tamano, estilos.menta]}
        guardando={guardando}
        alPresionar={() => setPorConfirmar('pre-aprobar')}
      />
      <ConfirmarDecision
        accion={porConfirmar}
        nombreAdoptante={nombreAdoptante}
        alConfirmar={confirmar}
        alCancelar={() => setPorConfirmar(null)}
      />
    </View>
  );
}
