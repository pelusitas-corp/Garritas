// Pruebas de la traducción de errores de Firebase (F-01 §6, RN-10 a RN-12).
// El nombre de cada prueba es su criterio de aceptación.
import {
  ERROR_USUARIO_NO_GUARDADO,
  mensajeErrorAcceso,
  mensajeErrorRegistro,
} from '../../src/compartido/acceso/errores';
import MENSAJES from '../../src/compartido/mensajes';

describe('CA-04 · RF-23 no válido', () => {
  test('RF-23 no válido: correo ya registrado muestra "Este correo ya tiene una cuenta. Inicia sesión."', () => {
    expect(mensajeErrorRegistro('auth/email-already-in-use')).toBe(
      'Este correo ya tiene una cuenta. Inicia sesión.',
    );
  });
});

describe('CA-06 · RF-09 no válido', () => {
  test('RF-09 no válido: contraseña incorrecta o correo no registrado muestra "Correo o contraseña inválidos"', () => {
    ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found'].forEach((codigo) => {
      expect(mensajeErrorAcceso(codigo)).toBe('Correo o contraseña inválidos');
    });
  });

  test('RN-10: correo con formato inválido en el acceso se trata como CA-06', () => {
    expect(mensajeErrorAcceso('auth/invalid-email')).toBe(MENSAJES.CREDENCIALES_INVALIDAS);
  });

  test('RN-12: demasiados intentos al iniciar sesión se trata como CA-06', () => {
    expect(mensajeErrorAcceso('auth/too-many-requests')).toBe(MENSAJES.CREDENCIALES_INVALIDAS);
  });

  test('P1: cuenta deshabilitada o código desconocido al iniciar sesión se trata como CA-06', () => {
    expect(mensajeErrorAcceso('auth/user-disabled')).toBe(MENSAJES.CREDENCIALES_INVALIDAS);
    expect(mensajeErrorAcceso('auth/otro-codigo')).toBe(MENSAJES.CREDENCIALES_INVALIDAS);
  });
});

describe('CA-11 · Contraseña corta según Firebase', () => {
  test('CA-11 no válido: si Firebase rechaza la contraseña muestra "Tu contraseña debe tener al menos 6 caracteres"', () => {
    expect(mensajeErrorRegistro('auth/weak-password')).toBe(MENSAJES.CONTRASENA_CORTA);
  });
});

describe('CA-12 · Sin conexión', () => {
  test('CA-12 no válido: sin internet, "Crear cuenta" e "Iniciar sesión" muestran "Error de conexión, verifica tu conexión a internet"', () => {
    expect(mensajeErrorRegistro('auth/network-request-failed')).toBe(
      'Error de conexión, verifica tu conexión a internet',
    );
    expect(mensajeErrorAcceso('auth/network-request-failed')).toBe(
      'Error de conexión, verifica tu conexión a internet',
    );
  });

  test('RN-11: si no se pudo guardar usuarios/{uid} muestra el mensaje de CA-12', () => {
    expect(mensajeErrorRegistro(ERROR_USUARIO_NO_GUARDADO)).toBe(MENSAJES.ERROR_CONEXION);
  });

  test('P1: demasiados intentos o código desconocido al registrarse muestra el mensaje de CA-12', () => {
    expect(mensajeErrorRegistro('auth/too-many-requests')).toBe(MENSAJES.ERROR_CONEXION);
    expect(mensajeErrorRegistro('auth/otro-codigo')).toBe(MENSAJES.ERROR_CONEXION);
  });
});

describe('CA-13 · Correo con formato inválido en el registro (A-2)', () => {
  test('CA-13 no válido: correo inválido al registrarse muestra "Escribe un correo electrónico válido"', () => {
    expect(mensajeErrorRegistro('auth/invalid-email')).toBe('Escribe un correo electrónico válido');
  });
});
