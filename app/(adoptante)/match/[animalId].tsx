/**
 * Match, "¡Es un match!" (spec F-06 flujos A y B: RF-20, RF-11, RF-17;
 * ruta /match/{animalId}). Reemplaza la pantalla provisional del esqueleto.
 *
 * Muestra el % y el porqué del match con el motor de F-05 (RN-01), o la
 * variante < 30 % (MS-3). Abajo, fijo, "Enviar solicitud" con un corazón.
 * Encima del botón aparecen los mensajes de A3 a A6. "Atrás" del sistema
 * regresa al Detalle. A1 y G-5 los resuelve `useMatch`.
 *
 * F-13 AF-20 (decisión del equipo, no está en el SRS; ajusta MS-8): arriba a
 * la izquierda va el botón "←", igual al del Detalle: regresa con
 * `router.back()` o, si no hay pantalla anterior (enlace directo), abre
 * `/animal/{animalId}` (02 §6). No cambia G-9 ni "¡Solicitud enviada!".
 *
 * Diseño de Figma ("Match", "Match · menos de 30 % (variante)"): encabezado
 * "Garritas"; huella grande; título negrita 32 café centrado; subtítulo
 * regular 16; tarjeta del % y tarjeta de dimensiones; botón azul marino a lo
 * ancho. Márgenes de 24 y separaciones de 16.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EncabezadoGarritas, { MARGEN } from '../../../src/adoptante/match/EncabezadoGarritas';
import HuellaMatch from '../../../src/adoptante/match/HuellaMatch';
import ICONOS_MATCH from '../../../src/adoptante/match/iconosMatch';
import { pantallaMatch } from '../../../src/adoptante/match/match';
import TarjetaDimensiones from '../../../src/adoptante/match/TarjetaDimensiones';
import TarjetaPorcentaje from '../../../src/adoptante/match/TarjetaPorcentaje';
import { TEXTOS_MATCH, textoParejaPerfecta } from '../../../src/adoptante/match/textos';
import useMatch from '../../../src/adoptante/match/useMatch';
import BotonPildora from '../../../src/compartido/BotonPildora';
import EstadoPantalla from '../../../src/compartido/EstadoPantalla';
import { rutaAnimal } from '../../../src/compartido/navegacion/rutas';
import { COLORES, FUENTES } from '../../../src/compartido/tema';

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.crema },
  contenido: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: MARGEN,
    paddingVertical: 16,
  },
  titulo: {
    fontFamily: FUENTES.negrita,
    fontSize: 32,
    color: COLORES.cafe,
    textAlign: 'center',
  },
  subtitulo: {
    fontFamily: FUENTES.regular,
    fontSize: 16,
    color: COLORES.cafe,
    textAlign: 'center',
  },
  pie: { gap: 8, paddingHorizontal: MARGEN, paddingTop: 8, paddingBottom: 12 },
  mensaje: {
    fontFamily: FUENTES.negrita,
    fontSize: 14,
    color: COLORES.cafe,
    textAlign: 'center',
  },
});

export default function Match() {
  const { animalId } = useLocalSearchParams<{ animalId: string }>();
  /** F-13 AF-20: "←" regresa al Detalle; con un enlace directo, lo abre. */
  const regresar = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(rutaAnimal(animalId));
    }
  };
  const { estado, envio, enviar, reintentar, irADescubrir } = useMatch(animalId);
  const propsEstado = pantallaMatch(estado, { reintentar, irADescubrir });

  if (propsEstado || estado.tipo !== 'match') {
    return (
      <SafeAreaView style={estilos.pantalla}>
        <EncabezadoGarritas alRegresar={regresar} />
        <EstadoPantalla
          estado={propsEstado?.estado ?? 'cargando'}
          mensaje={propsEstado?.mensaje}
          mensajeSiTarda={propsEstado?.mensajeSiTarda}
          boton={propsEstado?.boton}
        />
      </SafeAreaView>
    );
  }

  const { animal, resultado } = estado;
  const menor = resultado.explicacion.tipo === 'menorCoincidencia';

  return (
    <SafeAreaView style={estilos.pantalla}>
      <EncabezadoGarritas alRegresar={regresar} />
      <ScrollView contentContainerStyle={estilos.contenido}>
        <HuellaMatch conCorazon={!menor} />
        <Text accessibilityRole="header" style={estilos.titulo}>
          {menor ? resultado.explicacion.mensaje : TEXTOS_MATCH.esUnMatch}
        </Text>
        {menor ? null : <Text style={estilos.subtitulo}>{textoParejaPerfecta(animal.nombre)}</Text>}
        <TarjetaPorcentaje
          miniatura={animal.miniatura}
          porcentaje={resultado.porcentaje}
          menorCoincidencia={menor}
        />
        <TarjetaDimensiones explicacion={resultado.explicacion} />
      </ScrollView>
      <View style={estilos.pie}>
        {envio.mensaje ? (
          <Text accessibilityRole="alert" style={estilos.mensaje}>
            {envio.mensaje}
          </Text>
        ) : null}
        <BotonPildora
          texto={TEXTOS_MATCH.enviarSolicitud}
          icono={ICONOS_MATCH.corazon}
          alPresionar={enviar}
          cargando={envio.enviando}
          desactivado={envio.bloqueado}
        />
      </View>
    </SafeAreaView>
  );
}
