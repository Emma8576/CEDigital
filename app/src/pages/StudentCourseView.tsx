import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentDocumentExplorer from '../components/StudentDocumentExplorer';
// Importar componentes para las otras pestañas (los crearemos despus)
// import StudentEvaluations from '../components/StudentEvaluations';
// import StudentGrades from '../components/StudentGrades';
import StudentNews from '../components/StudentNews'; // Import the StudentNews component
import axios from 'axios'; // Added axios for fetching group info

interface User {
  id: string;
  nombre: string;
  tipo: string;
  carnet?: string;
}

interface StudentCourseViewProps {
    user: User | null; // Recibir el usuario como prop
}

// Optional: Interface for Group details if we fetch them
interface GroupDetail {
    idGrupo: number;
    numeroGrupo: number;
    codigoCurso: string;
    // Add other relevant course/group info here if needed
    curso: { // Assuming Course is nested like this
        nombreCurso: string;
        codigoCurso: string; // Redundant but useful for display
    };
    semestre: { // Assuming Semestre is nested
        año: number;
        periodo: string;
    };
}

const StudentCourseView: React.FC<StudentCourseViewProps> = ({ user }) => {
  // Renombramos courseId a idGrupo para mayor claridad
  const { courseId } = useParams<{ courseId: string }>(); 
  const idGrupo = parseInt(courseId || '0', 10); // Convert string param to number

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('noticias'); // Set initial tab to 'noticias'
  const [groupDetail, setGroupDetail] = useState<GroupDetail | null>(null); // State for group details
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [errorGroup, setErrorGroup] = useState<string | null>(null); // Error state for group details

  // Fetch group details on component mount
  useEffect(() => {
      const fetchGroupDetails = async () => {
          if (idGrupo === 0) {
              setErrorGroup("ID de grupo no vlido.");
              setLoadingGroup(false);
              return;
          }
          try {
              const response = await axios.get<GroupDetail>(`http://localhost:5261/api/Grupo/${idGrupo}`);
              setGroupDetail(response.data);
              setLoadingGroup(false);
          } catch (error) {
              console.error("Error fetching group details:", error);
              setErrorGroup("Error al cargar la informacin del grupo.");
              setLoadingGroup(false);
              // Handle error, maybe show a message to the user
          }
      };

      fetchGroupDetails();
  }, [idGrupo]); // Re-fetch if idGrupo changes

   if (loadingGroup) {
        return <div className="text-center mt-8 text-gray-600">Cargando informacin del grupo...</div>;
    }

    if (errorGroup) {
         return <div className="text-center mt-8 text-red-600">Error: {errorGroup}</div>;
    }

    if (!groupDetail) {
        return <div className="text-center mt-8 text-red-600">No se pudo cargar la informacin del grupo.</div>;
    }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            {/* Usar la informacin del grupo obtenida del backend */}
            <h1 className="text-3xl font-bold text-gray-800">{groupDetail.curso.nombreCurso}</h1>
            <p className="text-gray-600">Código: {groupDetail.curso.codigoCurso} - Grupo {groupDetail.numeroGrupo}</p>
             <p className="text-gray-600">Semestre: {groupDetail.semestre.periodo} {groupDetail.semestre.año}</p>
          </div>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mb-4 border-b border-gray-200">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" id="default-tab" data-tabs-toggle="#default-tab-content" role="tablist">
            {/* Noticias Tab */}
             <li className="me-2" role="presentation">
              <button
                className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'noticias' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
                onClick={() => setActiveTab('noticias')}
                type="button" role="tab" aria-controls="noticias" aria-selected={activeTab === 'noticias'}
              >
                Noticias
              </button>
            </li>
            {/* Documentos Tab */}
            <li className="me-2" role="presentation">
              <button
                className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'documentos' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
                onClick={() => setActiveTab('documentos')}
                type="button" role="tab" aria-controls="documentos" aria-selected={activeTab === 'documentos'}
              >
                Documentos
              </button>
            </li>
            {/* Evaluaciones Tab */}
            <li className="me-2" role="presentation">
               <button
                className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'evaluaciones' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
                onClick={() => setActiveTab('evaluaciones')}
                type="button" role="tab" aria-controls="evaluaciones" aria-selected={activeTab === 'evaluaciones'}
              >
                Evaluaciones
              </button>
            </li>
            {/* Notas Tab */}
            <li role="presentation">
              <button
                className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'notas' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
                onClick={() => setActiveTab('notas')}
                type="button" role="tab" aria-controls="notas" aria-selected={activeTab === 'notas'}
              >
                Notas
              </button>
            </li>
          </ul>
        </div>

        {/* Tab Content */}
        <div id="default-tab-content">
            {activeTab === 'noticias' && (
                <div className="p-4 rounded-lg bg-gray-50" role="tabpanel" aria-labelledby="noticias-tab">
                    <StudentNews idGrupo={idGrupo} />
                </div>
            )}
             {activeTab === 'documentos' && (
                <div className="p-4 rounded-lg bg-gray-50" role="tabpanel" aria-labelledby="documentos-tab">
                    {/* Pasar idGrupo y user a StudentDocumentExplorer */}
                    <StudentDocumentExplorer idGrupo={idGrupo} user={user} />
                </div>
            )}
            {activeTab === 'evaluaciones' && (
                <div className="p-4 rounded-lg bg-gray-50" role="tabpanel" aria-labelledby="evaluaciones-tab">
                    {/* Placeholder for Evaluaciones component */}
                    {/* <StudentEvaluations idGrupo={idGrupo} user={user} /> */}
                    <p>Contenido de Evaluaciones para el grupo {idGrupo}</p>
                </div>
            )}
            {activeTab === 'notas' && (
                <div className="p-4 rounded-lg bg-gray-50" role="tabpanel" aria-labelledby="notas-tab">
                    {/* Placeholder for Notas component */}
                     {/* <StudentGrades idGrupo={idGrupo} user={user} /> */}
                    <p>Contenido de Notas para el grupo {idGrupo}</p>
                </div>
            )}
        </div>

        {/* Remove old layout */}
        {/*
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Informacin del Curso</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-800">Profesor</h3>
                  <p className="text-gray-600">{mockCourseInfo.professor}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Horario</h3>
                  <p className="text-gray-600">{mockCourseInfo.schedule}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <StudentDocumentExplorer courseId={courseId || ''} />
          </div>
        </div>
        */}
      </div>
    </div>
  );
};

export default StudentCourseView; 