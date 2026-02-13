import React from 'react';
import Spinner from '../../../components/common/Spinner.jsx';
import { useModifyCourtLogic } from '../../../hooks/courts/useModifyCourtLogic.js';

function DashboardModifyCourtPage() {
  const {
    formData,
    loading,
    error,
    actionStatus,
    isSubmitting,
    handleChange,
    handleRemoveImage,
    handleSubmit,
    navigate,
  } = useModifyCourtLogic();

  if (loading) return <Spinner />;
  if (error)
    return (
      <div className="text-red-500 text-center mt-10">
        Error: {error.message}
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-semibold mb-6 text-center">
        Modificar Cancha: {formData.name}
      </h1>

      {actionStatus && (
        <div
          className={`mb-4 text-center py-2 rounded-lg ${
            actionStatus.includes('Error')
              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
              : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
          }`}
        >
          {actionStatus}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 max-w-3xl mx-auto">
        <h2 className="text-lg font-semibold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
          Detalles de la Cancha
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label
              htmlFor="name"
              className="block font-medium mb-1 text-gray-800 dark:text-gray-200"
            >
              Nombre:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Precio */}
          <div>
            <label
              htmlFor="price"
              className="block font-medium mb-1 text-gray-800 dark:text-gray-200"
            >
              Precio:
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Descripción */}
          <div>
            <label
              htmlFor="description"
              className="block font-medium mb-1 text-gray-800 dark:text-gray-200"
            >
              Descripción:
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Galería de imágenes */}
          <div>
            <div className="font-medium mb-2">
              Fotos -{' '}
              <span className="text-blue-500">{formData.images.length}</span>/5
              &nbsp; (Máx. 5 fotos)
            </div>

            <div className="flex flex-wrap gap-4">
              {formData.images.map((image, index) => (
                <div
                  key={image.id || index}
                  className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600"
                >
                  <img
                    src={
                      image instanceof File
                        ? URL.createObjectURL(image)
                        : image.image
                    }
                    alt={`Preview ${index}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {formData.images.length < 5 && (
                <label
                  htmlFor="images-input"
                  className="w-32 h-32 flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <div className="text-2xl">📷</div>
                  <div className="text-sm">Agregar</div>
                  <input
                    type="file"
                    id="images-input"
                    name="images"
                    onChange={handleChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium shadow disabled:opacity-50 transition"
            >
              Guardar Cambios
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/canchas/manage')}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-medium shadow transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DashboardModifyCourtPage;
