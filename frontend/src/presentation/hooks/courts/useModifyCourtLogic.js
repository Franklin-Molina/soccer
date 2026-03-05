import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUseCases } from '../../context/UseCaseContext.jsx';
import { toast } from 'react-toastify';

export function useModifyCourtLogic() {
  const { getCourtByIdUseCase, updateCourtUseCase } = useUseCases();
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    description: '',
    images: [],
    covered: false,
    category: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  useEffect(() => {
    const fetchCourt = async () => {
      try {
        const court = await getCourtByIdUseCase.execute(id);
        if (court) {
          setFormData({
            name: court.name,
            price: court.price,
            description: court.description || '',
            images: court.images || [],
            covered: court.covered || false,
            category: court.category ? court.category.id : '',
          });
        } else {
          setError(new Error('Cancha no encontrada.'));
          toast.error('Cancha no encontrada.');
        }
      } catch (err) {
        setError(err);
        toast.error('Error al cargar la cancha.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourt();
  }, [id, getCourtByIdUseCase]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name === 'images') {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...Array.from(files)],
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => {
      const newImages = prev.images.filter((image, index) => {
        if (index === indexToRemove) {
          if (image.id) {
            setImagesToDelete(prevDelete => [...prevDelete, image.id]);
          }
          return false;
        }
        return true;
      });
      return { ...prev, images: newImages };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const dataToUpdate = new FormData();
      dataToUpdate.append('name', formData.name);
      dataToUpdate.append('price', formData.price);
      dataToUpdate.append('description', formData.description);
      if (formData.covered !== undefined) dataToUpdate.append('covered', formData.covered);
      if (formData.category) dataToUpdate.append('category_id', formData.category);

      formData.images.forEach(image => {
        if (image instanceof File) {
          dataToUpdate.append('images', image);
        }
      });

      if (imagesToDelete.length > 0) {
        dataToUpdate.append('images_to_delete', JSON.stringify(imagesToDelete));
      }

      await updateCourtUseCase.execute(id, dataToUpdate);
      toast.success('Cancha actualizada exitosamente.');
      setTimeout(() => {
        navigate('/dashboard/canchas/manage');
      }, 2000);
    } catch (err) {
      setError(err);
      toast.error(`Error al actualizar la cancha: ${err.message || 'No se pudo actualizar la cancha.'}`);
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