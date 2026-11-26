/**
 * Perfil Garritas (spec F-04: RF-19; ruta /perfil-garritas).
 *
 * Se abre después de "Ver mi perfil Garritas". Muestra la ilustración, el
 * nombre y la frase del perfil, y "Ver mis matches" lleva a Descubrir.
 * Estados (§8): cargando, con datos, vacía (cuestionario incompleto),
 * error de conexión y sin permiso.
 *
 * F-11 AD-5: arriba a la izquierda va `EncabezadoMarca` con "Garritas".
 *
 * F-12 AE-3 (decisión del equipo, no está en el SRS): el perfil (círculo con
 * decoraciones, nombre y frase) y "Ver mis matches" forman un solo grupo
 * centrado verticalmente debajo del encabezado, con 32 entre la frase y el
 * botón (Figma "Perfil Garritas · Caminante").
 */
import { router } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TarjetaPerfilGarritas from '../../src/adoptante/perfil/TarjetaPerfilGarritas';
import { usePerfilGarritas } from '../../src/adoptante/perfil/usePerfilGarritas';
import { TEXTO_VER_MIS_MATCHES } from '../../src/adoptante/cuestionario/textos';
import { TEXTO_GARRITAS } from '../../src/adoptante/descubrir/textos';
import BotonPildora from '../../src/compartido/BotonPildora';
import EncabezadoMarca from '../../src/compartido/EncabezadoMarca';
import EstadoPantalla from '../../src/compartido/EstadoPantalla';
import MENSAJES from '../../src/compartido/mensajes';
import { RUTAS } from '../../src/compartido/navegacion/rutas';
import { COLORES } from '../../src/compartido/tema';

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.crema },
  // F-12 AE-3: un solo grupo al centro; antes el botón quedaba pegado abajo.
  contenido: { flex: 1, justifyContent: 'center', gap: 32, padding: 24 },
});

export default function PerfilGarritas() {
  const estado = usePerfilGarritas();

  // replace: "atrás" no regresa aquí ni al cuestionario (02-navegacion §4.2).
  const alVerMisMatches = useCallback(() => router.replace(RUTAS.descubrir), []);

  if (estado.tipo === 'cargando') {
    return <EstadoPantalla estado="cargando" />;
  }
  if (estado.tipo === 'vacia') {
    return <EstadoPantalla estado="vacia" mensaje={MENSAJES.PERFIL_SIN_CUESTIONARIO} />;
  }
  if (estado.tipo === 'error' || estado.tipo === 'sin-permiso') {
    return <EstadoPantalla estado={estado.tipo} />;
  }

  return (
    <SafeAreaView style={estilos.pantalla}>
      <EncabezadoMarca texto={TEXTO_GARRITAS} />
      <View style={estilos.contenido}>
        <TarjetaPerfilGarritas perfil={estado.perfil} />
        <BotonPildora texto={TEXTO_VER_MIS_MATCHES} alPresionar={alVerMisMatches} />
      </View>
    </SafeAreaView>
  );
}
