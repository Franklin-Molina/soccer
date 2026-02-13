import { useEffect, useState } from 'react';
import { GetUserListUseCase } from '../../../application/use-cases/users/get-user-list.js';
import { UpdateUserStatusUseCase } from '../../../application/use-cases/users/update-user-status.js';
import { DeleteUserUseCase } from '../../../application/use-cases/users/delete-user.js';
import { ApiUserRepository } from '../../../infrastructure/repositories/api-user-repository.js';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Hook personalizado para la lógica de gestión de administradores en el dashboard global.
 * Encapsula la obtención, suspensión, reactivación y eliminación de usuarios administradores.
 *
 * @returns {object} Un objeto que contiene el estado y las funciones para la gestión de administradores.
 * @property {Array} adminUsers - Lista de usuarios administradores.
 * @property {boolean} loading - Indica si los datos están cargando.
 * @property {string|null} error - Mensaje de error si ocurre uno.
 * @property {string} suspendSuccess - Mensaje de éxito para operaciones de suspensión/reactivación.
 * @property {Function} fetchAdminUsers - Función para recargar la lista de administradores.
 * @property {Function} handleSuspendUser - Función para suspender un usuario.
 * @property {Function} handleReactivateUser - Función para reactivar un usuario.
 * @property {Function} handleDeleteUser - Función para eliminar un usuario.
 */
export const useAdminDashboard = () => {
  const { user } = useAuth();
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suspendSuccess, setSuspendSuccess] = useState('');

  // Instanciar repositorio y casos de uso
  const userRepository = new ApiUserRepository();
  const getUserListUseCase = new GetUserListUseCase(userRepository);
  const updateUserStatusUseCase = new UpdateUserStatusUseCase(userRepository);
  const deleteUserUseCase = new DeleteUserUseCase(userRepository);

  /**
   * Obtiene la lista de usuarios administradores desde el backend.
   */
  const fetchAdminUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const users = await getUserListUseCase.execute();
      setAdminUsers(users);
      setLoading(false);
    } catch (err) {
      console.error("Error al obtener usuarios administradores:", err);
      setError(err);
      setAdminUsers([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Solo cargar datos si el usuario es adminglobal
    if (user && user.role === 'adminglobal') {
      fetchAdminUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  /**
   * Suspende un usuario administrador.
   * @param {string} userId - ID del usuario a suspender.
   */
  const handleSuspendUser = async (userId) => {
    try {
      await updateUserStatusUseCase.execute(userId, false);
      setAdminUsers(prevUsers =>
        prevUsers.map(u => u.id === userId ? { ...u, is_active: false } : u)
      );
      setSuspendSuccess('Administrador suspendido exitosamente.');
      setTimeout(() => {
        setSuspendSuccess('');
      }, 3000);
    } catch (err) {
      console.error(`Error al suspender usuario ${userId}:`, err);
      setError(new Error(`Error al suspender administrador: ${err.message}`));
      setSuspendSuccess(''); // Limpiar mensaje de éxito si hay error
    }
  };

  /**
   * Reactiva un usuario administrador.
   * @param {string} userId - ID del usuario a reactivar.
   */
  const handleReactivateUser = async (userId) => {
    try {
      await updateUserStatusUseCase.execute(userId, true);
      setAdminUsers(prevUsers =>
        prevUsers.map(u => u.id === userId ? { ...u, is_active: true } : u)
      );
      setSuspendSuccess('Administrador reactivado exitosamente.');
      setTimeout(() => {
        setSuspendSuccess('');
      }, 3000);
    } catch (err) {
      console.error(`Error al reactivar usuario ${userId}:`, err);
      setError(new Error(`Error al reactivar administrador: ${err.message}`));
      setSuspendSuccess(''); // Limpiar mensaje de éxito si hay error
    }
  };

  /**
   * Elimina un usuario administrador.
   * @param {string} userId - ID del usuario a eliminar.
   */
  const handleDeleteUser = async (userId) => {
    try {
      await deleteUserUseCase.execute(userId);
      setAdminUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      setSuspendSuccess('Administrador eliminado exitosamente.'); // Mensaje de éxito para eliminación
      setTimeout(() => {
        setSuspendSuccess('');
      }, 3000);
    } catch (err) {
      console.error(`Error al eliminar usuario ${userId}:`, err);
      setError(new Error(`Error al eliminar administrador: ${err.message}`));
      setSuspendSuccess(''); // Limpiar mensaje de éxito si hay error
    }
  };

  return {
    adminUsers,
    loading,
    error,
    suspendSuccess,
    fetchAdminUsers,
    handleSuspendUser,
    handleReactivateUser,
    handleDeleteUser,
  };
};
