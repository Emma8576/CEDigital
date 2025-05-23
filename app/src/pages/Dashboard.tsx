import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpenIcon,
  CalendarIcon,
  UsersIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

import { obtenerCursos } from "../services/cursoService";
import { obtenerSemestres } from "../services/semestreService";
import { getGrupos } from "../services/grupoService";
import { obtenerEstudiantes } from "../services/estudianteService";


const Dashboard = () => {
  const navigate = useNavigate();
  const [cantidadCursos, setCantidadCursos] = useState(0);
  const [cantidadSemestres, setCantidadSemestres] = useState(0);
  const [cantidadGrupos, setCantidadGrupos] = useState(0);
  const [cantidadEstudiantes, setCantidadEstudiantes] = useState(0);



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
      <div>
        <h1 className="text-3xl font-bold text-blue-900">Bienvenido a CEDigital</h1>
        <p className="text-gray-700 mt-2">
          Desde esta plataforma, puede gestionar cursos, semestres, matrícula y contenidos académicos de forma centralizada.
        </p>
      </div>

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

      <div className="flex flex-col items-center">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">Acceso Rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 w-full max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/cursos")}
            className="flex flex-col items-center justify-center bg-blue-600 text-white py-6 px-4 rounded-xl shadow hover:bg-blue-700 transition"
          >
            <BookOpenIcon className="w-8 h-8 mb-2" />
            <span>Gestión de Cursos</span>
          </button>
          <button
            onClick={() => navigate("/semestres")}
            className="flex flex-col items-center justify-center bg-green-600 text-white py-6 px-4 rounded-xl shadow hover:bg-green-700 transition"
          >
            <CalendarIcon className="w-8 h-8 mb-2" />
            <span>Gestión de Semestres</span>
          </button>
          <button
            onClick={() => navigate("/grupos")}
            className="flex flex-col items-center justify-center bg-purple-600 text-white py-6 px-4 rounded-xl shadow hover:bg-purple-700 transition"
          >
            <Squares2X2Icon className="w-8 h-8 mb-2" />
            <span>Gestión de Grupos</span>
          </button>
          <button
            onClick={() => navigate("/estudiantes")}
            className="flex flex-col items-center justify-center bg-yellow-600 text-white py-6 px-4 rounded-xl shadow hover:bg-yellow-700 transition"
          >
            <UsersIcon className="w-8 h-8 mb-2" />
            <span>Gestión de Estudiantes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
