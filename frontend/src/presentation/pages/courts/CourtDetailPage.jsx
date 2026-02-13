import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";

import { Link } from "react-router-dom";

import Spinner from "../../components/common/Spinner";
import CourtHeader from "../../components/Courts/CourtHeader.jsx";
import StatsCards from "../../components/Courts/StatsCards";
import CourtInfoSection from "../../components/Courts/CourtInfoSection";
import CourtImageGallery from "../../components/Courts/CourtImageGallery";
import CourtAvailabilityCalendar from "../../components/Courts/CourtAvailabilityCalendar";
import { useCourtDetailLogic } from "../../hooks/courts/useCourtDetailLogic.js";
import { formatPrice } from "../../utils/formatters.js";

function CourtDetailPage({ openAuthModal }) {
  const {
    court,
    loading,
    error,
    selectedImage,
    currentImageIndex,
    handlePreviousImage,
    handleNextImage,
    isBooking,
    bookingError,
    bookingSuccess,
    showLoginModal,
    showConfirmModal,
    bookingDetailsToConfirm,
    weeklyAvailability,
    loadingWeeklyAvailability,
    weeklyAvailabilityError,
    currentWeekStartDate,
    daysOfWeek,
    hoursOfDay,
    fetchCourtDetails,
    handleCellClick,
    confirmBooking,
    cancelConfirmation,
    handleCloseLoginModal,
    handlePreviousWeek,
    handleNextWeek,
    openModal,
    closeModal,
    selectedSlot,
    paymentPercentage,
    setPaymentPercentage,
    zoom,
    handleZoomIn,
    handleZoomOut,
  } = useCourtDetailLogic();

  // Calcular el precio a pagar basado en el porcentaje seleccionado
  const priceToPay = bookingDetailsToConfirm
    ? (bookingDetailsToConfirm.price * paymentPercentage) / 100
    : 0;

  useEffect(() => {
    if (bookingSuccess) {
      toast.success("¡Reserva creada con éxito!");
    }
  }, [bookingSuccess]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">¡Oops! Algo salió mal</h2>
          <p className="mb-4">
            Error al cargar detalles de la cancha: {error.message}
          </p>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
            onClick={fetchCourtDetails}
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (!court) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Cancha no encontrada</h2>
          <p>Lo sentimos, no pudimos encontrar la cancha que buscas.</p>
        </div>
      </div>
    );
  }

  const stats = {
    availableSlots: weeklyAvailability
      ? Object.values(weeklyAvailability)
          .flatMap((day) => Object.values(day))
          .filter((v) => v === true).length
      : 0,
    occupiedSlots: weeklyAvailability
      ? Object.values(weeklyAvailability)
          .flatMap((day) => Object.values(day))
          .filter((v) => v === false).length
      : 0,
  };
  const totalSlots = stats.availableSlots + stats.occupiedSlots;
  stats.occupancy =
    totalSlots > 0 ? Math.round((stats.occupiedSlots / totalSlots) * 100) : 0;

  return (
    <div className="min-h-screen pt-20 bg-gray-100 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-gray-800 dark:text-white p-6">
      <div className="max-w-8xl mx-auto mb-8">
        {/* Header */}
        <CourtHeader court={court} />

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Court Info Section */}
        <CourtInfoSection court={court} />

        {/* Galería de imágenes */}
        <CourtImageGallery
          court={court}
          openModal={openModal}
          closeModal={closeModal}
          selectedImage={selectedImage}
          currentImageIndex={currentImageIndex}
          handlePreviousImage={handlePreviousImage}
          handleNextImage={handleNextImage}
          zoom={zoom}
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
        />

        {/* Calendar Section */}
        <CourtAvailabilityCalendar
          weeklyAvailability={weeklyAvailability}
          loadingWeeklyAvailability={loadingWeeklyAvailability}
          weeklyAvailabilityError={weeklyAvailabilityError}
          handleCellClick={handleCellClick}
          daysOfWeek={daysOfWeek}
          hoursOfDay={hoursOfDay}
          currentWeekStartDate={currentWeekStartDate}
          handlePreviousWeek={handlePreviousWeek}
          handleNextWeek={handleNextWeek}
          selectedSlot={selectedSlot}
        />

        {/* Mensajes de estado */}
        {bookingError && (
          <div className="mt-4 bg-rose-500/20 border border-rose-500 text-rose-500 dark:text-rose-400 px-4 py-3 rounded-lg">
            {bookingError}
          </div>
        )}
      </div>

      {/* Modal de confirmación de reserva */}
      {showConfirmModal && bookingDetailsToConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                Confirmar Reserva
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600 dark:text-slate-300">
                ¿Estás seguro de que deseas reservar esta cancha?
              </p>
              <div className="bg-gray-100 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Cancha:
                  </span>{" "}
                  <span className="font-semibold">
                    {bookingDetailsToConfirm.courtName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Fecha:
                  </span>{" "}
                  <span className="font-semibold">
                    {format(
                      bookingDetailsToConfirm.startDateTime,
                      "dd/MM/yyyy",
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Hora:
                  </span>{" "}
                  <span className="font-semibold">
                    {format(bookingDetailsToConfirm.startDateTime, "h:mm a")} -{" "}
                    {format(bookingDetailsToConfirm.endDateTime, "h:mm a")}
                  </span>
                </div>
              </div>
              <div className="bg-gray-100 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300">
                    Precio por hora:
                  </span>
                  <span className="font-semibold">
                    ${formatPrice(bookingDetailsToConfirm.price)}
                  </span>
                </div>
                <div className="mt-4">
                  <label className="block text-slate-600 dark:text-slate-300 text-sm font-bold mb-2">
                    Selecciona el porcentaje a pagar:
                  </label>
                  <div className="flex space-x-4 mt-2">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-emerald-500"
                        name="paymentOption"
                        value="100"
                        checked={paymentPercentage === 100}
                        onChange={() => setPaymentPercentage(100)}
                      />
                      <span className="ml-2 text-slate-700 dark:text-slate-200">
                        100%
                      </span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-emerald-500"
                        name="paymentOption"
                        value="50"
                        checked={paymentPercentage === 50}
                        onChange={() => setPaymentPercentage(50)}
                      />
                      <span className="ml-2 text-slate-700 dark:text-slate-200">
                        50%
                      </span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-emerald-500"
                        name="paymentOption"
                        value="10"
                        checked={paymentPercentage === 10}
                        onChange={() => setPaymentPercentage(10)}
                      />
                      <span className="ml-2 text-slate-700 dark:text-slate-200">
                        10%
                      </span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-300 dark:border-slate-600">
                  <span className="text-slate-600 dark:text-slate-300">
                    Total a Pagar ({paymentPercentage}%):
                  </span>
                  <span className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                    ${formatPrice(priceToPay)}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
              <button
                onClick={cancelConfirmation}
                className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white px-6 py-3 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmBooking(paymentPercentage)}
                disabled={isBooking}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 dark:from-emerald-600 dark:to-teal-600 dark:hover:from-emerald-700 dark:hover:to-teal-700 text-white px-6 py-3 rounded-lg transition-all shadow-lg disabled:opacity-50"
              >
                {isBooking ? "Procesando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para solicitar inicio de sesión */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                Acceso Requerido
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600 dark:text-slate-300">
                Para reservar una cancha, debes estar registrado e iniciar
                sesión.
              </p>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-between">
              <button
                onClick={openAuthModal}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 dark:from-emerald-600 dark:to-teal-600 dark:hover:from-emerald-700 dark:hover:to-teal-700 text-white px-6 py-3 rounded-lg transition-colors shadow-lg"
              >
                Iniciar Sesión
              </button>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors shadow-lg">
                <Link to="/register">Registrarse</Link>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourtDetailPage;
