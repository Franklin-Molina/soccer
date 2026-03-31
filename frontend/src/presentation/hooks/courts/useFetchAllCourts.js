import { useState, useEffect } from 'react';
import { GetCourtsUseCase } from '../../../application/use-cases/courts/get-courts.js';
import { ApiCourtRepository } from '../../../infrastructure/repositories/api-court-repository.js';
import { courtsWebSocket } from '../../../infrastructure/websocket/courtsWebSocket';

export const useFetchAllCourts = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        setLoading(true);
        const courtRepository = new ApiCourtRepository();
        const getCourtsUseCase = new GetCourtsUseCase(courtRepository);
        const courtsData = await getCourtsUseCase.execute();
        setCourts(courtsData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourts();

    // Conectar al WebSocket de la lista de canchas
    courtsWebSocket.connect();

    const unsubscribe = courtsWebSocket.subscribe((data) => {
      if (data.type === 'court_created') {
        setCourts(prev => [...prev, data.court]);
      } else if (data.type === 'court_updated') {
        setCourts(prev => prev.map(c => c.id === data.court.id ? data.court : c));
      } else if (data.type === 'court_deleted') {
        setCourts(prev => prev.filter(c => c.id !== data.court_id));
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { courts, loading, error };
};
