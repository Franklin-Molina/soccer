import React from 'react';
import useButtonDisable from '../../hooks/general/useButtonDisable.js';

function CourtActionsModal({ court, onClose, onDeleteRequest, onModifyRequest, onToggleActiveStatus }) {
  // Acciones con hook personalizado
  const [isActivatingDeactivating, handleActivarDesactivarClick] = useButtonDisable(async () => {
    await onToggleActiveStatus(court.id, !court.is_active);
    onClose(); // Cerrar modal después de acción
  });

  const [isDeleting, handleDeleteClick] = useButtonDisable(async () => {
    await onDeleteRequest(court);
  });

  const [isModifying, handleModifyClick] = useButtonDisable(async () => {
    await onModifyRequest(court);
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700 relative">
        
        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold focus:outline-none"
        >
          &times;
        </button>

        {/* Título */}
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 text-center">
          Acciones para <span className="text-blue-600 dark:text-blue-400">{court.name}</span>
        </h2>

        {/* Estado actual */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-6">
          Estado actual:{' '}
          <span
            className={`font-semibold ${
              court.is_active
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {court.is_active ? 'Activa' : 'Suspendida'}
          </span>
        </p>

        {/* Botones de acción */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="w-full px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>

          <button
            onClick={handleModifyClick}
            disabled={isModifying}
            className="w-full px-4 py-2 text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg transition disabled:opacity-50"
          >
            {isModifying ? 'Modificando...' : 'Modificar'}
          </button>

          <button
            onClick={handleActivarDesactivarClick}
            disabled={isActivatingDeactivating}
            className={`w-full px-4 py-2 text-white rounded-lg transition disabled:opacity-50 ${
              court.is_active
                ? 'bg-gray-600 hover:bg-gray-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isActivatingDeactivating
              ? 'Procesando...'
              : court.is_active
              ? 'Desactivar'
              : 'Activar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CourtActionsModal;
