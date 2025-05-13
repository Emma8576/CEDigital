import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Semester {
  id: string;
  name: string;
  year: number;
}

interface Course {
  id: string;
  name: string;
  code: string;
  professor: string;
  schedule: string;
  semesterId: string;
}

const mockSemesters: Semester[] = [
  { id: '2024-1', name: 'Semestre I', year: 2024 },
  { id: '2023-2', name: 'Semestre II', year: 2023 },
];

const mockCourses: Course[] = [
  {
    id: '1',
    name: 'Programación I',
    code: 'IC-1101',
    professor: 'Dr. Juan Pérez',
    schedule: 'Lunes y Miércoles 10:00-11:30',
    semesterId: '2024-1',
  },
  {
    id: '2',
    name: 'Bases de Datos',
    code: 'IC-2102',
    professor: 'Dra. María Rodríguez',
    schedule: 'Martes y Jueves 13:00-14:30',
    semesterId: '2024-1',
  },
  {
    id: '3',
    name: 'Matemática Discreta',
    code: 'MA-1201',
    professor: 'Dr. Carlos López',
    schedule: 'Viernes 08:00-10:00',
    semesterId: '2023-2',
  },
];

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Cursos filtrados por semestre seleccionado
  const filteredCourses = selectedSemester
    ? mockCourses.filter((c) => c.semesterId === selectedSemester.id)
    : [];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Panel de Estudiante</h1>
        {/* Listado de Semestres */}
        {!selectedSemester && (
          <div className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Mis Semestres</h2>
            <div className="space-y-4">
              {mockSemesters.map((semester) => (
                <div
                  key={semester.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedSemester(semester)}
                >
                  <h3 className="font-medium text-lg text-gray-800">{semester.name} {semester.year}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Listado de Cursos del Semestre Seleccionado */}
        {selectedSemester && !selectedCourse && (
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <button
              className="mb-4 text-blue-600 hover:underline"
              onClick={() => setSelectedSemester(null)}
            >
              ← Volver a Semestres
            </button>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Cursos de {selectedSemester.name} {selectedSemester.year}
            </h2>
            <div className="space-y-4">
              {filteredCourses.length === 0 && (
                <p className="text-gray-500">No tienes cursos en este semestre.</p>
              )}
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedCourse(course)}
                >
                  <h3 className="font-medium text-lg text-gray-800">{course.name}</h3>
                  <p className="text-gray-600">Código: {course.code}</p>
                  <p className="text-gray-600">Profesor: {course.professor}</p>
                  <p className="text-gray-600">Horario: {course.schedule}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información del Curso Seleccionado */}
        {selectedSemester && selectedCourse && (
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <button
              className="mb-4 text-blue-600 hover:underline"
              onClick={() => setSelectedCourse(null)}
            >
              ← Volver a Cursos
            </button>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Información del Curso</h2>
            <div className="space-y-4">
              <h3 className="font-medium text-lg text-gray-800">{selectedCourse.name}</h3>
              <p className="text-gray-600">Código: {selectedCourse.code}</p>
              <p className="text-gray-600">Profesor: {selectedCourse.professor}</p>
              <p className="text-gray-600">Horario: {selectedCourse.schedule}</p>
              <button
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                onClick={() => navigate(`/student/course/${selectedCourse.id}`)}
              >
                Ver Documentos del Curso
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard; 