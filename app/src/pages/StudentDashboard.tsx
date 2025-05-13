import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AcademicCapIcon, BookOpenIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

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

  // Breadcrumbs
  const breadcrumbs = [
    { label: 'Semestres', onClick: () => { setSelectedSemester(null); setSelectedCourse(null); } },
    ...(selectedSemester ? [{ label: `${selectedSemester.name} ${selectedSemester.year}`, onClick: () => { setSelectedCourse(null); } }] : []),
    ...(selectedCourse ? [{ label: selectedCourse.name }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Panel de Estudiante</h1>
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            {breadcrumbs.map((bc, idx) => (
              <span key={idx} className="flex items-center">
                {idx > 0 && <span className="mx-1">/</span>}
                {bc.onClick ? (
                  <button onClick={bc.onClick} className="hover:underline hover:text-blue-600">{bc.label}</button>
                ) : (
                  <span className="font-semibold text-blue-700">{bc.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>

        {/* Listado de Semestres */}
        {!selectedSemester && (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Mis Semestres</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {mockSemesters.map((semester) => (
                <div
                  key={semester.id}
                  className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all group"
                  onClick={() => setSelectedSemester(semester)}
                >
                  <AcademicCapIcon className="w-12 h-12 text-blue-400 mb-3 group-hover:text-blue-600 transition-colors" />
                  <h3 className="font-bold text-lg text-gray-800 mb-1">{semester.name} {semester.year}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Listado de Cursos del Semestre Seleccionado */}
        {selectedSemester && !selectedCourse && (
          <div>
            <div className="flex items-center mb-4">
              <button
                className="text-blue-600 hover:underline flex items-center mr-2"
                onClick={() => setSelectedSemester(null)}
              >
                <ArrowLeftIcon className="w-5 h-5 mr-1" /> Volver a Semestres
              </button>
              <h2 className="text-xl font-semibold text-gray-700 ml-2">
                Cursos de {selectedSemester.name} {selectedSemester.year}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredCourses.length === 0 && (
                <div className="col-span-full text-gray-500">No tienes cursos en este semestre.</div>
              )}
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all group"
                  onClick={() => setSelectedCourse(course)}
                >
                  <BookOpenIcon className="w-12 h-12 text-green-400 mb-3 group-hover:text-green-600 transition-colors" />
                  <h3 className="font-bold text-lg text-gray-800 mb-1">{course.name}</h3>
                  <p className="text-gray-600 text-sm mb-1">{course.code}</p>
                  <p className="text-gray-500 text-xs">{course.professor}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información del Curso Seleccionado */}
        {selectedSemester && selectedCourse && (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
            <button
              className="mb-4 text-blue-600 hover:underline flex items-center"
              onClick={() => setSelectedCourse(null)}
            >
              <ArrowLeftIcon className="w-5 h-5 mr-1" /> Volver a Cursos
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedCourse.name}</h2>
            <div className="mb-2 text-gray-600">Código: <span className="font-semibold">{selectedCourse.code}</span></div>
            <div className="mb-2 text-gray-600">Profesor: <span className="font-semibold">{selectedCourse.professor}</span></div>
            <div className="mb-4 text-gray-600">Horario: <span className="font-semibold">{selectedCourse.schedule}</span></div>
            <button
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors font-semibold"
              onClick={() => navigate(`/student/course/${selectedCourse.id}`)}
            >
              Ver Documentos del Curso
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard; 