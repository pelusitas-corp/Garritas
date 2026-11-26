/**
 * Mi perfil (spec F-04: RF-19; ruta /mi-perfil; pestaña del adoptante).
 *
 * Con el cuestionario completo: nombre del adoptante, su perfil Garritas
 * (ilustración, nombre y frase) y "Cerrar sesión" al final (N-3).
 * Sin terminar (G-6, RF-19 no válido): NO redirige; muestra el mensaje
 * "Termina tu cuestionario para descubrir tu perfil Garritas" y "Cerrar sesión".
 * Otros estados (§8): cargando, error de conexión y sin permiso.
 *
 * F-11 AD-5 y AD-6: arriba a la izquierda va `EncabezadoMarca` con "Mi perfil";
 * el nombre y la tarjeta quedan centrados entre el encabezado y "Cerrar sesión".
 *
 * F-12 AE-5 (decisión del equipo, no está en el SRS): debajo del encabezado,
 * el nombre va en su propia tarjeta (azul grisáceo, radio 24, relleno 20,
 * ícono de usuario de 28 y nombre en negrita 24). 32 debajo, la tarjeta del
 * perfil Garritas queda centrada en el espacio que sobra. Si todo cabe, la
 * pantalla no rebota ni se mueve al deslizar.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TEXTO_MI_PERFIL } from '../../../src/adoptante/descubrir/textos';
import TarjetaPerfilGarritas from '../../../src/adoptante/perfil/TarjetaPerfilGarritas';
import { useNombreAdoptante } from '../../../src/adoptante/perfil/useNombreAdoptante';
import { usePerfilGarritas } from '../../../src/adoptante/perfil/usePerfilGarritas';
import BotonTexto from '../../../src/compartido/BotonTexto';
import type { IconoBotonTexto } from '../../../src/compartido/BotonTexto';
import EncabezadoMarca from '../../../src/compartido/EncabezadoMarca';
import EstadoPantalla from '../../../src/compartido/EstadoPantalla';
import MENSAJES from '../../../src/compartido/mensajes';
import { useSesion } from '../../../src/compartido/navegacion/useSesion';
import { COLORES, FUENTES, RADIOS } from '../../../src/compartido/tema';

/** Texto del botón de N-3 (02-navegacion), igual que en la pantalla provisional. */
const TEXTO_CERRAR_SESION = 'Cerrar sesión';

/** Ícono de salida de "Cerrar sesión" (F-12 AE-6, igual que en el menú del albergue). */
const ICONO_CERRAR_SESION: IconoBotonTexto = 'logout';

/** Ícono de usuario de la tarjeta del nombre (F-12 AE-5). */
const ICONO_USUARIO: IconoBotonTexto = 'account-outline';

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.crema },
  contenido: { flexGrow: 1, gap: 32, padding: 24 },
  // F-12 AE-5: el nombre en su propia tarjeta, arriba.
  tarjetaNombre: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
    borderRadius: RADIOS.tarjeta,
    backgroundColor: COLORES.azulGrisaceo,
  },
  nombre: {
    flexShrink: 1,
    fontFamily: FUENTES.negrita,
    fontSize: 24,
    color: COLORES.cafe,
    textAlign: 'center',
  },
  // F-11 AD-6: el perfil Garritas, centrado en el espacio libre.
  cuerpo: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
    return <EstadoPantalla estado="sin-permiso" botonTexto={botonCerrarSesion} />;
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
        botonTexto={botonCerrarSesion}
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
      <EncabezadoMarca texto={TEXTO_MI_PERFIL} />
      {/* F-12 AE-5: sin rebote si todo cabe (iOS y Android); si no cabe, se desplaza. */}
      <ScrollView
        contentContainerStyle={estilos.contenido}
        alwaysBounceVertical={false}
        overScrollMode="never"
      >
        {nombre.nombre ? (
          <View style={estilos.tarjetaNombre}>
            <MaterialCommunityIcons name={ICONO_USUARIO} size={28} color={COLORES.cafe} />
            <Text accessibilityRole="header" style={estilos.nombre}>
              {nombre.nombre}
            </Text>
          </View>
        ) : null}
        <View style={estilos.cuerpo}>
          <TarjetaPerfilGarritas perfil={perfil.perfil} />
        </View>
        {/* N-3: "Cerrar sesión" al final de Mi perfil (F-12 AE-6: botón de texto, sin píldora). */}
        <BotonTexto
          texto={TEXTO_CERRAR_SESION}
          icono={ICONO_CERRAR_SESION}
          alPresionar={cerrarSesion}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
