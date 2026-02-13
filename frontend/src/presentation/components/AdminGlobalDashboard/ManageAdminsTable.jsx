import React, { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import Spinner from "../common/Spinner";
import useButtonDisable from "../../hooks/general/useButtonDisable";

import { Trash2, Ban, CheckCircle } from "lucide-react";

function ManageAdminsTable() {
  const {
    adminUsers,
    loading,
    error,
    handleSuspendUser,
    handleReactivateUser,
    handleDeleteUser,
  } = useOutletContext();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  const confirmDelete = (admin) => {
    setAdminToDelete(admin);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setAdminToDelete(null);
    setShowDeleteModal(false);
  };

  const [isDeleting, proceedDelete] = useButtonDisable(async () => {
    if (adminToDelete) {
      await handleDeleteUser(adminToDelete.id);
      cancelDelete();
    }
  });

  if (loading) return <Spinner />;

  if (error)
    return (
      <p className="text-red-600 dark:text-red-400">
        Error al cargar la lista de administradores.
      </p>
    );

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Gestionar Administradores de Cancha
      </h1>

      {/* BOTÓN CREAR ADMIN */}
      <div className="flex justify-end mb-4">
        <Link to="/adminglobal/register-admin">
          <button className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-md transition flex items-center gap-2">
            <span className="text-lg bg-emerald"></span> Crear Admin
          </button>
        </Link>
      </div>

      {/* TABLA */}
      {adminUsers.length === 0 ? (
        <p className="text-gray-700 dark:text-gray-300">
          No hay administradores registrados.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="w-full border-collapse bg-white dark:bg-gray-900 text-left">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm uppercase">
              <tr>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Nombre</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {adminUsers.map((admin) => (
                <tr
                  key={admin.id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                    {admin.username}
                  </td>

                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                    {admin.email}
                  </td>

                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                    {admin.first_name} {admin.last_name}
                  </td>

                  {/* ESTADO */}
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        admin.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                          : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                      }`}
                    >
                      {admin.is_active ? "Activo" : "Suspendido"}
                    </span>
                  </td>

                  {/* ACCIONES */}
                  <td className="py-3 px-4 flex gap-2">
                    {admin.is_active ? (
                      <button
                        onClick={() => handleSuspendUser(admin.id)}
                        className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow transition flex items-center justify-center"
                        title="Suspender"
                      >
                        <Ban size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReactivateUser(admin.id)}
                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition flex items-center justify-center"
                        title="Reactivar"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}

                    <button
                      onClick={() => confirmDelete(admin)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition flex items-center justify-center"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {showDeleteModal && adminToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-md animate-fadeIn">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Confirmar Eliminación
            </h2>

            <p className="text-gray-700 dark:text-gray-300">
              ¿Estás seguro de eliminar al administrador?
            </p>

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              <p>
                <strong>Username:</strong> {adminToDelete.username}
              </p>
              <p>
                <strong>Email:</strong> {adminToDelete.email}
              </p>
              <p>
                <strong>Nombre:</strong> {adminToDelete.first_name}{" "}
                {adminToDelete.last_name}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={proceedDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow disabled:opacity-50"
              >
                Sí, eliminar
              </button>

              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg shadow"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageAdminsTable;
