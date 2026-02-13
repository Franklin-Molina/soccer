import React from 'react';

/**
 * Componente de input reutilizable.
 * @param {object} props - Las props del componente.
 * @param {string} props.label - La etiqueta del input.
 * @param {string} props.type - El tipo de input (text, password, email, etc.).
 * @param {string} props.value - El valor actual del input.
 * @param {function} props.onChange - La función a llamar cuando cambia el valor del input.
 * @param {string} [props.placeholder] - El texto de placeholder del input.
 * @param {string} [props.className] - Clases CSS adicionales para el input.
 * @returns {JSX.Element} El elemento JSX del input.
 */
function Input({ label, type, value, onChange, placeholder, className }) {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${className}`}
      />
    </div>
  );
}

export default Input;
