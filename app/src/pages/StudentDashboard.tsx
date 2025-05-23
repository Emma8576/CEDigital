import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AcademicCapIcon, BookOpenIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

interface User {
  id: string;
  nombre: string;
  tipo: string;
  carne?: string; // Use carne to match backend LoginResponse
}

interface Course {
    idGrupo: number;
    codigoCurso: string;
    nombreCurso: string;
    numeroGrupo: number;
    idSemestre: number; // Added IdSemestre back
    añoSemestre: number; // Corrected type to number
    periodoSemestre: string; // Corrected property name to match backend DTO
}

interface Semester {
  year: number; // Corrected type to number
  periodo: string; // Matches backend DTO PeriodoSemestre
  courses: Course[];
}

interface StudentDashboardProps {
    user: User | null;
}

// Remove mock data
// const mockSemesters: Semester[] = [...];
// const mockCourses: Course[] = [...];

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [semestersData, setSemestersData] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentCourses = async () => {
      if (!user || !user.carne) {
        setError("No se pudo obtener el carne del estudiante.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get<Course[]>(`http://localhost:5261/api/EstudianteGrupo/estudiante-cursos/${user.carne}`);
        
        // Group courses by semester (AñoSemestre and PeriodoSemestre)
        const groupedBySemester: { [key: string]: Course[] } = response.data.reduce((acc, course) => {
          // Use correct property names from backend DTO
          const semesterKey = `${course.añoSemestre} - ${course.periodoSemestre}`;
          if (!acc[semesterKey]) {
            acc[semesterKey] = [];
          }
          acc[semesterKey].push(course);
          return acc;
        }, {} as { [key: string]: Course[] });

        const semestersArray: Semester[] = Object.keys(groupedBySemester).map(key => {
          const [yearStr, periodo] = key.split(' - ');
          const year = parseInt(yearStr); // Parse year string to number
          return {
            year: year, // Use correct property name
            periodo: periodo.trim(), // Use correct property name
            courses: groupedBySemester[key]
          };
        });
        
        // Sort semesters by year and then period
        semestersArray.sort((a, b) => {
            if (a.year !== b.year) {
                return a.year - b.year; // Sort numerically for year
            }
            // Basic sorting for period, adjust if needed for 'V'
            if (a.periodo === 'V') return 1;
            if (b.periodo === 'V') return -1;
            return a.periodo.localeCompare(b.periodo);
        });

        setSemestersData(semestersArray);
        setLoading(false);
      } catch (err) {
        setError("Error al cargar los cursos.");
        setLoading(false);
        console.error("Error fetching student courses:", err);
      }
    };

    fetchStudentCourses();
  }, [user]);

  const filteredCourses = selectedSemester ? selectedSemester.courses : [];

  // Breadcrumbs
  const breadcrumbs = [
    { label: 'Semestres', onClick: () => { setSelectedSemester(null); setSelectedCourse(null); } },
    ...(selectedSemester ? [{ label: `Semestre ${selectedSemester.periodo} ${selectedSemester.year}`, onClick: () => { setSelectedCourse(null); } }] : []),
    ...(selectedCourse ? [{ label: selectedCourse.nombreCurso }] : []),
  ];

  if (loading) {
      return <div className="text-center mt-8 text-gray-600">Cargando cursos...</div>;
  }

   if (error) {
      return <div className="text-center mt-8 text-red-600">Error: {error}</div>;
  }

   if (!user || !user.carne) {
        return <div className="text-center mt-8 text-red-600">Informacin de usuario no disponible.</div>;
    }

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
              {semestersData.length === 0 && (
                 <div className="col-span-full text-gray-500">No tienes cursos matriculados.</div>
              )}
              {semestersData.map((semester, index) => (
                <div
                  key={`${semester.year}-${semester.periodo}`}
                  className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all group"
                  onClick={() => setSelectedSemester(semester)}
                >
                  <AcademicCapIcon className="w-12 h-12 text-blue-400 mb-3 group-hover:text-blue-600 transition-colors" />
                  <h3 className="font-bold text-lg text-gray-800 mb-1">Semestre {semester.periodo} {semester.year}</h3>
                  <p className="text-gray-600 text-sm">{semester.courses.length} cursos</p>
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
                Cursos de Semestre {selectedSemester.periodo} {selectedSemester.year}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredCourses.length === 0 && (
                <div className="col-span-full text-gray-500">No tienes cursos en este semestre.</div>
              )}
              {filteredCourses.map((course) => (
                <div
                  key={course.idGrupo}
                  className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all group"
                  onClick={() => navigate(`/student/course/${course.idGrupo}`)}
                >
                  <BookOpenIcon className="w-12 h-12 text-green-400 mb-3 group-hover:text-green-600 transition-colors" />
                  <h3 className="font-bold text-lg text-gray-800 mb-1">{course.nombreCurso}</h3>
                  <p className="text-gray-600 text-sm mb-1">{course.codigoCurso} - Grupo {course.numeroGrupo}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Render the specific course view when a course is selected */}
        {/* This part was previously handled by state and will now be handled by routing */}
        {/* {selectedCourse && (
          <StudentCourseView course={selectedCourse} user={user} />
        )} */}
      </div>
    </div>
  );
};

export default StudentDashboard; 