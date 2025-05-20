import { useState, useEffect } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  Curso,
  obtenerCursos,
  crearCurso,
  eliminarCurso,
} from "../services/cursoService";
import { Carrera, obtenerCarreras } from "../services/carreraService";

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

  useEffect(() => {
    obtenerCursos()
      .then((res) => setCursos(res.data))
      .catch((err) => {
        console.error("Error al cargar cursos:", err);
        if (err.response) {
          console.error("Respuesta del servidor:", err.response.data);
        }
      });
  }, []);

useEffect(() => {
  obtenerCarreras()
    .then((res) => {
      console.log("Carreras cargadas:", res.data); 
      setCarreras(res.data);
    })
    .catch((err) => console.error("Error al cargar carreras:", err));
}, []);


  const handleAgregar = () => {
    const { codigoCurso, nombreCurso, idCarrera } = nuevoCurso;

    if (!codigoCurso || !nombreCurso || idCarrera === 0) {
      alert("Por favor completa todos los campos obligatorios.");
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
      })
      .catch((err) => {
        console.error("Error al crear curso:", err);
        if (err.response) {
          alert(`Error del servidor: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
        } else if (err.request) {
          alert("No se recibió respuesta del servidor. Verifica la conexión.");
        } else {
          alert(`Error: ${err.message}`);
        }
      });
  };

  const handleEliminar = (codigo: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el curso ${codigo}?`)) {
      eliminarCurso(codigo)
        .then(() => {
          setCursos(cursos.filter((c) => c.codigoCurso !== codigo));
        })
        .catch((err) => {
          console.error("Error al eliminar curso:", err);
          if (err.response) {
            alert(`Error del servidor: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
          } else {
            alert(`Error: ${err.message}`);
          }
        });
    }
  };
const obtenerNombreCarrera = (id: number) => {
  const carrera = carreras.find((c) => c.idCarrera === id);
  return carrera ? carrera.nombreCarrera : "Desconocida";
};

  return (
    <div className="space-y-6">
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
