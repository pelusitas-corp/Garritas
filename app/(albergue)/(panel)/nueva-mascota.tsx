/**
 * "Nueva mascota" · Alta del animal (F-02; RF-01, RF-13, RF-14, RI-02;
 * ruta "/nueva-mascota", pestaña "Mascotas").
 *
 * Orden (AL-12): fotos → datos básicos → cuidados de salud → perfil de
 * compatibilidad → "Publicar para adopción". El formulario se desplaza
 * (ScrollView); el mensaje de error y el botón quedan fijos abajo, para
 * verse sin hacer scroll (plan, ajuste 3). Al publicar, regresa a
 * /solicitudes (02-navegacion §4.3, AL-7).
 */
import { router } from 'expo-router';
import { useCallback } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CasillaCuidado from '../../../src/albergue/alta/CasillaCuidado';
import { DIMENSIONES_PERFIL } from '../../../src/albergue/alta/opcionesPerfil';
import type { DimensionPerfil } from '../../../src/albergue/alta/opcionesPerfil';
import SeccionFotos from '../../../src/albergue/alta/SeccionFotos';
import SelectorOpciones from '../../../src/albergue/alta/SelectorOpciones';
import {
  OPCIONES_EDAD_ALTA,
  OPCIONES_ESPECIE,
  OPCIONES_TAMANO_ALTA,
  TEXTOS_ALTA,
} from '../../../src/albergue/alta/textos';
import { useAltaAnimal } from '../../../src/albergue/alta/useAltaAnimal';
import CampoTexto from '../../../src/compartido/acceso/CampoTexto';
import MensajeError from '../../../src/compartido/acceso/MensajeError';
import BotonPildora from '../../../src/compartido/BotonPildora';
import { RUTAS } from '../../../src/compartido/navegacion/rutas';
import { COLORES, FUENTES } from '../../../src/compartido/tema';

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.crema },
  flex: { flex: 1 },
  contenido: { gap: 20, padding: 24 },
  titulo: { fontFamily: FUENTES.negrita, fontSize: 28, color: COLORES.cafe },
  seccion: { gap: 12 },
  tituloSeccion: { fontFamily: FUENTES.negrita, fontSize: 20, color: COLORES.cafe },
  abajo: {
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORES.crema,
    borderTopWidth: 2,
    borderTopColor: COLORES.azulGrisaceo,
  },
});

export default function NuevaMascota() {
  const irASolicitudes = useCallback(() => router.navigate(RUTAS.solicitudes), []);
  const alta = useAltaAnimal(irASolicitudes);
  const bloqueado = alta.publicando;

  /** Dibuja una dimensión del perfil con su selector (RF-14). */
  const selectorDe = (dimension: DimensionPerfil) => {
    switch (dimension.clave) {
      case 'energia':
        return (
          <SelectorOpciones
            key={dimension.clave}
            titulo={dimension.titulo}
            opciones={dimension.opciones}
            valor={alta.perfil.energia}
            alElegir={(valor) => alta.elegirPerfil('energia', valor)}
            bloqueado={bloqueado}
          />
        );
      case 'espacio':
        return (
          <SelectorOpciones
            key={dimension.clave}
            titulo={dimension.titulo}
            opciones={dimension.opciones}
            valor={alta.perfil.espacio}
            alElegir={(valor) => alta.elegirPerfil('espacio', valor)}
            bloqueado={bloqueado}
          />
        );
      case 'tiempo':
        return (
          <SelectorOpciones
            key={dimension.clave}
            titulo={dimension.titulo}
            opciones={dimension.opciones}
            valor={alta.perfil.tiempo}
            alElegir={(valor) => alta.elegirPerfil('tiempo', valor)}
            bloqueado={bloqueado}
          />
        );
      case 'experiencia':
        return (
          <SelectorOpciones
            key={dimension.clave}
            titulo={dimension.titulo}
            opciones={dimension.opciones}
            valor={alta.perfil.experiencia}
            alElegir={(valor) => alta.elegirPerfil('experiencia', valor)}
            bloqueado={bloqueado}
          />
        );
      case 'convivencia':
        return (
          <SelectorOpciones
            key={dimension.clave}
            titulo={dimension.titulo}
            opciones={dimension.opciones}
            valor={alta.perfil.convivencia}
            alElegir={(valor) => alta.elegirPerfil('convivencia', valor)}
            bloqueado={bloqueado}
          />
        );
      default:
        return (
          <SelectorOpciones
            key={dimension.clave}
            titulo={dimension.titulo}
            opciones={dimension.opciones}
            valor={alta.perfil.temperamento}
            alElegir={(valor) => alta.elegirPerfil('temperamento', valor)}
            bloqueado={bloqueado}
          />
        );
    }
  };

  return (
    <SafeAreaView style={estilos.pantalla} edges={['top']}>
      <KeyboardAvoidingView
        style={estilos.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
          <Text accessibilityRole="header" style={estilos.titulo}>
            {TEXTOS_ALTA.titulo}
          </Text>

          <SeccionFotos
            fotos={alta.fotos}
            procesando={alta.procesando}
            puedeAgregar={alta.puedeAgregar}
            mostrarOpciones={alta.mostrarOpciones}
            camaraNegada={alta.camaraNegada}
            bloqueada={bloqueado}
            alAnadir={alta.anadirFoto}
            alTomar={alta.tomar}
            alElegir={alta.elegir}
            alQuitar={alta.quitar}
          />

          <View style={estilos.seccion}>
            <CampoTexto
              valor={alta.nombre}
              alCambiar={alta.setNombre}
              marcador={TEXTOS_ALTA.nombre}
              editable={!bloqueado}
            />
            <SelectorOpciones
              titulo={TEXTOS_ALTA.especie}
              opciones={OPCIONES_ESPECIE}
              valor={alta.especie}
              alElegir={alta.setEspecie}
              bloqueado={bloqueado}
            />
            <SelectorOpciones
              titulo={TEXTOS_ALTA.edad}
              opciones={OPCIONES_EDAD_ALTA}
              valor={alta.edad}
              alElegir={alta.setEdad}
              bloqueado={bloqueado}
            />
            <SelectorOpciones
              titulo={TEXTOS_ALTA.tamano}
              opciones={OPCIONES_TAMANO_ALTA}
              valor={alta.tamano}
              alElegir={alta.setTamano}
              bloqueado={bloqueado}
            />
          </View>

          <View style={estilos.seccion}>
            <Text style={estilos.tituloSeccion}>{TEXTOS_ALTA.cuidados}</Text>
            <CasillaCuidado
              texto={TEXTOS_ALTA.vacunado}
              marcada={alta.vacunado}
              alCambiar={alta.alternarVacunado}
              bloqueada={bloqueado}
            />
            <CasillaCuidado
              texto={TEXTOS_ALTA.esterilizado}
              marcada={alta.esterilizado}
              alCambiar={alta.alternarEsterilizado}
              bloqueada={bloqueado}
            />
          </View>

          <View style={estilos.seccion}>
            <Text style={estilos.tituloSeccion}>{TEXTOS_ALTA.perfil}</Text>
            {DIMENSIONES_PERFIL.map(selectorDe)}
          </View>
        </ScrollView>

        <View style={estilos.abajo}>
          {alta.error ? <MensajeError texto={alta.error} /> : null}
          <BotonPildora
            texto={TEXTOS_ALTA.publicar}
            alPresionar={alta.publicar}
            cargando={alta.publicando}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
