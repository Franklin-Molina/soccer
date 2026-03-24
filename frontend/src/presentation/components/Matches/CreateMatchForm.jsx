import React from 'react';
import { toast } from 'react-toastify';
import CustomSelect from '../common/CustomSelect';
import WeeklyAvailabilityCalendar from '../../pages/courts/WeeklyAvailabilityCalendar';
import { format, parseISO, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMatchForm } from '../../hooks/matches/useMatchForm';
import { formatPrice } from '../../utils/formatters';

const CreateMatchForm = ({ onClose, onMatchCreated, match }) => {
  const {
    formData,
    courts,
    categories,
    selectedCourtId,
    weeklyAvailability,
    loadingWeeklyAvailability,
    weeklyAvailabilityError,
    selectedSlot,
    showCalendar,
    showConfirmBooking,
    paymentPercentage,
    isBooking,
    currentWeekStartDate,
    daysOfWeek,
    hoursOfDay,
    isEditing,
    selectedCourt,
    priceToPay,
    handleChange,
    handleSelectChange,
    handleTimeSlotClick,
    handlePreviousWeek,
    handleNextWeek,
    handleSubmit,
    confirmBookingAndMatch,
    setShowCalendar,
    setShowConfirmBooking,
    setPaymentPercentage,
  } = useMatchForm({ match, onClose, onMatchCreated });

  return (
    <>
      {/* Modal Principal del Formulario */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {isEditing ? 'Editar Partido' : 'Crear Nuevo Partido'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Cancha */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Cancha
              </label>
              <CustomSelect
                options={courts.map(c => ({ value: c.id, label: c.name }))}
                value={formData.court_id}
                onChange={(value) => handleSelectChange('court_id', value)}
                placeholder="Selecciona una cancha"
                disabled={isEditing}
              />
              {isEditing && (
                <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-1 font-medium">
                  La cancha no se puede cambiar después de crear el partido.
                </p>
              )}
            </div>
           

            {/* Selección de Hora */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-300 mb-3">
                Selecciona Fecha y Hora
              </h3>

              {selectedCourtId && selectedSlot && (
                <div className="bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500 text-emerald-800 dark:text-emerald-400 px-4 py-3 rounded-lg flex justify-between items-center">
                  <span className="text-sm">
                    <strong>{format(parseISO(selectedSlot.date), 'dd/MM/yyyy', { locale: es })}</strong> a las <strong>{hoursOfDay[selectedSlot.hour - 6]}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCalendar(true)}
                    className="ml-4 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium transition"
                  >
                    Cambiar
                  </button>
                </div>
              )}

              {selectedCourtId && !selectedSlot && (
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-lg text-center">
                  <p className="text-sm mb-2">Por favor, selecciona una fecha y hora</p>
                  <button
                    type="button"
                    onClick={() => setShowCalendar(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
                  >
                    Abrir Calendario
                  </button>
                </div>
              )}
            </div>

             {/* Categoría */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Categoría
              </label>
              <CustomSelect
                options={categories.map(c => ({ value: c.id, label: c.name }))}
                value={formData.category_id}
                onChange={(value) => handleSelectChange('category_id', value)}
                placeholder="Selecciona una categoría"
              />
            </div>

            {/* Jugadores */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Jugadores Necesarios (además de ti)
              </label>
              <input
                type="number"
                name="players_needed"
                min="1"
                value={formData.players_needed}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!formData.court_id || !formData.category_id || !formData.start_time || !formData.end_time}
                className={`px-5 py-2 rounded-lg text-white font-semibold transition ${
                  !formData.court_id || !formData.category_id || !formData.start_time || !formData.end_time
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                }`}
              >
                {isEditing ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de confirmación de reserva (Estilo CourtDetailPage) */}
      {showConfirmBooking && selectedCourt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[130] p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                Confirmar Reserva y Partido
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Se realizará la reserva de la cancha y se creará tu partido simultáneamente.
              </p>
              <div className="bg-gray-100 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Cancha:</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-100">{selectedCourt.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Fecha:</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-100">
                    {format(parseISO(formData.start_time), 'dd/MM/yyyy', { locale: es })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Hora:</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-100">
                    {format(parseISO(formData.start_time), 'h:mm a')} - {format(parseISO(formData.end_time), 'h:mm a')}
                  </span>
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300 text-sm">Precio por hora:</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-100">${formatPrice(selectedCourt.price)}</span>
                </div>
                <div className="mt-4">
                  <label className="block text-slate-600 dark:text-slate-300 text-xs font-bold mb-2 uppercase tracking-wider">
                    Porcentaje a pagar ahora:
                  </label>
                  <div className="flex justify-between gap-2 mt-2">
                    {[100, 50, 10].map((pct) => (
                      <label key={pct} className={`flex-1 flex items-center justify-center p-2 rounded-lg border cursor-pointer transition-all ${
                        paymentPercentage === pct
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-emerald-400'
                      }`}>
                        <input
                          type="radio"
                          className="hidden"
                          name="paymentOption"
                          value={pct}
                          checked={paymentPercentage === pct}
                          onChange={() => setPaymentPercentage(pct)}
                        />
                        <span className="text-sm font-bold">{pct}%</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-300 dark:border-slate-600">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Total a Pagar:</span>
                  <span className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                    ${formatPrice(priceToPay)}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmBooking(false)}
                className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white px-4 py-3 rounded-xl transition-colors font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmBookingAndMatch}
                disabled={isBooking}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-3 rounded-xl transition-all shadow-lg disabled:opacity-50 font-semibold"
              >
                {isBooking ? "Procesando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Separado para el Calendario - Más Amplio */}
      {showCalendar && selectedCourtId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl border border-gray-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            {/* Header del Modal del Calendario */}
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div className="flex justify-between items-center w-full sm:w-auto">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Selecciona Fecha y Hora
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 mt-1">
                    Elige un horario disponible para tu partido
                  </p>
                </div>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="sm:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  <X className="w-6 h-6 text-gray-500 dark:text-slate-400" />
                </button>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePreviousWeek}
                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all active:scale-95"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextWeek}
                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-right hidden xs:block">
                  <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">
                    {format(currentWeekStartDate, 'MMMM yyyy', { locale: es })}
                  </p>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {format(currentWeekStartDate, 'dd MMM')} - {format(addDays(currentWeekStartDate, 6), 'dd MMM')}
                  </p>
                </div>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="hidden sm:block p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  <X className="w-6 h-6 text-gray-500 dark:text-slate-400" />
                </button>
              </div>
            </div>

            {/* Contenido del Calendario */}
            <div className="p-4 sm:p-6">
              <div className="xs:hidden text-center mb-4 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">
                  {format(currentWeekStartDate, 'MMMM yyyy', { locale: es })}
                </p>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {format(currentWeekStartDate, 'dd MMM')} - {format(addDays(currentWeekStartDate, 6), 'dd MMM')}
                </p>
              </div>
              <WeeklyAvailabilityCalendar
                weeklyAvailability={weeklyAvailability}
                loadingWeeklyAvailability={loadingWeeklyAvailability}
                weeklyAvailabilityError={weeklyAvailabilityError}
                onTimeSlotClick={handleTimeSlotClick}
                daysOfWeek={daysOfWeek}
                hoursOfDay={hoursOfDay}
                monday={currentWeekStartDate}
                selectedSlot={selectedSlot}
              />
            </div>

            {/* Footer del Modal del Calendario */}
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center sticky bottom-0 bg-white dark:bg-slate-900">
              <div className="flex gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-teal-400/50 dark:bg-teal-500/20 border-2 border-teal-500/70 dark:border-teal-500/30"></div>
                  <span className="text-gray-600 dark:text-slate-400">Disponible</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-red-400/40 dark:bg-red-500/20 border-2 border-red-500/70 dark:border-red-500/40"></div>
                  <span className="text-gray-600 dark:text-slate-400">Ocupado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-slate-200/60 dark:bg-gray-500/10 border-2 border-slate-300/70 dark:border-gray-600/20 opacity-50"></div>
                  <span className="text-gray-600 dark:text-slate-400">Expirado</span>
                </div>
              </div>
              <button
                onClick={() => setShowCalendar(false)}
                className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-slate-100 transition font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateMatchForm;