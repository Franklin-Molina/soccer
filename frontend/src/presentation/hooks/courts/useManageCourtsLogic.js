import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useButtonDisable from '../general/useButtonDisable.js';
import { ApiCourtRepository } from '../../../infrastructure/repositories/api-court-repository'; // Se mantiene para operaciones directas del repo
import { GetCourtsUseCase } from '../../../application/use-cases/courts/get-courts.js'; // Importar el caso de uso
import { toast } from 'react-toastify'; // Importar toast de react-toastify
import Swal from 'sweetalert2'; // Importar Swal

/**
 * Hook personalizado para la lógica de la página de gestión de canchas.
 * Encapsula la obtención, suspensión, reactivación y eliminación de canchas.
 *
 * @returns {object} Un objeto que contiene el estado y las funciones para la gestión de canchas.
 * @property {Array} courts - Lista de canchas.
 * @property {boolean} loading - Indica si los datos están cargando.
 * @property {string|null} error - Mensaje de error si ocurre uno.
 * @property {string} actionStatus - Mensaje de estado de la última acción realizada.
 * @property {object|null} selectedCourt - Cancha seleccionada para ver acciones.
 * @property {object|null} courtToDelete - Cancha seleccionada para eliminar.
 * @property {boolean} isSuspending - Indica si una cancha se está suspendiendo.
 * @property {boolean} isReactivating - Indica si una cancha se está reactivando.
 * @property {boolean} isDeleting - Indica si una cancha se está eliminando.
 * @property {Function} handleSuspendCourtClick - Función para suspender una cancha.
 * @property {Function} handleReactivateCourtClick - Función para reactivar una cancha.
 * @property {Function} handleDeleteRequest - Función para solicitar la eliminación de una cancha.
 * @property {Function} handleConfirmDeleteClick - Función para confirmar la eliminación de una cancha.
 * @property {Function} handleCancelDelete - Función para cancelar la eliminación de una cancha.
 * @property {Function} handleModifyRequest - Función para navegar a la página de modificación de cancha.
 * @property {Function} handleOpenModal - Función para abrir el modal de acciones.
 * @property {Function} handleCloseModal - Función para cerrar el modal de acciones.
 */
export const useManageCourtsLogic = () => {
  const navigate = useNavigate();
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const hasFetchedCourts = useRef(false);

  const filteredCourts = useMemo(() => {
    return courts.filter(court => {
      const nameMatch = nameFilter === '' || court.name.toLowerCase().includes(nameFilter.toLowerCase());
      const statusMatch = statusFilter === 'all' || (statusFilter === 'active' && court.is_active) || (statusFilter === 'inactive' && !court.is_active);
      return nameMatch && statusMatch;
    });
  }, [courts, nameFilter, statusFilter]);

  // Instanciar repositorio y casos de uso
  const courtRepository = new ApiCourtRepository(); // Se mantiene para operaciones directas del repo
  const getCourtsUseCase = new GetCourtsUseCase(courtRepository);

  const fetchCourts = async () => {
    try {
      setLoading(true);
      const courtsData = await getCourtsUseCase.execute(); // Usar el caso de uso
      setCourts(courtsData);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
      toast.error('Error al cargar las canchas.'); // Alerta de error
    }
  };

  useEffect(() => {
    if (!hasFetchedCourts.current) {
      fetchCourts();
      hasFetchedCourts.current = true;
    }
  }, [courtRepository]);

  const [isSuspending, handleSuspendCourtClick] = useButtonDisable(async (courtId) => {
    try {
      await courtRepository.updateCourtStatus(courtId, false);
      setCourts(prevCourts =>
        prevCourts.map(c => c.id === courtId ? { ...c, is_active: false } : c)
      );
      toast.success('Cancha suspendida exitosamente.'); // Alerta de éxito
    } catch (error) {
      // console.error(`Error al suspender cancha ${courtId}:`, error); // Eliminado mensaje de consola
      toast.error(`Error al suspender cancha: ${error.message}`); // Alerta de error
      throw error;
    }
  });

  const [isReactivating, handleReactivateCourtClick] = useButtonDisable(async (courtId) => {
    try {
      await courtRepository.updateCourtStatus(courtId, true);
      setCourts(prevCourts =>
        prevCourts.map(c => c.id === courtId ? { ...c, is_active: true } : c)
      );
      toast.success('Cancha reactivada exitosamente.'); // Alerta de éxito
    } catch (error) {
      // console.error(`Error al reactivar cancha ${courtId}:`, error); // Eliminado mensaje de consola
      toast.error(`Error al reactivar cancha: ${error.message}`); // Alerta de error
      throw error;
    }
  });

  const handleDeleteRequest = async (court) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¡No podrás revertir la eliminación de "${court.name}"!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await courtRepository.deleteCourt(court.id);
        setCourts(prevCourts => prevCourts.filter(c => c.id !== court.id));
        toast.success(`Cancha ${court.name} eliminada exitosamente.`);
      } catch (error) {
        toast.error(`Error al eliminar cancha ${court.name}: ${error.message}`);
      }
    }
  };

  const handleModifyRequest = (court) => {
    navigate(`/dashboard/manage-courts/${court.id}`);
  };

  const clearFilters = () => {
    setNameFilter('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredCourts.length / itemsPerPage);
  return {
    courts: filteredCourts,
    loading,
    error,
    isSuspending,
    isReactivating,
    currentPage,
    totalPages,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalCourts: filteredCourts.length,
    nameFilter,
    setNameFilter,
    statusFilter,
    setStatusFilter,
    clearFilters,
    handleSuspendCourtClick,
    handleReactivateCourtClick,
    handleDeleteRequest,
    handleModifyRequest,
    fetchAllCourts: fetchCourts, // Exponer la función para recargar
  };
};
