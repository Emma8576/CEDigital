import { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { crearEstudiante, obtenerEstudiantes } from "../services/estudianteService";

// Definición del tipo de datos para un estudiante
export type Estudiante = {
  carne: string;
  cedula: string;
  nombre: string;
  correo: string;
  telefono: string;
  password: string;
};

/**
 * Componente principal para la gestión de estudiantes
 * Permite agregar nuevos estudiantes y visualizar la lista existente
 */
const GestionEstudiantes = () => {
  // Estado para almacenar la lista de estudiantes
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  
  // Estado para controlar la visibilidad del formulario de registro
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  
  // Estado para almacenar los datos del nuevo estudiante mientras se está creando
  const [nuevoEstudiante, setNuevoEstudiante] = useState<Estudiante>({
    carne: "",
    cedula: "",
    nombre: "",
    correo: "",
    telefono: "",
    password: "",
  });

  // Efecto que se ejecuta al montar el componente para cargar la lista de estudiantes
  useEffect(() => {
    obtenerEstudiantes()
      .then((response) => setEstudiantes(response.data))
      .catch((error) => console.error("Error al obtener estudiantes:", error));
  }, []);

  /**
   * Función para encriptar la contraseña usando SHA-256
   * @param password - Contraseña en texto plano
   * @returns Promise con la contraseña encriptada en formato hexadecimal
   */
  const hashPassword = async (password: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  /**
   * Función para manejar el registro de un nuevo estudiante
   * Encripta la contraseña antes de enviarla al servidor
   */
  const handleAgregarEstudiante = async () => {
    try {
      // Encriptar la contraseña antes de enviar
      const hashedPassword = await hashPassword(nuevoEstudiante.password);
      const estudianteConPasswordEncriptado = {
        ...nuevoEstudiante,
        password: hashedPassword,
      };

      // Enviar el estudiante al servidor
      const response = await crearEstudiante(estudianteConPasswordEncriptado);
      
      // Actualizar la lista local de estudiantes
      setEstudiantes([...estudiantes, response.data]);
      
      // Limpiar el formulario
      setNuevoEstudiante({
        carne: "",
        cedula: "",
        nombre: "",
        correo: "",
        telefono: "",
        password: "",
      });
      
      // Ocultar el formulario
      setMostrarFormulario(false);
    } catch (error: any) {
      console.error("Error al crear estudiante:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con título y botón para agregar estudiante */}
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

      {/* Descripción de la funcionalidad */}
      <div className="text-gray-700">
        En esta sección puede agregar nuevos estudiantes al sistema.
      </div>

      {/* Formulario de registro (solo visible cuando mostrarFormulario es true) */}
      {mostrarFormulario && (
        <div className="bg-gray-100 p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Nuevo Estudiante</h2>
          
          {/* Grid de campos de entrada */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campo Carnet */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Carnet</label>
              <input
                type="text"
                className="p-2 border rounded"
                value={nuevoEstudiante.carne}
                onChange={(e) =>
                  setNuevoEstudiante({ ...nuevoEstudiante, carne: e.target.value })
                }
              />
            </div>
            
            {/* Campo Cédula */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Cédula</label>
              <input
                type="text"
                className="p-2 border rounded"
                value={nuevoEstudiante.cedula}
                onChange={(e) =>
                  setNuevoEstudiante({...nuevoEstudiante,cedula: e.target.value })
                }
              />
            </div>
            
            {/* Campo Nombre */}
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
            
            {/* Campo Correo */}
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
            
            {/* Campo Teléfono */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Teléfono</label>
              <input
                type="text"
                className="p-2 border rounded"
                value={nuevoEstudiante.telefono}
                onChange={(e) =>
                  setNuevoEstudiante({ ...nuevoEstudiante, telefono: e.target.value })
                }
              />
            </div>
            
            {/* Campo Contraseña */}
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

          {/* Botones de acción del formulario */}
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

      {/* Tabla para mostrar la lista de estudiantes */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-xl">
          {/* Encabezados de la tabla */}
          <thead>
            <tr className="bg-blue-100 text-left">
              <th className="p-3">Carnet</th>
              <th className="p-3">Cédula</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Correo</th>
              <th className="p-3">Teléfono</th>
            </tr>
          </thead>
          
          {/* Cuerpo de la tabla con datos de estudiantes */}
          <tbody>
            {/* Mapeo de cada estudiante a una fila de la tabla */}
            {estudiantes.map((est) => (
              <tr key={est.carne} className="border-t">
                <td className="p-3">{est.carne}</td>
                <td className="p-3">{est.cedula}</td>
                <td className="p-3">{est.nombre}</td>
                <td className="p-3">{est.correo}</td>
                <td className="p-3">{est.telefono}</td>
              </tr>
            ))}
            
            {/* Mensaje cuando no hay estudiantes registrados */}
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