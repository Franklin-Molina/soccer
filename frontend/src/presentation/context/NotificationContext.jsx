import React, { createContext, useState, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext'; // Importar el hook useAuth

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const { user } = useAuth(); // Obtener el usuario del contexto de autenticación

  const showNotification = useCallback((message) => {
    // Verificar si el usuario es un administrador (is_staff)
    if (user && user.is_staff) {
      setNotification(message);
      setTimeout(() => {
        setNotification(null);
      }, 4000); // La notificación desaparece después de 4 segundos
    }
  }, [user]); // Añadir user como dependencia

  return (
    <NotificationContext.Provider value={{ notification, showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
