import { useEffect, useState } from "react";
import { PlusIcon, TrashIcon, CheckCircleIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { obtenerSemestres, crearSemestre, eliminarSemestre,obtenerSemestreCantidadGrupos } from "../services/semestreService"; // Ajusta ruta si es necesario

// Tipo de datos para la entidad Semestre
type Semestre = {
  idSemestre: number;
  año: number;
  periodo: string;
  cantidadGrupos: number;
};

// Tipo para las notificaciones del sistema
type Notificacion = {
  id: number;
  tipo: 'success' | 'error';
  mensaje: string;
};

const GestionSemestres = () => {
  // Estados para manejo de datos y UI
  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [mostrarFormularioSemestre, setMostrarFormularioSemestre] = useState(false);
  const [nuevoSemestre, setNuevoSemestre] = useState({ año: new Date().getFullYear(), periodo: "1" });
  const [mostrarFormularioGrupo, setMostrarFormularioGrupo] = useState(false);
  const [semestreSeleccionado, setSemestreSeleccionado] = useState<number | null>(null);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  // Sistema de notificaciones - crea y muestra mensajes al usuario
  const mostrarNotificacion = (tipo: 'success' | 'error', mensaje: string) => {
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

  // Carga inicial - obtiene semestres y calcula cantidad de grupos para cada uno
  useEffect(() => {
    obtenerSemestres()
      .then(async response => {
        const listaSemestres = response.data;
        // Para cada semestre, obtiene la cantidad de grupos activos
        const semestresConGrupos = await Promise.all(
          listaSemestres.map(async (sem: Semestre) => {
            try {
              const resp = await obtenerSemestreCantidadGrupos(sem.idSemestre);
              return {
                ...sem,
                cantidadGrupos: resp.data.cantidadGrupos ?? 0,
              };
              //Si hay un error se muestra 0 en Grupos Activos
            } catch (error) {
              console.error(`Error al obtener cantidad de grupos para semestre ${sem.idSemestre}`, error);
              return { ...sem, cantidadGrupos: 0 }; // fallback
            }
          })
        );

        setSemestres(semestresConGrupos);
      })
      .catch(error => console.error("Error al obtener semestres:", error));
  }, []);

/*
  useEffect(() => {
    obtenerSemestres()
      .then(response => setSemestres(response.data))
      .catch(error => console.error("Error al obtener semestres:", error));
  }, []);
*/

  // Opciones disponibles para periodos académicos
  const periodos = [
    { valor: "1", nombre: "1 - Primer Semestre" },
    { valor: "2", nombre: "2 - Segundo Semestre" },
    { valor: "V", nombre: "V - Verano" },
  ];

  // Maneja la creación de un nuevo semestre
  const handleAgregarSemestre = () => {
    crearSemestre(nuevoSemestre)
      .then(response => {
        // Actualiza la lista local y resetea el formulario
        setSemestres([...semestres, response.data]);
        setNuevoSemestre({ año: new Date().getFullYear(), periodo: "1" });
        setMostrarFormularioSemestre(false);
        mostrarNotificacion('success', 'Semestre creado exitosamente');
      })
      .catch(error => {
        console.error("Error al agregar semestre:", error);
        mostrarNotificacion('error', 'Error al crear el semestre');
      });
  };

  // Maneja la eliminación de un semestre
  const handleEliminarSemestre = (id: number) => {
    eliminarSemestre(id)
      .then(() => {
        // Remueve el semestre de la lista local
        setSemestres(semestres.filter(s => s.idSemestre !== id));
        mostrarNotificacion('success', 'Semestre eliminado exitosamente');
      })
      .catch(error => {
        const mensaje = error.response?.data || "Error al eliminar semestre.";
        mostrarNotificacion('error', mensaje);
      });
  };

  // Función placeholder para agregar cursos (funcionalidad futura)
  const handleAgregarCursos = (idSemestre: number) => {
    // Por ahora solo imprime en consola. Luego puedes conectar a un modal o navegación.
    console.log(`Agregar cursos al semestre con ID: ${idSemestre}`);
  };

  return (
    <div className="space-y-6">
      {/* Sistema de Notificaciones - posicionado fijo en la esquina superior derecha */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notificaciones.map((notif) => (
          <div
            key={notif.id}
            className={`
              flex items-center gap-3 p-4 rounded-lg shadow-lg max-w-md transform transition-all duration-300 ease-in-out
              ${notif.tipo === 'success' 
                ? 'bg-green-50 border-l-4 border-green-500 text-green-800' 
                : 'bg-red-50 border-l-4 border-red-500 text-red-800'
              }
            `}
          >
            {/* Icono según el tipo de notificación */}
            {notif.tipo === 'success' ? (
              <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : (
              <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
            )}
            <span className="flex-1 text-sm font-medium">{notif.mensaje}</span>
            {/* Botón para cerrar notificación manualmente */}
            <button
              onClick={() => cerrarNotificacion(notif.id)}
              className={`
                p-1 rounded-full hover:bg-opacity-20 transition-colors
                ${notif.tipo === 'success' ? 'hover:bg-green-500' : 'hover:bg-red-500'}
              `}
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Header con título y botón de crear */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-900">Gestión de Semestres</h1>
        <button
          onClick={() => setMostrarFormularioSemestre(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5" />
          Crear Semestre
        </button>
      </div>

      {/* Descripción */}
      <div className="text-gray-700">
        En esta sección puede crear semestres con su respectivo año y periodo académico.
      </div>

      {/* Formulario de creación de semestre - aparece condicionalmente */}
      {mostrarFormularioSemestre && (
        <div className="bg-gray-100 p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Nuevo Semestre</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campo Año */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Año</label>
              <input
                type="number"
                className="p-2 border rounded"
                value={nuevoSemestre.año}
                onChange={(e) => setNuevoSemestre({ ...nuevoSemestre, año: parseInt(e.target.value) })}
              />
            </div>
            {/* Campo Periodo - dropdown con opciones predefinidas */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Periodo</label>
              <select
                className="p-2 border rounded"
                value={nuevoSemestre.periodo}
                onChange={(e) => setNuevoSemestre({ ...nuevoSemestre, periodo: e.target.value })}
              >
                {periodos.map((p) => (
                  <option key={p.valor} value={p.valor}>{p.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Botones de acción del formulario */}
          <div className="flex gap-3">
            <button
              onClick={handleAgregarSemestre}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Guardar
            </button>
            <button
              onClick={() => setMostrarFormularioSemestre(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tabla de semestres registrados */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-xl">
          <thead>
            <tr className="bg-blue-100 text-left">
              <th className="p-3">Año</th>
              <th className="p-3">Periodo</th>
              <th className="p-3">Grupos Activos</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {/* Renderiza cada semestre */}
            {semestres.map((sem) => (
              <tr key={sem.idSemestre} className="border-t">
                <td className="p-3">{sem.año}</td>
                <td className="p-3">{sem.periodo}</td>
                <td className="p-3">{sem.cantidadGrupos ?? 0}</td>
                <td className="p-3 flex gap-2">
                  {/* Botón de eliminar semestre */}
                  <button 
                    onClick={() => handleEliminarSemestre(sem.idSemestre)}
                    className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {/* Mensaje cuando no hay semestres */}
            {semestres.length === 0 && (
              <tr>
                <td colSpan={3} className="p-3 text-center text-gray-500">
                  No hay semestres registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    
  );
};

export default GestionSemestres;