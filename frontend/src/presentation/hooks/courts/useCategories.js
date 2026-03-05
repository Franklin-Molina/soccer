import { useState, useEffect, useCallback } from 'react';
import { ApiCourtRepository } from '../../../infrastructure/repositories/api-court-repository';
import { toast } from 'react-toastify';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const courtRepository = new ApiCourtRepository();
      const data = await courtRepository.getCategories();
      setCategories(data);
    } catch (error) {
      setError(error);
      toast.error('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name) => {
    try {
      const courtRepository = new ApiCourtRepository();
      const response = await courtRepository.createCategory(name);
      await fetchCategories();
      return response;
    } catch (error) {
      toast.error('Error al crear la categoría');
      throw error;
    }
  };

  const updateCategory = async (id, name) => {
    try {
      const courtRepository = new ApiCourtRepository();
      const response = await courtRepository.updateCategory(id, name);
      await fetchCategories();
      return response;
    } catch (error) {
      toast.error('Error al actualizar la categoría');
      throw error;
    }
  };

  const deleteCategory = async (id) => {
    try {
      const courtRepository = new ApiCourtRepository();
      await courtRepository.deleteCategory(id);
      await fetchCategories();
    } catch (error) {
      toast.error('Error al eliminar la categoría');
      throw error;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refreshCategories: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};