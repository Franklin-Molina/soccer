import { useState, useEffect } from 'react';
import apiClient from '../../../infrastructure/api/api';

/**
 * Hook personalizado para obtener estadísticas de usuarios desde el backend.
 *
 * @returns {{
 *   stats: { total_users: number, percentage_change: number } | null,
 *   loading: boolean,
 *   error: any
 * }}
 */
const useUserStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/api/users/stats/');
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

export default useUserStats;
