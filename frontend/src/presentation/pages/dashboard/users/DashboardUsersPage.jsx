import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext.jsx";
import Spinner from "../../../components/common/Spinner.jsx";
import Pagination from "../../../components/common/Pagination.jsx";
import CustomSelect from "../../../components/common/CustomSelect.jsx";
import { useDashboardUsersLogic } from "../../../hooks/dashboard/useDashboardUsersLogic.js";
import { useUsersRealtime } from "../../../hooks/users/useUsersRealtime";
import { toast } from "react-toastify";
import {
  User,
  Trash2,
  Eye,
  UserMinus,
  UserCheck,
  XCircle,
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

function DashboardUsersPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const {
    users,
    loading,
    error,
    currentPage,
    totalPages,
    setCurrentPage,
    actionStatus,
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
    setStatusFilter,
    searchTerm,
    statusFilter,
    dateFilter,
    setDateFilter,
    fetchAllUsers,
    clearFilters,
    itemsPerPage,
    setItemsPerPage,
    totalUsers,
  } = useDashboardUsersLogic();

  const { user } = useAuth();

  // Integrar WebSockets para actualizaciones de usuarios en tiempo real
  useUsersRealtime(React.useCallback((event) => {
//  console.log("Real-time user update received:", event);
    fetchAllUsers(); // Refrescar la lista de usuarios
  }, [fetchAllUsers]));

  // Log para debugging - puedes eliminarlo después
  useEffect(() => {
    //console.log("Users actualizados:", users);
   // console.log("Página actual:", currentPage);
  }, [users, currentPage]);

  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "active", label: "Activos" },
    { value: "suspended", label: "Suspendidos" },
  ];

  const dateOptions = [
    { value: "all", label: "Todas las fechas" },
    { value: "today", label: "Hoy" },
    { value: "week", label: "Última semana" },
    { value: "month", label: "Último mes" },
    { value: "year", label: "Último año" },
  ];

  const getRowNumber = (index) => {
    return (currentPage - 1) * itemsPerPage + index + 1;
  };

  const activeFilterCount = [statusFilter, dateFilter].filter(
    (filter) => filter !== "all"
  ).length;

  if (loading) return <Spinner />;
  if (error)
    return (
      <div className="text-center text-red-600 font-medium">
        Error: {error.message}
      </div>
    );

  return (
    <div className="p-6 relative">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Gestión de Usuarios Cliente
      </h1>

      {/* Controles de Filtro y Búsqueda */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 transition-all">

        {/* Barra principal de búsqueda y acciones */}
        <div className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

          {/* Campo de búsqueda principal */}
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nombre o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all"
            />
          </div>

          {/* Botón de filtros avanzados */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${isFilterOpen
              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
            />
          </button>

         
        </div>

        {/* Panel de filtros expandible */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${isFilterOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

              {/* Filtro de estado */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 ml-1">
                  Estado
                </label>
                <CustomSelect
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                />
              </div>

              {/* Filtro adicional: Fecha de registro */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 ml-1">
                  Fecha de registro
                </label>
                <CustomSelect
                  options={dateOptions}
                  value={dateFilter}
                  onChange={(value) => setDateFilter(value)}
                />
              </div>
            </div>

            {/* Botones de acción en filtros */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                Limpiar filtros
              </button>
              <div className="flex-grow"></div>
              <span className="text-xs text-gray-500 dark:text-gray-500">
                {activeFilterCount === 0
                  ? "Sin filtros"
                  : `${activeFilterCount} filtro${activeFilterCount > 1 ? "s" : ""
                  } activo${activeFilterCount > 1 ? "s" : ""}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de acción */}
      {actionStatus && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm ${actionStatus.includes("Error")
            ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
            : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
            }`}
        >
          {actionStatus}
        </div>
      )}

      {/* Tabla */}
      {Array.isArray(users) && users.length > 0 ? (
        <div className="shadow-md relative z-0">
          <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-t-2xl border-x border-t border-gray-200 dark:border-gray-700">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase text-sm">
                <tr>
                  <th className="py-3 px-4 text-left">#</th>
                  <th className="py-3 px-4 text-left">Usuario</th>
                  <th className="py-3 px-4 text-left">Nombre</th>
                  <th className="py-3 px-4 text-left">Estado</th>
                  <th className="py-3 px-4 text-left">Acciones</th>
                  <th className="py-3 px-4 text-left">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {users.map((clientUser, index) => {
                  // Generar una key única y consistente
                  const uniqueKey = `user-${clientUser.id}-page-${currentPage}-index-${index}`;
                  return (
                    <tr
                      key={uniqueKey}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-100 font-medium">
                        {getRowNumber(index)}
                      </td>
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-500 dark:text-blue-300" />
                          <span>{clientUser.username}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                        {clientUser.first_name} {clientUser.last_name}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${clientUser.is_active
                            ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300"
                            }`}
                        >
                          {clientUser.is_active ? "Activo" : "Suspendido"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {clientUser.is_active ? (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                //console.log("Suspendiendo usuario:", clientUser.id);
                                handleSuspendUserClick(clientUser.id);
                              }}
                              disabled={isSuspending}
                              className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-yellow-200 dark:hover:bg-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <UserMinus className="w-4 h-4" />
                              Suspender
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                               // console.log("Reactivando usuario:", clientUser.id);
                                handleReactivateUserClick(clientUser.id);
                              }}
                              disabled={isReactivating}
                              className="inline-flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-green-200 dark:hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <UserCheck className="w-4 h-4" />
                              Reactivar
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log("Eliminando usuario:", clientUser);
                              confirmDelete(clientUser);
                            }}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-1 bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("Ver detalles de usuario:", clientUser);
                            handleViewDetails(clientUser);
                          }}
                          className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-purple-200 dark:hover:bg-purple-700 transition"
                        >
                          <Eye className="w-4 h-4" />
                          Ver más
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Paginación */}
          <div className="bg-white dark:bg-gray-900 rounded-b-2xl border-x border-b border-gray-200 dark:border-gray-700">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              totalItems={totalUsers}
            />
          </div>
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400 mt-4">
          No se encontraron usuarios cliente.
        </p>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-3 text-red-600 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Confirmar Eliminación
            </h2>
            <p className="text-sm mb-4 text-gray-700 dark:text-gray-300">
              ¿Estás seguro de que deseas eliminar al usuario?
            </p>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong>Usuario:</strong> {userToDelete.username}
              </p>
              <p>
                <strong>Email:</strong> {userToDelete.email}
              </p>
              <p>
                <strong>Nombre:</strong> {userToDelete.first_name}{" "}
                {userToDelete.last_name}
              </p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancelar
              </button>
              <button
                onClick={proceedDeleteClick}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalles */}
      {showDetailsModal && userDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 text-blue-600">
              Detalles del Usuario
            </h2>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p>
                <strong>ID:</strong> {userDetails.id}
              </p>
              <p>
                <strong>Usuario:</strong> {userDetails.username}
              </p>
              <p>
                <strong>Email:</strong> {userDetails.email}
              </p>
              <p>
                <strong>Nombre:</strong> {userDetails.first_name}{" "}
                {userDetails.last_name}
              </p>
              <p>
                <strong>Rol:</strong> {userDetails.role}
              </p>
              <p>
                <strong>Estado:</strong>{" "}
                {userDetails.is_active ? "Activo" : "Suspendido"}
              </p>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleCloseDetailsModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardUsersPage;