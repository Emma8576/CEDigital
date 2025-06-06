import { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { crearProfesor, obtenerProfesores } from "../services/profesorService";

// Tipo de datos para la entidad Profesor
export type Profesor = {
  cedula: string;
  nombre: string;
  correo: string;
  password: string;
};

const GestionProfesores = () => {
  // Estados para manejo de datos y UI
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoProfesor, setNuevoProfesor] = useState<Profesor>({
    cedula: "",
    nombre: "",
    correo: "",
    password: "",
  });

  // Carga inicial de profesores desde el backend
  useEffect(() => {
    obtenerProfesores()
      .then((response) => {
        console.log("Profesores response:", response);
        setProfesores(response.data);
      })
      .catch((error) => console.error("Error al obtener profesores:", error));
  }, []);

  // Función para encriptar contraseña usando SHA-256
  const hashPassword = async (password: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  // Maneja la creación de un nuevo profesor
  const handleAgregarProfesor = async () => {
    try {
      // Encripta la contraseña antes de enviarla
      const hashedPassword = await hashPassword(nuevoProfesor.password);
      const profesorConPasswordEncriptado = {
        ...nuevoProfesor,
        password: hashedPassword,
      };

      // Envía datos al backend y actualiza la lista local
      const response = await crearProfesor(profesorConPasswordEncriptado);
      setProfesores([...profesores, response.data]);
      // Resetea el formulario
      setNuevoProfesor({ cedula: "", nombre: "", correo: "", password: "" });
      setMostrarFormulario(false);
    } catch (error: any) {
      console.error("Error al crear profesor:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con título y botón de agregar */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-900">Gestión de Profesores</h1>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5" />
          Registrar Profesor
        </button>
      </div>
      {/* Descripción */}
      <div className="text-gray-700">
        En esta sección puede agregar nuevos profesores al sistema.
      </div>
      {/* Formulario de registro - aparece condicionalmente */}
      {mostrarFormulario && (
        <div className="bg-gray-100 p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Nuevo Profesor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campo Cédula - solo números */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Cédula</label>
              <input
                type="text"
                className="p-2 border rounded"
                value={nuevoProfesor.cedula}
                onChange={(e) =>
                  setNuevoProfesor({
                    ...nuevoProfesor,
                    cedula: e.target.value,
                  })
                }
              />
            </div>
            {/* Campo Nombre */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Nombre</label>
              <input
                type="text"
                className="p-2 border rounded"
                value={nuevoProfesor.nombre}
                onChange={(e) =>
                  setNuevoProfesor({ ...nuevoProfesor, nombre: e.target.value })
                }
              />
            </div>
            {/* Campo Correo */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Correo</label>
              <input
                type="email"
                className="p-2 border rounded"
                value={nuevoProfesor.correo}
                onChange={(e) =>
                  setNuevoProfesor({ ...nuevoProfesor, correo: e.target.value })
                }
              />
            </div>
            {/* Campo Contraseña */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Contraseña</label>
              <input
                type="password"
                className="p-2 border rounded"
                value={nuevoProfesor.password}
                onChange={(e) =>
                  setNuevoProfesor({ ...nuevoProfesor, password: e.target.value })
                }
              />
            </div>
          </div>
          {/* Botones de acción del formulario */}
          <div className="flex gap-3">
            <button
              onClick={handleAgregarProfesor}
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

      {/* Tabla de profesores registrados */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-xl">
          <thead>
            <tr className="bg-blue-100 text-left">
              <th className="p-3">Cédula</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Correo</th>
            </tr>
          </thead>
          <tbody>
            {/* Renderiza cada profesor */}
            {profesores.map((prof) => (
              <tr key={prof.cedula} className="border-t">
                <td className="p-3">{prof.cedula}</td>
                <td className="p-3">{prof.nombre}</td>
                <td className="p-3">{prof.correo}</td>
              </tr>
            ))}
            {/* Mensaje cuando no hay profesores */}
            {profesores.length === 0 && (
              <tr>
                <td colSpan={3} className="p-3 text-center text-gray-500">
                  No hay profesores registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionProfesores;