import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import DarkModeSwitch from "./DarkModeSwitch.jsx";
import { Menu, X, ChevronDown, LogOut } from "lucide-react";
import { menuItems } from "../Dashboard/menuConfig.jsx";

function Header({ children, openAuthModal, onToggleSidebar }) {
  const { isAuthenticated, user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const location = useLocation();

  // Determinar rol de usuario
  const userRole = user?.role || 'cliente';
  const currentMenuItems = menuItems[userRole] || [];

  // Manejar submenús abiertos
  useEffect(() => {
    const activeSubmenus = {};
    currentMenuItems.forEach((item, index) => {
      if (item.submenu && item.submenu.some(subItem => location.pathname.startsWith(subItem.to))) {
        activeSubmenus[index] = true;
      }
    });
    setOpenSubmenus(activeSubmenus);
  }, [location.pathname, currentMenuItems]);

  const toggleSubmenu = (index) => {
    setOpenSubmenus(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  const handleLogout = () => {
    logout();
    setIsSidebarOpen(false);
  };

  // Componente para elementos de navegación
  const NavItem = ({ item, index }) => {
    if (item.type === 'header') {
      return (
        <li className="px-4 pt-3 pb-1 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {item.label}
        </li>
      );
    }

    const isActive = item.submenu
      ? item.submenu.some(subItem => location.pathname.startsWith(subItem.to))
      : location.pathname === item.to;

    if (item.submenu) {
      return (
        <li>
          <button
            onClick={() => toggleSubmenu(index)}
            className={`flex items-center justify-between w-full gap-3 px-4 py-2 rounded-xl font-normal transition-all ${isActive ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.label}</span>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${openSubmenus[index] ? 'rotate-180' : ''}`} />
          </button>
          {openSubmenus[index] && (
            <ul className="pl-6 pt-1 space-y-1">
              {item.submenu.map((subItem) => {
                const isSubActive = location.pathname === subItem.to;
                return (
                  <li key={subItem.to}>
                    <NavLink
                      to={subItem.to}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-all ${isSubActive
                          ? 'bg-emerald-500/20 text-gray-700 dark:text-gray-300'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                      {subItem.icon}
                      <span>{subItem.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li>
        <NavLink
          to={item.to}
          end={item.to === '/' || item.to === '/dashboard' || item.to === '/client' || item.to === '/adminglobal'}
          onClick={() => setIsSidebarOpen(false)}
          className={({ isActive: isNavLinkActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-xl font-normal transition-all ${isNavLinkActive ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`
          }
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      </li>
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Header Superior - Siempre arriba del todo */}
      {!isAuthenticated ? (
        <header className="flex-shrink-0 flex items-center justify-between w-full px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 border-b border-gray-200 dark:border-gray-700 z-50">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/"
              className="text-lg sm:text-2xl font-bold tracking-tight whitespace-nowrap"
            >
              <span className="text-emerald-600 dark:text-emerald-400">
                Sintética
              </span>
              <span className="text-gray-900 dark:text-white">
                God
              </span>
            </Link>
          </div>

          <nav className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center">
              <DarkModeSwitch />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={openAuthModal}
                className="px-3 sm:px-4 py-2
                text-white rounded-xl
                bg-emerald-600 hover:bg-emerald-700
                text-sm sm:text-base font-medium
                transition-all shadow-md hover:shadow-lg whitespace-nowrap"
              >
                Iniciar Sesion
              </button>
              <Link
                to="/register"
                className="hidden sm:block px-4 py-2
                border border-emerald-600
                text-emerald-600
                dark:text-emerald-400
                dark:border-emerald-400
                rounded-xl font-medium
                hover:bg-emerald-50
                dark:hover:bg-emerald-900/30
                transition-all shadow-sm whitespace-nowrap"
              >
                Registrarse
              </Link>
            </div>
          </nav>
        </header>
      ) : (
        /* Header simplificado para usuarios autenticados */
        <header className="flex-shrink-0 flex items-center justify-between w-full px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 border-b border-gray-200 dark:border-gray-700 z-50">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 text-[#16A34A] dark:text-[#FACC15] hover:bg-[#16A34A]/10 dark:hover:bg-[#0F172A] rounded-lg transition md:hidden"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <Link
              to="/"
              className="text-lg sm:text-2xl font-bold tracking-tight whitespace-nowrap"
            >
              <span className="text-emerald-600 dark:text-emerald-400">
                Sintética
              </span>
              <span className="text-gray-900 dark:text-white">
                God
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <DarkModeSwitch />
          </div>
        </header>
      )}

      {/* Contenedor inferior: Sidebar + Contenido Principal */}
      <div className="flex flex-1 relative overflow-hidden">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-[60] md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar con menú completo - solo para usuarios autenticados */}
        {isAuthenticated && (
          <aside
            className={`fixed md:static top-0 left-0 h-full w-72 bg-white dark:bg-gray-800
        border-r border-gray-200 dark:border-gray-700 flex-shrink-0 z-[70]
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col shadow-2xl md:shadow-none`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 md:hidden ">
              <Link
              to="/"
              className="text-lg sm:text-2xl font-bold tracking-tight whitespace-nowrap"
            >
              <span className="text-emerald-600 dark:text-emerald-400">
                Sintética
              </span>
              <span className="text-gray-900 dark:text-white">
                God
              </span>
            </Link>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col justify-between flex-grow p-4 overflow-y-auto">
              <ul className="space-y-1">
                {currentMenuItems.map((item, index) => (
                  <NavItem key={item.label || item.to} item={item} index={index} />
                ))}
              </ul>

              <div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-700/20 rounded-xl font-medium transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Cerrar Sesión</span>
                </button>

                <div className="p-4 text-sm text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 mt-4">
                  © {new Date().getFullYear()} HCKD
                </div>
              </div>
            </nav>
          </aside>
        )}

        {/* Área de contenido */}
        <main className="flex-1 overflow-y-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default Header;
