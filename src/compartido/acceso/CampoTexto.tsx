/**
 * Campo de texto de los formularios de acceso (F-01 §3 y §5; Soft UI).
 *
 * Recibe:
 * - `valor` y `alCambiar`: lo escrito y qué hacer cuando cambia;
 * - `marcador`: texto de Figma dentro del campo (placeholder);
 * - `tipo`: 'texto' | 'correo' | 'telefono' | 'contrasena'. Cambia el teclado
 *   (correo: email-address y sin mayúsculas; teléfono: phone-pad) y, en la
 *   contraseña, la oculta y agrega el ojo para mostrarla u ocultarla;
 * - `editable`: `false` mientras responde Firebase (§3.1).
 * No devuelve datos: solo dibuja el campo.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';

import { COLORES, FUENTES, RADIOS } from '../tema';

export type TipoCampo = 'texto' | 'correo' | 'telefono' | 'contrasena';

interface Props {
  valor: string;
  alCambiar: (texto: string) => void;
  marcador: string;
  tipo?: TipoCampo;
  editable?: boolean;
}

/** Ajustes del teclado de cada tipo de campo. */
const TECLADO: Record<TipoCampo, TextInputProps> = {
  texto: { autoCapitalize: 'words' },
  correo: { keyboardType: 'email-address', autoCapitalize: 'none', autoComplete: 'email' },
  telefono: { keyboardType: 'phone-pad', autoComplete: 'tel' },
  contrasena: { autoCapitalize: 'none', autoComplete: 'password' },
};

const estilos = StyleSheet.create({
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIOS.tarjeta,
    borderWidth: 2,
    borderColor: COLORES.azulGrisaceo,
    backgroundColor: COLORES.crema,
    paddingHorizontal: 20,
  },
  entrada: {
    flex: 1,
    paddingVertical: 14,
    fontFamily: FUENTES.regular,
    fontSize: 16,
    color: COLORES.cafe,
  },
  ojo: { padding: 8 },
});

export default function CampoTexto({
  valor,
  alCambiar,
  marcador,
  tipo = 'texto',
  editable = true,
}: Props) {
  const [visible, setVisible] = useState(false);
  const esContrasena = tipo === 'contrasena';

  return (
    <View style={estilos.campo}>
      <TextInput
        {...TECLADO[tipo]}
        accessibilityLabel={marcador}
        autoCorrect={false}
        editable={editable}
        onChangeText={alCambiar}
        placeholder={marcador}
        placeholderTextColor={COLORES.azulGrisaceo}
        secureTextEntry={esContrasena && !visible}
        style={estilos.entrada}
        value={valor}
      />
      {esContrasena ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ checked: visible }}
          accessibilityLabel={marcador}
          hitSlop={8}
          onPress={() => setVisible((anterior) => !anterior)}
          style={estilos.ojo}
        >
          <Ionicons name={visible ? 'eye-off' : 'eye'} size={24} color={COLORES.azulMarino} />
        </Pressable>
      ) : null}
    </View>
  );
}
