import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  BookOpenIcon,
  CalendarIcon,
  ArrowUpTrayIcon,
  UsersIcon,
  Bars3Icon,
  XMarkIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect, FC } from "react";

interface NavLinkProps {
  path: string;
  name: string;
  icon: JSX.Element;
}

const Navbar: FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const links: NavLinkProps[] = [
    { path: "/", name: "Inicio", icon: <HomeIcon className="w-5 h-5" /> },
    { path: "/semestres", name: "Semestres", icon: <CalendarIcon className="w-5 h-5" /> },
    { path: "/cursos", name: "Cursos", icon: <BookOpenIcon className="w-5 h-5" /> },
    { path: "/profesores", name: "Profesores", icon: <UserGroupIcon className="w-5 h-5" /> },
    { path: "/estudiantes", name: "Estudiantes", icon: <UserGroupIcon className="w-5 h-5" /> },
    { path: "/grupos", name: "Grupos", icon: <UsersIcon className="w-5 h-5" /> },
    { path: "/contenido", name: "Cargar Semestre", icon: <ArrowUpTrayIcon className="w-5 h-5" /> },
  ];

  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-blue-900 shadow-lg" : "bg-blue-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo completamente alineado a la izquierda */}
          <div className="flex items-center flex-grow">
            <Link to="/" className="text-white text-xl font-bold">
              CEDigital
            </Link>
          </div>

          {/* Navegación en escritorio */}
          <div className="hidden md:flex space-x-4">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? "bg-blue-700 text-white"
                    : "text-gray-200 hover:bg-blue-700 hover:text-white"
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Botón de menú móvil */}
          <div className="md:hidden ml-4">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-200 hover:text-white hover:bg-blue-700 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${
        isMobileMenuOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
      }`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-900">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === link.path
                  ? "bg-blue-700 text-white"
                  : "text-gray-200 hover:bg-blue-700 hover:text-white"
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
