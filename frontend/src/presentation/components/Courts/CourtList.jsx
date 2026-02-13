import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Spinner from '../common/Spinner';

/**
 * Componente para visualizar la lista de canchas.
 */
function CourtList() {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
   const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        // Asumiendo que el backend corre en localhost:8000 y el endpoint es /courts/
        const response = await axios.get(`${API_URL}/api/courts/`);
        setCourts(response.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchCourts();
  }, []); // El array vacío asegura que el efecto se ejecute solo una vez al montar

  if (loading) {
    return <Spinner/>; 
  }

  if (error) {
    return <div>Error al cargar las canchas: {error.message}</div>;
  }

  return (
    <div>
      <h2>Lista de Canchas</h2>
      {courts.length === 0 ? (
        <p>No hay canchas disponibles en este momento.</p>
      ) : (
        <ul>
          {courts.map(court => (
            <li key={court.id}>
              <h3>{court.name}</h3>
              <p>{court.description}</p>
              <p>Características: {court.characteristics}</p>
              <p>Precio: ${court.price}</p>
              {/* TODO: Añadir botón para ver detalles o reservar */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CourtList;
