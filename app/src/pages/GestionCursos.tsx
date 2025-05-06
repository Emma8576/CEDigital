import { useState } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

type Curso = {
  id: number;
  codigo: string;
  nombre: string;
  creditos: number;
  carrera: string;
  activo: boolean;
};

const GestionCursos = () => {
  const [cursos, setCursos] = useState<Curso[]>([
    // Ejemplo inicial
    { id: 1, codigo: "CE101", nombre: "Introducción a la Programación", creditos: 4, carrera: "Ingeniería en Computadores", activo: true },
  ]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoCurso, setNuevoCurso] = useState({
    codigo: "",
    nombre: "",
    creditos: 0,
    carrera: "",
  });

  const handleAgregar = () => {
    const nuevo = {
      id: Date.now(),
      ...nuevoCurso,
      activo: true,
    };
    setCursos([...cursos, nuevo]);
    setNuevoCurso({ codigo: "", nombre: "", creditos: 0, carrera: "" });
    setMostrarFormulario(false);
  };

  const handleDeshabilitar = (id: number) => {
    const actualizados = cursos.map((curso) =>
      curso.id === id ? { ...curso, activo: false } : curso
    );
    setCursos(actualizados);
  };

  return (
    <div className="space-y-6">
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
      <div className="text-gray-700">
      Aquí podrá visualizar, crear o deshabilitar cursos que usa el sistema.
    </div>
      {/* Tabla de cursos */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-xl">
          <thead>
            <tr className="bg-blue-100 text-left">
              <th className="p-3">Código</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Créditos</th>
              <th className="p-3">Carrera</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cursos.map((curso) => (
              <tr key={curso.id} className="border-t">
                <td className="p-3">{curso.codigo}</td>
                <td className="p-3">{curso.nombre}</td>
                <td className="p-3">{curso.creditos}</td>
                <td className="p-3">{curso.carrera}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-semibold ${
                      curso.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {curso.activo ? "Activo" : "Deshabilitado"}
                  </span>
                </td>
                <td className="p-3">
                  {curso.activo && (
                    <button
                      onClick={() => handleDeshabilitar(curso.id)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                      <TrashIcon className="w-5 h-5" />
                      Deshabilitar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                value={nuevoCurso.codigo}
                onChange={(e) => setNuevoCurso({ ...nuevoCurso, codigo: e.target.value })}
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Nombre del Curso</label>
              <input
                type="text"
                placeholder="Ej: Introducción a la Programación"
                className="p-2 border rounded"
                value={nuevoCurso.nombre}
                onChange={(e) => setNuevoCurso({ ...nuevoCurso, nombre: e.target.value })}
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Créditos</label>
              <input
                type="number"
                placeholder="Ingrese cantidad (1-10)"
                className="p-2 border rounded"
                value={nuevoCurso.creditos}
                onChange={(e) => setNuevoCurso({ ...nuevoCurso, creditos: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Carrera</label>
              <input
                type="text"
                placeholder="Ej: Ingeniería en Computadores"
                className="p-2 border rounded"
                value={nuevoCurso.carrera}
                onChange={(e) => setNuevoCurso({ ...nuevoCurso, carrera: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3">
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
    </div>
  );
};

export default GestionCursos;