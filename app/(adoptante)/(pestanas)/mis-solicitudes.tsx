/**
 * Mis solicitudes (spec F-06 flujo D: RF-27; A5 a A7; N-4; ruta
 * /mis-solicitudes). Reemplaza la pantalla provisional del esqueleto.
 *
 * Encabezado "Mis solicitudes" con la huella; las tarjetas de la más
 * reciente a la más antigua (MS-7) y, debajo de la lista, "Cada paso te
 * acerca a su hogar.". Las tarjetas no llevan a ninguna parte (N-4). Se
 * vuelve a leer al enfocar la pestaña (`useMisSolicitudes`, MS-6). Los
 * estados de vacía, error y permiso los decide `pantallaMisSolicitudes`.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ICONOS_MATCH from '../../../src/adoptante/match/iconosMatch';
import { pantallaMisSolicitudes } from '../../../src/adoptante/solicitudes/misSolicitudes';
import TarjetaMiSolicitud from '../../../src/adoptante/solicitudes/TarjetaMiSolicitud';
import TEXTOS_MIS_SOLICITUDES from '../../../src/adoptante/solicitudes/textos';
import useMisSolicitudes from '../../../src/adoptante/solicitudes/useMisSolicitudes';
import EstadoPantalla from '../../../src/compartido/EstadoPantalla';
import { COLORES, FUENTES } from '../../../src/compartido/tema';

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
  lista: { gap: 12, paddingHorizontal: MARGEN, paddingTop: 16, paddingBottom: 24 },
  cierre: {
    marginTop: 4,
    fontFamily: FUENTES.regular,
    fontSize: 13,
    color: COLORES.cafe,
    textAlign: 'center',
  },
});

export default function MisSolicitudes() {
  const { estado, reintentar } = useMisSolicitudes();
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
        <EstadoPantalla
          estado={propsEstado?.estado ?? 'cargando'}
          mensaje={propsEstado?.mensaje}
          boton={propsEstado?.boton}
        />
      ) : (
        <ScrollView contentContainerStyle={estilos.lista}>
          {estado.solicitudes.map((solicitud) => (
            <TarjetaMiSolicitud key={solicitud.id} solicitud={solicitud} />
          ))}
          <Text style={estilos.cierre}>{TEXTOS_MIS_SOLICITUDES.cadaPaso}</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
