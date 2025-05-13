import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentDocumentExplorer from '../components/StudentDocumentExplorer';

const StudentCourseView: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  // Mock data for course information
  const mockCourseInfo = {
    id: courseId,
    name: 'Programación I',
    code: 'IC-1101',
    professor: 'Dr. Juan Pérez',
    schedule: 'Lunes y Miércoles 10:00-11:30'
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{mockCourseInfo.name}</h1>
            <p className="text-gray-600">Código: {mockCourseInfo.code}</p>
          </div>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Información del Curso */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Información del Curso</h2>
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

          {/* Explorador de Documentos */}
          <div className="lg:col-span-3">
            <StudentDocumentExplorer courseId={courseId || ''} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCourseView; 