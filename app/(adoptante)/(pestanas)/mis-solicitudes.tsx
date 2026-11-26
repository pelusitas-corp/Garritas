/**
 * Mis solicitudes (spec F-06 flujo D: RF-27; A5 a A7; N-4; ruta
 * /mis-solicitudes). Reemplaza la pantalla provisional del esqueleto.
 *
 * Encabezado "Mis solicitudes" con la huella; las tarjetas de la más
 * reciente a la más antigua (MS-7) y, debajo de la lista, "Cada paso te
 * acerca a su hogar.". Las tarjetas no llevan a ninguna parte (N-4). Se
 * vuelve a leer al enfocar la pestaña (`useMisSolicitudes`, MS-6). Los
 * estados de vacía, error y permiso los decide `pantallaMisSolicitudes`.
 *
 * F-13 AF-3 (decisión del equipo, no está en el SRS):
 * - debajo del título, "Aquí ves cómo van tus solicitudes." (16);
 * - el estado de cada tarjeta es texto con puntito (`EstadoConPuntito`);
 * - al final de la lista, "Descubrir más animales" lleva a la pestaña Descubrir;
 * - deslizar hacia abajo vuelve a leer del servidor (`RefreshControl`).
 * F-13 AF-18: con solicitudes, el subtítulo va dentro de la lista (se
 * desplaza con ella y desaparece al bajar); el título se queda arriba. Sin
 * lista (cargando, vacía, error o sin permiso) va debajo del título.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ICONOS_MATCH from '../../../src/adoptante/match/iconosMatch';
import { pantallaMisSolicitudes } from '../../../src/adoptante/solicitudes/misSolicitudes';
import TarjetaMiSolicitud from '../../../src/adoptante/solicitudes/TarjetaMiSolicitud';
import TEXTOS_MIS_SOLICITUDES from '../../../src/adoptante/solicitudes/textos';
import useMisSolicitudes from '../../../src/adoptante/solicitudes/useMisSolicitudes';
import BotonPildora from '../../../src/compartido/BotonPildora';
import EstadoPantalla from '../../../src/compartido/EstadoPantalla';
import { RUTAS } from '../../../src/compartido/navegacion/rutas';
import { COLORES, FUENTES, TAMANOS_TEXTO } from '../../../src/compartido/tema';

const MARGEN = 24;

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.crema },
  encabezado: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: MARGEN,
  },
  titulo: { fontFamily: FUENTES.negrita, fontSize: 24, color: COLORES.cafe },
  subtituloFijo: { paddingHorizontal: MARGEN },
  subtitulo: {
    fontFamily: FUENTES.regular,
    fontSize: TAMANOS_TEXTO.dato,
    color: COLORES.cafe,
  },
  lista: { gap: 12, paddingHorizontal: MARGEN, paddingBottom: 24 },
  cierre: {
    marginTop: 4,
    fontFamily: FUENTES.regular,
    fontSize: TAMANOS_TEXTO.minimo,
    color: COLORES.cafe,
    textAlign: 'center',
  },
});

export default function MisSolicitudes() {
  const { estado, reintentar, actualizando, actualizar } = useMisSolicitudes();
  const propsEstado = pantallaMisSolicitudes(estado, reintentar);

  return (
    <SafeAreaView style={estilos.pantalla} edges={['top']}>
      <View style={estilos.encabezado}>
        <MaterialCommunityIcons name={ICONOS_MATCH.huella} size={24} color={COLORES.cafe} />
        <Text accessibilityRole="header" style={estilos.titulo}>
          {TEXTOS_MIS_SOLICITUDES.encabezado}
        </Text>
      </View>
      {propsEstado || estado.tipo !== 'con-datos' ? (
        <>
          <Text style={[estilos.subtitulo, estilos.subtituloFijo]}>
            {TEXTOS_MIS_SOLICITUDES.subtitulo}
          </Text>
          <EstadoPantalla
            estado={propsEstado?.estado ?? 'cargando'}
            mensaje={propsEstado?.mensaje}
            boton={propsEstado?.boton}
          />
        </>
      ) : (
        <ScrollView
          contentContainerStyle={estilos.lista}
          refreshControl={
            <RefreshControl
              refreshing={actualizando}
              onRefresh={actualizar}
              colors={[COLORES.azulMarino]}
              tintColor={COLORES.azulMarino}
            />
          }
        >
          {/* F-13 AF-18: el subtítulo se desplaza con la lista. */}
          <Text style={estilos.subtitulo}>{TEXTOS_MIS_SOLICITUDES.subtitulo}</Text>
          {estado.solicitudes.map((solicitud) => (
            <TarjetaMiSolicitud key={solicitud.id} solicitud={solicitud} />
          ))}
          <Text style={estilos.cierre}>{TEXTOS_MIS_SOLICITUDES.cadaPaso}</Text>
          <BotonPildora
            texto={TEXTOS_MIS_SOLICITUDES.descubrirMas}
            alPresionar={() => router.navigate(RUTAS.descubrir)}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
