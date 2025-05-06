import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import GestionCursos from "./pages/GestionCursos";
import GestionSemestres from "./pages/GestionSemestres";
import CargaSemestre from "./pages/CargaSemestre";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8 pb-6">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/cursos" element={<GestionCursos />} />
              <Route path="/semestres" element={<GestionSemestres />} />
              <Route path="/contenido" element={<CargaSemestre />} />
            </Routes>
          </div>
        </main>
        <footer className="bg-blue-800 text-white py-4 text-center text-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p>&copy; {new Date().getFullYear()} CEDigital. Todos los derechos reservados.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;