/**
 * Estado y acciones del formulario "Nueva mascota" (F-02 §4).
 *
 * Analogía: es la carpeta donde el albergue va llenando la hoja de ingreso.
 * La pantalla solo dibuja; aquí se guardan las respuestas, se piden las
 * fotos, se valida (RN-02) y se publica con `src/firebase/altaAnimal.ts`.
 *
 * Recibe `alPublicar`: qué hacer cuando Firestore confirma (la pantalla
 * regresa a /solicitudes, AL-7).
 * Devuelve los valores del formulario y las funciones de cada botón.
 */
import { useCallback, useRef, useState } from 'react';

import MENSAJES from '../../compartido/mensajes';
import type { Edad, Tamano } from '../../compartido/modelo';
import { nuevoIdAnimal, publicarAnimal } from '../../firebase/altaAnimal';
import type { Especie, PerfilCompatibilidad } from '../../matchmaking';
import { agregarFoto, fotosParaGuardar, puedeAgregarFoto, quitarFoto } from './fotos';
import type { FotoProcesada } from './fotos';
import type { ClavePerfil } from './opcionesPerfil';
import { elegirDeGaleria, procesarFoto, revisarCamara, tomarFoto } from './procesarFoto';
import type { Seleccion } from './procesarFoto';
import { datosValidados, validarAlta } from './validacion';
import type { FormularioAlta } from './validacion';

/** Una foto del formulario: su clave para React y la foto ya procesada. */
export interface FotoDelFormulario extends FotoProcesada {
  clave: string;
}

export function useAltaAnimal(alPublicar: () => void) {
  // AL-8: un ID por formulario; solo cambia después de publicar.
  const [idAnimal, setIdAnimal] = useState(nuevoIdAnimal);
  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState<Especie | null>(null);
  const [edad, setEdad] = useState<Edad | null>(null);
  const [tamano, setTamano] = useState<Tamano | null>(null);
  const [vacunado, setVacunado] = useState(false);
  const [esterilizado, setEsterilizado] = useState(false);
  const [perfil, setPerfil] = useState<Partial<PerfilCompatibilidad>>({});
  const [fotos, setFotos] = useState<FotoDelFormulario[]>([]);
  const [procesando, setProcesando] = useState(false);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [camaraNegada, setCamaraNegada] = useState(false);
  const [publicando, setPublicando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const siguienteClave = useRef(0);

  /** "Añadir una foto": muestra las dos opciones y revisa el permiso (CA-08). */
  const anadirFoto = useCallback(async () => {
    setMostrarOpciones(true);
    setCamaraNegada((await revisarCamara()) === 'negada');
  }, []);

  /** Recibe lo que eligió la persona y, si hay foto, la procesa y la agrega (AL-6). */
  const recibirSeleccion = useCallback(
    async (seleccion: Seleccion) => {
      if (seleccion.tipo === 'negada') {
        setCamaraNegada(true); // CA-08: los dos botones y el mensaje se quedan
        return;
      }
      if (!camaraNegada) {
        setMostrarOpciones(false); // plan, punto 4
      }
      if (seleccion.tipo === 'cancelada') {
        return; // A6: no pasa nada
      }
      setProcesando(true);
      const foto = await procesarFoto(seleccion.uri, seleccion.ancho);
      setProcesando(false);
      if (foto) {
        siguienteClave.current += 1;
        const clave = `foto-${siguienteClave.current}`;
        setFotos((anteriores) => agregarFoto(anteriores, { ...foto, clave }));
      } // A7: si no se pudo procesar, no se agrega y no hay mensaje
    },
    [camaraNegada],
  );

  const tomar = useCallback(async () => recibirSeleccion(await tomarFoto()), [recibirSeleccion]);
  const elegir = useCallback(
    async () => recibirSeleccion(await elegirDeGaleria()),
    [recibirSeleccion],
  );

  /** ✕ de una foto: las demás se recorren (RN-05). */
  const quitar = useCallback((posicion: number) => {
    setFotos((anteriores) => quitarFoto(anteriores, posicion));
  }, []);

  /** Elige una opción del perfil de compatibilidad (RF-14). */
  const elegirPerfil = useCallback(
    <K extends ClavePerfil>(clave: K, valor: PerfilCompatibilidad[K]) => {
      setPerfil((anterior) => ({ ...anterior, [clave]: valor }));
    },
    [],
  );

  /** Deja el formulario vacío y con un ID nuevo (AL-7, AL-8). */
  const limpiar = useCallback(() => {
    setIdAnimal(nuevoIdAnimal());
    setNombre('');
    setEspecie(null);
    setEdad(null);
    setTamano(null);
    setVacunado(false);
    setEsterilizado(false);
    setPerfil({});
    setFotos([]);
    setMostrarOpciones(false);
    setCamaraNegada(false);
    setError(null);
  }, []);

  /** "Publicar para adopción" (RN-01: siempre responde, salvo mientras publica). */
  const publicar = useCallback(async () => {
    setError(null); // RN-02: el mensaje se borra al presionar de nuevo
    const formulario: FormularioAlta = {
      nombre,
      especie,
      edad,
      tamano,
      vacunado,
      esterilizado,
      perfil,
      numeroFotos: fotos.length,
    };
    const claveError = validarAlta(formulario);
    const datos = datosValidados(formulario);
    if (claveError || !datos || fotos.length === 0) {
      setError(MENSAJES[claveError ?? 'FOTO_OBLIGATORIA']); // CA-02, CA-04, CA-06
      return;
    }
    setPublicando(true);
    const resultado = await publicarAnimal(idAnimal, {
      ...datos,
      fotos: fotosParaGuardar(fotos),
      miniatura: fotos[0].miniatura, // RN-05: de la foto orden 0
    });
    setPublicando(false);
    if (resultado === 'ok') {
      limpiar();
      alPublicar();
      return;
    }
    setError(resultado === 'sin-permiso' ? MENSAJES.SIN_PERMISO : MENSAJES.ERROR_CONEXION);
  }, [
    nombre,
    especie,
    edad,
    tamano,
    vacunado,
    esterilizado,
    perfil,
    fotos,
    idAnimal,
    limpiar,
    alPublicar,
  ]);

  return {
    nombre,
    setNombre,
    especie,
    setEspecie,
    edad,
    setEdad,
    tamano,
    setTamano,
    vacunado,
    alternarVacunado: () => setVacunado((anterior) => !anterior),
    esterilizado,
    alternarEsterilizado: () => setEsterilizado((anterior) => !anterior),
    perfil,
    elegirPerfil,
    fotos,
    puedeAgregar: puedeAgregarFoto(fotos),
    procesando,
    mostrarOpciones,
    camaraNegada,
    anadirFoto,
    tomar,
    elegir,
    quitar,
    publicando,
    error,
    publicar,
  };
}
