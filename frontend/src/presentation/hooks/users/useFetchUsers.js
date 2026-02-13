import { useState, useEffect, useMemo } from 'react';

import { GetUserListUseCase } from '../../../application/use-cases/users/get-user-list';
import { ApiUserRepository } from '../../../infrastructure/repositories/api-user-repository';

/**
 * Hook personalizado para obtener la lista de usuarios con paginación del lado del cliente.
 * @returns {object} Un objeto con los datos de paginación y funciones.
 */
export const useFetchUsers = () => {
  const [allUsers, setAllUsers] = useState([]); // Almacena todos los usuarios
  const [displayedUsers, setDisplayedUsers] = useState([]); // Almacena los usuarios para la página actual
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'suspended'
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month', 'year'
  const [itemsPerPage, setItemsPerPage] = useState(10); // Define cuántos elementos mostrar por página

  // No usamos useUseCases aquí directamente para GetUserListUseCase porque necesitamos un filtro específico
  // y el UseCaseContext no proporciona filtros por defecto.
  const userRepository = useMemo(() => new ApiUserRepository(), []);
  const getUserListUseCase = useMemo(() => new GetUserListUseCase(userRepository), [userRepository]);

  const filteredUsers = useMemo(() => {
    // Genera una cadena de fecha YYYY-MM-DD para el inicio del rango de filtro.
    const getStartDateString = (filter) => {
      if (filter === 'all') return null;
      
      // Usar la fecha local para que coincida con la perspectiva del usuario.
      const now = new Date();
      let targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (filter) {
        case 'today':
          // No se necesita hacer nada, targetDate ya es el inicio de hoy.
          break;
        case 'week':
          targetDate.setDate(targetDate.getDate() - 7);
          break;
        case 'month':
          targetDate.setMonth(targetDate.getMonth() - 1);
          break;
        case 'year':
          targetDate.setFullYear(targetDate.getFullYear() - 1);
          break;
        default:
          return null;
      }
      // Convertir a formato YYYY-MM-DD.
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const startDateString = getStartDateString(dateFilter);

    return allUsers.filter(user => {
      // Filtro de búsqueda
      const searchMatch =
        searchTerm === '' ||
        ['username', 'first_name'].some(field =>
          user[field]?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Filtro de estado
      const statusMatch =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.is_active) ||
        (statusFilter === 'suspended' && !user.is_active);

      // Si no hay filtro de fecha, se devuelve el resultado de los otros filtros.
      if (startDateString === null) {
        return searchMatch && statusMatch;
      }

      // Se asegura de que la fecha del usuario sea válida.
      if (!user.date_joined) {
        return false;
      }

      // Convertir la fecha de registro del usuario (desde UTC) a una fecha local.
      // new Date() interpreta la cadena ISO y la ajusta a la zona horaria del navegador.
      const userLocalDate = new Date(user.date_joined);
      
      // Formatear la fecha local del usuario a YYYY-MM-DD para una comparación de cadenas consistente.
      const userLocalDateString = `${userLocalDate.getFullYear()}-${String(userLocalDate.getMonth() + 1).padStart(2, '0')}-${String(userLocalDate.getDate()).padStart(2, '0')}`;

      let dateMatch;
      if (dateFilter === 'today') {
        // Para 'hoy', las cadenas de fecha deben ser idénticas.
        dateMatch = userLocalDateString === startDateString;
      } else {
        // Para otros rangos, la fecha del usuario debe ser mayor o igual a la fecha de inicio del filtro.
        dateMatch = userLocalDateString >= startDateString;
      }

      return searchMatch && statusMatch && dateMatch;
    });
  }, [allUsers, searchTerm, statusFilter, dateFilter]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      // Obtenemos todos los usuarios cliente
      const response = await getUserListUseCase.execute({ role: 'cliente' });
      const users = Array.isArray(response) ? response : response.results || response.users || [];
      setAllUsers(users);
      // Forzar la actualización del estado para que se reflejen los cambios
      setDisplayedUsers(users.slice(0, itemsPerPage));
      setTotalPages(Math.ceil((users?.length || 0) / itemsPerPage));
    } catch (err) {
      setError(err);
      console.error('Error al obtener usuarios en useFetchUsers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para obtener todos los usuarios una sola vez
  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Efecto para actualizar los usuarios mostrados cuando cambia la página o los datos filtrados
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedUsers(filteredUsers.slice(startIndex, endIndex));
    setTotalPages(Math.ceil((filteredUsers?.length || 0) / itemsPerPage));
  }, [currentPage, filteredUsers, itemsPerPage]);

  // Efecto para resetear la página a 1 cuando los filtros cambian
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter]);

  // Función para actualizar un usuario en la lista (por ejemplo, después de suspender/reactivar)
  const updateLocalUser = (userId, updatedFields) => {
    setAllUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, ...updatedFields } : user
      )
    );
  };

  // Función para eliminar un usuario de la lista
  const removeLocalUser = (userId) => {
    setAllUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };

  // Función para limpiar todos los filtros a sus valores iniciales.
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('all');
    setCurrentPage(1); // Resetear a la primera página
  };

  return {
    users: displayedUsers, // Devuelve la lista paginada
    loading,
    error,
    currentPage,
    totalPages,
    totalUsers: filteredUsers.length, // Devuelve el conteo total de usuarios filtrados
    setCurrentPage,
    fetchAllUsers, // Exponer para recargar la lista si es necesario
    updateLocalUser,
    removeLocalUser,
    setSearchTerm,
    searchTerm, // Exponer para controlar el input
    setStatusFilter,
    statusFilter, // Exponer para controlar el select
    dateFilter,
    setDateFilter,
    clearFilters, // Exponer la función de limpieza
    itemsPerPage,
    setItemsPerPage,
  };
};
