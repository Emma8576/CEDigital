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
  AcademicCapIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect, FC } from "react";

interface NavLinkProps {
  path: string;
  name: string;
  icon: JSX.Element;
}

interface NavbarProps {
  user: {
    id: string;
    nombre: string;
    tipo: string;
  };
}

const Navbar: FC<NavbarProps> = ({ user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();

  const mainLinks: NavLinkProps[] = [
    { path: "/", name: "Inicio", icon: <HomeIcon className="w-5 h-5" /> },
    { path: "/semestres", name: "Semestres", icon: <CalendarIcon className="w-5 h-5" /> },
    { path: "/cursos", name: "Cursos", icon: <BookOpenIcon className="w-5 h-5" /> },
    { path: "/grupos", name: "Grupos", icon: <UsersIcon className="w-5 h-5" /> },
    { path: "/matricula", name: "Matrícula", icon: <AcademicCapIcon className="w-5 h-5" /> },
    { path: "/contenido", name: "Cargar Semestre", icon: <ArrowUpTrayIcon className="w-5 h-5" /> },
  ];

  const extraLinks: NavLinkProps[] = [
    { path: "/profesores", name: "Profesores", icon: <UserGroupIcon className="w-5 h-5" /> },
    { path: "/estudiantes", name: "Estudiantes", icon: <UserIcon className="w-5 h-5" /> },
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
          
          {/* Logo */}
          <div className="flex items-center flex-grow">
            <Link to="/" className="text-white text-xl font-bold">
              CEDigital
            </Link>
          </div>

          {/* Menú de escritorio */}
          <div className="hidden md:flex space-x-4 items-center">
            {mainLinks.map((link) => (
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

            {/* Submenú Más */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-200 hover:bg-blue-700 hover:text-white"
              >
                Más ▾
              </button>
              {showDropdown && (
                <div
                  className="absolute right-0 z-50 bg-blue-800 rounded-md shadow-md mt-2 py-2 w-48"
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  {extraLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-blue-700 hover:text-white"
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Usuario */}
            <div className="ml-4 text-white">
              <span className="text-sm">{user.nombre}</span>
            </div>
          </div>

          {/* Botón menú móvil */}
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

      {/* Menú móvil */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${
        isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
      }`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-900">
          {[...mainLinks, ...extraLinks].map((link) => (
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
          {/* Usuario en móvil */}
          <div className="px-3 py-2 text-gray-200">
            <span className="text-sm">{user.nombre}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
