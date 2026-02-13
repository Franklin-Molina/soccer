import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUseCases } from '../../context/UseCaseContext.jsx'; // Importar el hook useUseCases
import { toast } from 'react-toastify'; // Importar toast de react-toastify

export function useModifyCourtLogic() {
  const { getCourtByIdUseCase, updateCourtUseCase } = useUseCases(); // Usar los casos de uso específicos
  const { id } = useParams(); // Para obtener el ID de la cancha de la URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    description: '', // Usar 'description' en lugar de 'characteristics'
    images: [], // Aquí se guardan las imágenes (File objects o {id, image} objects)
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // NUEVO ESTADO: para guardar los IDs de las imágenes a eliminar
  const [imagesToDelete, setImagesToDelete] = useState([]); 

  useEffect(() => {
    const fetchCourt = async () => {
      try {
        const court = await getCourtByIdUseCase.execute(id); // Usar el caso de uso correcto
        if (court) {
          setFormData({
            name: court.name,
            price: court.price,
            description: court.description || '', // Cargar la descripción
            images: court.images || [], // Cargar imágenes existentes
          });
        } else {
          setError(new Error('Cancha no encontrada.'));
          toast.error('Cancha no encontrada.'); // Alerta de error
        }
      } catch (err) {
        setError(err);
        toast.error('Error al cargar la cancha.'); // Alerta de error
      } finally {
        setLoading(false);
      }
    };
    fetchCourt();
  }, [id, getCourtByIdUseCase]); // Añadir getCourtByIdUseCase a las dependencias

  const handleChange = (e) => {
    if (e.target.name === 'images') {
      // Manejar la adición de nuevas imágenes
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...Array.from(e.target.files)],
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => {
      const newImages = prev.images.filter((image, index) => {
        if (index === indexToRemove) {
          // Si la imagen tiene un ID, significa que ya existe en el backend y debe ser eliminada
          if (image.id) {
            setImagesToDelete(prevDelete => [...prevDelete, image.id]);
          }
          return false; // Eliminar esta imagen del array
        }
        return true;
      });
      return { ...prev, images: newImages };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null); // Eliminar setActionStatus(null);

    try {
      const dataToUpdate = new FormData();
      dataToUpdate.append('name', formData.name);
      dataToUpdate.append('price', formData.price);
      dataToUpdate.append('description', formData.description); // Usar 'description'

      // Añadir nuevas imágenes (objetos File)
      formData.images.forEach(image => {
        if (image instanceof File) {
          dataToUpdate.append('images', image);
        }
      });

      // NUEVO: Añadir los IDs de las imágenes a eliminar
      if (imagesToDelete.length > 0) {
        // Enviar como un array de IDs. El backend necesitará procesar esto.
        // Para FormData, lo más simple es un string JSON.
        dataToUpdate.append('images_to_delete', JSON.stringify(imagesToDelete));
      }

      await updateCourtUseCase.execute(id, dataToUpdate); // Usar el caso de uso correcto
      toast.success('Cancha actualizada exitosamente.'); // Alerta de éxito
      // Redirigir después de un breve retraso para que el usuario vea el mensaje
      setTimeout(() => {
        navigate('/dashboard/canchas/manage'); 
      }, 2000); // Redirigir después de 2 segundos
    } catch (err) {
      // console.error('Error al actualizar la cancha:', err); // Eliminado mensaje de consola
      setError(err);
      toast.error(`Error al actualizar la cancha: ${err.message || 'No se pudo actualizar la cancha.'}`); // Alerta de error
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    loading,
    error,
    isSubmitting,
    handleChange,
    handleRemoveImage,
    handleSubmit,
    navigate,
  };
}
