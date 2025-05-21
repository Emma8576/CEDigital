import { useEffect, useState, useRef } from "react";
import {
  getGrupos,
  getCursos,
  getSemestres,
  getProfesores,
  crearGrupo,
  asignarProfesoresAGrupo,
  Grupo,
  Curso,
  Semestre,
  Profesor
} from "../services/grupoService";
import axios from "axios";

/**
 * Componente para la gestión de grupos académicos
 * Permite crear nuevos grupos, asignar profesores y ver los grupos existentes
 */
const GestionGrupos = () => {
  // Estados para almacenar datos de la API
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  
  // Estado para almacenar los profesores seleccionados (sus cédulas)
  const [profesoresSeleccionados, setProfesoresSeleccionados] = useState<string[]>([]);

  // Estados para el formulario de creación de grupos
  const [busquedaCurso, setBusquedaCurso] = useState("");
  const [codigoCurso, setCodigoCurso] = useState("");
  const [busquedaProfesor, setBusquedaProfesor] = useState("");
  const [idSemestre, setIdSemestre] = useState<number | "">("");
  const [numeroGrupo, setNumeroGrupo] = useState<number>(1);
  const [mensaje, setMensaje] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  
  // Estados para controlar los dropdowns
  const [cursoDropdownOpen, setCursoDropdownOpen] = useState(false);
  const [profesorDropdownOpen, setProfesorDropdownOpen] = useState(false);
  
  // Referencias para cerrar los dropdowns al hacer click fuera
  const cursoRef = useRef<HTMLDivElement>(null);
  const profesorRef = useRef<HTMLDivElement>(null);

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener datos en paralelo para mejorar rendimiento
        const [gruposData, cursosData, semestresData, profesoresData] = await Promise.all([
          getGrupos(),
          getCursos(),
          getSemestres(),
          getProfesores()
        ]);
        
        // Actualizar estados con los datos obtenidos
        setGrupos(gruposData);
        setCursos(cursosData);
        setSemestres(semestresData);
        setProfesores(profesoresData);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    fetchData();
    
    // Agregar event listener para cerrar dropdowns al hacer click fuera
    const handleClickOutside = (event: MouseEvent) => {
      if (cursoRef.current && !cursoRef.current.contains(event.target as Node)) {
        setCursoDropdownOpen(false);
      }
      if (profesorRef.current && !profesorRef.current.contains(event.target as Node)) {
        setProfesorDropdownOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filtrar profesores según el texto de búsqueda (por nombre o cédula)
  const profesoresFiltrados = profesores.filter((prof: Profesor) =>
    prof.nombre.toLowerCase().includes(busquedaProfesor.toLowerCase()) ||
    prof.cedula.toString().includes(busquedaProfesor)
  );

  // Filtrar cursos según el texto de búsqueda (por nombre o código)
  const cursosFiltrados = cursos.filter((curso: Curso) =>
    curso.nombreCurso.toLowerCase().includes(busquedaCurso.toLowerCase()) ||
    curso.codigoCurso.toLowerCase().includes(busquedaCurso.toLowerCase())
  );
  
  // Obtener información del curso seleccionado
  const cursoSeleccionado = cursos.find(curso => curso.codigoCurso === codigoCurso);
  
  // Función para seleccionar un curso
  const seleccionarCurso = (curso: Curso) => {
    setCodigoCurso(curso.codigoCurso);
    setBusquedaCurso(`${curso.codigoCurso} - ${curso.nombreCurso}`);
    setCursoDropdownOpen(false);
  };
  
  // Función para manejar cambios en el input de búsqueda de cursos
  const handleBusquedaCursoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusquedaCurso(e.target.value);
    if (!cursoDropdownOpen) setCursoDropdownOpen(true);
    if (e.target.value === "" || !cursos.some(curso => 
      `${curso.codigoCurso} - ${curso.nombreCurso}` === e.target.value)) {
      setCodigoCurso("");
    }
  };

  /**
   * Manejar el envío del formulario para crear un nuevo grupo
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar mensajes previos
    setMensaje("");
    setMensajeExito("");
    
    // Validar que se hayan seleccionado curso y semestre
    if (!codigoCurso || !idSemestre) return;

    // Validar que no exista ya un grupo con la misma combinación de datos
    const grupoYaExiste = grupos.some(
      (grupo) =>
        grupo.codigoCurso === codigoCurso &&
        grupo.idSemestre === idSemestre &&
        grupo.numeroGrupo === numeroGrupo
    );

    if (grupoYaExiste) {
      setMensaje(`Ya existe el grupo ${numeroGrupo} para este curso en este semestre.`);
      return;
    }

    // Validar que se haya seleccionado al menos un profesor
    if (profesoresSeleccionados.length === 0) {
      setMensaje("Debe asignar al menos un profesor al grupo.");
      return;
    }

    try {
      // Primero crear el grupo base
      const nuevoGrupo = await crearGrupo(
        codigoCurso,
        Number(idSemestre),
        numeroGrupo
      );

        console.log("Asignando profesores...", {
        idGrupo: nuevoGrupo.idGrupo,
        cedulasProfesores: profesoresSeleccionados
        });

        await asignarProfesoresAGrupo(nuevoGrupo.idGrupo, profesoresSeleccionados.map(String));


        console.log("Profesores asignados correctamente");

      // Actualizar la lista de grupos con los nuevos datos (incluyendo profesores)
      const nuevosGrupos = await getGrupos();
      setGrupos(nuevosGrupos);

      // Mostrar mensaje de éxito
      const nombreCurso = cursos.find(c => c.codigoCurso === codigoCurso)?.nombreCurso || codigoCurso;
      const cantidadProfesores = profesoresSeleccionados.length;
      setMensajeExito(
        `¡Éxito! ${cantidadProfesores > 1 ? 'Profesores asignados' : 'Profesor asignado'} correctamente al grupo ${numeroGrupo} de ${nombreCurso}`
      );
      
      // Limpiar el formulario después de un tiempo
      setTimeout(() => {
        setMensajeExito("");
      }, 5000); // El mensaje desaparecerá después de 5 segundos
      
      // Limpiar el formulario
      setCodigoCurso("");
      setBusquedaCurso("");
      setIdSemestre("");
      setNumeroGrupo(1);
      setProfesoresSeleccionados([]);
      setBusquedaProfesor("");
      setMensaje("");
    } catch (error) {
      console.error("Error al crear grupo:", error);
      if (axios.isAxiosError(error)) {
        console.error("Respuesta del backend:", error.response?.data);
      }
      setMensaje("Error al crear el grupo o asignar profesores. Intente nuevamente.");
      setMensajeExito(""); // Asegurarse de limpiar cualquier mensaje de éxito previo
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Gestión de Grupos</h1>
      {/* Descripción */}
      <div className="text-gray-700">
        En esta sección puede crear semestres con su respectivo año y periodo académico.
      </div>

      {/* Formulario de creación de grupos */}
      <form onSubmit={handleSubmit} className="space-y-5 mb-6">
        {/* Selector de curso con búsqueda integrada */}
        <div ref={cursoRef} className="relative mt-6">
          <label className="block mb-1">Curso:</label>
          <div className="relative">
            <input
              type="text"
              value={busquedaCurso}
              onChange={handleBusquedaCursoChange}
              onFocus={() => setCursoDropdownOpen(true)}
              className="border p-2 w-full"
              placeholder="Buscar y seleccionar curso"
              required
            />
            <button 
              type="button"
              className="absolute right-2 top-2 text-gray-500"
              onClick={() => setCursoDropdownOpen(!cursoDropdownOpen)}
            >
              ▼
            </button>
          </div>
          
          {cursoDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
              {cursosFiltrados.length > 0 ? (
                cursosFiltrados.map((curso) => (
                  <div
                    key={curso.codigoCurso}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => seleccionarCurso(curso)}
                  >
                    {curso.codigoCurso} - {curso.nombreCurso}
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-500">No se encontraron cursos</div>
              )}
            </div>
          )}
        </div>

        {/* Selector de semestre */}
        <div>
          <label className="block mb-1">Semestre:</label>
          <select
            value={idSemestre}
            onChange={(e) => setIdSemestre(Number(e.target.value))}
            className="border p-2 w-full"
            required
          >
            <option value="">Seleccione un semestre</option>
            {semestres.map((semestre) => (
              <option key={semestre.idSemestre} value={semestre.idSemestre}>
                {semestre.año} - {semestre.periodo}
              </option>
            ))}
          </select>
        </div>

        {/* Entrada para número de grupo */}
        <div>
          <label className="block mb-1">Número de Grupo:</label>
          <input
            type="number"
            value={numeroGrupo}
            onChange={(e) => setNumeroGrupo(parseInt(e.target.value))}
            className="border p-2 w-full"
            min={1}
            required
          />
        </div>

        {/* Selector de profesores con búsqueda integrada y selección múltiple */}
        <div ref={profesorRef} className="relative">
          <label className="block mb-1">Asignar Profesores (máximo 2):</label>
          <div className="relative">
            <input
              type="text"
              value={busquedaProfesor}
              onChange={(e) => {
                setBusquedaProfesor(e.target.value);
                if (!profesorDropdownOpen) setProfesorDropdownOpen(true);
              }}
              onFocus={() => setProfesorDropdownOpen(true)}
              className="border p-2 w-full"
              placeholder="Buscar profesores por nombre o cédula"
            />
            <button 
              type="button"
              className="absolute right-2 top-2 text-gray-500"
              onClick={() => setProfesorDropdownOpen(!profesorDropdownOpen)}
            >
              ▼
            </button>
          </div>
          
          {/* Mostrar profesores seleccionados como "chips" o "etiquetas" */}
          {profesoresSeleccionados.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {profesoresSeleccionados.map(cedula => {
                const profesor = profesores.find(p => p.cedula === cedula);
                return profesor ? (
                  <div key={cedula} className="bg-blue-100 px-2 py-1 rounded-full flex items-center">
                    <span>{profesor.nombre}</span>
                    <button
                      type="button"
                      className="ml-2 text-blue-700 font-bold"
                      onClick={() => setProfesoresSeleccionados(prev => prev.filter(id => id !== cedula))}
                    >
                      ×
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          )}
          
          {profesorDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
              {profesoresFiltrados.length > 0 ? (
                profesoresFiltrados.map((profesor) => {
                  const isSelected = profesoresSeleccionados.includes(profesor.cedula);
                  return (
                    <div
                      key={profesor.cedula}
                      className={`p-2 hover:bg-gray-100 cursor-pointer flex items-center ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setProfesoresSeleccionados(prev => 
                            prev.filter(id => id !== profesor.cedula)
                          );
                        } else if (profesoresSeleccionados.length < 2) {
                          setProfesoresSeleccionados(prev => [...prev, profesor.cedula]);
                        }
                        // No cerramos el dropdown para permitir seleccionar múltiples profesores
                        setBusquedaProfesor(""); // Limpiar búsqueda después de seleccionar
                      }}
                    >
                      <div className="flex-grow">
                        {profesor.nombre} ({profesor.cedula})
                      </div>
                      {isSelected && <span className="text-blue-600">✓</span>}
                    </div>
                  );
                })
              ) : (
                <div className="p-2 text-gray-500">No se encontraron profesores</div>
              )}
            </div>
          )}
        </div>

        {/* Mostrar mensajes de error o éxito */}
        {mensaje && <p className="text-red-600 font-semibold">{mensaje}</p>}
        {mensajeExito && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative flex items-center" role="alert">
            <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="block sm:inline">{mensajeExito}</span>
          </div>
        )}

        {/* Botón para enviar el formulario */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Agregar Grupo
        </button>
      </form>

      {/* Tabla de grupos existentes */}
      <h2 className="text-lg font-semibold mb-2">
        Grupos Registrados ({grupos.length})
      </h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Curso</th>
            <th className="border p-2">Semestre</th>
            <th className="border p-2">Grupo</th>
            {/* Comentada la columna de profesores 
            <th className="border p-2">Profesores</th>
            */}
          </tr>
        </thead>
        <tbody>
          {grupos.map((grupo) => (
            <tr key={grupo.idGrupo}>
              <td className="border p-2">
                {grupo.codigoCurso} - {grupo.curso?.nombreCurso}
              </td>
              <td className="border p-2">
                {grupo.semestre?.año} - {grupo.semestre?.periodo}
              </td>
              <td className="border p-2">{grupo.numeroGrupo}</td>
              {/* Comentada la celda de profesores 
              <td className="border p-2">
                {grupo.profesores && grupo.profesores.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {grupo.profesores.map((profesor) => (
                      <div key={profesor.cedula} className="bg-blue-50 px-2 py-1 rounded">
                        {profesor.nombre} ({profesor.cedula})
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 italic">Sin profesores asignados</span>
                )}
              </td>
              */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GestionGrupos;