/**
 * Descubrir (spec F-03: RF-10, RF-26, RNF-01; ruta /descubrir; pestaña del adoptante).
 *
 * Muestra el mazo ordenado por compatibilidad, una tarjeta a la vez.
 * Diseño del prototipo (DE-10): encabezado con la huella y "Garritas", el
 * ícono de usuario en un círculo azul claro (abre Mi perfil) y el subtítulo
 * "Tu próximo mejor amigo.". Si llega de G-8, muestra arriba "Esta mascota
 * ya no está disponible para adopción" (DE-4).
 * Los estados (cargando, vacía, mazo terminado, error y sin permiso) los
 * decide `pantallaDescubrir` y los dibuja `EstadoPantalla`.
 *
 * F-11 AD-5: el encabezado es `EncabezadoMarca` (se ve igual que antes).
 * F-11 AD-7: subtítulo de 22 más pegado al encabezado.
 * F-12 AE-4: la tarjeta empieza 16 debajo del subtítulo; `TarjetaAnimal`
 * deja otros 16 hasta los botones y 16 hasta la barra de pestañas.
 * F-13 AF-4: la tarjeta recibe la foto completa en cuanto llega
 * (`useFotosCompletas` y `fotoDeTarjeta`); mientras, la miniatura.
 * F-13 AF-19 (reemplaza la decoración de AF-5): sin estrellitas ni puntito
 * junto a "Tu próximo mejor amigo."; el subtítulo queda como antes de F-13.
 */
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BotonCircular from '../../../src/adoptante/descubrir/BotonCircular';
import { pantallaDescubrir } from '../../../src/adoptante/descubrir/estados';
import { fotoDeTarjeta } from '../../../src/adoptante/descubrir/fotoTarjeta';
import { ICONOS_DESCUBRIR } from '../../../src/adoptante/descubrir/iconosDescubrir';
import { tarjetaActual } from '../../../src/adoptante/descubrir/mazo';
import TarjetaAnimal from '../../../src/adoptante/descubrir/TarjetaAnimal';
import {
  TEXTO_GARRITAS,
  TEXTO_MI_PERFIL,
  TEXTO_SUBTITULO_DESCUBRIR,
} from '../../../src/adoptante/descubrir/textos';
import useDescubrir from '../../../src/adoptante/descubrir/useDescubrir';
import useFotosCompletas from '../../../src/adoptante/descubrir/useFotosCompletas';
import EncabezadoMarca from '../../../src/compartido/EncabezadoMarca';
import EstadoPantalla from '../../../src/compartido/EstadoPantalla';
import MENSAJES from '../../../src/compartido/mensajes';
import { RUTAS } from '../../../src/compartido/navegacion/rutas';
import { COLORES, FUENTES, RADIOS } from '../../../src/compartido/tema';

/** Margen lateral del prototipo. */
const MARGEN = 24;

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.crema },
  subtitulo: {
    marginTop: 8,
    paddingHorizontal: MARGEN,
    fontFamily: FUENTES.negrita,
    fontSize: 22,
    color: COLORES.cafe,
  },
  aviso: {
    marginHorizontal: MARGEN,
    marginTop: 12,
    padding: 16,
    borderRadius: RADIOS.tarjeta,
    backgroundColor: COLORES.menta,
  },
  textoAviso: { fontFamily: FUENTES.negrita, fontSize: 16, color: COLORES.cafe },
  // F-12 AE-4: la tarjeta empieza 16 debajo del subtítulo, igual que los demás espacios.
  cuerpo: { flex: 1, alignItems: 'center', paddingTop: 16 },
});

export default function Descubrir() {
  const { estado, avisoNoDisponible, pasar, verDeNuevo, abrirDetalle, reintentar } = useDescubrir();
  const propsEstado = pantallaDescubrir(estado, { reintentar, verDeNuevo });
  const tarjeta = estado.tipo === 'con-datos' ? tarjetaActual(estado.mazo) : null;
  const fotos = useFotosCompletas(estado.tipo === 'con-datos' ? estado.mazo : null);

  return (
    <SafeAreaView style={estilos.pantalla} edges={['top']}>
      <EncabezadoMarca
        texto={TEXTO_GARRITAS}
        derecha={
          <BotonCircular
            icono={ICONOS_DESCUBRIR.miPerfil}
            etiqueta={TEXTO_MI_PERFIL}
            fondo="azulGrisaceo"
            diametro={48}
            tamanoIcono={24}
            alPresionar={() => router.navigate(RUTAS.miPerfil)}
          />
        }
      />
      <Text style={estilos.subtitulo}>{TEXTO_SUBTITULO_DESCUBRIR}</Text>
      {avisoNoDisponible ? (
        <View style={estilos.aviso}>
          <Text accessibilityRole="alert" style={estilos.textoAviso}>
            {MENSAJES.MASCOTA_NO_DISPONIBLE}
          </Text>
        </View>
      ) : null}
      {propsEstado || !tarjeta ? (
        <EstadoPantalla
          estado={propsEstado?.estado ?? 'cargando'}
          mensaje={propsEstado?.mensaje}
          mensajeSiTarda={propsEstado?.mensajeSiTarda}
          boton={propsEstado?.boton}
        />
      ) : (
        <View style={estilos.cuerpo}>
          {/* F-11 AD-8: key = animalId, así cada tarjeta nueva empieza centrada. */}
          <TarjetaAnimal
            key={tarjeta.animalId}
            tarjeta={tarjeta}
            foto={fotoDeTarjeta(tarjeta, fotos)}
            alPasar={pasar}
            alAbrir={abrirDetalle}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
