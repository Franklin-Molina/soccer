import { useState, useEffect } from 'react';
import apiClient from '../../../infrastructure/api/api';

/**
 * Hook personalizado para obtener estadísticas de reservas (órdenes) desde el backend.
 *
 * @returns {{
 *   stats: { total_bookings: number, percentage_change: number } | null,
 *   loading: boolean,
 *   error: any
 * }}
 */
const useBookingStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/api/bookings/stats/');
        setStats(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};

export default useBookingStats;
