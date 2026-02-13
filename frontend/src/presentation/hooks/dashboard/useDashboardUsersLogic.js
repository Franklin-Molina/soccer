import { useState, useMemo } from 'react'; // Eliminamos useEffect ya que useFetchUsers lo manejará
import { useAuth } from '../../context/AuthContext.jsx';
import useButtonDisable from '../general/useButtonDisable.js';
import { toast } from 'react-toastify'; // Importar toast de react-toastify
import { useFetchUsers } from '../users/useFetchUsers.js'; // Importar el nuevo hook de paginación

// Casos de uso y repositorios
import { ApiUserRepository } from '../../../infrastructure/repositories/api-user-repository.js';
import { DeleteUserUseCase } from '../../../application/use-cases/users/delete-user.js';

/**
 * Hook personalizado para la lógica de la página de gestión de usuarios cliente.
 * Encapsula la obtención, suspensión, reactivación y eliminación de usuarios.
 *
 * @returns {object} Un objeto que contiene el estado y las funciones para la gestión de usuarios.
 * @property {Array} users - Lista de usuarios cliente paginada.
 * @property {boolean} loading - Indica si los datos están cargando.
 * @property {string|null} error - Mensaje de error si ocurre uno.
 * @property {number} currentPage - Página actual de la paginación.
 * @property {number} totalPages - Número total de páginas.
 * @property {Function} setCurrentPage - Función para cambiar la página actual.
 * @property {boolean} showDeleteModal - Controla la visibilidad del modal de confirmación de eliminación.
 * @property {object|null} userToDelete - Usuario seleccionado para eliminar.
 * @property {boolean} showDetailsModal - Controla la visibilidad del modal de detalles.
 * @property {object|null} userDetails - Detalles del usuario a mostrar.
 * @property {boolean} isSuspending - Indica si un usuario se está suspendiendo.
 * @property {boolean} isReactivating - Indica si un usuario se está reactivando.
 * @property {boolean} isDeleting - Indica si un usuario se está eliminando.
 * @property {Function} fetchClientUsers - Función para recargar la lista de usuarios cliente.
 * @property {Function} handleSuspendUserClick - Función para suspender un usuario.
 * @property {Function} handleReactivateUserClick - Función para reactivar un usuario.
 * @property {Function} confirmDelete - Función para solicitar la eliminación de un usuario.
 * @property {Function} cancelDelete - Función para cancelar la eliminación de un usuario.
 * @property {Function} proceedDeleteClick - Función para confirmar la eliminación de un usuario.
 * @property {Function} handleViewDetails - Función para ver los detalles de un usuario.
 * @property {Function} handleCloseDetailsModal - Función para cerrar el modal de detalles.
 */
export const useDashboardUsersLogic = () => {
  const { user } = useAuth();

  // Usar el hook useFetchUsers para la obtención y paginación de datos
const {
  users,
  loading,
  error,
  currentPage,
  totalPages,
  setCurrentPage,
  updateLocalUser,
  removeLocalUser,
  setSearchTerm,
  searchTerm,
  setStatusFilter,
  statusFilter,
  dateFilter,
  setDateFilter,
    fetchAllUsers,
    clearFilters, // Añadido para limpiar filtros
    itemsPerPage,
    setItemsPerPage,
    totalUsers,
  } = useFetchUsers({ enableDebug: true });


  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  const userRepository = useMemo(() => new ApiUserRepository(), []);
  // Eliminamos GetUserListUseCase de aquí ya que useFetchUsers lo maneja
  const deleteUserUseCase = useMemo(() => new DeleteUserUseCase(userRepository), [userRepository]);

  // Las funciones de acción ahora usan updateLocalUser y removeLocalUser
  const [isSuspending, handleSuspendUserClick] = useButtonDisable(async (userId) => {
    try {
      await userRepository.updateClientUserStatus(userId, false);
      updateLocalUser(userId, { is_active: false }); // Actualizar el estado local
      toast.success('Usuario suspendido exitosamente.'); // Alerta de éxito
    } catch (err) {
      toast.error(`Error al suspender usuario: ${err.message}`); // Alerta de error
      throw err;
    }
  });

  const [isReactivating, handleReactivateUserClick] = useButtonDisable(async (userId) => {
    try {
      await userRepository.updateClientUserStatus(userId, true);
      updateLocalUser(userId, { is_active: true }); // Actualizar el estado local
      toast.success('Usuario reactivado exitosamente.'); // Alerta de éxito
    } catch (err) {
      toast.error(`Error al reactivar usuario: ${err.message}`); // Alerta de error
      throw err;
    }
  });

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setUserToDelete(null);
    setShowDeleteModal(false);
  };

  const [isDeleting, proceedDeleteClick] = useButtonDisable(async () => {
    if (userToDelete) {
      try {
        await deleteUserUseCase.execute(userToDelete.id);
        removeLocalUser(userToDelete.id); // Corregido: usar removeLocalUser
        toast.success('Usuario eliminado exitosamente.');
      } catch (err) {
        toast.error(`Error al eliminar usuario: ${err.message}`);
        throw err;
      } finally {
        cancelDelete();
      }
    }
  });

  const handleViewDetails = (user) => {
    setUserDetails(user);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setUserDetails(null);
    setShowDetailsModal(false);
  };

  return {
    users, // Ahora se devuelve 'users' del hook de paginación
    loading,
    error,
    currentPage,
    totalPages,
    setCurrentPage,
    showDeleteModal,
    userToDelete,
    showDetailsModal,
    userDetails,
    isSuspending,
    isReactivating,
    isDeleting,
    handleSuspendUserClick,
    handleReactivateUserClick,
    confirmDelete,
    cancelDelete,
    proceedDeleteClick,
    handleViewDetails,
    handleCloseDetailsModal,
    setSearchTerm,
    searchTerm, // Añadido para controlar el input
    setStatusFilter,
    statusFilter, // Añadido para controlar el select
    dateFilter,
    setDateFilter,
    fetchAllUsers,
    clearFilters, // Exponer la función de limpieza
    itemsPerPage,
    setItemsPerPage,
    totalUsers,
  };
};