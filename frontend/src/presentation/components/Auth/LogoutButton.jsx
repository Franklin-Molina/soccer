import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import useButtonDisable from '../../hooks/general/useButtonDisable.js';

const LogoutButton = () => {
  const { logout } = useAuth();
  const [isLoggingOut, handleLogout] = useButtonDisable(async () => {
    await logout();
  });

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="
        w-full
        bg-[#da4453]
        text-white
        font-medium
        py-2.5
        px-5
        rounded-md
        hover:bg-[#c43240]
        transition-colors
        duration-300
        disabled:opacity-50
        disabled:cursor-not-allowed
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        focus:ring-[#da4453]
      "
    >
      {isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
    </button>
  );
};

export default LogoutButton;
