import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AcademicCapIcon, BookOpenIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

interface User {
  id: string;
  nombre: string;
  tipo: string;
  carnet?: string; // Make carnet optional as it might not be present for other user types
}

interface Course {
    idGrupo: number; // Added IdGrupo
    codigoCurso: string;
    nombreCurso: string;
    numeroGrupo: number; // Added NumeroGrupo from backend DTO
    semestre: string; // Corresponds to Semestre property (Year)
    periodo: string; // Corresponds to Periodo property
    // Removed mock data specific fields like professor, schedule, semesterId
}

interface Semester {
  year: string; // Changed to string to match backend Semestre property
  periodo: string; // Added Periodo property
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
  const [semestersData, setSemestersData] = useState<Semester[]>([]); // State to hold grouped courses by semester
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  useEffect(() => {
    const fetchStudentCourses = async () => {
      if (!user || !user.carnet) {
        setError("No se pudo obtener el carnet del estudiante.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get<Course[]>(`http://localhost:5261/api/EstudianteGrupo/estudiante-cursos/${user.carnet}`);
        
        // Group courses by semester (Year and Period)
        const groupedBySemester: { [key: string]: Course[] } = response.data.reduce((acc, course) => {
          const semesterKey = `${course.semestre} - ${course.periodo}`; // Use year and period as key
          if (!acc[semesterKey]) {
            acc[semesterKey] = [];
          }
          acc[semesterKey].push(course);
          return acc;
        }, {} as { [key: string]: Course[] });

        const semestersArray: Semester[] = Object.keys(groupedBySemester).map(key => {
          const [year, periodo] = key.split(' - ');
          return {
            year: year.trim(),
            periodo: periodo.trim(),
            courses: groupedBySemester[key]
          };
        });
        
        // Sort semesters by year and then period (assuming Period is '1', '2', 'V' or similar, adjust sorting if needed)
        semestersArray.sort((a, b) => {
            if (a.year !== b.year) {
                return parseInt(a.year) - parseInt(b.year);
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
  }, [user]); // Refetch if user changes (e.g., after login)

  // Cursos filtrados por semestre seleccionado
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

   if (!user || !user.carnet) {
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
                  key={course.idGrupo} // Use IdGrupo as key
                  className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all group"
                  onClick={() => navigate(`/student/course/${course.idGrupo}`)} // Pass IdGrupo to the course view
                >
                  <BookOpenIcon className="w-12 h-12 text-green-400 mb-3 group-hover:text-green-600 transition-colors" />
                  <h3 className="font-bold text-lg text-gray-800 mb-1">{course.nombreCurso}</h3>
                  <p className="text-gray-600 text-sm mb-1">{course.codigoCurso} - Grupo {course.numeroGrupo}</p>
                   {/* You might want to fetch professor info separately or add to DTO if needed */}
                   {/* <p className="text-gray-500 text-xs">{course.professor}</p> */}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información del Curso Seleccionado (will be replaced by navigation) */}
        
      </div>
    </div>
  );
};

export default StudentDashboard; 