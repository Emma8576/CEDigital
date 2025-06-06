import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpenIcon,
  CalendarIcon,
  UsersIcon,
  Squares2X2Icon,
  ArrowUpTrayIcon,
  UserGroupIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

import { obtenerCursos } from "../services/cursoService";
import { obtenerSemestres } from "../services/semestreService";
import { getGrupos } from "../services/grupoService";
import { obtenerEstudiantes } from "../services/estudianteService";

// Componente principal del panel de control
const Dashboard = () => {
  const navigate = useNavigate();

  // Estados para almacenar la cantidad de registros por entidad
  const [cantidadCursos, setCantidadCursos] = useState(0);
  const [cantidadSemestres, setCantidadSemestres] = useState(0);
  const [cantidadGrupos, setCantidadGrupos] = useState(0);
  const [cantidadEstudiantes, setCantidadEstudiantes] = useState(0);

  // Al montar el componente, obtener los datos desde los servicios correspondientes
  useEffect(() => {
    obtenerCursos()
      .then((res) => setCantidadCursos(res.data.length))
      .catch(console.error);

    obtenerSemestres()
      .then((res) => setCantidadSemestres(res.data.length))
      .catch(console.error);

    getGrupos()
      .then((data) => setCantidadGrupos(data.length))
      .catch(console.error);

    obtenerEstudiantes()
      .then((res) => setCantidadEstudiantes(res.data.length))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-8">
      {/* Encabezado de bienvenida */}
      <div>
        <h1 className="text-3xl font-bold text-blue-900">Bienvenido a CEDigital</h1>
        <p className="text-gray-700 mt-2">
          Desde esta plataforma, puede gestionar cursos, semestres, matrícula y contenidos académicos de forma centralizada.
        </p>
      </div>

      {/* Tarjetas resumen con la cantidad de registros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white shadow-md rounded-xl p-4 border-l-4 border-blue-600">
          <h2 className="text-lg font-semibold">Cursos Registrados</h2>
          <p className="text-2xl font-bold text-blue-700">{cantidadCursos}</p>
        </div>
        <div className="bg-white shadow-md rounded-xl p-4 border-l-4 border-green-600">
          <h2 className="text-lg font-semibold">Semestres Añadidos</h2>
          <p className="text-2xl font-bold text-green-700">{cantidadSemestres}</p>
        </div>
        <div className="bg-white shadow-md rounded-xl p-4 border-l-4 border-purple-600">
          <h2 className="text-lg font-semibold">Grupos Creados</h2>
          <p className="text-2xl font-bold text-purple-700">{cantidadGrupos}</p>
        </div>
        <div className="bg-white shadow-md rounded-xl p-4 border-l-4 border-yellow-600">
          <h2 className="text-lg font-semibold">Estudiantes Registrados</h2>
          <p className="text-2xl font-bold text-yellow-700">{cantidadEstudiantes}</p>
        </div>
      </div>

      {/* Sección de acceso rápido con botones de navegación */}
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">Acceso Rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
          <button
            onClick={() => navigate("/semestres")}
            className="flex flex-col items-center justify-center bg-green-600 text-white py-6 px-4 rounded-xl shadow hover:bg-green-700 transition"
          >
            <CalendarIcon className="w-8 h-8 mb-2" />
            <span>Gestión de Semestres</span>
          </button>

          <button
            onClick={() => navigate("/cursos")}
            className="flex flex-col items-center justify-center bg-blue-600 text-white py-6 px-4 rounded-xl shadow hover:bg-blue-700 transition"
          >
            <BookOpenIcon className="w-8 h-8 mb-2" />
            <span>Gestión de Cursos</span>
          </button>

          <button
            onClick={() => navigate("/grupos")}
            className="flex flex-col items-center justify-center bg-purple-600 text-white py-6 px-4 rounded-xl shadow hover:bg-purple-700 transition"
          >
            <Squares2X2Icon className="w-8 h-8 mb-2" />
            <span>Gestión de Grupos</span>
          </button>

          <button
            onClick={() => navigate("/matricula")}
            className="flex flex-col items-center justify-center bg-red-600 text-white py-6 px-4 rounded-xl shadow hover:bg-red-700 transition"
          >
            <AcademicCapIcon className="w-8 h-8 mb-2" />
            <span>Gestión de Matrícula</span>
          </button>

          <button
            onClick={() => navigate("/contenido")}
            className="flex flex-col items-center justify-center bg-indigo-600 text-white py-6 px-4 rounded-xl shadow hover:bg-indigo-700 transition"
          >
            <ArrowUpTrayIcon className="w-8 h-8 mb-2" />
            <span>Cargar Semestre</span>
          </button>

          <button
            onClick={() => navigate("/profesores")}
            className="flex flex-col items-center justify-center bg-pink-600 text-white py-6 px-4 rounded-xl shadow hover:bg-pink-700 transition"
          >
            <UserGroupIcon className="w-8 h-8 mb-2" />
            <span>Gestión de Profesores</span>
          </button>

          {/* Botón centrado de acceso a estudiantes */}
          <div className="col-span-full flex justify-center">
            <button
              onClick={() => navigate("/estudiantes")}
              className="flex flex-col items-center justify-center bg-yellow-600 text-white py-6 px-4 rounded-xl shadow hover:bg-yellow-700 transition w-full max-w-xs"
            >
              <UsersIcon className="w-8 h-8 mb-2" />
              <span>Gestión de Estudiantes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
