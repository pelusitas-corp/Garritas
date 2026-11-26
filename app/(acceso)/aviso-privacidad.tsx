/**
 * Aviso de Privacidad (F-01 §3 flujo A, RF-25; ruta "/aviso-privacidad").
 *
 * Estados (§3.1):
 * - "1 sin aceptar": "Continuar" se ve gris, pero responde al toque (A1);
 * - "1b error": se presionó "Continuar" sin la casilla → mensaje de CA-02;
 * - "2 aceptado": casilla marcada → "Continuar" guarda la aceptación con su
 *   fecha EN MEMORIA y abre el registro (CA-01).
 *
 * F-11 AD-3 (decisión del equipo; no está en el SRS): el enlace, la casilla y
 * el mensaje de CA-02 van DENTRO del recuadro que se desplaza, al final del
 * aviso, y "Continuar" queda fijo debajo. Cada vez que se toca "Continuar"
 * sin la casilla, el recuadro baja solo hasta el final (`scrollToEnd`).
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ScrollViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { avisoSimplificadoParaApp } from '../../src/compartido/acceso/avisos';
import { guardarAceptacion } from '../../src/compartido/acceso/consentimiento';
import EncabezadoAcceso from '../../src/compartido/acceso/EncabezadoAcceso';
import estilosAcceso from '../../src/compartido/acceso/estilosAcceso';
import MensajeError from '../../src/compartido/acceso/MensajeError';
import TextoAviso from '../../src/compartido/acceso/TextoAviso';
import BotonPildora from '../../src/compartido/BotonPildora';
import MENSAJES from '../../src/compartido/mensajes';
import { RUTAS } from '../../src/compartido/navegacion/rutas';
import { COLORES, FUENTES, RADIOS } from '../../src/compartido/tema';

const AVISO = avisoSimplificadoParaApp();

const estilos = StyleSheet.create({
  contenido: { flex: 1, gap: 12, paddingHorizontal: 24, paddingBottom: 24 },
  recuadro: { flex: 1, backgroundColor: COLORES.menta, borderRadius: RADIOS.tarjeta },
  textoRecuadro: { gap: 16, padding: 20 },
  enlace: {
    fontFamily: FUENTES.negrita,
    fontSize: 16,
    color: COLORES.azulMarino,
    textDecorationLine: 'underline',
  },
  casilla: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  textoCasilla: { flex: 1, fontFamily: FUENTES.regular, fontSize: 15, color: COLORES.cafe },
});

export default function AvisoPrivacidad() {
  const [aceptado, setAceptado] = useState(false);
  const [mostrarError, setMostrarError] = useState(false);
  /** Veces que se tocó "Continuar" sin la casilla: cada una baja el recuadro. */
  const [intentosSinCasilla, setIntentosSinCasilla] = useState(0);
  const recuadro = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    if (intentosSinCasilla > 0) {
      // AD-3: ya con el mensaje dibujado, baja para que se vean la casilla y el mensaje.
      recuadro.current?.scrollToEnd({ animated: true });
    }
  }, [intentosSinCasilla]);

  const alternarCasilla = () => {
    setAceptado((anterior) => !anterior);
    setMostrarError(false);
  };

  const continuar = () => {
    if (!aceptado) {
      setMostrarError(true); // CA-02: no avanza
      setIntentosSinCasilla((anteriores) => anteriores + 1);
      return;
    }
    guardarAceptacion(new Date()); // CA-01: aceptación con su fecha
    router.push(RUTAS.registro);
  };

  return (
    <SafeAreaView style={estilosAcceso.pantalla}>
      <EncabezadoAcceso conFlechaAtras />
      <View style={estilos.contenido}>
        <Text accessibilityRole="header" style={estilosAcceso.titulo}>
          Aviso de privacidad
        </Text>
        <Text style={estilosAcceso.subtitulo}>
          Antes de crear tu cuenta, revisa cómo cuidamos tus datos.
        </Text>
        <ScrollView
          ref={recuadro}
          style={estilos.recuadro}
          contentContainerStyle={estilos.textoRecuadro}
        >
          <TextoAviso markdown={AVISO} />
          <Pressable accessibilityRole="link" onPress={() => router.push(RUTAS.avisoIntegral)}>
            <Text style={estilos.enlace}>Ver aviso completo</Text>
          </Pressable>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: aceptado }}
            onPress={alternarCasilla}
            style={estilos.casilla}
          >
            <Ionicons
              name={aceptado ? 'checkbox' : 'square-outline'}
              size={28}
              color={COLORES.azulMarino}
            />
            <Text style={estilos.textoCasilla}>
              Acepto el aviso de privacidad y confirmo que soy mayor de 18 años
            </Text>
          </Pressable>
          {mostrarError ? <MensajeError texto={MENSAJES.AVISO_SIN_ACEPTAR} /> : null}
        </ScrollView>
        <BotonPildora texto="Continuar" alPresionar={continuar} gris={!aceptado} />
      </View>
    </SafeAreaView>
  );
}
