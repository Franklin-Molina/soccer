import React from "react";
import { useCourtForm } from "../../hooks/courts/useCourtForm";
import CustomSelect from "../common/CustomSelect";

import {
  CheckCircle2,
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
    categories,
    categoriesLoading,
  } = useCourtForm();

  const handleSelectChange = (name) => (value) => {
    const event = {
      target: {
        name,
        value,
      },
    };
    handleChange(event);
  };

  return (
    <div className="w-full mx-auto p-6">
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="relative h-48 sm:h-64 overflow-hidden">
          <img
            src="/img.jpg"
            alt="Cancha Background"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/50 flex flex-col justify-center px-8 sm:px-12">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <img
                  src="/balon.png"
                  alt="Balón"
                  className="w-15 h-10 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                  Registrar Nueva Cancha
                </h1>
                <p className="text-gray-200 text-sm sm:text-lg font-medium opacity-90 mt-1">
                  Configura tu espacio deportivo profesional
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6 text-gray-800 dark:text-gray-100" >

          <div className="p-6 md:p-8 space-y-8">
          {/* Nombre + Precio */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label
                htmlFor="name"
                className="flex items-center gap-2 text-sm font-medium mb-2"
              >
                <MapPin className="w-4 h-4 text-emerald-500" />
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
                className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 outline-none transition"
              />
            </div>

            {/* Precio */}
            <div>
              <label
                htmlFor="price"
                className="flex items-center gap-2 text-sm font-medium mb-2"
              >
                <DollarSign className="w-4 h-4 text-emerald-500" />
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
                className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 outline-none transition"
              />
            </div>

            {/* Cubierto */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ¿Tiene Cubierta?
              </label>
              <div className="flex items-center gap-6 mt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.covered === true}
                    onChange={() => handleSelectChange("covered")(true)}
                   className="w-4 h-4 accent-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-emerald-500 transition-colors">
                    Sí
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.covered === false}
                    onChange={() => handleSelectChange("covered")(false)}
                    className="w-4 h-4 accent-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-emerald-500 transition-colors">
                    No
                  </span>
                </label>
              </div>
            </div>


            {/* Categoría */}
            <div>
              <label
                htmlFor="category"
                className="flex items-center gap-2 text-sm font-medium mb-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Categoría
              </label>
              <CustomSelect
                options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                value={formData.category}
                onChange={handleSelectChange("category")}
                placeholder={categoriesLoading ? "Cargando..." : "Seleccione una categoría"}
                direction="down"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label
              htmlFor="description"
              className="flex items-center gap-2 text-sm font-medium mb-2"
            >
              <FileText className="w-4 h-4 text-emerald-500" />
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe las características de tu cancha, servicios incluidos, ubicación, etc."
              className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 dark:bg-slate-700 outline-none transition min-h-[120px]"
            ></textarea>
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />
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
                    className="absolute top-1 right-1 dark:bg-slate-900/50 hover:bg-black/80 text-white p-1 rounded-full transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {/* Botón agregar */}
              {formData.images.length < 5 && (
                <label className="w-32 h-32 flex flex-col items-center justify-center border-2 dark:bg-slate-900/50 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
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
       </div>
        {/* FOOTER: Botón de Guardar */}

          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end ">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed min-w-[200px]"
            >
            {isSubmitting ? "Creando..." : "Crear Cancha"}
            </button>
          </div>         
        </form>
      </div>
    </div>
  );
}

export default CourtForm;