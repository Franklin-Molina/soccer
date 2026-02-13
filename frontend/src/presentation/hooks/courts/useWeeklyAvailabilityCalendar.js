import { useMemo } from 'react';
import { Check, Plus, Icon } from 'lucide-react';
import { soccerBall } from '@lucide/lab';

/**
 * Hook personalizado para la lógica de presentación del calendario de disponibilidad semanal.
 * Encapsula el cálculo de estadísticas y la lógica para obtener el icono del slot.
 *
 * @param {Object} weeklyAvailability - Objeto que contiene la disponibilidad semanal.
 * @returns {Object} Un objeto con las estadísticas de disponibilidad y la función para obtener el icono del slot.
 */
export function useWeeklyAvailabilityCalendar(weeklyAvailability) {

  /**
   * Calcula las estadísticas de disponibilidad (total, disponibles, ocupados).
   * @returns {{totalSlots: number, availableSlots: number, occupiedSlots: number}} Estadísticas de disponibilidad.
   */
  const calculateStats = useMemo(() => {
    if (!weeklyAvailability) return { totalSlots: 0, availableSlots: 0, occupiedSlots: 0 };

    let totalSlots = 0;
    let availableSlots = 0;
    let occupiedSlots = 0;

    Object.values(weeklyAvailability).forEach(dayAvailability => {
      Object.values(dayAvailability).forEach(slot => {
        totalSlots++;
        if (slot === true) availableSlots++;
        if (slot === false) occupiedSlots++;
      });
    });

    return { totalSlots, availableSlots, occupiedSlots };
  }, [weeklyAvailability]);

  /**
   * Determina el icono a mostrar para un slot de tiempo.
   * @param {boolean} isAvailable - Indica si el slot está disponible.
   * @param {boolean} isDefined - Indica si el slot tiene un estado definido (disponible u ocupado).
   * @returns {JSX.Element} El componente de icono correspondiente.
   */
  const getSlotIconName = (isAvailable, isDefined) => {
    if (isAvailable) return 'check';
    if (isDefined && !isAvailable) return 'soccerBall';
    return 'plus';
  };

  const availabilityPercentage = calculateStats.totalSlots > 0 ? Math.round((calculateStats.availableSlots / calculateStats.totalSlots) * 100) : 0;

  return {
    stats: calculateStats,
    availabilityPercentage,
    getSlotIconName
  };
}
