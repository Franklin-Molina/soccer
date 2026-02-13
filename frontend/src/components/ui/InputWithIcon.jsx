import React from 'react';

const InputWithIcon = ({ icon: Icon, error, loading, rightElement, ...props }) => {
  const hasError = !!error;

  return (
    <div>
      <div className="relative flex items-center">
        {/* Ícono izquierdo */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Icon className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
        </div>

        {/* Campo de entrada */}
        <input
          className={`
            w-full h-12 pl-10 ${rightElement ? 'pr-12' : 'pr-4'}
            border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400
            focus:outline-none
            focus:border-indigo-400 focus:shadow-[0_0_4px_rgba(102,126,234,0.5)]
            transition-[border-color,box-shadow] duration-300
            ${hasError 
              ? 'border-red-500 bg-red-50 text-red-900 placeholder-red-700/50 focus:border-red-500 focus:shadow-[0_0_4px_rgba(239,68,68,0.5)]' 
              : ''
            }
            ${loading ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}
          `}
          disabled={loading}
          {...props}
        />

        {/* Ícono derecho (por ejemplo el ojo de mostrar/ocultar) */}
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightElement}
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {hasError && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default InputWithIcon;
