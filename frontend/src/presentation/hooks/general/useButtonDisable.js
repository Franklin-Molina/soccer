import { useState, useCallback } from 'react';

/**
 * Hook personalizado para manejar el estado de deshabilitación de un botón
 * y prevenir múltiples clicks mientras una acción está en progreso.
 *
 * @param {function} action - La función asíncrona o síncrona que se ejecutará al hacer click.
 * @returns {Array} Un array que contiene [isDisabled, handleClick].
 *   - isDisabled (boolean): Indica si el botón debe estar deshabilitado.
 *   - handleClick (function): La función que debe ser asignada al onClick del botón.
 */
const useButtonDisable = (action) => {
  const [isDisabled, setIsDisabled] = useState(false);

  const handleClick = useCallback(async (event) => {
    if (isDisabled) {
      return; // Si ya está deshabilitado, no hacer nada
    }

    setIsDisabled(true); // Deshabilitar el botón

    try {
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault(); // Prevenir el comportamiento por defecto si es un evento de formulario
      }
      await action(event); // Ejecutar la acción original
    } catch (error) {
     // console.error("Error en la acción del botón:", error);
      // Opcional: re-habilitar el botón si la acción falla y se desea permitir reintentos
      // setIsDisabled(false);
    } finally {
      // Si la acción es exitosa y se espera una navegación o un estado final,
      // el botón puede permanecer deshabilitado. Si se necesita re-habilitar
      // en ciertos escenarios (ej. un modal que se cierra), se puede añadir lógica aquí.
      // Para el propósito de "solo un click", lo mantenemos deshabilitado.
      setIsDisabled(false); // Re-habilitar el botón después de que la acción se complete
    }
  }, [isDisabled, action]);

  return [isDisabled, handleClick];
};

export default useButtonDisable;
