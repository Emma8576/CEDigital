import { useState } from "react";
import { 
  DocumentArrowUpIcon, 
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  UserGroupIcon,
  AcademicCapIcon
} from "@heroicons/react/24/outline";
import { cargarSemestreService } from "../services/cargarSemestreService";

const CargarSemestre = () => {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [mostrarInstrucciones, setMostrarInstrucciones] = useState(false);

  const handleArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setArchivo(e.target.files[0]);
    }
  };

  const handleCargar = async () => {
    if (!archivo) {
      setMensaje("Debe seleccionar un archivo.");
      return;
    }

    try {
      const resultado = await cargarSemestreService(archivo);
      setMensaje(`✅ ${resultado.message} (IdSemestre: ${resultado.idSemestre})`);
    } catch (error: any) {
      console.error("Error al cargar semestre:", error);
      setMensaje(`❌ Error: ${error.response?.data || "No se pudo cargar el archivo."}`);
    }
  };

  const instrucciones = [
    {
      icon: CalendarDaysIcon,
      hoja: "Semestre",
      descripcion: "Solo una fila con el año en una celda y el periodo en la celda contigua.",
      ejemplo: { Año: "2025", Periodo: "I" },
      color: "text-purple-600"
    },
    {
      icon: BookOpenIcon,
      hoja: "Cursos",
      descripcion: "Una fila por cada curso. La carrera se crea automáticamente si no existe.",
      ejemplo: {
        CódigoCurso: "INF101",
        NombreCurso: "Programación I",
        Créditos: "4",
        NombreCarrera: "Ingeniería en Computadores"
      },
      color: "text-blue-600"
    },
    {
      icon: UserGroupIcon,
      hoja: "Grupos",
      descripcion: "Puede ingresar uno o dos profesores por grupo. Si no hay segundo profesor, deje la celda vacía.",
      ejemplo: {
        CódigoCurso: "INF101",
        NumeroGrupo: "1",
        CedulaProfesor1: "123456788",
        CedulaProfesor2: "87654321"
      },
      color: "text-green-600"
    },
    {
      icon: AcademicCapIcon,
      hoja: "EstudiantesGrupo",
      descripcion: "Una fila por cada estudiante a matricular en un grupo. (Opcional)",
      ejemplo: {
        CódigoCurso: "INF101",
        NumeroGrupo: "1",
        CarnetEstudiante: "2023123456"
      },
      color: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-900">Cargar Semestre desde Excel</h1>
        <button
          onClick={() => setMostrarInstrucciones(!mostrarInstrucciones)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <InformationCircleIcon className="w-5 h-5" />
          {mostrarInstrucciones ? "Ocultar Instrucciones" : "Ver Instrucciones"}
          {mostrarInstrucciones ? 
            <ChevronUpIcon className="w-4 h-4" /> : 
            <ChevronDownIcon className="w-4 h-4" />
          }
        </button>
      </div>

      {/* Descripción */}
      <div className="text-gray-700">
        Suba un archivo Excel (.xlsx) con la estructura correcta para cargar un semestre completo con sus cursos, grupos y estudiantes.
      </div>

      {/* Instrucciones desplegables */}
      {mostrarInstrucciones && (
        <div className="bg-gray-50 p-6 rounded-lg shadow-md space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <DocumentArrowUpIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">Instrucciones para subir el archivo Excel</h2>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium">
              📥 El archivo debe estar en formato <code className="bg-blue-100 px-2 py-1 rounded">.xlsx</code> (Excel)
            </p>
            <p className="text-blue-700 mt-2">
              Debe contener las siguientes hojas con estos nombres exactos:
            </p>
          </div>

          <div className="grid gap-4">
            {instrucciones.map((inst, index) => {
              const IconComponent = inst.icon;
              return (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <IconComponent className={`w-6 h-6 ${inst.color}`} />
                    <h3 className="font-bold text-gray-800">📘 Hoja: <span className={inst.color}>{inst.hoja}</span></h3>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{inst.descripcion}</p>
                  
                  <div className="bg-gray-50 p-3 rounded border-l-4 border-gray-300">
                    <p className="text-sm font-medium text-gray-600 mb-2">Ejemplo:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      {Object.entries(inst.ejemplo).map(([key, value]) => (
                        <div key={key} className="bg-white p-2 rounded border">
                          <div className="font-medium text-gray-800">{key}</div>
                          <div className="text-gray-600">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sección de carga */}
      <div className="bg-white shadow-md rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Subir Archivo</h2>
        
        <div className="space-y-4">
          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-gray-600">
              Seleccionar archivo Excel (.xlsx)
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx"
                onChange={handleArchivo}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-lg p-2"
              />
            </div>
            {archivo && (
              <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                <CheckCircleIcon className="w-4 h-4" />
                Archivo seleccionado: {archivo.name}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCargar}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <DocumentArrowUpIcon className="w-5 h-5" />
              Cargar Archivo
            </button>
          </div>

          {mensaje && (
            <div className={`mt-4 p-4 rounded-lg border-l-4 flex items-start gap-3 ${
              mensaje.includes("✅") 
                ? "bg-green-50 border-green-400 text-green-800" 
                : "bg-red-50 border-red-400 text-red-800"
            }`}>
              {mensaje.includes("✅") ? (
                <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm">{mensaje}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CargarSemestre;