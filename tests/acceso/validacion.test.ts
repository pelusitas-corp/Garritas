// Pruebas de las validaciones del formulario (F-01 §5, RN-09, CA-11).
// El nombre de cada prueba es su criterio de aceptación.
import { camposLlenos, validarContrasena } from '../../src/compartido/acceso/validacion';
import MENSAJES from '../../src/compartido/mensajes';

describe('RN-09 · "Crear cuenta" e "Iniciar sesión" no responden con un campo vacío', () => {
  test('RN-09 válido: con los 4 campos del registro llenos, "Crear cuenta" responde', () => {
    expect(camposLlenos(['Ana Torres', 'ana.torres@example.com', '6461234567', 'secreta'])).toBe(
      true,
    );
  });

  test('RN-09 no válido: con un campo vacío, "Crear cuenta" no responde', () => {
    expect(camposLlenos(['Ana Torres', '', '6461234567', 'secreta'])).toBe(false);
  });

  test('RN-09 no válido: un campo con solo espacios cuenta como vacío', () => {
    expect(camposLlenos(['ana.torres@example.com', '   '])).toBe(false);
  });
});

describe('CA-11 · Contraseña corta (P-03)', () => {
  test('CA-11 no válido: con 5 caracteres muestra "Tu contraseña debe tener al menos 6 caracteres"', () => {
    expect(validarContrasena('12345')).toBe(MENSAJES.CONTRASENA_CORTA);
    expect(MENSAJES.CONTRASENA_CORTA).toBe('Tu contraseña debe tener al menos 6 caracteres');
  });

  test('CA-11 válido: con 6 caracteres no muestra error', () => {
    expect(validarContrasena('123456')).toBeNull();
  });
});
