import React from 'react';
import { Navigate, useLocation } from 'react-router-dom'; // Importar useLocation
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../common/Spinner.jsx';

/**
 * Componente de ruta protegida.
 * Redirige al usuario a la página de login si no está autenticado.
 * Restringe el acceso a rutas de administrador si el usuario no es administrador.
 * @param {object} props - Las props del componente.
 * @param {React.ReactNode} props.children - Los componentes hijos (la ruta a proteger).
 * @returns {JSX.Element} El componente hijo si está autenticado y autorizado, o un componente Navigate.
 */
const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth(); // Obtener el objeto user
  const location = useLocation(); // Obtener la ubicación actual

  // Si aún está cargando el estado de autenticación inicial, no renderizar nada o mostrar un spinner
  if (loading) {
    return <Spinner/>;  // TODO: Reemplazar con un spinner o componente de carga adecuado
  }

  // Si no está autenticado, redirigir a la página de login
  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />; // Pasar la ubicación actual para redirigir de vuelta después del login
  }

  // Verificar si la ruta actual es la de registro de administrador
  const isAdminRegisterRoute = location.pathname === '/admin/register';

  // Verificar si la ruta actual es una ruta de administrador (registro de admin o cualquier ruta del dashboard)
  const isAdminRoute = isAdminRegisterRoute || location.pathname.startsWith('/dashboard');

  // Si es una ruta de administrador y el usuario no es staff (asumiendo que is_staff indica admin)
  if (isAdminRoute && (!user || !user.is_staff)) {
    console.warn(`Acceso denegado a ruta de administrador: ${location.pathname}. Usuario no es staff. Redirigiendo al home.`);
    return <Navigate to="/" replace />;
  }

  // Verificar si la ruta actual es para adminglobal
  const isAdminglobalRoute = location.pathname.startsWith('/adminglobal');

  // Si es una ruta de adminglobal y el usuario no tiene role='adminglobal'
  if (isAdminglobalRoute && (!user || user.role !== 'adminglobal')) {
    console.warn(`Acceso denegado a ruta de adminglobal: ${location.pathname}. Usuario no tiene rol 'adminglobal'. Redirigiendo al home.`);
    return <Navigate to="/" replace />;
  }

  // Si está autenticado y autorizado para la ruta, renderizar los componentes hijos
  return children;
};

export default ProtectedRoute;
