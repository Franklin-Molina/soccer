import React from "react";
import { useCourtForm } from "../../hooks/courts/useCourtForm";
import {
  Upload,
  X,
  Camera,
  MapPin,
  DollarSign,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

function CourtForm() {
  const {
    formData,
    handleChange,
    handleRemoveImage,
    handleSubmit,
    isSubmitting,
  } = useCourtForm();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
          <MapPin className="text-white w-6 h-6" />
          <div>
            <h2 className="text-lg font-semibold text-white">
              Crear Nueva Cancha
            </h2>
            <p className="text-sm text-gray-200">
              Completa la información para registrar tu cancha deportiva
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 text-gray-800 dark:text-gray-100"
        >
          {/* Nombre + Precio */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label
                htmlFor="name"
                className="flex items-center gap-2 text-sm font-medium mb-2"
              >
                <MapPin className="w-4 h-4 text-blue-500" />
                Nombre de la Cancha
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ej: Cancha de Fútbol El Campeón"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 outline-none transition"
              />
            </div>

            {/* Precio */}
            <div>
              <label
                htmlFor="price"
                className="flex items-center gap-2 text-sm font-medium mb-2"
              >
                <DollarSign className="w-4 h-4 text-green-500" />
                Precio por Hora
              </label>
              <input
                type="text"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                pattern="[0-9]*\.?[0-9]*"
                inputMode="decimal"
                placeholder="$ 0.00"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 dark:bg-gray-800 outline-none transition"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label
              htmlFor="description"
              className="flex items-center gap-2 text-sm font-medium mb-2"
            >
              <FileText className="w-4 h-4 text-purple-500" />
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe las características de tu cancha, servicios incluidos, ubicación, etc."
              className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 outline-none transition min-h-[120px]"
            ></textarea>
          </div>

          {/* Imágenes */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <ImageIcon className="w-4 h-4 text-orange-500" />
                Fotografías de la Cancha
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formData.images.length}/5 fotos
              </span>
            </div>

            {/* Galería */}
            <div className="flex flex-wrap gap-4">
              {formData.images.map((image, index) => (
                <div
                  key={index}
                  className="relative w-32 h-32 rounded-xl overflow-hidden group shadow-md"
                >
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {/* Botón agregar */}
              {formData.images.length < 5 && (
                <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <Camera className="w-6 h-6 text-blue-500" />
                  <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">
                    Agregar foto
                  </span>
                  <input
                    type="file"
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

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition disabled:opacity-60"
          >
            {isSubmitting ? "Creando..." : "Crear Cancha"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CourtForm;
