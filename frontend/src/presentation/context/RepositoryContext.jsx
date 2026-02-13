import React, { createContext, useContext } from 'react';
import { ApiBookingRepository } from '../../infrastructure/repositories/api-booking-repository';
import { ApiUserRepository } from '../../infrastructure/repositories/api-user-repository';
import { ApiCourtRepository } from '../../infrastructure/repositories/api-court-repository';
// Importar otros repositorios aquí si es necesario

// Crear el contexto para los repositorios
const RepositoryContext = createContext(null);

/**
 * Proveedor de repositorios para la aplicación.
 * Envuelve la aplicación y proporciona instancias de repositorios a los componentes hijos.
 * @param {object} { children } - Los componentes hijos que tendrán acceso a los repositorios.
 */
export const RepositoryProvider = ({ children }) => {
  // Instanciar los repositorios aquí. En una aplicación más grande,
  // podrías tener una fábrica o un contenedor de inyección de dependencias.
  const bookingRepository = new ApiBookingRepository();
  const userRepository = new ApiUserRepository();
  const courtRepository = new ApiCourtRepository();
  // const anotherRepository = new AnotherRepository();

  const repositories = {
    bookingRepository,
    userRepository,
    courtRepository,
    // Añadir otros repositorios aquí
  };

  return (
    <RepositoryContext.Provider value={repositories}>
      {children}
    </RepositoryContext.Provider>
  );
};

/**
 * Hook personalizado para acceder a los repositorios.
 * @returns {object} Un objeto que contiene las instancias de los repositorios.
 */
export const useRepositories = () => {
  const context = useContext(RepositoryContext);
  if (!context) {
    throw new Error('useRepositories debe ser usado dentro de un RepositoryProvider');
  }
  return context;
};
