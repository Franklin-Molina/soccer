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
    <header className="flex items-center justify-between w-full px-6 py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md transition-colors duration-300 fixed top-0 left-0 z-40">
      {/* --- Botón hamburguesa (solo móvil) --- */}
      {onToggleSidebar && (
        <button
          onClick={onToggleSidebar}
          className="md:hidden mr-2 text-gray-700 dark:text-gray-300 hover:text-indigo-500"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* --- LOGO --- */}
      <Link
        to="/"
        className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent"
      >
        Sintética God
      </Link>

      {/* --- NAVIGATION --- */}
      <nav className="flex items-center gap-4">
        <DarkModeSwitch />

        {!isAuthenticated ? (
          <>
            <button
              onClick={openAuthModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
            >
              Iniciar Sesión
            </button>
            <Link
              to="/register"
              className="px-4 py-2 border border-indigo-500 text-indigo-600 dark:text-indigo-400 rounded-xl font-medium hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
            >
              Registrarse
            </Link>
          </>
        ) : (
          <div
            className="relative flex items-center gap-3"
            ref={dropdownRef}
          >
            {user?.is_staff ? (
              <Link
                to="/dashboard"
                className="text-gray-700 dark:text-gray-200 hover:text-indigo-500 transition"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/client"
                className="text-gray-700 dark:text-gray-200 hover:text-indigo-500 transition"
              >
                Mi Dashboard
              </Link>
            )}

            <button
              onClick={toggleDropdown}
              className="focus:outline-none hover:text-indigo-500 transition"
            >
              <i className="fas fa-user-circle text-2xl"></i>
            </button>

            {dropdownOpen && (
             <div className="absolute right-0 top-12 w-64 z-50">
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
