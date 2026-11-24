// PROVISIONAL (02-navegacion): Mi Perfil. F-04 pone el perfil Garritas (RF-19).
import MENSAJES from '../../../src/compartido/mensajes';
import PantallaProvisional from '../../../src/compartido/navegacion/PantallaProvisional';
import { RUTAS } from '../../../src/compartido/navegacion/rutas';
import { useSesion } from '../../../src/compartido/navegacion/useSesion';

export default function MiPerfil() {
  const { sesion, cerrarSesion } = useSesion();
  const cuestionarioCompleto = sesion.tipo === 'con-rol' && sesion.cuestionarioCompleto;

  return (
    <PantallaProvisional
      titulo="Mi perfil"
      ruta={RUTAS.miPerfil}
      feature="F-04"
      // G-6 (RF-19): sin cuestionario completo NO redirige; muestra el mensaje.
      aviso={cuestionarioCompleto ? '' : MENSAJES.PERFIL_SIN_CUESTIONARIO}
      estados={{ error: MENSAJES.ERROR_CONEXION }}
      botones={[
        // N-3: "Cerrar sesión" al final de Mi perfil. Las guardas llevan a Selección de Rol.
        { texto: 'Cerrar sesión', alPresionar: () => cerrarSesion(), variante: 'secundario' },
      ]}
    />
  );
}
