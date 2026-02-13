import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { User, LogOut } from "lucide-react";

const ProfileDropdown = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (!user) return null;

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in zoom-in duration-150">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-700">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{user.username}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
      </div>

      {/* Opciones */}
      <ul className="py-2">
        <li>
          <Link
            to={user.is_staff ? "/dashboard/perfil" : "/client/profile"}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
          >
            <User className="w-4 h-4" />
            <span>Mi Perfil</span>
          </Link>
        </li>

        <li>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ProfileDropdown;
