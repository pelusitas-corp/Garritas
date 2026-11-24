/**
 * Estilo Soft UI de las pestañas (adoptante y albergue).
 *
 * [PENDIENTE: íconos de Figma (huella, portapapeles, usuario). Se necesita
 * una librería de íconos que hoy no está instalada (@expo/vector-icons);
 * por la regla de CLAUDE.md, se pregunta antes de agregarla.] Mientras
 * tanto, las pestañas muestran solo el texto.
 */
import type { TabsScreenOptions } from 'expo-router/tabs';

import { COLORES, FUENTES } from '../tema';

const OPCIONES_PESTANAS: TabsScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: COLORES.azulMarino,
  tabBarInactiveTintColor: COLORES.cafe,
  tabBarActiveBackgroundColor: COLORES.azulGrisaceo,
  tabBarStyle: { backgroundColor: COLORES.crema, borderTopWidth: 0, height: 72 },
  tabBarItemStyle: { borderRadius: 24, margin: 8 },
  tabBarIconStyle: { display: 'none' },
  tabBarLabelStyle: { fontFamily: FUENTES.negrita, fontSize: 14 },
  tabBarLabelPosition: 'beside-icon',
};

export default OPCIONES_PESTANAS;
