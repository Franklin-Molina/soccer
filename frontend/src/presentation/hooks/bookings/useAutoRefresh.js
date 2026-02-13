import { useState, useEffect, useRef } from 'react';

// Hook para gestionar el refresco automático y el tiempo transcurrido.
export const useAutoRefresh = (callback, interval = 10000, dependency) => {
  const [timeSinceLastUpdate, setTimeSinceLastUpdate] = useState(0);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  // Efecto para el refresco automático de datos.
  useEffect(() => {
    setTimeSinceLastUpdate(0); // Reiniciar al cambiar la dependencia.

    const autoRefreshInterval = setInterval(() => {
      callbackRef.current();
    }, interval);
    
    const timerInterval = setInterval(() => {
      setTimeSinceLastUpdate(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(autoRefreshInterval);
      clearInterval(timerInterval);
    };
  }, [dependency, interval]);


  // Función para formatear el tiempo en un formato legible.
  const formatearTiempo = (segundos) => {
    if (segundos < 60) return `hace ${segundos}s`;
    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return `hace ${minutos}min`;
    const horas = Math.floor(minutos / 60);
    return `hace ${horas}h`;
  };

  return {
    timeSinceLastUpdate: formatearTiempo(timeSinceLastUpdate)
  };
};
