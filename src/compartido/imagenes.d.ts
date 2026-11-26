/**
 * Le dice a TypeScript qué es un `.png` importado (F-11 AD-1, el logo).
 * Metro, el empaquetador de Expo, convierte la imagen en un número que
 * `<Image source={...} />` entiende; aquí solo se declara ese tipo.
 */
declare module '*.png' {
  import type { ImageSourcePropType } from 'react-native';

  const imagen: ImageSourcePropType;
  export default imagen;
}
