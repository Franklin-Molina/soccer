import React, { useState } from 'react';
import { useCategories } from '../../hooks/courts/useCategories';
import {
  PlusCircle,
  Edit,
  Trash2,
  X,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-toastify';

function CategoryManagement() {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error('El nombre de la categoría es obligatorio.');
      return;
    }
    try {
      await createCategory(newCategoryName);
      toast.success('Categoría creada exitosamente!');
      setNewCategoryName('');
    } catch (error) {
      // El error ya se muestra en el hook
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error('El nombre de la categoría es obligatorio.');
      return;
    }
    try {
      await updateCategory(editingCategory.id, newCategoryName);
      toast.success('Categoría actualizada exitosamente!');
      setNewCategoryName('');
      setEditingCategory(null);
    } catch (error) {
      // El error ya se muestra en el hook
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      try {
        await deleteCategory(categoryId);
        toast.success('Categoría eliminada exitosamente!');
      } catch (error) {
        // El error ya se muestra en el hook
      }
    }
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
  };

  const closeEditModal = () => {
    setEditingCategory(null);
    setNewCategoryName('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-6">
      <div className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Gestionar Categorías
          </h1>

          {/* Formulario para crear/editar categoría */}
          <form onSubmit={editingCategory ? handleEditCategory : handleCreateCategory} className="mb-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nombre de la categoría"
                className="flex-1 border border-gray-300 dark:border-gray-700 dark:text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 outline-none transition"
              />
              <button
                type="submit"
                className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-emerald-700 transition flex items-center gap-2"
              >
                {editingCategory ? (
                  <>
                    <Edit className="w-4 h-4" />
                    Actualizar
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    Crear
                  </>
                )}
              </button>
              {editingCategory && (
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="bg-gray-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-gray-700 transition flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              )}
            </div>
          </form>

          {/* Lista de categorías */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="text-left p-4 text-gray-700 dark:text-gray-300 font-semibold">
                    ID
                  </th>
                  <th className="text-left p-4 text-gray-700 dark:text-gray-300 font-semibold">
                    Nombre
                  </th>
                  <th className="text-left p-4 text-gray-700 dark:text-gray-300 font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-4 text-center text-gray-500">
                      No hay categorías registradas.
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="p-4 text-gray-800 dark:text-gray-200">
                        {category.id}
                      </td>
                      <td className="p-4 text-gray-800 dark:text-gray-200">
                        {category.name}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(category)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryManagement;