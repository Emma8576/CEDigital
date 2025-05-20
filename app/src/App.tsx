import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import GestionCursos from "./pages/GestionCursos";
import GestionSemestres from "./pages/GestionSemestres";
import CargaSemestre from "./pages/CargaSemestre";
import Login from "./components/Login";
import StudentDashboard from "./pages/StudentDashboard";
import StudentCourseView from "./pages/StudentCourseView";

function App() {
  const [user, setUser] = useState<null | { id: string; nombre: string; tipo: string }>(null);

  // Componente para rutas protegidas
  const ProtectedRoute = ({ children, allowedTypes }: { children: JSX.Element, allowedTypes: string[] }) => {
    if (!user) {
      return <Navigate to="/" replace />;
    }
    if (!allowedTypes.includes(user.tipo)) {
      return <Navigate to="/unauthorized" replace />;
    }
    return children;
  };

  // Función para determinar la ruta de redirección según el tipo de usuario
  const getRedirectPath = (userType: string) => {
    switch (userType) {
      case "administrador":
        return "/dashboard";
      case "profesor":
        return "/profesor/dashboard";
      case "estudiante":
        return "/student/dashboard";
      default:
        return "/unauthorized";
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar user={user} />}
        <main className={user ? "pt-20 px-4 sm:px-6 lg:px-8 pb-6" : ""}>
          <div className="max-w-7xl mx-auto">
            <Routes>
              {/* Ruta pública - Login */}
              <Route path="/" element={
                user ? <Navigate to={getRedirectPath(user.tipo)} replace /> : <Login onLogin={setUser} />
              } />

              {/* Rutas protegidas para administrador */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedTypes={["administrador"]}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/cursos" element={
                <ProtectedRoute allowedTypes={["administrador"]}>
                  <GestionCursos />
                </ProtectedRoute>
              } />
              <Route path="/semestres" element={
                <ProtectedRoute allowedTypes={["administrador"]}>
                  <GestionSemestres />
                </ProtectedRoute>
              } />
              <Route path="/contenido" element={
                <ProtectedRoute allowedTypes={["administrador"]}>
                  <CargaSemestre />
                </ProtectedRoute>
              } />

              {/* Rutas protegidas para profesor */}
              <Route path="/profesor/dashboard" element={
                <ProtectedRoute allowedTypes={["profesor"]}>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold mb-4">Dashboard del Profesor</h1>
                    <p>Bienvenido, {user?.nombre}</p>
                  </div>
                </ProtectedRoute>
              } />

              {/* Rutas protegidas para estudiante */}
              <Route path="/student/dashboard" element={
                <ProtectedRoute allowedTypes={["estudiante"]}>
                  <StudentDashboard user={user} />
                </ProtectedRoute>
              } />
              <Route path="/student/course/:courseId" element={
                <ProtectedRoute allowedTypes={["estudiante"]}>
                  <StudentCourseView user={user} />
                </ProtectedRoute>
              } />

              {/* Ruta para no autorizado */}
              <Route path="/unauthorized" element={
                <div className="flex items-center justify-center h-screen text-2xl text-red-600">
                  No tienes permiso para acceder a esta página
                </div>
              } />
            </Routes>
          </div>
        </main>
        {user && (
          <footer className="bg-blue-800 text-white py-4 text-center text-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p>&copy; {new Date().getFullYear()} CEDigital. Todos los derechos reservados.</p>
            </div>
          </footer>
        )}
      </div>
    </Router>
  );
}

export default App;