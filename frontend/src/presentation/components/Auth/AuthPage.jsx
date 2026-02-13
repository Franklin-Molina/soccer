import React, { useState, useEffect, useRef } from 'react'; // Importar useState, useEffect y useRef
import axios from 'axios'; // Importar axios (para la cookie CSRF, si no se mueve esa lógica)
// import { useNavigate } from 'react-router-dom'; // useNavigate no se usa directamente aquí si AuthContext maneja la redirección
import { useAuth } from '../../context/AuthContext.jsx'; // Importar useAuth

// Los casos de uso y el repositorio ya no se instancian ni usan directamente aquí, AuthContext los maneja.
// import { ApiAuthRepository } from '../../infrastructure/repositories/api-auth-repository.js';
// import { LoginUserUseCase } from '../../application/use-cases/login-user.js';
// import { LoginWithGoogleUseCase } from '../../application/use-cases/login-with-google.js';

import LoginForm from './LoginForm.jsx'; // Importar el componente LoginForm

/**
 * Página de autenticación.
 * Contiene el formulario de inicio de sesión tradicional y el botón de inicio de sesión con Google.
 * Utiliza casos de uso de la capa de Aplicación para la lógica de autenticación.
 * @returns {JSX.Element} El elemento JSX de la página de autenticación.
 */
function AuthPage() {
  // const navigate = useNavigate(); // useNavigate no se usa directamente aquí
  const { login: contextLogin, loginWithGoogle: contextLoginWithGoogle } = useAuth(); // Obtener funciones del contexto
  const API_URL = import.meta.env.VITE_API_URL;

  // Estados para el formulario de inicio de sesión tradicional
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [csrfTokenObtained, setCsrfTokenObtained] = useState(false); // Nuevo estado para la cookie CSRF

  // Ref para rastrear si el efecto ya se ejecutó
  const effectRan = useRef(false);

  // Las instancias del repositorio y casos de uso se manejan en AuthContext.
  // No es necesario crearlas aquí.


  // Efecto para obtener la cookie CSRF al montar el componente
  // Esta lógica podría moverse a la capa de infraestructura si es compleja
  useEffect(() => {
    // Usar el ref para asegurar que el efecto solo se ejecute una vez en desarrollo (StrictMode)
    if (effectRan.current === false) {
      const fetchCsrfToken = async () => {
        try {
          // Hacer una solicitud GET a un endpoint que establezca la cookie CSRF
          // Usar el nuevo endpoint dedicado para obtener la cookie CSRF
          // Nota: Si api.js ya maneja esto, esta llamada directa a axios podría no ser necesaria
          await axios.get(`${API_URL}/api/csrf/`);
        //  console.log('Cookie CSRF obtenida.');
          setCsrfTokenObtained(true); // Establecer estado a true cuando se obtiene la cookie
        } catch (error) {
          console.error('Error al obtener la cookie CSRF:', error);
          // Manejar el error si la cookie CSRF no se puede obtener
          setError('Error al cargar la página de autenticación. Inténtalo de nuevo.');
        }
      };

      fetchCsrfToken();
      
      // Marcar que el efecto ya se ejecutó
      effectRan.current = true;
    }

    // Función de limpieza (opcional para este caso)
    return () => {
      // effectRan.current = false; // No es necesario resetear para este caso
    };

  }, []); // El array vacío asegura que se ejecute solo una vez al montar (después del primer ciclo de StrictMode)

  // Manejar inicio de sesión con Google exitoso usando el caso de uso
  // Manejar inicio de sesión con Google exitoso usando el caso de uso
  const handleLoginSuccess = async (response) => {
   // console.log('Inicio de sesión con Google exitoso:', response);
    const googleAccessToken = response.access_token; // Obtener el access_token de la respuesta de Google

    // Esperar a que la cookie CSRF se haya obtenido
    if (!csrfTokenObtained) {
        setError('Cargando... Por favor, espera.');
        return;
    }

    try {
      // Limpiar errores previos
      setError('');
      // Llamar a la función loginWithGoogle del contexto.
      // Esta se encargará de llamar al caso de uso, guardar tokens y llamar a fetchUser.
      await contextLoginWithGoogle(googleAccessToken);
     // console.log('Llamada a contextLoginWithGoogle completada.');
      // La redirección es manejada por fetchUser en AuthContext

    } catch (error) {
      console.error('Error al iniciar sesión con Google desde AuthPage:', error);
      // TODO: Mostrar mensaje de error al usuario
      setError('Error al iniciar sesión con Google. Inténtalo de nuevo.');
      throw error; // Relanzar el error después de manejarlo localmente
    }
  };

  const handleLoginError = () => {
    console.log('Inicio de sesión con Google fallido');
    // TODO: Mostrar mensaje de error al usuario
    setError('Inicio de sesión con Google fallido.');
  };

  // Manejar inicio de sesión tradicional usando el caso de uso
  const handleTraditionalLogin = async (e) => {
    e.preventDefault(); // Prevenir la recarga de la página

    // Esperar a que la cookie CSRF se haya obtenido
    if (!csrfTokenObtained) {
        setError('Cargando... Por favor, espera.');
        return;
    }

    // Validar que los campos no estén vacíos
    if (!username || !password) {
      setError('Por favor, ingresa tu username y contraseña.');
      return;
    }

    try {
      // Limpiar errores previos
      setError('');

      // Llamar a la función login del contexto con las credenciales originales.
      // AuthContext.login se encargará de llamar al caso de uso, guardar tokens y llamar a fetchUser.
      await contextLogin(username, password);
      //console.log('Llamada a contextLogin completada.');
      // La redirección es manejada por fetchUser en AuthContext

    } catch (error) {
      console.error('Error en inicio de sesión tradicional desde AuthPage:', error);
      if (error.response && error.response.data && error.response.data.detail) {
        setError(error.response.data.detail); // Mostrar mensaje de error del backend
      } else if (error.message) { // Capturar otros tipos de errores
        setError(error.message);
      } else {
        setError('Error en el inicio de sesión. Inténtalo de nuevo.');
      }
      // No es necesario relanzar el error si ya se está mostrando al usuario a través de setError.
      // throw error; 
    }
  };

  return (
    <div>
   {/*  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100"></div> */}
      {/* Renderizar el componente LoginForm y pasarle las props */}
      <LoginForm
        username={username}
        password={password}
        error={error}
        setUsername={setUsername}
        setPassword={setPassword}
        setError={setError}
        onSubmit={handleTraditionalLogin}
        onGoogleSuccess={handleLoginSuccess} // Pasar la función de éxito de Google
        onGoogleError={handleLoginError} // Pasar la función de error de Google
      />

      {/* El botón de Google y el separador "- O -" ahora están dentro de LoginForm */}
    </div>
  );
}

export default AuthPage;
