/**
 * Pantalla PROVISIONAL del esqueleto de navegación (specs/02-navegacion.md
 * §8). Cada ruta de §4 la usa hasta que su feature (F-01 a F-08) ponga el
 * contenido real; entonces se borra de esa ruta.
 *
 * Analogía: es el cuarto con muros y puertas, pero sin muebles. Muestra el
 * título de Figma, los botones que llevan a otras pantallas y, en las
 * pantallas con datos, una vista previa de sus estados (§7).
 *
 * Recibe:
 * - `titulo`: título de la pantalla en Figma;
 * - `ruta` y `feature`: nota técnica de qué ruta es y quién la llena;
 * - `aviso`: mensaje del SRS que la guarda pide mostrar (p. ej. RF-02);
 * - `botones`: botones de navegación de §4 (texto de Figma);
 * - `estados`: textos de vacía, error y "si tarda" para la vista previa.
 */
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BotonPildora from '../BotonPildora';
import EstadoPantalla from '../EstadoPantalla';
import type { TipoEstado } from '../EstadoPantalla';
import { COLORES, FUENTES, RADIOS } from '../tema';

export interface BotonProvisional {
  texto: string;
  alPresionar: () => void;
  variante?: 'principal' | 'secundario';
}

export interface EstadosDePrueba {
  vacia?: string;
  error?: string;
  siTarda?: string;
}

interface Props {
  titulo: string;
  ruta: string;
  feature: string;
  aviso?: string;
  botones?: BotonProvisional[];
  estados?: EstadosDePrueba | null;
}

type Vista = 'con-datos' | Exclude<TipoEstado, 'sin-permiso'>;

/** Nombres de las columnas de §7 (estados de una pantalla con datos). */
const NOMBRES_VISTA: Record<Vista, string> = {
  'con-datos': 'Con datos',
  cargando: 'Cargando',
  vacia: 'Vacía',
  error: 'Error de conexión',
};

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.crema },
  contenido: { flexGrow: 1, gap: 16, padding: 24 },
  titulo: { fontFamily: FUENTES.negrita, fontSize: 28, color: COLORES.cafe },
  nota: { fontFamily: FUENTES.regular, fontSize: 14, color: COLORES.cafe },
  aviso: {
    fontFamily: FUENTES.negrita,
    fontSize: 16,
    color: COLORES.cafe,
    backgroundColor: COLORES.menta,
    borderRadius: RADIOS.tarjeta,
    overflow: 'hidden',
    padding: 16,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: RADIOS.pildora,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORES.azulGrisaceo,
  },
  chipActivo: { backgroundColor: COLORES.azulMarino },
  textoChip: { fontFamily: FUENTES.regular, fontSize: 14, color: COLORES.cafe },
  textoChipActivo: { color: COLORES.crema },
  vistaPrevia: {
    minHeight: 240,
    borderRadius: RADIOS.tarjeta,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORES.azulGrisaceo,
  },
  botones: { gap: 12, marginTop: 'auto' },
});

/** Vistas disponibles según los textos que la pantalla definió. */
function vistasDisponibles(estados: EstadosDePrueba): Vista[] {
  const vistas: Vista[] = ['con-datos', 'cargando'];
  if (estados.vacia) {
    vistas.push('vacia');
  }
  if (estados.error) {
    vistas.push('error');
  }
  return vistas;
}

export default function PantallaProvisional({
  titulo,
  ruta,
  feature,
  aviso = '',
  botones = [],
  estados = null,
}: Props) {
  const [vista, setVista] = useState<Vista>('con-datos');

  return (
    <SafeAreaView style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Text accessibilityRole="header" style={estilos.titulo}>
          {titulo}
        </Text>
        <Text style={estilos.nota}>{`Pantalla provisional · ${feature} · ${ruta}`}</Text>
        {aviso ? (
          <Text accessibilityRole="alert" style={estilos.aviso}>
            {aviso}
          </Text>
        ) : null}

        {estados ? (
          <>
            <View style={estilos.chips}>
              {vistasDisponibles(estados).map((opcion) => (
                <Pressable
                  key={opcion}
                  accessibilityRole="button"
                  onPress={() => setVista(opcion)}
                  style={[estilos.chip, vista === opcion && estilos.chipActivo]}
                >
                  <Text style={[estilos.textoChip, vista === opcion && estilos.textoChipActivo]}>
                    {NOMBRES_VISTA[opcion]}
                  </Text>
                </Pressable>
              ))}
            </View>
            {vista !== 'con-datos' ? (
              <View style={estilos.vistaPrevia}>
                <EstadoPantalla
                  estado={vista}
                  mensaje={vista === 'vacia' ? estados.vacia : estados.error}
                  mensajeSiTarda={estados.siTarda}
                />
              </View>
            ) : null}
          </>
        ) : null}

        <View style={estilos.botones}>
          {botones.map((boton) => (
            <BotonPildora
              key={boton.texto}
              texto={boton.texto}
              alPresionar={boton.alPresionar}
              variante={boton.variante}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
