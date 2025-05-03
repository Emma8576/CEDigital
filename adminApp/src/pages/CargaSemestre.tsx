import { useState } from "react";
import { ArrowUpTrayIcon, DocumentTextIcon, CheckCircleIcon, XCircleIcon, UsersIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import * as XLSX from "xlsx";

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
  estudiantes?: number; // Contador de estudiantes en el curso
};

type Estudiante = {
  id: number;
  cursoId: number;
  carnet: string;
  nombre: string;
};

// Estructura esperada en el archivo Excel
type FilaCursoExcel = {
  semestre: string; // formato: "YYYY-P" (P: 1, 2 o V)
  curso: string;
  grupo: number;
  profesor: string;
  carnet?: string; // opcional para filas que definen cursos
};

// Componente principal
const CargaSemestre = () => {
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [errorProcesamiento, setErrorProcesamiento] = useState<string | null>(null);
  const [resultadosCarga, setResultadosCarga] = useState<{
    semestres: Semestre[];
    cursos: Curso[];
    estudiantes: Estudiante[];
    errores: string[];
  } | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [pestañaActiva, setPestañaActiva] = useState<'resumen' | 'cursos' | 'errores'>('resumen');
  const [mostrarVistaPreviaTabla, setMostrarVistaPreviaTabla] = useState(false);

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

  const manejarSeleccionArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = e.target.files;
    if (archivos && archivos.length > 0) {
      setArchivoSeleccionado(archivos[0]);
      setErrorProcesamiento(null);
      setResultadosCarga(null);
      setMostrarVistaPreviaTabla(false);
    }
  };

  const procesarArchivo = async () => {
    if (!archivoSeleccionado) {
      setErrorProcesamiento("Debe seleccionar un archivo Excel primero.");
      return;
    }

    setProcesando(true);
    setErrorProcesamiento(null);
    
    try {
      const data = await leerArchivoExcel(archivoSeleccionado);
      const { semestres, cursos, estudiantes, errores } = procesarDatosExcel(data);
      
      // Calcular el número de estudiantes por curso
      const cursoConEstudiantes = cursos.map(curso => {
        const estudiantesCurso = estudiantes.filter(est => est.cursoId === curso.id);
        return {
          ...curso,
          estudiantes: estudiantesCurso.length,
        };
      });
      
      setResultadosCarga({
        semestres,
        cursos: cursoConEstudiantes,
        estudiantes,
        errores
      });
      
      // Mostrar automáticamente la vista previa si hay cursos
      if (cursoConEstudiantes.length > 0) {
        setMostrarVistaPreviaTabla(true);
      }
    } catch (error) {
      setErrorProcesamiento(`Error al procesar el archivo: ${error instanceof Error ? error.message : 'Desconocido'}`);
    } finally {
      setProcesando(false);
    }
  };

  const leerArchivoExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error("No se pudo leer el archivo"));
            return;
          }
          
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convertir a array de objetos
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData as any[]);
        } catch (err) {
          reject(err);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsBinaryString(file);
    });
  };

  const procesarDatosExcel = (data: any[]): {
    semestres: Semestre[],
    cursos: Curso[],
    estudiantes: Estudiante[],
    errores: string[]
  } => {
    const semestres: Semestre[] = [];
    const cursos: Curso[] = [];
    const estudiantes: Estudiante[] = [];
    const errores: string[] = [];
    
    // Map para tracking de semestres ya creados
    const semestresMap = new Map<string, number>(); // key: "YYYY-P", value: semestreId
    
    // Map para tracking de cursos ya creados
    const cursosMap = new Map<string, number>(); // key: "semestreId-nombre-grupo", value: cursoId
    
    // Set para tracking de estudiantes ya agregados
    const estudiantesSet = new Set<string>(); // key: "cursoId-carnet"
    
    // Iterar sobre cada fila del Excel
    data.forEach((fila: any, index: number) => {
      try {
        const numFila = index + 2; // +2 porque Excel comienza en 1 y la primera fila suele ser encabezados
        
        // Verificar si la fila tiene los campos requeridos
        if (!fila.semestre || !fila.curso || !fila.grupo || !fila.profesor) {
          errores.push(`Fila ${numFila}: Falta información requerida.`);
          return;
        }
        
        // Procesar información del semestre
        const semestreStr = String(fila.semestre).trim();
        const partesSemestre = semestreStr.split('-');
        
        if (partesSemestre.length !== 2) {
          errores.push(`Fila ${numFila}: Formato de semestre incorrecto. Debe ser "YYYY-P".`);
          return;
        }
        
        const año = parseInt(partesSemestre[0]);
        const periodo = partesSemestre[1];
        
        if (isNaN(año) || !['1', '2', 'V'].includes(periodo)) {
          errores.push(`Fila ${numFila}: Año o periodo inválido. El periodo debe ser 1, 2 o V.`);
          return;
        }
        
        // Verificar si ya existe el semestre, si no, crearlo
        const semestreKey = `${año}-${periodo}`;
        let semestreId: number;
        
        if (!semestresMap.has(semestreKey)) {
          semestreId = Date.now() + semestres.length;
          semestres.push({
            id: semestreId,
            año,
            periodo
          });
          semestresMap.set(semestreKey, semestreId);
        } else {
          semestreId = semestresMap.get(semestreKey)!;
        }
        
        // Procesar información del curso
        const nombreCurso = String(fila.curso).trim();
        const grupoCurso = parseInt(String(fila.grupo));
        const profesorCurso = String(fila.profesor).trim();
        
        if (isNaN(grupoCurso) || grupoCurso <= 0) {
          errores.push(`Fila ${numFila}: Número de grupo inválido.`);
          return;
        }
        
        // Verificar si ya existe el curso, si no, crearlo
        const cursoKey = `${semestreId}-${nombreCurso}-${grupoCurso}`;
        let cursoId: number;
        
        if (!cursosMap.has(cursoKey)) {
          cursoId = Date.now() + cursos.length;
          cursos.push({
            id: cursoId,
            semestreId,
            nombre: nombreCurso,
            grupo: grupoCurso,
            profesor: profesorCurso,
            carpetasDocumentos: [...carpetasDocumentosDefault], 
            rubrosEvaluacion: [...rubrosEvaluacionDefault]  
          });
          cursosMap.set(cursoKey, cursoId);
        } else {
          cursoId = cursosMap.get(cursoKey)!;
          
          // Si el curso ya existe pero tiene diferente profesor, actualizar el profesor (permite múltiples profesores)
          const cursoExistente = cursos.find(c => c.id === cursoId);
          if (cursoExistente && !cursoExistente.profesor.includes(profesorCurso)) {
            cursoExistente.profesor += `, ${profesorCurso}`;
          }
        }
        
        // Procesar información del estudiante (si existe)
        if (fila.carnet) {
          const carnetEstudiante = String(fila.carnet).trim();
          const estudianteKey = `${cursoId}-${carnetEstudiante}`;
          
          // Verificar si ya existe el estudiante en este curso
          if (!estudiantesSet.has(estudianteKey)) {
            const estudianteId = Date.now() + estudiantes.length;
            estudiantes.push({
              id: estudianteId,
              cursoId,
              carnet: carnetEstudiante,
              nombre: "" 
            });
            estudiantesSet.add(estudianteKey);
          }
        }
      } catch (error) {
        errores.push(`Error procesando la fila ${index + 2}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    });
    
    return { semestres, cursos, estudiantes, errores };
  };

  const formatearSemestre = (semestre: Semestre) => {
    return `${semestre.año} / ${semestre.periodo}`;
  };

  const handleGuardarDatos = () => {
    // lógica para enviar los datos a la API
    alert("Los datos se guardarían en la base de datos. Esta funcionalidad se implementará cuando se conecte con la API.");
    
    // Limpiar el estado
    setArchivoSeleccionado(null);
    setResultadosCarga(null);
    setMostrarVistaPreviaTabla(false);
    
    // Resetear el input de archivo
    const fileInput = document.getElementById('excel-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleCancelar = () => {
    setArchivoSeleccionado(null);
    setErrorProcesamiento(null);
    setResultadosCarga(null);
    setMostrarVistaPreviaTabla(false);
    
    // Resetear el input de archivo
    const fileInput = document.getElementById('excel-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-900">Cargar Semestre desde Excel</h1>
      </div>
      
      <div className="text-gray-700">
        En esta sección puede cargar masivamente la información de un semestre, cursos y estudiantes matriculados 
        utilizando un archivo Excel. Asegúrese de que el archivo tenga el formato correcto.
      </div>
      
      {/* Sección de carga de archivo */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-blue-800 mb-4">Seleccionar archivo Excel</h2>
        
        <div className="flex flex-col space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mb-3" />
            
            <label htmlFor="excel-upload" className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
              <ArrowUpTrayIcon className="w-5 h-5" />
              Seleccionar Archivo
              <input
                id="excel-upload"
                type="file"
                className="hidden"
                accept=".xlsx, .xls"
                onChange={manejarSeleccionArchivo}
              />
            </label>
            
            <p className="mt-2 text-sm text-gray-500">
              {archivoSeleccionado ? `Archivo seleccionado: ${archivoSeleccionado.name}` : "Seleccione un archivo Excel (.xlsx, .xls)"}
            </p>
          </div>
          
          {archivoSeleccionado && (
            <div className="flex gap-3">
              <button 
                onClick={procesarArchivo}
                disabled={procesando}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 disabled:bg-gray-400"
              >
                {procesando ? "Procesando..." : "Procesar archivo"}
              </button>
              
              <button
                onClick={handleCancelar}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mensaje de error */}
      {errorProcesamiento && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-start">
            <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
            <div>
              <p className="font-semibold text-red-800">Error al procesar el archivo</p>
              <p className="text-red-700">{errorProcesamiento}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Resultados del procesamiento */}
      {resultadosCarga && (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Resultados del procesamiento</h2>
          
          {/* Pestañas */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setPestañaActiva('resumen')}
                className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
                  pestañaActiva === 'resumen'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Resumen
              </button>
              <button
                onClick={() => setPestañaActiva('cursos')}
                className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
                  pestañaActiva === 'cursos'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Vista Previa de Cursos
              </button>
              {resultadosCarga.errores.length > 0 && (
                <button
                  onClick={() => setPestañaActiva('errores')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    pestañaActiva === 'errores'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Advertencias ({resultadosCarga.errores.length})
                </button>
              )}
            </nav>
          </div>
          
          {/* Contenido de las pestañas */}
          <div className="mt-4">
            {pestañaActiva === 'resumen' && (
              <div className="flex gap-6 flex-wrap">
                <div className="bg-green-50 p-4 rounded-md border border-green-200 flex-1 min-w-[200px]">
                  <p className="font-semibold text-green-800 flex items-center gap-1">
                    <CheckCircleIcon className="w-5 h-5" />
                    Semestres a cargar
                  </p>
                  <p className="text-4xl font-bold text-green-600 mt-2">{resultadosCarga.semestres.length}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-md border border-green-200 flex-1 min-w-[200px]">
                  <p className="font-semibold text-green-800 flex items-center gap-1">
                    <CheckCircleIcon className="w-5 h-5" />
                    Cursos a cargar
                  </p>
                  <p className="text-4xl font-bold text-green-600 mt-2">{resultadosCarga.cursos.length}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-md border border-green-200 flex-1 min-w-[200px]">
                  <p className="font-semibold text-green-800 flex items-center gap-1">
                    <CheckCircleIcon className="w-5 h-5" />
                    Estudiantes a matricular
                  </p>
                  <p className="text-4xl font-bold text-green-600 mt-2">{resultadosCarga.estudiantes.length}</p>
                </div>
              </div>
            )}
            
            {pestañaActiva === 'cursos' && (
              <div className="overflow-x-auto">
                <div className="text-sm text-gray-600 mb-3">
                  Vista previa de los cursos que se cargarán en el sistema:
                </div>
                
                <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium text-blue-900 border-b">Semestre</th>
                      <th className="py-3 px-4 text-left font-medium text-blue-900 border-b">Curso</th>
                      <th className="py-3 px-4 text-left font-medium text-blue-900 border-b">Grupo</th>
                      <th className="py-3 px-4 text-left font-medium text-blue-900 border-b">Profesor</th>
                      <th className="py-3 px-4 text-left font-medium text-blue-900 border-b">Estudiantes</th>
                      <th className="py-3 px-4 text-left font-medium text-blue-900 border-b">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultadosCarga.cursos.map((curso) => {
                      const semestre = resultadosCarga.semestres.find(sem => sem.id === curso.semestreId);
                      return (
                        <tr key={curso.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 border-b border-gray-100">
                            {semestre ? formatearSemestre(semestre) : 'N/A'}
                          </td>
                          <td className="py-3 px-4 border-b border-gray-100">{curso.nombre}</td>
                          <td className="py-3 px-4 border-b border-gray-100">{curso.grupo}</td>
                          <td className="py-3 px-4 border-b border-gray-100">{curso.profesor}</td>
                          <td className="py-3 px-4 border-b border-gray-100">
                            <div className="flex items-center gap-1">
                              <span>{curso.estudiantes || 0}</span>
                              <UsersIcon className="w-4 h-4 text-blue-500" />
                            </div>
                          </td>
                          <td className="py-3 px-4 border-b border-gray-100">
                            <div className="flex space-x-2">
                              <button className="bg-indigo-600 text-white p-1 rounded hover:bg-indigo-700">
                                <DocumentTextIcon className="w-5 h-5" />
                              </button>
                              <button className="bg-red-600 text-white p-1 rounded hover:bg-red-700">
                                <XCircleIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            {pestañaActiva === 'errores' && (
              <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                <p className="font-semibold text-amber-800 mb-2">Advertencias encontradas:</p>
                <ul className="list-disc pl-6 space-y-1 text-amber-700">
                  {resultadosCarga.errores.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleGuardarDatos}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Guardar en Base de Datos
            </button>
            
            <button
              onClick={handleCancelar}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      
      {/* Guía de formato */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setMostrarVistaPreviaTabla(!mostrarVistaPreviaTabla)}>
          <h3 className="text-lg font-semibold text-blue-800">Formato del archivo Excel</h3>
          {mostrarVistaPreviaTabla ? (
            <ChevronUpIcon className="w-5 h-5 text-blue-600" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-blue-600" />
          )}
        </div>
        
        {mostrarVistaPreviaTabla && (
          <div className="mt-3">
            <p className="mb-3 text-blue-700">
              El archivo Excel debe contener las siguientes columnas con información para cada curso y sus estudiantes:
            </p>
            
            <table className="min-w-full bg-white border border-blue-200 rounded-md overflow-hidden">
              <thead>
                <tr className="bg-blue-100">
                  <th className="p-2 text-left border-b border-blue-200">Columna</th>
                  <th className="p-2 text-left border-b border-blue-200">Descripción</th>
                  <th className="p-2 text-left border-b border-blue-200">Formato/Ejemplo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border-b border-blue-100 font-medium">semestre</td>
                  <td className="p-2 border-b border-blue-100">Año y periodo académico</td>
                  <td className="p-2 border-b border-blue-100">YYYY-P (2025-1, 2025-2, 2025-V)</td>
                </tr>
                <tr>
                  <td className="p-2 border-b border-blue-100 font-medium">curso</td>
                  <td className="p-2 border-b border-blue-100">Nombre del curso</td>
                  <td className="p-2 border-b border-blue-100">Programación I</td>
                </tr>
                <tr>
                  <td className="p-2 border-b border-blue-100 font-medium">grupo</td>
                  <td className="p-2 border-b border-blue-100">Número de grupo</td>
                  <td className="p-2 border-b border-blue-100">1, 2, 3, etc.</td>
                </tr>
                <tr>
                  <td className="p-2 border-b border-blue-100 font-medium">profesor</td>
                  <td className="p-2 border-b border-blue-100">Nombre del profesor</td>
                  <td className="p-2 border-b border-blue-100">Juan Pérez</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">carnet</td>
                  <td className="p-2">Número de carnet del estudiante (opcional)</td>
                  <td className="p-2">2023215432</td>
                </tr>
              </tbody>
            </table>
            
            <div className="mt-4 text-blue-700 text-sm">
              <p className="mb-2">Notas importantes:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Para cada curso debe haber al menos una fila con la información del curso.</li>
                <li>Si un curso tiene varios estudiantes, debe haber una fila por cada estudiante con la misma información del curso y el carnet del estudiante.</li>
                <li>Si un grupo tiene varios profesores, incluya el mismo curso/grupo varias veces con diferentes profesores.</li>
                <li>Cuando se carga un curso, automáticamente se crean las carpetas de documentos y los rubros de evaluación predeterminados.</li>
                <li>Los nombres de los estudiantes se completarán automáticamente desde la base de datos institucional.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CargaSemestre;