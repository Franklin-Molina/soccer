import React from 'react';

const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="
          bg-transparent 
          transform transition-all duration-200 scale-100
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>

            <button
              onClick={onClose}
              className="
                text-gray-500 hover:text-gray-700 dark:hover:text-gray-300
                text-2xl leading-none font-bold transition
              "
            >
              ✕
            </button>
          </div>
        )}
        {!title && (
          <div className="text-right -mb-8 text-white font-bold text-2xl z-50 relative">
            {/* Botón de cierre eliminado */}
          </div>
        )}

        {/* Body */}
        <div className="text-gray-800 dark:text-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
