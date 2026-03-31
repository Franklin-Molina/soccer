import { useEffect, useState, useMemo } from 'react';
import { GetCourtsUseCase } from '../../../application/use-cases/courts/get-courts.js';
import { ApiCourtRepository } from '../../../infrastructure/repositories/api-court-repository.js';
import { courtsWebSocket } from '../../../infrastructure/websocket/courtsWebSocket';

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

    // Conectar al WebSocket de la lista de canchas
    courtsWebSocket.connect();

    const unsubscribe = courtsWebSocket.subscribe((data) => {
      if (data.type === 'court_created') {
        // Solo agregar si está activa (como en el fetch inicial)
        if (data.court.is_active) {
          setAllCourts(prev => [...prev, data.court]);
        }
      } else if (data.type === 'court_updated') {
        setAllCourts(prev => {
          const exists = prev.find(c => c.id === data.court.id);
          if (data.court.is_active) {
            if (exists) {
              return prev.map(c => c.id === data.court.id ? data.court : c);
            } else {
              return [...prev, data.court];
            }
          } else {
            return prev.filter(c => c.id !== data.court.id);
          }
        });
      } else if (data.type === 'court_deleted') {
        setAllCourts(prev => prev.filter(c => c.id !== data.court_id));
      }
    });

    return () => {
      unsubscribe();
    };
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
