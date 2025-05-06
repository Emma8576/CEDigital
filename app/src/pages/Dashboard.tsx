import { useNavigate } from "react-router-dom";
import React from "react";
import {
  BookOpenIcon,
  CalendarIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-blue-900">Bienvenido a CEDigital</h1>
        <p className="text-gray-700 mt-2">
          Desde esta plataforma, puede gestionar cursos, semestres, matrícula y contenidos académicos de forma centralizada.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow-md rounded-xl p-4 border-l-4 border-blue-600">
          <h2 className="text-lg font-semibold">Cursos Registrados</h2>
          <p className="text-2xl font-bold text-blue-700">0</p>
        </div>
        <div className="bg-white shadow-md rounded-xl p-4 border-l-4 border-green-600">
          <h2 className="text-lg font-semibold">Semestres Activos</h2>
          <p className="text-2xl font-bold text-green-700">0</p>
        </div>
        <div className="bg-white shadow-md rounded-xl p-4 border-l-4 border-purple-600">
          <h2 className="text-lg font-semibold">Usuarios Registrados</h2>
          <p className="text-2xl font-bold text-purple-700">0</p>
        </div>
      </div>

      {/* Sección de botones de navegación mejorada */}
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">Acceso Rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl mx-auto">
          <button
            onClick={() => navigate("/cursos")}
            className="flex flex-col items-center justify-center bg-blue-600 text-white py-6 px-4 rounded-xl shadow hover:bg-blue-700 transition"
          >
            <BookOpenIcon className="w-8 h-8 mb-2" />
            <span className="text-center">Gestión de Cursos</span>
          </button>
          
          <button
            onClick={() => navigate("/semestres")}
            className="flex flex-col items-center justify-center bg-green-600 text-white py-6 px-4 rounded-xl shadow hover:bg-green-700 transition"
          >
            <CalendarIcon className="w-8 h-8 mb-2" />
            <span className="text-center">Gestión de Semestres</span>
          </button>
          
          <button
            onClick={() => navigate("/contenido")}
            className="flex flex-col items-center justify-center bg-yellow-600 text-white py-6 px-4 rounded-xl shadow hover:bg-yellow-700 transition"
          >
            <ArrowUpTrayIcon className="w-8 h-8 mb-2" />
            <span className="text-center">Carga de Semestre</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;