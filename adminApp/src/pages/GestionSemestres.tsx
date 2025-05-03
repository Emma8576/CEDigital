import { useState } from "react";
import { PlusIcon, TrashIcon, UserPlusIcon, UserGroupIcon, FolderIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

// Tipos de datos
type Semestre = {
  id: number;
  año: number;
  periodo: string;
};

type CarpetaDocumento = {
  id: number;
  nombre: string;
};

type RubroEvaluacion = {
  id: number;
  nombre: string;
  porcentaje: number;
};

type Curso = {
  id: number;
  semestreId: number;
  nombre: string;
  grupo: number;
  profesor: string;
  carpetasDocumentos: CarpetaDocumento[];
  rubrosEvaluacion: RubroEvaluacion[];
};

type Estudiante = {
  id: number;
  cursoId: number;
  carnet: string;
  nombre: string;
};

const GestionSemestres = () => {
  // Estados
  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [mostrarFormularioSemestre, setMostrarFormularioSemestre] = useState(false);
  const [mostrarFormularioCurso, setMostrarFormularioCurso] = useState(false);
  const [mostrarFormularioMatricula, setMostrarFormularioMatricula] = useState(false);
  const [mostrarDetallesCurso, setMostrarDetallesCurso] = useState(false);
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState<number | null>(null);
  const [nuevoSemestre, setNuevoSemestre] = useState({ año: new Date().getFullYear(), periodo: "1" });
  const [nuevoCurso, setNuevoCurso] = useState({
    semestreId: 0,
    nombre: "",
    grupo: 1,
    profesor: ""
  });
  const [nuevoEstudiante, setNuevoEstudiante] = useState({
    cursoId: 0,
    carnet: "",
    nombre: ""
  });

  // Lista de periodos académicos
  const periodos = [
    { valor: "1", nombre: "1 - Primer Semestre" },
    { valor: "2", nombre: "2 - Segundo Semestre" },
    { valor: "V", nombre: "V - Verano" },
  ];

  // Estructura predeterminada para carpetas de documentos
  const carpetasDocumentosDefault = [
    { id: Date.now() + 1, nombre: "Presentaciones" },
    { id: Date.now() + 2, nombre: "Quices" },
    { id: Date.now() + 3, nombre: "Exámenes" },
    { id: Date.now() + 4, nombre: "Proyectos" },
  ];

  // Estructura predeterminada para rubros de evaluación
  const rubrosEvaluacionDefault = [
    { id: Date.now() + 5, nombre: "Quices", porcentaje: 30 },
    { id: Date.now() + 6, nombre: "Exámenes", porcentaje: 30 },
    { id: Date.now() + 7, nombre: "Proyectos", porcentaje: 40 },
  ];

  // Manejadores para semestres
  const handleAgregarSemestre = () => {
    const nuevo = {
      id: Date.now(),
      año: nuevoSemestre.año,
      periodo: nuevoSemestre.periodo,
    };
    setSemestres([...semestres, nuevo]);
    setNuevoSemestre({ año: new Date().getFullYear(), periodo: "1" });
    setMostrarFormularioSemestre(false);
  };

  const handleEliminarSemestre = (id: number) => {
    // Eliminar los cursos asociados a este semestre
    const cursosDelSemestre = cursos.filter(c => c.semestreId === id).map(c => c.id);
    
    // Eliminar estudiantes de los cursos de este semestre
    setEstudiantes(estudiantes.filter(e => !cursosDelSemestre.includes(e.cursoId)));
    
    // Eliminar cursos del semestre
    setCursos(cursos.filter(c => c.semestreId !== id));
    
    // Eliminar el semestre
    setSemestres(semestres.filter(s => s.id !== id));
  };

  // Manejadores para cursos
  const handleAgregarCurso = () => {
    if (nuevoCurso.semestreId === 0 || !nuevoCurso.nombre.trim() || !nuevoCurso.profesor.trim()) {
      return;
    }
    
    const nuevo: Curso = {
      id: Date.now(),
      semestreId: nuevoCurso.semestreId,
      nombre: nuevoCurso.nombre,
      grupo: nuevoCurso.grupo,
      profesor: nuevoCurso.profesor,
      carpetasDocumentos: carpetasDocumentosDefault,
      rubrosEvaluacion: rubrosEvaluacionDefault,
    };
    
    setCursos([...cursos, nuevo]);
    setNuevoCurso({
      semestreId: nuevoCurso.semestreId,
      nombre: "",
      grupo: 1,
      profesor: ""
    });
    setMostrarFormularioCurso(false);
  };

  const handleEliminarCurso = (id: number) => {
    // Eliminar estudiantes del curso
    setEstudiantes(estudiantes.filter(e => e.cursoId !== id));
    
    // Eliminar el curso
    setCursos(cursos.filter(c => c.id !== id));
  };

  // Manejadores para estudiantes
  const handleAgregarEstudiante = () => {
    if (!cursoSeleccionadoId || !nuevoEstudiante.carnet.trim() || !nuevoEstudiante.nombre.trim()) {
      return;
    }
    
    const nuevo: Estudiante = {
      id: Date.now(),
      cursoId: cursoSeleccionadoId,
      carnet: nuevoEstudiante.carnet,
      nombre: nuevoEstudiante.nombre,
    };
    
    setEstudiantes([...estudiantes, nuevo]);
    setNuevoEstudiante({
      cursoId: cursoSeleccionadoId,
      carnet: "",
      nombre: ""
    });
  };

  const handleEliminarEstudiante = (id: number) => {
    setEstudiantes(estudiantes.filter(e => e.id !== id));
  };

  // Función para abrir el formulario de matrícula
  const abrirFormularioMatricula = (cursoId: number) => {
    setCursoSeleccionadoId(cursoId);
    setNuevoEstudiante({...nuevoEstudiante, cursoId: cursoId});
    setMostrarFormularioMatricula(true);
    setMostrarDetallesCurso(false);
  };

  // Función para abrir los detalles del curso
  const abrirDetallesCurso = (cursoId: number) => {
    setCursoSeleccionadoId(cursoId);
    setMostrarDetallesCurso(true);
    setMostrarFormularioMatricula(false);
  };

  // Función para obtener los datos de un curso
  const getCursoData = (cursoId: number) => {
    const curso = cursos.find(c => c.id === cursoId);
    if (!curso) return null;
    
    const semestre = semestres.find(s => s.id === curso.semestreId);
    return {
      curso,
      semestre
    };
  };

  return (
    <div className="space-y-6">
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
      <div className="text-gray-700">
        En esta sección puede crear semestres con su respectivo año y periodo académico.
        También puede asignar cursos, grupos, profesores y estudiantes a cada semestre.
      </div>

      {/* Tabla de semestres */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-xl">
          <thead>
            <tr className="bg-blue-100 text-left">
              <th className="p-3">Año</th>
              <th className="p-3">Periodo</th>
              <th className="p-3">Cursos</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {semestres.map((sem) => (
              <tr key={sem.id} className="border-t">
                <td className="p-3">{sem.año}</td>
                <td className="p-3">{sem.periodo}</td>
                <td className="p-3">{cursos.filter(c => c.semestreId === sem.id).length}</td>
                <td className="p-3 flex gap-2">
                  <button 
                    onClick={() => {
                      setNuevoCurso({ ...nuevoCurso, semestreId: sem.id });
                      setMostrarFormularioCurso(true);
                    }}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                  >
                    Añadir Curso
                  </button>
                  <button 
                    onClick={() => handleEliminarSemestre(sem.id)}
                    className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {semestres.length === 0 && (
              <tr>
                <td colSpan={4} className="p-3 text-center text-gray-500">
                  No hay semestres registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Formulario para crear semestre */}
      {mostrarFormularioSemestre && (
        <div className="bg-gray-100 p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Nuevo Semestre</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Año</label>
              <input
                type="number"
                className="p-2 border rounded"
                value={nuevoSemestre.año}
                onChange={(e) => setNuevoSemestre({ ...nuevoSemestre, año: parseInt(e.target.value) })}
              />
            </div>
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

      {/* Formulario para asignar curso a semestre */}
      {mostrarFormularioCurso && (
        <div className="bg-gray-100 p-6 rounded-lg shadow-md space-y-4 mt-6">
          <h2 className="text-lg font-bold text-gray-800">
            Asignar Curso a Semestre {
              semestres.find(s => s.id === nuevoCurso.semestreId)?.año
            } / Periodo {
              semestres.find(s => s.id === nuevoCurso.semestreId)?.periodo
            }
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Nombre del Curso</label>
              <input
                type="text"
                className="p-2 border rounded"
                value={nuevoCurso.nombre}
                onChange={(e) => setNuevoCurso({ ...nuevoCurso, nombre: e.target.value })}
                placeholder="Ej: Cálculo"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-600">Número de Grupo</label>
              <input
                type="number"
                className="p-2 border rounded"
                value={nuevoCurso.grupo}
                onChange={(e) => setNuevoCurso({ ...nuevoCurso, grupo: parseInt(e.target.value) })}
                min="1"
              />
            </div>
          </div>
          
          <div className="flex flex-col">
            <label className="mb-1 text-sm text-gray-600">Profesor</label>
            <input
              type="text"
              className="p-2 border rounded"
              value={nuevoCurso.profesor}
              onChange={(e) => setNuevoCurso({ ...nuevoCurso, profesor: e.target.value })}
              placeholder="Ej: Juan Pérez"
            />
          </div>
          
          <div className="mt-2 text-gray-600 text-sm">
            <p>El curso se creará con las siguientes estructuras predeterminadas:</p>
            <ul className="list-disc pl-6 mt-1">
              <li>Carpetas de documentos: Presentaciones, Quices, Exámenes, Proyectos</li>
              <li>Rubros de evaluación: Quices (30%), Exámenes (30%), Proyectos (40%)</li>
            </ul>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleAgregarCurso}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Guardar
            </button>
            <button
              onClick={() => setMostrarFormularioCurso(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tabla de cursos asignados */}
      {cursos.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-blue-800 mb-4">Cursos Asignados</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-xl">
              <thead>
                <tr className="bg-blue-100 text-left">
                  <th className="p-3">Semestre</th>
                  <th className="p-3">Curso</th>
                  <th className="p-3">Grupo</th>
                  <th className="p-3">Profesor</th>
                  <th className="p-3">Estudiantes</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cursos.map((curso) => {
                  const semestre = semestres.find(s => s.id === curso.semestreId);
                  const numEstudiantes = estudiantes.filter(e => e.cursoId === curso.id).length;
                  
                  return (
                    <tr key={curso.id} className="border-t">
                      <td className="p-3">
                        {semestre ? `${semestre.año} / ${semestre.periodo}` : 'N/A'}
                      </td>
                      <td className="p-3">{curso.nombre}</td>
                      <td className="p-3">{curso.grupo}</td>
                      <td className="p-3">{curso.profesor}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <span>{numEstudiantes}</span>
                          <button
                            onClick={() => abrirFormularioMatricula(curso.id)}
                            className="ml-2 bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                            title="Gestionar estudiantes"
                          >
                            <UserGroupIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="p-3 flex gap-2">
                        <button 
                          onClick={() => abrirDetallesCurso(curso.id)}
                          className="bg-indigo-600 text-white p-1 rounded hover:bg-indigo-700"
                          title="Ver detalles del curso"
                        >
                          <FolderIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEliminarCurso(curso.id)}
                          className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detalles del curso (carpetas y evaluaciones) */}
      {mostrarDetallesCurso && cursoSeleccionadoId && (
        <div className="mt-8 border-t pt-4">
          {(() => {
            const cursoData = getCursoData(cursoSeleccionadoId);
            if (!cursoData) return null;
            
            const { curso, semestre } = cursoData;
            
            return (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-blue-800">
                    Detalles de Curso - {curso.nombre} (Grupo {curso.grupo})
                  </h2>
                  <button
                    onClick={() => setMostrarDetallesCurso(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Volver
                  </button>
                </div>
                
                <div className="text-gray-600 mb-4">
                  Semestre: {semestre?.año} / Periodo {semestre?.periodo} • Profesor: {curso.profesor}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sección de Documentos */}
                  <div className="bg-white shadow-md rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                      <FolderIcon className="w-5 h-5" />
                      Sección de Documentos
                    </h3>
                    
                    <ul className="space-y-2">
                      {curso.carpetasDocumentos.map(carpeta => (
                        <li key={carpeta.id} className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 flex items-center gap-2">
                          <FolderIcon className="w-5 h-5 text-yellow-600" />
                          {carpeta.nombre}
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-4 text-gray-600 text-sm">
                      <p>Los profesores y estudiantes verán estas carpetas de documentos cuando accedan al curso.</p>
                    </div>
                  </div>
                  
                  {/* Sección de Evaluaciones */}
                  <div className="bg-white shadow-md rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                      <ClipboardDocumentListIcon className="w-5 h-5" />
                      Rubros de Evaluación
                    </h3>
                    
                    <div className="space-y-3">
                      {curso.rubrosEvaluacion.map(rubro => (
                        <div key={rubro.id} className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
                          <span className="font-medium">{rubro.nombre}</span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                            {rubro.porcentaje}%
                          </span>
                        </div>
                      ))}
                      
                      <div className="p-3 bg-blue-50 rounded-md flex justify-between items-center">
                        <span className="font-medium text-blue-800">Total</span>
                        <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm">
                          {curso.rubrosEvaluacion.reduce((sum, rubro) => sum + rubro.porcentaje, 0)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-gray-600 text-sm">
                      <p>Los profesores y estudiantes verán estos rubros de evaluación al acceder al curso.</p>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Formulario y tabla de matrícula de estudiantes */}
      {mostrarFormularioMatricula && cursoSeleccionadoId && (
        <div className="mt-8 border-t pt-4">
          {(() => {
            const cursoData = getCursoData(cursoSeleccionadoId);
            if (!cursoData) return null;
            
            const { curso, semestre } = cursoData;
            
            return (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-blue-800">
                    Matrícula de Estudiantes - {curso.nombre} (Grupo {curso.grupo})
                  </h2>
                  <button
                    onClick={() => setMostrarFormularioMatricula(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Volver
                  </button>
                </div>
                
                <div className="text-gray-600 mb-4">
                  Semestre: {semestre?.año} / Periodo {semestre?.periodo} • Profesor: {curso.profesor}
                </div>
                
                {/* Formulario para matricular estudiante */}
                <div className="bg-gray-100 p-6 rounded-lg shadow-md space-y-4 mb-6">
                  <h3 className="text-lg font-bold text-gray-800">Matricular Estudiante</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm text-gray-600">Número de Carnet</label>
                      <input
                        type="text"
                        className="p-2 border rounded"
                        value={nuevoEstudiante.carnet}
                        onChange={(e) => setNuevoEstudiante({ ...nuevoEstudiante, carnet: e.target.value })}
                        placeholder="Ej: 2021358714"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm text-gray-600">Nombre del Estudiante</label>
                      <input
                        type="text"
                        className="p-2 border rounded"
                        value={nuevoEstudiante.nombre}
                        onChange={(e) => setNuevoEstudiante({ ...nuevoEstudiante, nombre: e.target.value })}
                        placeholder="Ej: María López"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleAgregarEstudiante}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                    >
                      <UserPlusIcon className="w-5 h-5" />
                      Matricular
                    </button>
                  </div>
                </div>
                
                {/* Tabla de estudiantes matriculados */}
                <div className="overflow-x-auto">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Estudiantes Matriculados</h3>
                  <table className="min-w-full bg-white shadow-md rounded-xl">
                    <thead>
                      <tr className="bg-blue-100 text-left">
                        <th className="p-3">Carnet</th>
                        <th className="p-3">Nombre</th>
                        <th className="p-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estudiantes.filter(e => e.cursoId === cursoSeleccionadoId).map((est) => (
                        <tr key={est.id} className="border-t">
                          <td className="p-3">{est.carnet}</td>
                          <td className="p-3">{est.nombre}</td>
                          <td className="p-3">
                            <button 
                              onClick={() => handleEliminarEstudiante(est.id)}
                              className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {estudiantes.filter(e => e.cursoId === cursoSeleccionadoId).length === 0 && (
                        <tr>
                          <td colSpan={3} className="p-3 text-center text-gray-500">
                            No hay estudiantes matriculados
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default GestionSemestres;