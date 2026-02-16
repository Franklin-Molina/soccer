import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import ProfileDropdown from "./ProfileDropdown.jsx";
import DarkModeSwitch from "./DarkModeSwitch.jsx";
import { Menu, X } from "lucide-react";

function Header({ openAuthModal, onToggleSidebar }) {
  const { isAuthenticated, user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between w-full px-4 sm:px-6 py-3 sm:py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg text-gray-900 dark:text-white shadow-sm transition-colors duration-300 fixed top-0 left-0 z-40">
      <div className="flex items-center gap-2 sm:gap-4">
        {/* --- Botón hamburguesa (solo móvil) --- */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* --- LOGO --- */}
        <Link
          to="/"
          className="text-lg sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent whitespace-nowrap"
        >
          Sintética God
        </Link>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center">
          <DarkModeSwitch />
        </div>

        {!isAuthenticated ? (
          <div className="flex items-center gap-2">
            <button
              onClick={openAuthModal}
              className="px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm sm:text-base font-medium transition-all shadow-md hover:shadow-lg whitespace-nowrap"
            >
              Iniciar Sesion
            </button>
            <Link
              to="/register"
              className="hidden sm:block px-4 py-2 border border-indigo-500 text-indigo-600 dark:text-indigo-400 rounded-xl font-medium hover:bg-indigo-500 hover:text-white transition-all shadow-sm whitespace-nowrap"
            >
              Registrarse
            </Link>
          </div>
        ) : (
          <div
            className="relative flex items-center gap-2 sm:gap-3"
            ref={dropdownRef}
          >
            {user?.is_staff ? (
              <Link
                to="/dashboard"
                className="hidden sm:block text-sm sm:text-base text-gray-700 dark:text-gray-200 hover:text-indigo-500 transition"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/client"
                className="hidden sm:block text-sm sm:text-base text-gray-700 dark:text-gray-200 hover:text-indigo-500 transition"
              >
                Mi Cuenta
              </Link>
            )}

            <button
              onClick={toggleDropdown}
              className="flex items-center justify-center p-1 sm:p-2 focus:outline-none hover:text-indigo-500 transition bg-gray-100 dark:bg-gray-800 rounded-full"
            >
              <i className="fas fa-user-circle text-xl sm:text-2xl"></i>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 z-50 animate-in fade-in zoom-in duration-200">
                <ProfileDropdown />
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;
