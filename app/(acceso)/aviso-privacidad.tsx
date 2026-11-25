/**
 * Aviso de Privacidad (F-01 §3 flujo A, RF-25; ruta "/aviso-privacidad").
 *
 * Estados (§3.1):
 * - "1 sin aceptar": "Continuar" se ve gris, pero responde al toque (A1);
 * - "1b error": se presionó "Continuar" sin la casilla → mensaje de CA-02;
 * - "2 aceptado": casilla marcada → "Continuar" guarda la aceptación con su
 *   fecha EN MEMORIA y abre el registro (CA-01).
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  textoRecuadro: { padding: 20 },
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

  const alternarCasilla = () => {
    setAceptado((anterior) => !anterior);
    setMostrarError(false);
  };

  const continuar = () => {
    if (!aceptado) {
      setMostrarError(true); // CA-02: no avanza
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
        <ScrollView style={estilos.recuadro} contentContainerStyle={estilos.textoRecuadro}>
          <TextoAviso markdown={AVISO} />
        </ScrollView>
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
        <BotonPildora texto="Continuar" alPresionar={continuar} gris={!aceptado} />
      </View>
    </SafeAreaView>
  );
}
