import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  BookOpenIcon,
  CalendarIcon,
  ArrowUpTrayIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { useState, useEffect, FC } from "react";

interface NavLinkProps {
  path: string;
  name: string;
  icon: JSX.Element;
}

interface NavBarProps {
  user?: { id: string; nombre: string; tipo: string } | null;
}

const Navbar: FC<NavBarProps> = ({ user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const location = useLocation();

  let links: NavLinkProps[] = [
    { path: "/", name: "Inicio", icon: <HomeIcon className="w-5 h-5" /> },
  ];

  if (user && user.tipo === "administrador") {
    links = [
      { path: "/", name: "Inicio", icon: <HomeIcon className="w-5 h-5" /> },
      { path: "/cursos", name: "Gestión de Cursos", icon: <BookOpenIcon className="w-5 h-5" /> },
      { path: "/semestres", name: "Gestión de Semestres", icon: <CalendarIcon className="w-5 h-5" /> },
      { path: "/contenido", name: "Cargar Semestre", icon: <ArrowUpTrayIcon className="w-5 h-5" /> },
    ];
  } else if (user && user.tipo === "profesor") {
    // Aquí puedes agregar enlaces específicos para profesor si es necesario
    links = [
      { path: "/", name: "Inicio", icon: <HomeIcon className="w-5 h-5" /> },
    ];
  } // Para estudiante y sin usuario, solo 'Inicio'

  // Control scroll effect for sticky navbar
  useEffect(() => {
    const handleScroll = (): void => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
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
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-white text-xl font-bold">
              CEDigital
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
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
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-blue-700 focus:outline-none"
              aria-expanded="false"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-900">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === link.path
                  ? "bg-blue-700 text-white"
                  : "text-gray-200 hover:bg-blue-700 hover:text-white"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
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