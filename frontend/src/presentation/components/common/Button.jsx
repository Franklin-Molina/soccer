import React from 'react';

/**
 * Componente de botón reutilizable.
 * @param {object} props - Las props del componente.
 * @param {function} props.onClick - La función a llamar cuando se hace clic en el botón.
 * @param {React.ReactNode} props.children - El contenido del botón.
 * @param {string} [props.type] - El tipo de botón (submit, button, reset).
 * @param {boolean} [props.disabled] - Indica si el botón está deshabilitado.
 * @param {string} [props.className] - Clases CSS adicionales para el botón.
 * @returns {JSX.Element} El elemento JSX del botón.
 */
function Button({ onClick, children, type = 'button', disabled = false, className }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}

export default Button;
