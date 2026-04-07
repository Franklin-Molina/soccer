import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { X, User } from "lucide-react";

import { Link } from "react-router-dom";

import Spinner from "../../components/common/Spinner";
import CourtHeader from "../../components/Courts/CourtHeader.jsx";
import StatsCards from "../../components/Courts/StatsCards";
import CourtInfoSection from "../../components/Courts/CourtInfoSection";
import CourtImageGallery from "../../components/Courts/CourtImageGallery";
import CourtAvailabilityCalendar from "../../components/Courts/CourtAvailabilityCalendar";
import { useCourtDetailLogic } from "../../hooks/courts/useCourtDetailLogic.js";
import { formatPrice } from "../../utils/formatters.js";
import GoogleLoginButton from "../../components/Auth/GoogleLoginButton.jsx"
import { useAuth } from "../../context/AuthContext.jsx";


function RegisterForm() {
  const { loginWithGoogle } = useAuth(); // Sacamos la función de tu contexto

  // Función cuando Google dice "¡Todo bien!"
  const handleGoogleSuccess = async (googleResponse) => {
    try {
      // Le pasamos el token de Google a tu contexto
      await loginWithGoogle(googleResponse.credential || googleResponse.access_token);
      toast.success('¡Ingreso con Google exitoso!');
      // La redirección ya la hace tu fetchUser en el AuthContext 😉
    } catch (error) {
      toast.error('Error al ingresar con Google.');
    }
  };

  // Función cuando el usuario cierra la ventanita de Google
  const handleGoogleError = () => {
    toast.error('Se canceló el inicio de sesión con Google.');
  };

}



function CourtDetailPage({ openAuthModal }) {
  const { isAuthenticated } = useAuth();
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
    timeLeft,
    isExpired,
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
    <div className="min-h-screen bg-gray-100 dark:bg-gradient-to-br dark:from-slate-900 
                    dark:via-slate-800 dark:to-slate-900 text-gray-800 dark:text-white p-4 sm:p-6">
      <div className="max-w-8xl mx-auto mb-8  ">
        {/* Header */}
        <CourtHeader court={court} />

        {/* Stats Cards */}
        <StatsCards stats={stats} />

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

    

        {/* Mensajes de estado */}
        {bookingError && (
          <div className="mt-4 bg-rose-500/20 border border-rose-500 text-rose-500 dark:text-rose-400 px-4 py-3 rounded-lg">
            {bookingError}
          </div>
        )}
      </div>

      {/* Modal de confirmación de reserva */}
      {showConfirmModal && bookingDetailsToConfirm && (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 ${isAuthenticated ? 'md:pl-72' : ''}`}>
          <div className="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 animate-in slide-in-from-bottom duration-300">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                Confirmar Reserva
              </h2>
              <button onClick={cancelConfirmation} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Revisa los detalles de tu reserva antes de confirmar.
              </p>
              <div className="bg-gray-100 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Cancha</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-sm">
                    {bookingDetailsToConfirm.courtName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Fecha</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-sm">
                    {format(bookingDetailsToConfirm.startDateTime, "dd/MM/yyyy")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Horario</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-sm">
                    {format(bookingDetailsToConfirm.startDateTime, "h:mm a")} - {format(bookingDetailsToConfirm.endDateTime, "h:mm a")}
                  </span>
                </div>
              </div>
              
              {timeLeft !== null && (
                <div className={`p-4 rounded-xl border flex items-center justify-between ${isExpired ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-600'}`}>
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {isExpired ? 'Tiempo expirado' : 'Tiempo para pagar'}
                  </span>
                  <span className="font-mono font-bold text-lg">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}

              <div className="bg-emerald-500/5 dark:bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                <label className="block text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                  ¿Cuánto deseas pagar ahora?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 50, 100].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setPaymentPercentage(pct)}
                      className={`py-3 px-2 rounded-xl text-sm font-bold transition-all border-2 ${
                        paymentPercentage === pct
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-5 pt-4 border-t border-emerald-500/20">
                  <span className="text-slate-600 dark:text-slate-300 text-sm">
                    Total a Pagar:
                  </span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    ${formatPrice(priceToPay)}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3 pb-8 sm:pb-6">
              <button
                onClick={cancelConfirmation}
                className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white px-6 py-4 rounded-xl font-bold transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => confirmBooking(paymentPercentage)}
                disabled={isBooking || isExpired}
                className={`flex-[2] px-6 py-4 rounded-xl font-bold transition-all shadow-xl disabled:opacity-50 active:scale-95 ${
                  isExpired 
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none" 
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-500/20"
                }`}
              >
                {isBooking ? "Procesando..." : isExpired ? "Expirado" : "Confirmar Reserva"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para solicitar inicio de sesión */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 animate-in slide-in-from-bottom duration-300">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-emerald-400 dark:text-emerald-400">
                Acceso Requerido
              </h2>
              <button onClick={handleCloseLoginModal} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-4 text-center">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                Para reservar una cancha, debes estar registrado e iniciar sesión.
              </p>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-3 pb-10 sm:pb-6">
              <button
                onClick={openAuthModal}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95"
              >
                Iniciar Sesión
              </button>
                {/* Divider */}
                       <div className="flex items-center justify-center gap-2 text-gray-400 my-4">
                         <span className="border-t border-gray-300 dark:border-gray-600 w-16"></span>
                         <span className="text-sm">O</span>
                         <span className="border-t border-gray-300 dark:border-gray-600 w-16"></span>
                       </div>
             
                       {/* Google Login */}
                   
                   
             
                     {/* Registro */}
                     <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                       ¿No tienes una cuenta?{' '}
                       <a href="/register" className="text-emerald-500 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium animate-float animate-pulse-glow ">
                         Regístrate aquí
                       </a>
                     </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourtDetailPage;
