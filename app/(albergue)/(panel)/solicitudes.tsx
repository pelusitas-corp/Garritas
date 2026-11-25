/**
 * Solicitudes · lista de mis animales (spec F-07: RF-04; N-5, PS-2, PS-3,
 * PS-11, PS-14; ruta "/solicitudes", pestaña de inicio del albergue).
 *
 * Diseño de Figma (plan de F-07): encabezado con la huella de contorno y
 * "Solicitudes", a la derecha el ícono de usuario con "Cerrar sesión"
 * (N-3); debajo, el nombre del albergue y el título "Tus animales". Cada
 * fila muestra la miniatura, el nombre y "N solicitudes"; al tocarla se abre
 * `/solicitudes-animal/{animalId}` (toque 1 de RC-05).
 *
 * Los datos los lee `useMisAnimales` cada vez que la pantalla se enfoca
 * (PS-6). Cargando, vacía (A1), error (A4) y sin permiso (A5) los dibuja
 * `EstadoPantalla`.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FilaAnimal from '../../../src/albergue/panel/FilaAnimal';
import { ICONOS_PANEL } from '../../../src/albergue/panel/iconosPanel';
import MenuUsuario from '../../../src/albergue/panel/MenuUsuario';
import { TEXTOS_PANEL } from '../../../src/albergue/panel/textos';
import useMisAnimales from '../../../src/albergue/panel/useMisAnimales';
import EstadoPantalla from '../../../src/compartido/EstadoPantalla';
import { rutaSolicitudesAnimal } from '../../../src/compartido/navegacion/rutas';
import { useSesion } from '../../../src/compartido/navegacion/useSesion';
import { COLORES, FUENTES } from '../../../src/compartido/tema';

/** Margen lateral (Figma). */
const MARGEN = 24;

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.crema },
  encabezado: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: MARGEN,
  },
  marca: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  textoEncabezado: { fontFamily: FUENTES.negrita, fontSize: 24, color: COLORES.cafe },
  titulos: { gap: 2, marginTop: 16, marginBottom: 16, paddingHorizontal: MARGEN },
  subtitulo: { fontFamily: FUENTES.negrita, fontSize: 13, color: COLORES.cafe },
  titulo: { fontFamily: FUENTES.negrita, fontSize: 26, color: COLORES.cafe },
  lista: { gap: 12, paddingHorizontal: MARGEN, paddingBottom: MARGEN },
});

export default function Solicitudes() {
  const { cerrarSesion } = useSesion();
  const { estado } = useMisAnimales();
  const nombreAlbergue =
    estado.tipo === 'con-datos' || estado.tipo === 'vacia' ? estado.nombreAlbergue : null;

  return (
    <SafeAreaView style={estilos.pantalla} edges={['top']}>
      <View style={estilos.encabezado}>
        <View style={estilos.marca}>
          <MaterialCommunityIcons name={ICONOS_PANEL.marca} size={24} color={COLORES.cafe} />
          <Text accessibilityRole="header" style={estilos.textoEncabezado}>
            {TEXTOS_PANEL.encabezado}
          </Text>
        </View>
        <MenuUsuario alCerrarSesion={cerrarSesion} />
      </View>

      {nombreAlbergue !== null ? (
        <View style={estilos.titulos}>
          <Text style={estilos.subtitulo}>{nombreAlbergue}</Text>
          <Text style={estilos.titulo}>{TEXTOS_PANEL.tusAnimales}</Text>
        </View>
      ) : null}

      {estado.tipo === 'con-datos' ? (
        <FlatList
          data={estado.filas}
          keyExtractor={(fila) => fila.animal.id}
          contentContainerStyle={estilos.lista}
          renderItem={({ item }) => (
            <FilaAnimal
              animal={item.animal}
              conteo={item.conteo}
              alPresionar={() => router.push(rutaSolicitudesAnimal(item.animal.id))}
            />
          )}
        />
      ) : (
        <EstadoPantalla
          estado={estado.tipo}
          mensaje={estado.tipo === 'cargando' ? undefined : estado.mensaje}
        />
      )}
    </SafeAreaView>
  );
}
