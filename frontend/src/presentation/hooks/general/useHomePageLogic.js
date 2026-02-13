import { useEffect, useState, useMemo } from 'react';
import { GetCourtsUseCase } from '../../../application/use-cases/courts/get-courts.js';
import { ApiCourtRepository } from '../../../infrastructure/repositories/api-court-repository.js';

/**
 * Hook personalizado para la lógica de la página de inicio (HomePage).
 * Encapsula la obtención de la lista de canchas y el manejo de su estado,
 * incluyendo la lógica de paginación.
 *
 * @returns {object} Un objeto que contiene el estado y los datos de las canchas.
 */
export const useHomePageLogic = () => {
  const [allCourts, setAllCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado de la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // Canchas por página

  useEffect(() => {
    const courtRepository = new ApiCourtRepository();
    const getCourtsUseCase = new GetCourtsUseCase(courtRepository);

    const fetchCourts = async () => {
      try {
        setLoading(true);
        const courtsList = await getCourtsUseCase.execute({ is_active: true });
        setAllCourts(courtsList);
      } catch (err) {
        setError(err);
       //console.error('Error al obtener canchas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourts();
  }, []); // Se ejecuta solo una vez al montar el componente

  const totalItems = allCourts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const showPagination = totalItems > 6; // El 6 es el valor inicial de itemsPerPage

  // Canchas paginadas calculadas con useMemo para optimización
  const paginatedCourts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allCourts.slice(startIndex, endIndex);
  }, [allCourts, currentPage, itemsPerPage]);

  // Función para cambiar de página
  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  return {
    courts: paginatedCourts, // Exporta las canchas de la página actual
    loading,
    error,
    // Propiedades de paginación
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    showPagination,
  };
};
