import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ApiUserRepository } from '../../../infrastructure/repositories/api-user-repository.js';
import { UpdateUserProfileUseCase } from '../../../application/use-cases/users/update-user-profile.js';
import { ChangePasswordUseCase } from '../../../application/use-cases/users/change-password.js';
import useButtonDisable from '../general/useButtonDisable.js';
import { useEffect } from 'react'; // Importar useEffect
import { toast } from 'react-toastify'; // Importar toast para notificaciones
/**
 * Hook personalizado para la lógica de la página de perfil del usuario.
 * Encapsula la gestión de la edición del perfil y el cambio de contraseña.
 *
 * @returns {object} Un objeto que contiene el estado y las funciones para la página de perfil.
 * @property {object} user - Objeto de usuario del contexto de autenticación.
 * @property {boolean} loading - Indica si el usuario está cargando desde el contexto de autenticación.
 * @property {boolean} isEditing - Indica si el perfil está en modo de edición.
 * @property {boolean} isPasswordModalOpen - Indica si el modal de cambio de contraseña está abierto.
 * @property {string} currentPassword - Contraseña actual para el cambio de contraseña.
 * @property {Function} setCurrentPassword - Setter para la contraseña actual.
 * @property {string} newPassword - Nueva contraseña para el cambio de contraseña.
 * @property {Function} setNewPassword - Setter para la nueva contraseña.
 * @property {string} passwordError - Mensaje de error para el cambio de contraseña.
 * @property {string} passwordSuccess - Mensaje de éxito para el cambio de contraseña.
 * @property {string} username - Nombre de usuario del formulario.
 * @property {Function} setUsername - Setter para el nombre de usuario.
 * @property {string} firstName - Nombre del usuario del formulario.
 * @property {Function} setFirstName - Setter para el nombre.
 * @property {string} lastName - Apellido del usuario del formulario.
 * @property {Function} setLastName - Setter para el apellido.
 * @property {string} email - Email del usuario del formulario.
 * @property {Function} setEmail - Setter para el email.
 * @property {boolean} hasChanges - Indica si hay cambios pendientes en el formulario de perfil.
 * @property {Function} setHasChanges - Setter para el estado de cambios pendientes.
 * @property {string} error - Mensaje de error general del perfil.
 * @property {string} success - Mensaje de éxito general del perfil.
 * @property {boolean} isSubmittingProfile - Indica si el formulario de perfil se está enviando.
 * @property {boolean} isSubmittingPassword - Indica si el formulario de cambio de contraseña se está enviando.
 * @property {Function} handleEditClick - Manejador para activar el modo de edición.
 * @property {Function} handleCancelClick - Manejador para cancelar el modo de edición.
 * @property {Function} handleProfileSubmit - Manejador para el envío del formulario de perfil.
 * @property {Function} handleChangePasswordSubmit - Manejador para el envío del formulario de cambio de contraseña.
 * @property {Function} setIsPasswordModalOpen - Setter para el estado del modal de contraseña.
 */
export const useProfilePageLogic = () => {
  const { user, loading, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [username, setUsername] = useState(user ? user.username : '');
  const [firstName, setFirstName] = useState(user ? user.first_name : '');
  const [lastName, setLastName] = useState(user ? user.last_name : '');
  const [email, setEmail] = useState(user ? user.email : '');
  const [hasChanges, setHasChanges] = useState(false); // Nuevo estado para rastrear cambios
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Efecto para detectar cambios en los campos del formulario
  useEffect(() => {
    if (user) {
      const currentFirstName = user.first_name || '';
      const currentLastName = user.last_name || '';
      const currentEmail = user.email || '';

      const changed =
        firstName !== currentFirstName ||
        lastName !== currentLastName ||
        email !== currentEmail;
      setHasChanges(changed);
    }
  }, [firstName, lastName, email, user]);

  const userRepository = new ApiUserRepository();
  const updateUserProfileUseCase = new UpdateUserProfileUseCase(userRepository);
  const changePasswordUseCase = new ChangePasswordUseCase(userRepository);

  const handleEditClick = () => {
    setIsEditing(true);
    setHasChanges(false); // Resetear al iniciar edición
    setError('');
    setSuccess('');
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setUsername(user.username);
    setFirstName(user.first_name);
    setLastName(user.last_name);
    setEmail(user.email);
    setHasChanges(false); // Resetear al cancelar
    setError('');
    setSuccess('');
  };

  const [isSubmittingProfile, handleProfileSubmit] = useButtonDisable(async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const userData = {
        username,
        first_name: firstName,
        last_name: lastName,
        email,
      };

      const updatedUser = await updateUserProfileUseCase.execute(user.id, userData);
     // console.log('Perfil actualizado exitosamente:', updatedUser);
      toast.success('Perfil actualizado exitosamente.');
      updateUser(updatedUser);
      setHasChanges(false); // Resetear al guardar
      setTimeout(() => {
        setIsEditing(false);
      }, 2000);

    } catch (err) {
      console.error('Error al actualizar el perfil:', err);
      setError('Error al actualizar el perfil. Inténtalo de nuevo.');
      throw err;
    }
  });

  const [isSubmittingPassword, handleChangePasswordSubmit] = useButtonDisable(async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword) {
      setPasswordError('Por favor, ingresa la contraseña actual y la nueva contraseña.');
      return;
    }

    try {
      const result = await changePasswordUseCase.execute(user.id, currentPassword, newPassword);
      setPasswordSuccess(result.detail || 'Contraseña cambiada exitosamente.');

      setTimeout(() => {
        setCurrentPassword('');
        setNewPassword('');
        setIsPasswordModalOpen(false);
        setPasswordSuccess('');
      }, 2000);

    } catch (err) {
      if (err.response) {
        setPasswordError(err.response.data.error || err.response.data.detail || 'Error al cambiar la contraseña.');
      } else {
        setPasswordError(err.message || 'Error al cambiar la contraseña. Inténtalo de nuevo.');
      }
      throw err;
    }
  });

  return {
    user,
    loading,
    isEditing,
    setIsEditing,
    isPasswordModalOpen,
    setIsPasswordModalOpen,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    passwordError,
    setPasswordError,
    passwordSuccess,
    setPasswordSuccess,
    username,
    setUsername,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    hasChanges,
    setHasChanges,
    error,
    setError,
    success,
    setSuccess,
    isSubmittingProfile,
    isSubmittingPassword,
    handleEditClick,
    handleCancelClick,
    handleProfileSubmit,
    handleChangePasswordSubmit,
  };
};
