import { useState, useEffect } from 'react';
import { GetCourtsUseCase } from '../../../application/use-cases/courts/get-courts.js';
import { ApiCourtRepository } from '../../../infrastructure/repositories/api-court-repository.js';

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
  }, []);

  return { courts, loading, error };
};
