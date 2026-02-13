import React from 'react';
import Spinner from '../../components/common/Spinner.jsx';
import { useBookingForm } from '../../hooks/bookings/useBookingForm.js';

function BookingPage() {
  // Usar el hook personalizado para la lógica de la página de reserva
  const {
    court,
    date,
    setDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    loading,
    error,
    bookingError,
    isSubmitting,
    handleSubmit,
  } = useBookingForm();

  if (loading) {
    return <Spinner/>; 
  }

  if (error) {
    return <div>Error al cargar la cancha: {error.message}</div>;
  }

  if (!court) {
      return <div>Cancha no encontrada.</div>;
  }


  return (
    <div>
      <h1>Reservar Cancha: {court.name}</h1>
      <p>Precio por hora: ${court.price}</p>
      {/* TODO: Mostrar información sobre el pago anticipado del 10% */}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="date">Fecha:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="startTime">Hora de Inicio:</label>
          <input
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
         <div>
          <label htmlFor="endTime">Hora de Fin:</label>
          <input
            type="time"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        {bookingError && <div style={{ color: 'red' }}>{bookingError}</div>} {/* Mostrar errores de reserva */}

        <button type="submit" disabled={isSubmitting}>Confirmar Reserva</button>
      </form>
    </div>
  );
}

export default BookingPage;
