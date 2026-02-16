import React from 'react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, CheckCircle, XCircle, MinusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import WeeklyAvailabilityCalendar from '../../pages/courts/WeeklyAvailabilityCalendar.jsx'; // Assuming WeeklyAvailabilityCalendar is in the same directory or adjust path

function CourtAvailabilityCalendar({
  weeklyAvailability,
  loadingWeeklyAvailability,
  weeklyAvailabilityError,
  handleCellClick,
  daysOfWeek,
  hoursOfDay,
  currentWeekStartDate,
  handlePreviousWeek,
  handleNextWeek,
  selectedSlot
}) {
  return (
    <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-6 shadow-sm overflow-hidden">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <CalendarDays className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Calendario de Disponibilidad</h2>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button 
              onClick={handlePreviousWeek} 
              className="p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-all active:scale-95"
              title="Semana anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNextWeek} 
              className="p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-all active:scale-95"
              title="Siguiente semana"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 sm:gap-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-400 dark:bg-slate-600"></div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Expirado</span>
          </div>
        </div>
      </div>
      

      <div className="text-center mb-6 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-emerald-500/5 py-3 rounded-xl">
        <p className="text-lg font-bold text-slate-800 dark:text-white capitalize">
          {format(currentWeekStartDate, 'MMMM yyyy', { locale: es })}
        </p>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 tracking-widest uppercase">
          {format(currentWeekStartDate, 'dd MMM')} — {format(addDays(currentWeekStartDate, 6), 'dd MMM')}
        </p>
      </div>
 <div className="flex justify-center mb-8">
  <div className="
    flex items-center gap-3 px-4 py-2 rounded-2xl
    bg-white dark:bg-slate-900
    border border-slate-200 dark:border-slate-700
    shadow-sm dark:shadow-lg
    transition-colors
  ">

    <button 
      onClick={handlePreviousWeek} 
      className="
        flex items-center justify-center w-10 h-10
        rounded-xl
        bg-slate-100 dark:bg-slate-800
        hover:bg-slate-200 dark:hover:bg-slate-700
        text-slate-700 dark:text-slate-300
        transition-all duration-200
        hover:scale-105 active:scale-95
      "
      title="Semana anterior"
    >
      <ChevronLeft className="w-5 h-5" />
    </button>

    <span className="
      text-sm font-semibold tracking-wide
      text-slate-800 dark:text-slate-200
    ">
      Siguiente Semana
    </span>

    <button 
      onClick={handleNextWeek} 
      className="
        flex items-center justify-center w-10 h-10
        rounded-xl
        bg-slate-100 dark:bg-slate-800
        hover:bg-slate-200 dark:hover:bg-slate-700
        text-slate-700 dark:text-slate-300
        transition-all duration-200
        hover:scale-105 active:scale-95
      "
      title="Siguiente semana"
    >
      <ChevronRight className="w-5 h-5" />
    </button>

  </div>
</div>

      
      <WeeklyAvailabilityCalendar
        weeklyAvailability={weeklyAvailability}
        loadingWeeklyAvailability={loadingWeeklyAvailability}
        weeklyAvailabilityError={weeklyAvailabilityError}
        onTimeSlotClick={handleCellClick}
        daysOfWeek={daysOfWeek}
        hoursOfDay={hoursOfDay}
        monday={currentWeekStartDate}
        selectedSlot={selectedSlot}
      />
    </div>
  );
}

export default CourtAvailabilityCalendar;
