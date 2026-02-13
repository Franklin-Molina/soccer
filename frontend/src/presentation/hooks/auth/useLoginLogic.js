import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Hook personalizado para la lógica de la página de Login.
 * Encapsula el manejo del formulario de inicio de sesión y la interacción con el contexto de autenticación.
 *
 * @returns {object} Un objeto que contiene el estado y las funciones para el login.
 * @property {string} username - Nombre de usuario del formulario.
 * @property {Function} setUsername - Setter para el nombre de usuario.
 * @property {string} password - Contraseña del formulario.
 * @property {Function} setPassword - Setter para la contraseña.
 * @property {string} error - Mensaje de error del login.
 * @property {Function} handleSubmit - Manejador para el envío del formulario de login.
 */
export const useLoginLogic = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate(); // Aunque navigate no se usa directamente en el return, se usa en handleSubmit

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(username, password);
      // La redirección ya se maneja dentro de fetchUser del contexto AuthContext
      // Si AuthContext no redirige, se podría añadir aquí: navigate('/dashboard');
    } catch (err) {
      console.error('Error en el inicio de sesión:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Error en el inicio de sesión. Inténtalo de nuevo.');
      }
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    error,
    handleSubmit,
  };
};
