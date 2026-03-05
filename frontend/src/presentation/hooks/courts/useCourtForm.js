import { useState, useEffect } from 'react';
import { CreateCourtUseCase } from '../../../application/use-cases/courts/create-court';
import { ApiCourtRepository } from '../../../infrastructure/repositories/api-court-repository';
import { useCategories } from './useCategories';
import useButtonDisable from '../general/useButtonDisable.js';
import { toast } from 'react-toastify';

export const useCourtForm = () => {
  const courtRepository = new ApiCourtRepository();
  const createCourtUseCase = new CreateCourtUseCase(courtRepository);
  
  const { categories, loading: categoriesLoading } = useCategories();

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    images: [],
    covered: false,
    category: '',
  });

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === 'images') {
      setFormData({
        ...formData,
        images: [...formData.images, ...Array.from(files)],
      });
    } else if (name === 'price') {
      const re = /^[0-9]*\.?[0-9]*$/;
      if (value === '' || re.test(value)) {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('El nombre de la cancha es obligatorio.');
      return false;
    }
    if (!formData.price.trim()) {
      toast.error('El precio por hora es obligatorio.');
      return false;
    }
    if (isNaN(parseFloat(formData.price))) {
      toast.error('El precio debe ser un número válido.');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('La descripción es obligatoria.');
      return false;
    }
    if (!formData.category) {
      toast.error('Debes seleccionar una categoría.');
      return false;
    }
    if (formData.images.length === 0) {
      toast.error('Debes subir al menos una imagen para la cancha.');
      return false;
    }
    return true;
  };

  const [isSubmitting, handleSubmit] = useButtonDisable(async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const courtData = {
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description,
      images: formData.images,
      covered: formData.covered,
      category: formData.category,
    };

    try {
      const createdCourt = await createCourtUseCase.execute(courtData);
      toast.success('Cancha creada exitosamente!');
      setFormData({
        name: '',
        price: '',
        description: '',
        images: [],
        covered: false,
        category: '',
      });
    } catch (error) {
      if (error.response && error.response.data) {
        let errorText = 'Error al crear cancha: ';
        if (typeof error.response.data === 'object' && error.response.data !== null) {
          try {
            const errorMessages = Object.entries(error.response.data)
              .map(([field, messages]) => {
                const msgArray = Array.isArray(messages) ? messages : [messages];
                return `${field}: ${msgArray.join(', ')}`;
              })
              .join('; ');
            errorText += errorMessages;
          } catch (formatError) {
            errorText += JSON.stringify(error.response.data);
          }
        } else {
          errorText += error.response.data;
        }
        toast.error(errorText);
      } else {
        toast.error('Error al crear cancha. Verifica la conexión o los datos.');
      }
      throw error;
    }
  });

  return {
    formData,
    handleChange,
    handleRemoveImage,
    handleSubmit,
    isSubmitting,
    categories,
    categoriesLoading,
  };
};
