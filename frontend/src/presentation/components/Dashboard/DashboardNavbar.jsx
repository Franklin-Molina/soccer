import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Menu } from "lucide-react"; // ícono moderno de hamburguesa
import DarkModeSwitch from "../common/DarkModeSwitch.jsx";

function DashboardNavbar({ toggleSidebar }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNavbarRightClick = () => {
    if (user.role === "cliente") {
      navigate("/client/profile");
    } else {
      navigate("/dashboard/perfil");
    }
  };

  return (
    <header className="flex items-center justify-between px-4 md:px-8 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-30">
      {/* Botón de menú (solo móvil) */}
      <button
        onClick={toggleSidebar}
        className="md:hidden flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Logo o título */}
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Administración
        </h2>
      </div>

      {/* Acciones y Perfil de usuario */}
      <div className="flex items-center gap-4">
        <DarkModeSwitch />

        {/* Perfil de usuario */}
        <div
          onClick={handleNavbarRightClick}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
            {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
          </div>

          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition">
              {user?.username || "Usuario"}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {user?.role || "Sin rol"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default DashboardNavbar;
