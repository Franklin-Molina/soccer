import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom'; // Importar useNavigate y Navigate

// Importar los casos de uso y la implementación del repositorio
import { ApiAuthRepository } from '../../infrastructure/repositories/api-auth-repository.js';
import { LoginUserUseCase } from '../../application/use-cases/users/login-user.js';
import { LogoutUserUseCase } from '../../application/use-cases/users/logout-user.js';
import { GetAuthenticatedUserUseCase } from '../../application/use-cases/users/get-authenticated-user.js';
import { LoginWithGoogleUseCase } from '../../application/use-cases/users/login-with-google.js';
import { ResetPasswordUseCase } from '../../application/use-cases/users/reset-password.js';
import { ResetPasswordConfirmUseCase } from '../../application/use-cases/users/reset-password-confirm.js';
import { bookingsWebSocket } from '../../infrastructure/websocket/bookingsWebSocket.js'; 

import { toast } from 'react-toastify'; // Importar toast de react-toastify

// Crear el contexto de autenticación
const AuthContext = createContext(null);

/**
 * Proveedor de contexto de autenticación.
 * Maneja el estado de autenticación del usuario y los tokens JWT
 * utilizando casos de uso de la capa de Aplicación.
 * @param {object} props - Las props del componente.
 * @param {React.ReactNode} props.children - Los componentes hijos que tendrán acceso al contexto.
 * @returns {JSX.Element} El proveedor de contexto.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Estado para indicar si se está cargando la sesión inicial
  const [isRefreshing, setIsRefreshing] = useState(false); // Nuevo estado para indicar si se está despertando el backend
  const hasFetchedUser = useRef(false); // Ref para asegurar que fetchUser se llame solo una vez

  // Obtener la función de navegación
  const navigate = useNavigate();

  // Crear instancias del repositorio y casos de uso
  // En una aplicación real, esto se haría a través de inyección de dependencias
  const authRepository = new ApiAuthRepository();
  const loginUserUseCase = new LoginUserUseCase(authRepository);
  const logoutUserUseCase = new LogoutUserUseCase(authRepository);
  const getAuthenticatedUserUseCase = new GetAuthenticatedUserUseCase(authRepository);
  const loginWithGoogleUseCase = new LoginWithGoogleUseCase(authRepository);
  const resetPasswordUseCase = new ResetPasswordUseCase(authRepository);
  const resetPasswordConfirmUseCase = new ResetPasswordConfirmUseCase(authRepository);


  // Función para obtener la información completa del usuario usando el caso de uso
  const fetchUser = async () => {
    setLoading(true); // Indicar que se está cargando el usuario
    setIsRefreshing(true); // Indicar que estamos intentando conectar/refrescar

    try {
      // Llamar al caso de uso para obtener el usuario autenticado
      const authenticatedUser = await getAuthenticatedUserUseCase.execute();

      if (authenticatedUser) {
        setUser(authenticatedUser);
        setIsAuthenticated(true);
      } else {
        // Si no hay usuario autenticado (ej. no hay tokens o son inválidos)
        setUser(null);
        setIsAuthenticated(false);
        // No redirigir aquí, la redirección al login se maneja en ProtectedRoute
      }

    } catch (error) {
      // console.error('Error al obtener información del usuario:', error); // Eliminado mensaje de consola
      // Si hay un error al obtener el usuario (ej. token expirado), el repositorio ya debería haber limpiado los tokens
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('hasSession');
      setIsAuthenticated(false);
      // No redirigir aquí, la redirección al login se maneja en ProtectedRoute
    } finally {
      setLoading(false); // Asegurar que loading se establezca en false siempre
      setIsRefreshing(false); // Finalizar estado de refresco
    }
  };


  // Función para iniciar sesión con credenciales usando el caso de uso
  const login = async (username, password) => {
    try {
      // Llamar al caso de uso para iniciar sesión y obtener tokens y datos del usuario
      const { tokens, user } = await loginUserUseCase.execute(username, password);
     // console.log("Respuesta de loginUserUseCase.execute():", { tokens, user }); // Añadir log para depuración

      // Actualizar el estado del contexto con el usuario autenticado
      setUser(user);
      setIsAuthenticated(true);
      toast.success('¡Inicio de sesión exitoso!'); // Alerta de éxito

      // Redirigir después de un login exitoso según el rol
      if (user.role === 'adminglobal') {
          navigate('/adminglobal'); // Redirigir a adminglobal a su dashboard
      } else if (user.is_staff) { // Para role='admin' u otros staff
          navigate('/dashboard'); // Redirigir a administradores de cancha al dashboard
      } else { // Para role='cliente'
          navigate('/client'); // Redirigir a usuarios normales al dashboard de cliente
      }

    } catch (error) {
      // console.error('Error en el inicio de sesión (AuthContext):', error); // Eliminado mensaje de consola
      if (error.response && error.response.data) {
        // Loguear el string exacto de la respuesta de error
        //console.log('Raw error response data string (AuthContext):', JSON.stringify(error.response.data));
        let errorMessage = 'Error en el inicio de sesión.'; // Mensaje por defecto
        
        if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.non_field_errors) && error.response.data.non_field_errors.length > 0) {
          errorMessage = error.response.data.non_field_errors[0];
        }
        
        // Manejo específico para credenciales inválidas
        if (errorMessage.toLowerCase().includes("no active account found with the given credentials") ||
            errorMessage.toLowerCase().includes("unable to log in with provided credentials") ||
            errorMessage.toLowerCase().includes("credenciales inválidas")) { // Añadir "credenciales inválidas" si el backend lo usa
          toast.error("Usuario o contraseña incorrectos.");
          return;
        } else if (errorMessage.toLowerCase().includes("cuenta de usuario está inactiva")) {
          toast.error("Tu cuenta está suspendida. Por favor, contacta al administrador.");
          return; 
        } else {
          toast.error(errorMessage); // Usar toast para otros errores
        }
      } else {
        toast.error('Error en el inicio de sesión. Verifica tu conexión.'); // Mensaje genérico si no hay respuesta de error
      }
      // No relanzar el error si ya se manejó con toast
      // throw error; 
    }
  };

// Función para cerrar sesión usando el caso de uso
  const logout = async () => {
    // 1. CORTAR DE RAÍZ: Limpiamos el estado INMEDIATAMENTE.
    // Esto desmontará los componentes protegidos al instante, evitando que hagan peticiones.
    bookingsWebSocket.disconnect();
    setIsAuthenticated(false);
    setUser(null); 
    
    try {
      // 2. Avisar al backend para que destruya las cookies HttpOnly
      await logoutUserUseCase.execute();
      toast.info('Sesión cerrada exitosamente.'); 
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error);
      // Aunque falle en el backend (ej. token ya expirado), igual debemos sacarlo del frontend.
    } finally {
      // 3. REDIRECCIÓN FORZADA
      // Usamos window.location.href en lugar de navigate('/') para forzar 
      // una limpieza total de la memoria del navegador y matar cualquier 
      // petición fantasma que haya quedado en Axios.
      window.location.href = '/'; 
    }
  };

  // Función para iniciar sesión con Google usando el caso de uso
 // Función para iniciar sesión con Google usando el caso de uso
  const loginWithGoogle = async (googleAccessToken) => {
    try {
      // Llamar al caso de uso para iniciar sesión con Google
      const tokens = await loginWithGoogleUseCase.execute(googleAccessToken);
      
      // 🔥 LA SOLUCIÓN: Levantamos la bandera para sobrevivir a la recarga (F5)
      localStorage.setItem('hasSession', 'true');
      
      // Después de obtener los tokens, obtener la información del usuario
      await fetchUser(); 

    } catch (error) {
      throw error;
    }
  };


// Efecto para cargar la sesión al iniciar la aplicación
  useEffect(() => {
    // Intentar obtener el usuario autenticado al cargar la app solo una vez
    if (!hasFetchedUser.current) {
      hasFetchedUser.current = true; // Lo marcamos como ejecutado inmediatamente

      // 👇 La magia de la bandera: si no hay sesión previa, cortamos de raíz
      if (!localStorage.getItem('hasSession')) {
        setIsAuthenticated(false);
        setLoading(false); // ¡Vital para que tu app no se quede cargando infinitamente!
        return; 
      }

      // Si la bandera sí existe, entonces hacemos la petición real al backend
      fetchUser();
    }
  }, []); // Se ejecuta solo una vez al montar el componente


  // TODO: Implementar lógica para refrescar tokens usando el refreshToken en el repositorio
  const updateUser = (updatedUserData) => {
    setUser(prevUser => ({ ...prevUser, ...updatedUserData }));
  };

  const resetPassword = async (email) => {
    try {
      await resetPasswordUseCase.execute(email);
      toast.success('Se ha enviado un correo para restablecer tu contraseña.');
    } catch (error) {
      toast.error('Error al solicitar el restablecimiento de contraseña.');
      throw error;
    }
  };

  const resetPasswordConfirm = async (uid, token, new_password, re_new_password) => {
    try {
      await resetPasswordConfirmUseCase.execute(uid, token, new_password, re_new_password);
      toast.success('Contraseña restablecida exitosamente.');
      navigate('/');
    } catch (error) {
      toast.error('Error al restablecer la contraseña. El enlace puede haber expirado.');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      loading, 
      isRefreshing,
      login, 
      logout, 
      loginWithGoogle, 
      fetchUser, 
      updateUser,
      resetPassword,
      resetPasswordConfirm,
      validatePasswordResetToken: (uid, token) => authRepository.validatePasswordResetToken(uid, token)
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personalizado para usar el contexto de autenticación.
 * @returns {object} El valor del contexto de autenticación.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
