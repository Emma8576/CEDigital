import { useState, useEffect } from "react";
import { PlusIcon, TrashIcon, CheckCircleIcon, XCircleIcon, XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import {
  Curso,
  obtenerCursos,
  crearCurso,
  eliminarCurso,
} from "../services/cursoService";
import { Carrera, obtenerCarreras } from "../services/carreraService";

type Notificacion = {
  id: number;
  tipo: 'success' | 'error' | 'warning';
  mensaje: string;
};

type NotificacionConfirmacion = {
  id: number;
  mensaje: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const GestionCursos = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoCurso, setNuevoCurso] = useState({
    codigoCurso: "",
    nombreCurso: "",
    creditos: 0,
    idCarrera: 0,
  });
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [confirmacion, setConfirmacion] = useState<NotificacionConfirmacion | null>(null);

  // Función para mostrar notificaciones
  const mostrarNotificacion = (tipo: 'success' | 'error' | 'warning', mensaje: string) => {
    const nuevaNotificacion: Notificacion = {
      id: Date.now(),
      tipo,
      mensaje
    };
    
    setNotificaciones(prev => [...prev, nuevaNotificacion]);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
      setNotificaciones(prev => prev.filter(n => n.id !== nuevaNotificacion.id));
    }, 5000);
  };

  // Función para cerrar notificación manualmente
  const cerrarNotificacion = (id: number) => {
    setNotificaciones(prev => prev.filter(n => n.id !== id));
  };

  // Función para mostrar confirmación
  const mostrarConfirmacion = (mensaje: string, onConfirm: () => void) => {
    setConfirmacion({
      id: Date.now(),
      mensaje,
      onConfirm,
      onCancel: () => setConfirmacion(null)
    });
  };

  // Función para manejar errores de manera consistente
  const manejarError = (error: any, mensajeDefault: string) => {
    console.error("Error:", error);
    const mensaje = error.message || mensajeDefault;
    mostrarNotificacion('error', mensaje);
  };

  useEffect(() => {
    obtenerCursos()
      .then((res) => setCursos(res.data))
      .catch((err) => {
        manejarError(err, 'Error al cargar cursos');
      });
  }, []);

  useEffect(() => {
    obtenerCarreras()
      .then((res) => {
        console.log("Carreras cargadas:", res.data); 
        setCarreras(res.data);
      })
      .catch((err) => {
        manejarError(err, 'Error al cargar carreras');
      });
  }, []);

  const handleAgregar = () => {
    const { codigoCurso, nombreCurso, idCarrera } = nuevoCurso;

    if (!codigoCurso || !nombreCurso || idCarrera === 0) {
      mostrarNotificacion('warning', 'Por favor completa todos los campos obligatorios');
      return;
    }

    crearCurso(nuevoCurso)
      .then((res) => {
        setCursos([...cursos, res.data]);
        setNuevoCurso({
          codigoCurso: "",
          nombreCurso: "",
          creditos: 0,
          idCarrera: 0,
        });
        setMostrarFormulario(false);
        mostrarNotificacion('success', 'Curso creado exitosamente');
      })
      .catch((err) => {
        manejarError(err, "Error al crear el curso");
      });
  };

  const handleEliminar = (codigo: string) => {
    mostrarConfirmacion(
      `¿Estás seguro de que deseas eliminar el curso ${codigo}?`,
      () => {
        eliminarCurso(codigo)
          .then(() => {
            setCursos(cursos.filter((c) => c.codigoCurso !== codigo));
            mostrarNotificacion('success', 'Curso eliminado exitosamente');
          })
          .catch((err) => {
            manejarError(err, "Error al eliminar el curso");
          });
        setConfirmacion(null);
      }
    );
  };

  const obtenerNombreCarrera = (id: number) => {
    const carrera = carreras.find((c) => c.idCarrera === id);
    return carrera ? carrera.nombreCarrera : "Desconocida";
  };

  return (
    <div className="space-y-6">
      {/* Sistema de Notificaciones */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notificaciones.map((notif) => (
          <div
            key={notif.id}
            className={`
              flex items-center gap-3 p-4 rounded-lg shadow-lg max-w-md transform transition-all duration-300 ease-in-out
              ${notif.tipo === 'success' 
                ? 'bg-green-50 border-l-4 border-green-500 text-green-800' 
                : notif.tipo === 'error'
                ? 'bg-red-50 border-l-4 border-red-500 text-red-800'
                : 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800'
              }
            `}
          >
            {notif.tipo === 'success' ? (
              <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : notif.tipo === 'error' ? (
              <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            )}
            <span className="flex-1 text-sm font-medium">{notif.mensaje}</span>
            <button
              onClick={() => cerrarNotificacion(notif.id)}
              className={`
                p-1 rounded-full hover:bg-opacity-20 transition-colors
                ${notif.tipo === 'success' 
                  ? 'hover:bg-green-500' 
                  : notif.tipo === 'error'
                  ? 'hover:bg-red-500'
                  : 'hover:bg-yellow-500'
                }
              `}
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Modal de Confirmación */}
      {confirmacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-800">Confirmar eliminación</h3>
            </div>
            <p className="text-gray-600 mb-6">{confirmacion.mensaje}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={confirmacion.onCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmacion.onConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-900">Gestión de Cursos</h1>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5" />
          Agregar Curso
        </button>
      </div>
      
      {/* Descripción */}
      <div className="text-gray-700">
        En esta sección puede añadir nuevos cursos y eliminarlos.
      </div>
      
      {/* Formulario para agregar curso */}
      {mostrarFormulario && (
        <div className="bg-gray-100 p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Nuevo Curso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Código</label>
              <input
                type="text"
                placeholder="Ej: CE101"
                className="p-2 border rounded"
                value={nuevoCurso.codigoCurso}
                onChange={(e) =>
                  setNuevoCurso({ ...nuevoCurso, codigoCurso: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Nombre del Curso</label>
              <input
                type="text"
                placeholder="Ej: Introducción a la Programación"
                className="p-2 border rounded"
                value={nuevoCurso.nombreCurso}
                onChange={(e) =>
                  setNuevoCurso({ ...nuevoCurso, nombreCurso: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Créditos</label>
              <input
                type="number"
                placeholder="Ingrese cantidad (1-10)"
                className="p-2 border rounded"
                value={nuevoCurso.creditos}
                onChange={(e) =>
                  setNuevoCurso({
                    ...nuevoCurso,
                    creditos: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Carrera</label>
              <select
                className="p-2 border rounded"
                value={nuevoCurso.idCarrera}
                onChange={(e) =>
                  setNuevoCurso({
                    ...nuevoCurso,
                    idCarrera: parseInt(e.target.value) || 0,
                  })
                }
              >
                <option value="">Selecciona una carrera</option>
                {carreras.map((carrera) => (
                  <option key={carrera.idCarrera} value={carrera.idCarrera}>
                    [{carrera.idCarrera}] {carrera.nombreCarrera}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAgregar}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Guardar
            </button>
            <button
              onClick={() => setMostrarFormulario(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tabla de cursos */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-xl">
          <thead>
            <tr className="bg-blue-100 text-left">
              <th className="p-3">Código</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Créditos</th>
              <th className="p-3">Carrera (ID)</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cursos.map((curso) => (
              <tr key={curso.codigoCurso} className="border-t">
                <td className="p-3">{curso.codigoCurso}</td>
                <td className="p-3">{curso.nombreCurso}</td>
                <td className="p-3">{curso.creditos}</td>
                <td className="p-3">{obtenerNombreCarrera(curso.idCarrera)}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleEliminar(curso.codigoCurso)}
                    className="text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <TrashIcon className="w-5 h-5" />
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {cursos.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-center text-gray-500">
                  No hay cursos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionCursos;