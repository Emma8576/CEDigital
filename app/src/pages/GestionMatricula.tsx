import { useEffect, useState, useRef } from "react";
import {
  getGruposConCurso,
  getEstudiantes,
  asignarEstudiantesAGrupo,
  obtenerGruposConCantidadEstudiantes,
  Estudiante,
  GrupoConCurso,
} from "../services/matriculaService";

const GestionMatricula = () => {
  // Estados principales para datos de la API
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [grupos, setGrupos] = useState<GrupoConCurso[]>([]);
  const [grupoId, setGrupoId] = useState<number>(0);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [gruposResumen, setGruposResumen] = useState<any[]>([]);
  
  // Estados para los dropdowns filtrados
  const [busquedaGrupo, setBusquedaGrupo] = useState("");
  const [busquedaEstudiante, setBusquedaEstudiante] = useState("");
  const [grupoDropdownOpen, setGrupoDropdownOpen] = useState(false);
  const [estudianteDropdownOpen, setEstudianteDropdownOpen] = useState(false);

  // Referencias para cerrar los dropdowns al hacer click fuera
  const grupoRef = useRef<HTMLDivElement>(null);
  const estudianteRef = useRef<HTMLDivElement>(null);

  // Función para cargar todos los datos necesarios
  const cargarDatos = async () => {
    const estudiantesData = await getEstudiantes();
    const gruposData = await getGruposConCurso();
    const resumenData = await obtenerGruposConCantidadEstudiantes();

    console.log("Grupos con curso:", gruposData);

    setEstudiantes(estudiantesData);
    setGrupos(gruposData);
    setGruposResumen(resumenData);
  };

  // Cargar datos iniciales y configurar event listeners
  useEffect(() => {
    cargarDatos();
    
    // Agregar event listener para cerrar dropdowns al hacer click fuera
    const handleClickOutside = (event: MouseEvent) => {
      if (grupoRef.current && !grupoRef.current.contains(event.target as Node)) {
        setGrupoDropdownOpen(false);
      }
      if (estudianteRef.current && !estudianteRef.current.contains(event.target as Node)) {
        setEstudianteDropdownOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filtrar grupos según el texto de búsqueda (por nombre, código o número)
  const gruposFiltrados = grupos.filter((grupo: GrupoConCurso) =>
    grupo.nombreCurso.toLowerCase().includes(busquedaGrupo.toLowerCase()) ||
    (grupo.codigoCurso && grupo.codigoCurso.toLowerCase().includes(busquedaGrupo.toLowerCase())) ||
    grupo.numeroGrupo.toString().includes(busquedaGrupo)
  );

  // Filtrar estudiantes según el texto de búsqueda (por nombre o carné)
  const estudiantesFiltrados = estudiantes.filter((estudiante: Estudiante) =>
    estudiante.nombre.toLowerCase().includes(busquedaEstudiante.toLowerCase()) ||
    estudiante.carne.toString().toLowerCase().includes(busquedaEstudiante.toLowerCase())
  );

  // Obtener información del grupo seleccionado
  const grupoSeleccionado = grupos.find(grupo => grupo.idGrupo === grupoId);

  // Función para seleccionar un grupo
  const seleccionarGrupo = (grupo: GrupoConCurso) => {
    setGrupoId(grupo.idGrupo);
    setBusquedaGrupo(`Grupo ${grupo.numeroGrupo} - ${grupo.nombreCurso}${grupo.codigoCurso ? ` (${grupo.codigoCurso})` : ""}`);
    setGrupoDropdownOpen(false);
  };

  // Función para manejar cambios en el input de búsqueda de grupos
  const handleBusquedaGrupoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusquedaGrupo(e.target.value);
    if (!grupoDropdownOpen) setGrupoDropdownOpen(true);
    // Limpiar selección si el texto no coincide con ningún grupo
    if (e.target.value === "" || !grupos.some(grupo => 
      `Grupo ${grupo.numeroGrupo} - ${grupo.nombreCurso}${grupo.codigoCurso ? ` (${grupo.codigoCurso})` : ""}` === e.target.value)) {
      setGrupoId(0);
    }
  };

  // Función principal para asignar estudiantes al grupo seleccionado
  const manejarAsignacion = async () => {
    // Limpiar mensajes previos
    setMensaje("");
    setMensajeExito("");

    // Validar que se hayan seleccionado grupo y estudiantes
    if (!grupoId || seleccionados.length === 0) {
      setMensaje("Debes seleccionar al menos un estudiante y un grupo.");
      return;
    }

    try {
      // Realizar la asignación en el backend
      await asignarEstudiantesAGrupo(grupoId, seleccionados);
      
      // Mostrar mensaje de éxito personalizado
      const cantidadEstudiantes = seleccionados.length;
      const nombreGrupo = grupoSeleccionado ? 
        `Grupo ${grupoSeleccionado.numeroGrupo} - ${grupoSeleccionado.nombreCurso}` : 
        "el grupo seleccionado";
      
      setMensajeExito(
        `¡Éxito! ${cantidadEstudiantes > 1 ? `${cantidadEstudiantes} estudiantes asignados` : 'Estudiante asignado'} correctamente a ${nombreGrupo}`
      );
      
      // Limpiar formulario
      setSeleccionados([]);
      setBusquedaEstudiante("");
      setMensaje("");
      
      // Actualizar datos para reflejar cambios
      await cargarDatos();
      
      // Limpiar mensaje de éxito después de un tiempo
      setTimeout(() => {
        setMensajeExito("");
      }, 5000);
      
    } catch (error: any) {
      console.error("Error al asignar estudiantes:", error);
      setMensaje(
        `Error al asignar estudiantes: ${
          error.response?.data?.message || error.message
        }`
      );
      setMensajeExito("");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Gestión de Matrícula</h1>
      
      {/* Descripción */}
      <div className="text-gray-700 mb-6">
        En esta sección puede asignar estudiantes a los grupos académicos existentes.
      </div>

      <div className="space-y-5 mb-6">
        {/* Selector de grupo con búsqueda integrada */}
        <div ref={grupoRef} className="relative">
          <label className="block mb-1">Seleccionar Grupo:</label>
          <div className="relative">
            <input
              type="text"
              value={busquedaGrupo}
              onChange={handleBusquedaGrupoChange}
              onFocus={() => setGrupoDropdownOpen(true)}
              className="border p-2 w-full"
              placeholder="Buscar y seleccionar grupo"
              required
            />
            {/* Botón dropdown para grupos */}
            <button 
              type="button"
              className="absolute right-2 top-2 text-gray-500"
              onClick={() => setGrupoDropdownOpen(!grupoDropdownOpen)}
            >
              ▼
            </button>
          </div>
          
          {/* Lista desplegable de grupos filtrados */}
          {grupoDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
              {gruposFiltrados.length > 0 ? (
                gruposFiltrados.map((grupo) => (
                  <div
                    key={grupo.idGrupo}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => seleccionarGrupo(grupo)}
                  >
                    Grupo {grupo.numeroGrupo} - {grupo.nombreCurso}
                    {grupo.codigoCurso ? ` (${grupo.codigoCurso})` : ""}
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-500">No se encontraron grupos</div>
              )}
            </div>
          )}
        </div>

        {/* Selector de estudiantes con búsqueda integrada y selección múltiple */}
        <div ref={estudianteRef} className="relative">
          <label className="block mb-1">Asignar Estudiantes:</label>
          <div className="relative">
            <input
              type="text"
              value={busquedaEstudiante}
              onChange={(e) => {
                setBusquedaEstudiante(e.target.value);
                if (!estudianteDropdownOpen) setEstudianteDropdownOpen(true);
              }}
              onFocus={() => setEstudianteDropdownOpen(true)}
              className="border p-2 w-full"
              placeholder="Buscar estudiantes por nombre o carné"
            />
            {/* Botón dropdown para estudiantes */}
            <button 
              type="button"
              className="absolute right-2 top-2 text-gray-500"
              onClick={() => setEstudianteDropdownOpen(!estudianteDropdownOpen)}
            >
              ▼
            </button>
          </div>
          
          {/* Mostrar estudiantes seleccionados como "chips" o "etiquetas" */}
          {seleccionados.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {seleccionados.map(carne => {
                const estudiante = estudiantes.find(e => e.carne === carne);
                return estudiante ? (
                  <div key={carne} className="bg-blue-100 px-2 py-1 rounded-full flex items-center">
                    <span>{estudiante.nombre} ({estudiante.carne})</span>
                    {/* Botón para remover estudiante seleccionado */}
                    <button
                      type="button"
                      className="ml-2 text-blue-700 font-bold"
                      onClick={() => setSeleccionados(prev => prev.filter(c => c !== carne))}
                    >
                      ×
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          )}
          
          {/* Lista desplegable de estudiantes filtrados */}
          {estudianteDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
              {estudiantesFiltrados.length > 0 ? (
                estudiantesFiltrados.map((estudiante) => {
                  const isSelected = seleccionados.includes(estudiante.carne);
                  return (
                    <div
                      key={estudiante.carne}
                      className={`p-2 hover:bg-gray-100 cursor-pointer flex items-center ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                      onClick={() => {
                        // Toggle selección del estudiante
                        if (isSelected) {
                          setSeleccionados(prev => 
                            prev.filter(c => c !== estudiante.carne)
                          );
                        } else {
                          setSeleccionados(prev => [...prev, estudiante.carne]);
                        }
                        setBusquedaEstudiante(""); // Limpiar búsqueda después de seleccionar
                      }}
                    >
                      <div className="flex-grow">
                        {estudiante.nombre} ({estudiante.carne})
                      </div>
                      {/* Indicador visual de estudiante seleccionado */}
                      {isSelected && <span className="text-blue-600">✓</span>}
                    </div>
                  );
                })
              ) : (
                <div className="p-2 text-gray-500">No se encontraron estudiantes</div>
              )}
            </div>
          )}
        </div>

        {/* Mostrar mensajes de error o éxito */}
        {mensaje && <p className="text-red-600 font-semibold">{mensaje}</p>}
        {mensajeExito && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative flex items-center" role="alert">
            {/* Icono de éxito */}
            <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="block sm:inline">{mensajeExito}</span>
          </div>
        )}

        {/* Botón para asignar estudiantes */}
        <button
          onClick={manejarAsignacion}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Asignar Estudiantes
        </button>
      </div>

      {/* Tabla de resumen de grupos */}
      <h2 className="text-lg font-semibold mb-2">
        Resumen de Grupos ({gruposResumen.length})
      </h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Curso</th>
            <th className="border p-2">Grupo</th>
            <th className="border p-2">Cantidad de Estudiantes</th>
          </tr>
        </thead>
        <tbody>
          {gruposResumen.map((grupo, index) => (
            <tr key={index}>
              {/* Nombre del curso */}
              <td className="border p-2">{grupo.nombreCurso}</td>
              {/* Número del grupo */}
              <td className="border p-2">{grupo.numeroGrupo}</td>
              {/* Cantidad de estudiantes matriculados */}
              <td className="border p-2 text-center">
                {grupo.cantidadEstudiantes}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GestionMatricula;