/**
 * Mi perfil (spec F-04: RF-19; ruta /mi-perfil; pestaña del adoptante).
 *
 * Con el cuestionario completo: saludo del adoptante y su perfil Garritas
 * (ilustración, nombre y frase).
 * Sin terminar (G-6, RF-19 no válido): NO redirige; muestra el mensaje
 * "Termina tu cuestionario para descubrir tu perfil Garritas" y "Cerrar sesión".
 * Otros estados (§8): cargando, error de conexión y sin permiso.
 *
 * F-11 AD-5 y AD-6: arriba a la izquierda va `EncabezadoMarca` con "Mi perfil";
 * la tarjeta del perfil queda centrada en el espacio que sobra.
 *
 * F-13 (decisión del equipo, no está en el SRS):
 * - AF-1: la tarjeta del nombre (F-12 AE-5) ya no lleva ícono y dice
 *   "¡Hola, {nombre}!" en negrita 26. Debajo, fuera de la tarjeta,
 *   "Tu perfil Garritas es:" (16) y luego la tarjeta del perfil.
 * - AF-2: "Cerrar sesión" es una píldora chica azul grisáceo con el ícono
 *   `logout`, en la esquina superior derecha del encabezado (ya no va abajo).
 *   Los estados vacía y sin permiso usan la misma píldora chica.
 * Si todo cabe, la pantalla no rebota ni se mueve al deslizar (F-12 AE-5).
 */
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TEXTO_MI_PERFIL } from '../../../src/adoptante/descubrir/textos';
import TarjetaPerfilGarritas from '../../../src/adoptante/perfil/TarjetaPerfilGarritas';
import { TEXTO_TU_PERFIL, textoSaludo } from '../../../src/adoptante/perfil/textos';
import { useNombreAdoptante } from '../../../src/adoptante/perfil/useNombreAdoptante';
import { usePerfilGarritas } from '../../../src/adoptante/perfil/usePerfilGarritas';
import BotonPildora from '../../../src/compartido/BotonPildora';
import type { IconoBotonTexto } from '../../../src/compartido/BotonTexto';
import EncabezadoMarca from '../../../src/compartido/EncabezadoMarca';
import EstadoPantalla from '../../../src/compartido/EstadoPantalla';
import MENSAJES from '../../../src/compartido/mensajes';
import { useSesion } from '../../../src/compartido/navegacion/useSesion';
import { COLORES, FUENTES, RADIOS, TAMANOS_TEXTO } from '../../../src/compartido/tema';

/** Texto del botón de N-3 (02-navegacion), igual que en la pantalla provisional. */
const TEXTO_CERRAR_SESION = 'Cerrar sesión';

/** Ícono de salida de "Cerrar sesión" (F-12 AE-6, igual que en el menú del albergue). */
const ICONO_CERRAR_SESION: IconoBotonTexto = 'logout';

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.crema },
  contenido: { flexGrow: 1, gap: 32, padding: 24 },
  // F-12 AE-5 y F-13 AF-1: el saludo en su propia tarjeta, arriba, sin ícono.
  tarjetaNombre: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: RADIOS.tarjeta,
    backgroundColor: COLORES.azulGrisaceo,
  },
  saludo: {
    fontFamily: FUENTES.negrita,
    fontSize: TAMANOS_TEXTO.saludo,
    color: COLORES.cafe,
    textAlign: 'center',
  },
  // F-11 AD-6: el perfil Garritas, centrado en el espacio libre.
  cuerpo: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  tuPerfil: {
    fontFamily: FUENTES.regular,
    fontSize: TAMANOS_TEXTO.dato,
    color: COLORES.cafe,
    textAlign: 'center',
  },
});

export default function MiPerfil() {
  const { cerrarSesion } = useSesion();
  const perfil = usePerfilGarritas();
  const nombre = useNombreAdoptante();
  const botonCerrarSesion = {
    texto: TEXTO_CERRAR_SESION,
    icono: ICONO_CERRAR_SESION,
    alPresionar: cerrarSesion,
  };

  if (perfil.tipo === 'sin-permiso' || nombre.tipo === 'sin-permiso') {
    return <EstadoPantalla estado="sin-permiso" botonChico={botonCerrarSesion} />;
  }
  if (perfil.tipo === 'cargando') {
    return <EstadoPantalla estado="cargando" />;
  }
  if (perfil.tipo === 'vacia') {
    // G-6 (RF-19 no válido): se queda aquí, sin redirigir.
    return (
      <EstadoPantalla
        estado="vacia"
        mensaje={MENSAJES.PERFIL_SIN_CUESTIONARIO}
        botonChico={botonCerrarSesion}
      />
    );
  }
  if (perfil.tipo === 'error' || nombre.tipo === 'error') {
    return <EstadoPantalla estado="error" />;
  }
  if (nombre.tipo === 'cargando') {
    return <EstadoPantalla estado="cargando" />;
  }

  return (
    <SafeAreaView style={estilos.pantalla} edges={['top']}>
      {/* N-3 y F-13 AF-2: "Cerrar sesión" como píldora chica arriba a la derecha. */}
      <EncabezadoMarca
        texto={TEXTO_MI_PERFIL}
        derecha={
          <BotonPildora
            texto={TEXTO_CERRAR_SESION}
            icono={ICONO_CERRAR_SESION}
            alPresionar={cerrarSesion}
            tamano="chico"
            gris
          />
        }
      />
      {/* F-12 AE-5: sin rebote si todo cabe (iOS y Android); si no cabe, se desplaza. */}
      <ScrollView
        contentContainerStyle={estilos.contenido}
        alwaysBounceVertical={false}
        overScrollMode="never"
      >
        {nombre.nombre ? (
          <View style={estilos.tarjetaNombre}>
            <Text accessibilityRole="header" style={estilos.saludo}>
              {textoSaludo(nombre.nombre)}
            </Text>
          </View>
        ) : null}
        <View style={estilos.cuerpo}>
          <Text style={estilos.tuPerfil}>{TEXTO_TU_PERFIL}</Text>
          <TarjetaPerfilGarritas perfil={perfil.perfil} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
