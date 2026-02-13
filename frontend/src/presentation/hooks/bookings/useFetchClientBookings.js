import { useState, useEffect, useCallback } from 'react';
import { useUseCases } from '../../context/UseCaseContext';
import { useAuth } from '../../context/AuthContext.jsx';
import { useBookingsRealtime } from './useBookingsRealtime';

/**
 * Hook personalizado para obtener la lista de reservas de un cliente específico.
 * @returns {object} Un objeto con la lista de reservas, estado de carga y error.
 */
export const useFetchClientBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getBookingsUseCase } = useUseCases();
  const { user } = useAuth();

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const bookingsList = await getBookingsUseCase.execute({ userId: user.id });
      setBookings(bookingsList);
    } catch (err) {
      setError(err);
      console.error('Error al obtener reservas del cliente:', err);
    } finally {
      setLoading(false);
    }
  }, [getBookingsUseCase, user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Sincronización en tiempo real vía WebSocket
  useBookingsRealtime(useCallback((event) => {
    console.log('Real-time client booking update:', event);
    fetchBookings();
  }, [fetchBookings]));

  return { bookings, loading, error, refreshBookings: fetchBookings };
};
