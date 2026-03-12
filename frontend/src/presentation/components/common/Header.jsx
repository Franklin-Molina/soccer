import React from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import DarkModeSwitch from "./DarkModeSwitch.jsx";
import { Menu, X, LogOut } from "lucide-react";
import { useHeaderLogic } from "../../hooks//general/useHeaderLogic.js";


import NavItem from "./NavItem";

function Header({ children, openAuthModal, onToggleSidebar }) {
  const { isAuthenticated, user, logout } = useAuth();

  // Usar hook personalizado para manejar lógica del header
  const {
    isSidebarOpen,
    openSubmenus,
    currentMenuItems,
    toggleSubmenu,
    toggleSidebar,
    closeSidebar
  } = useHeaderLogic({
    userRole: user?.role || 'cliente',
    onToggleSidebar
  });

  const handleLogout = () => {
    logout();
    closeSidebar();
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Header Superior - Siempre arriba del todo */}
      {!isAuthenticated ? (
        <header className="flex h-14 items-center justify-between w-full px-4 sm:px-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 z-50">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/"             
              className="flex text-lg sm:text-2xl font-bold tracking-tight whitespace-nowrap gap-1"
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
       <header className="flex h-14 items-center justify-between w-full px-4 sm:px-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 z-50">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 text-[#16A34A] dark:text-[#FACC15] hover:bg-[#16A34A]/10 dark:hover:bg-[#0F172A] rounded-lg transition md:hidden"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <Link
              to="/"
              className="flex text-lg sm:text-2xl font-bold tracking-tight whitespace-nowrap gap-1"
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
            onClick={closeSidebar}
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
              className="flex text-lg sm:text-2xl font-bold tracking-tight whitespace-nowrap gap-1"
            >
              <span className="text-emerald-600 dark:text-emerald-400">
                Sintética
              </span>
              <span className="text-gray-900 dark:text-white">
                God
              </span>
            </Link>
              <button
                onClick={closeSidebar}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col justify-between flex-grow p-4 overflow-y-auto">
              <ul className="space-y-1">
                {currentMenuItems.map((item, index) => (
                  <NavItem
                    key={item.label || item.to}
                    item={item}
                    index={index}
                    isOpen={openSubmenus[index]}
                    onToggle={toggleSubmenu}
                    currentPath={location.pathname}
                    onClick={closeSidebar}
                  />
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
       <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default Header;
