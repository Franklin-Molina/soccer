import React, { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import DashboardNavbar from "./DashboardNavbar.jsx";

function DashboardLayout() {
  const { user, logout } = useAuth();
  const [isCanchasExpanded, setIsCanchasExpanded] = useState(false);
  const [isReservasExpanded, setIsReservasExpanded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const location = useLocation();

  const handleLogout = () => logout();

  // Función para determinar si un enlace está activo
  const isActiveLink = (path) => {
    // Para el enlace principal del dashboard, solo debe coincidir exactamente
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    // Para otros enlaces, una coincidencia exacta o que el path actual empiece con el path del enlace
    return location.pathname.startsWith(path);
  };

  const toggleCanchasMenu = () => setIsCanchasExpanded(!isCanchasExpanded);
  const toggleReservasMenu = () => setIsReservasExpanded(!isReservasExpanded);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    if (window.innerWidth <= 768) closeSidebar();
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        window.innerWidth <= 768 &&
        isSidebarOpen
      ) {
        closeSidebar();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Overlay en móvil */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside
        ref={sidebarRef}
           className={`fixed md:static top-0 left-0 h-screen md:h-auto w-64 md:w-64 flex-shrink-0 
                  bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
                  shadow-md transform transition-transform duration-300 z-40 
       ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-center py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Cancha Admin
          </h2>
        </div>

        {/* MENU */}
        <nav className="flex flex-col p-4 text-gray-700 dark:text-gray-300 space-y-1">
          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mt-4 mb-2">
            Cuenta
          </div>

          <Link
            to="/dashboard/perfil"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              isActiveLink("/dashboard/perfil")
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            onClick={closeSidebar}
          >
            <i className={`fas fa-user ${isActiveLink("/dashboard/perfil") ? "text-white" : "text-gray-500"}`}></i> Perfil
          </Link>

          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mt-4 mb-2">
            Home
          </div>

          <Link
            to="/"
           className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              isActiveLink("/dashboard/home")
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            onClick={closeSidebar}
          >
            <i className={`fas fa-home ${isActiveLink("/") ? "text-white" : "text-gray-500"}`}></i> Inicio
          </Link>
         
          
          
          <Link
            to="/dashboard"
           className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              isActiveLink("/dashboard")
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            onClick={closeSidebar}
          >
            <i className={`fas fa-tachometer-alt ${isActiveLink("/dashboard") ? "text-white" : "text-gray-500"}`}></i> Dashboard
          </Link>


          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mt-4 mb-2">
            Gestión
          </div>

          {/* Menú Reservas */}
          <div
            role="button"
            tabIndex="0"
            onClick={toggleReservasMenu}
            className={`flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer transition-colors ${
              isActiveLink("/dashboard/reservas")
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            <span className="flex items-center gap-3">
              <i className={`fas fa-calendar-check ${isActiveLink("/dashboard/reservas") ? "text-white" : "text-gray-500"}`}></i> Reservas
            </span>
            <i
              className={`fas fa-chevron-${isReservasExpanded ? "up" : "down"
                } ${isActiveLink("/dashboard/reservas") ? "text-white" : "text-gray-500"}`}
            ></i>
          </div>

          {isReservasExpanded && (
            <div className="ml-6 mt-1 space-y-1">
              <Link
                to="/dashboard/reservas"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActiveLink("/dashboard/reservas") && !location.pathname.includes('historial')
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
                onClick={closeSidebar}
              >
                <i className={`fas fa-list ${isActiveLink("/dashboard/reservas") && !location.pathname.includes('historial') ? "text-white" : "text-gray-500"}`}></i> Gestionar Reservas
              </Link>
              <Link
                to="/dashboard/reservas/historial"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActiveLink("/dashboard/reservas/historial")
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
                onClick={closeSidebar}
              >
                <i className={`fas fa-history ${isActiveLink("/dashboard/reservas/historial") ? "text-white" : "text-gray-500"}`}></i> Historial
              </Link>
            </div>
          )}

          {/* Menú Canchas */}
          <div
            role="button"
            tabIndex="0"
            onClick={toggleCanchasMenu}
            className={`flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer transition-colors ${
              isActiveLink("/dashboard/canchas")
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            <span className="flex items-center gap-3">
              <i className={`fas fa-pencil-alt ${isActiveLink("/dashboard/canchas") ? "text-white" : "text-gray-500"}`}></i> Canchas
            </span>
            <i
              className={`fas fa-chevron-${isCanchasExpanded ? "up" : "down"
                } ${isActiveLink("/dashboard/canchas") ? "text-white" : "text-gray-500"}`}
            ></i>
          </div>

          {isCanchasExpanded && (
            <div className="ml-6 mt-1 space-y-1">
              <Link
                to="/dashboard/canchas/manage"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActiveLink("/dashboard/canchas/manage")
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
                onClick={closeSidebar}
              >
                <i className={`fas fa-list ${isActiveLink("/dashboard/canchas/manage") ? "text-white" : "text-gray-500"}`}></i> Gestionar Canchas
              </Link>
              <Link
                to="/dashboard/canchas/create"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActiveLink("/dashboard/canchas/create")
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
                onClick={closeSidebar}
              >
                <i className={`fas fa-plus ${isActiveLink("/dashboard/canchas/create") ? "text-white" : "text-gray-500"}`}></i> Crear Cancha
              </Link>
            </div>
          )}

          <Link
            to="/dashboard/usuarios"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              isActiveLink("/dashboard/usuarios")
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            onClick={closeSidebar}
          >
            <i className={`fas fa-users ${isActiveLink("/dashboard/usuarios") ? "text-white" : "text-gray-500"}`}></i> Usuarios
          </Link>

          <Link
            to="#"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              isActiveLink("/dashboard/pagos")
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            onClick={closeSidebar}
          >
            <i className={`fas fa-dollar-sign ${isActiveLink("/dashboard/pagos") ? "text-white" : "text-gray-500"}`}></i> Pagos
          </Link>

          <Link
            to="#"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              isActiveLink("/dashboard/estadisticas")
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            onClick={closeSidebar}
          >
            <i className={`fas fa-chart-line ${isActiveLink("/dashboard/estadisticas") ? "text-white" : "text-gray-500"}`}></i> Estadísticas
          </Link>

          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mt-4 mb-2">
            Salir
          </div>

          <div
            onClick={() => {
              handleLogout();
              closeSidebar();
            }}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-700 text-red-600 dark:text-red-400 cursor-pointer"
          >
            <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
          </div>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-h-screen">
        <DashboardNavbar toggleSidebar={toggleSidebar} />
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;