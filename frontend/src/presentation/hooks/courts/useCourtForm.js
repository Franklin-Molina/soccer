import { useState } from 'react';
import { CreateCourtUseCase } from '../../../application/use-cases/courts/create-court';
import { ApiCourtRepository } from '../../../infrastructure/repositories/api-court-repository';
import useButtonDisable from '../general/useButtonDisable.js';
import { toast } from 'react-toastify'; // Importar toast de react-toastify

export const useCourtForm = () => {
  const courtRepository = new ApiCourtRepository();
  const createCourtUseCase = new CreateCourtUseCase(courtRepository);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    images: [],
  });
  // Eliminamos el estado 'message' ya que react-toastify lo manejará

  const handleChange = (e) => {
    const { name, value, files } = e.target;
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

  // Función para validar los campos del formulario
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
    // Validación para las imágenes
    if (formData.images.length === 0) {
      toast.error('Debes subir al menos una imagen para la cancha.');
      return false;
    }
    return true;
  };

  const [isSubmitting, handleSubmit] = useButtonDisable(async (e) => {
    e.preventDefault();
    // No necesitamos limpiar mensajes anteriores con toastify, ya que se gestionan automáticamente

    // Validar el formulario antes de intentar enviar
    if (!validateForm()) {
      return; // Detener el envío si la validación falla
    }

    const courtData = {
      name: formData.name,
      price: parseFloat(formData.price), // Convertir precio a número
      description: formData.description,
      images: formData.images,
    };

    try {
      const createdCourt = await createCourtUseCase.execute(courtData);
      // console.log('Cancha creada:', createdCourt); // Eliminado mensaje de consola
      toast.success('Cancha creada exitosamente!'); // Usar toast.success
      setFormData({
        name: '',
        price: '',
        description: '',
        images: [],
      });
    } catch (error) {
      // console.error('Error al crear cancha:', error.response ? error.response.data : error.message); // Eliminado mensaje de consola
      if (error.response && error.response.data) {
        let errorText = 'Error al crear cancha: '; // Eliminado "xd"
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
        toast.error(errorText); // Usar toast.error
      } else {
        toast.error('Error al crear cancha. Verifica la conexión o los datos.'); // Usar toast.error
      }
      throw error;
    }
  });

  return {
    formData,
    // Eliminamos 'message' del retorno
    handleChange,
    handleRemoveImage,
    handleSubmit,
    isSubmitting,
  };
};
