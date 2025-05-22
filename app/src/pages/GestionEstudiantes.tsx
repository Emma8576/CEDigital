import { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { crearEstudiante, obtenerEstudiantes } from "../services/estudianteService";

export type Estudiante = {
  carne: number;
  cedula: number;
  nombre: string;
  correo: string;
  telefono: number;
  password: string;
};

const GestionEstudiantes = () => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoEstudiante, setNuevoEstudiante] = useState<Estudiante>({
    carne: 0,
    cedula: 0,
    nombre: "",
    correo: "",
    telefono: 0,
    password: "",
  });

  useEffect(() => {
    obtenerEstudiantes()
      .then((response) => setEstudiantes(response.data))
      .catch((error) => console.error("Error al obtener estudiantes:", error));
  }, []);

  const hashPassword = async (password: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const handleAgregarEstudiante = async () => {
    try {
      const hashedPassword = await hashPassword(nuevoEstudiante.password);
      const estudianteConPasswordEncriptado = {
        ...nuevoEstudiante,
        password: hashedPassword,
      };

      const response = await crearEstudiante(estudianteConPasswordEncriptado);
      setEstudiantes([...estudiantes, response.data]);
      setNuevoEstudiante({
        carne: 0,
        cedula: 0,
        nombre: "",
        correo: "",
        telefono: 0,
        password: "",
      });
      setMostrarFormulario(false);
    } catch (error: any) {
      console.error("Error al crear estudiante:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-900">Gestión de Estudiantes</h1>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5" />
          Registrar Estudiante
        </button>
      </div>

      <div className="text-gray-700">
        En esta sección puede agregar nuevos estudiantes al sistema.
      </div>

      {mostrarFormulario && (
        <div className="bg-gray-100 p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Nuevo Estudiante</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Carnet</label>
              <input
                type="number"
                className="p-2 border rounded"
                value={nuevoEstudiante.carne}
                onChange={(e) =>
                  setNuevoEstudiante({ ...nuevoEstudiante, carne:  parseInt(e.target.value || "0"),})
                }
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Cédula</label>
              <input
                type="number"
                className="p-2 border rounded"
                value={nuevoEstudiante.cedula}
                onChange={(e) =>
                  setNuevoEstudiante({...nuevoEstudiante,cedula: parseInt(e.target.value || "0"),})
                }
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Nombre</label>
              <input
                type="text"
                className="p-2 border rounded"
                value={nuevoEstudiante.nombre}
                onChange={(e) =>
                  setNuevoEstudiante({ ...nuevoEstudiante, nombre: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Correo</label>
              <input
                type="email"
                className="p-2 border rounded"
                value={nuevoEstudiante.correo}
                onChange={(e) =>
                  setNuevoEstudiante({ ...nuevoEstudiante, correo: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Teléfono</label>
              <input
                type="text"
                className="p-2 border rounded"
                value={nuevoEstudiante.telefono}
                onChange={(e) =>
                  setNuevoEstudiante({ ...nuevoEstudiante, telefono:parseInt(e.target.value || "0"),})
                }
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Contraseña</label>
              <input
                type="password"
                className="p-2 border rounded"
                value={nuevoEstudiante.password}
                onChange={(e) =>
                  setNuevoEstudiante({ ...nuevoEstudiante, password: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAgregarEstudiante}
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

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-xl">
          <thead>
            <tr className="bg-blue-100 text-left">
              <th className="p-3">Carnet</th>
              <th className="p-3">Cédula</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Correo</th>
              <th className="p-3">Teléfono</th>
            </tr>
          </thead>
          <tbody>
            {estudiantes.map((est) => (
              <tr key={est.carne} className="border-t">
                <td className="p-3">{est.carne}</td>
                <td className="p-3">{est.cedula}</td>
                <td className="p-3">{est.nombre}</td>
                <td className="p-3">{est.correo}</td>
                <td className="p-3">{est.telefono}</td>
              </tr>
            ))}
            {estudiantes.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-center text-gray-500">
                  No hay estudiantes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionEstudiantes;