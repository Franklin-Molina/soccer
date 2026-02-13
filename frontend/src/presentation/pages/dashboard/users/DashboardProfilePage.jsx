import React from 'react';
import LogoutButton from '../../../components/Auth/LogoutButton.jsx'; // Ruta actualizada
import { useProfilePageLogic } from '../../../hooks/users/useProfilePageLogic.js'
import Spinner from '../../../components/common/Spinner.jsx'; // Importar Spinner

function DashboardProfilePage() {
  const {
    user,
    loading, // Añadir loading del hook
    isEditing,
    setIsEditing,
    isPasswordModalOpen,
    setIsPasswordModalOpen,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    passwordError,
    passwordSuccess,
    username,
    setUsername,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    error,
    success,
    isSubmittingProfile,
    isSubmittingPassword,
    hasChanges, // Añadir hasChanges
    handleEditClick,
    handleCancelClick,
    handleProfileSubmit,
    handleChangePasswordSubmit,
  } = useProfilePageLogic();

  // Si el usuario está cargando, mostrar Spinner
  if (loading) {
    return <Spinner />;
  }

  // Si no hay usuario y no está cargando, mostrar mensaje de no autenticado
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Usuario no autenticado.
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Por favor, inicia sesión para ver tu perfil.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center">
        Perfil de Usuario
      </h1>

      {/* Tarjeta principal */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
        {/* Encabezado del perfil */}
        <div className="flex items-center mb-6">
          <div className="flex-shrink-0 bg-blue-600 dark:bg-blue-500 text-white text-2xl font-bold w-16 h-16 flex items-center justify-center rounded-full shadow-md">
            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {user.username}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{user.role}</p>
          </div>
        </div>

        {/* Vista de edición o solo lectura */}
        {isEditing ? (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 p-2 rounded">
                {success}
              </div>
            )}

            {/* Campos del formulario */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1 text-sm">Usuario</label>
                <input
                  type="text"
                  value={username}
                  readOnly // Campo de usuario no modificable
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-70"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1 text-sm">Nombre</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1 text-sm">Apellido</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1 text-sm">Correo</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmittingProfile || !hasChanges} // Deshabilitar si no hay cambios o se está enviando
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow disabled:opacity-50"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={handleCancelClick}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-2 text-gray-800 dark:text-gray-200">
            <div className="flex items-center">
              <span className="font-medium w-24">Nombre:</span>
              <span>{user.first_name}</span>
            </div>

            <div className="flex items-center">
              <span className="font-medium w-24">Apellido:</span>
              <span>{user.last_name}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium w-24">Correo:</span>
              <span>{user.email}</span>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={handleEditClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
              >
                Editar Perfil
              </button>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow"
              >
                Cambiar Contraseña
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Modal para cambiar contraseña */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Cambiar Contraseña</h2>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Contraseña actual
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                />
              </div>

              {passwordError && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 p-2 rounded">
                  {passwordSuccess}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow disabled:opacity-50"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cuentas vinculadas */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Cuentas Vinculadas</h2>
        {user.social_profiles && user.social_profiles.length > 0 ? (
          <ul className="space-y-2">
            {user.social_profiles.map((profile) => (
              <li
                key={profile.id}
                className="flex justify-between text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-1"
              >
                <span>{profile.provider}</span>
                <span className="text-gray-500 dark:text-gray-400">{profile.uid}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No hay cuentas sociales vinculadas.</p>
        )}
      </div>

      {/* Cierre de sesión */}
      <div className="mt-6 flex justify-center">
        <LogoutButton />
      </div>
    </div>
  );
}

export default DashboardProfilePage;
