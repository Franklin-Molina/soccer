import React from 'react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import WeeklyAvailabilityCalendar from '../../pages/courts/WeeklyAvailabilityCalendar.jsx'; 

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
    // Reducimos el padding en móvil (p-3 en vez de p-4/p-6)
    <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-3 sm:p-6 shadow-sm overflow-hidden">
      
      {/* Reducimos el margin bottom en móvil (mb-4 en vez de mb-8) */}
      <div className="flex flex-col gap-4 sm:gap-6 mb-4 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-lg">
            <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 dark:text-emerald-400" />
          </div>
          {/* Texto ligeramente más pequeño en móvil */}
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white leading-tight">Calendario de Disponibilidad</h2>
        </div>

        {/* Leyenda de colores más compacta */}
        <div className="flex flex-wrap gap-2 sm:gap-6 bg-slate-50 dark:bg-slate-900/50 p-2 sm:p-4 rounded-xl border border-slate-100 dark:border-slate-800 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
            <span className="text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Libre</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
            <span className="text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Ocupado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-600"></div>
            <span className="text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Expirado</span>
          </div>
        </div>
      </div>
      
      {/* Sección del mes y controles juntos en una sola fila (Mobile-friendly) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 sm:mb-6 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-emerald-500/5 p-3 sm:py-3 sm:px-6 rounded-xl">
        <div className="text-center sm:text-left">
          <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-white capitalize leading-none">
            {format(currentWeekStartDate, 'MMMM yyyy', { locale: es })}
          </p>
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 tracking-widest uppercase">
            {format(currentWeekStartDate, 'dd MMM')} — {format(addDays(currentWeekStartDate, 6), 'dd MMM')}
          </p>
        </div>

        {/* Controles de semana más pequeños en móvil */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePreviousWeek} 
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all active:scale-95 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <button 
            onClick={handleNextWeek} 
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all active:scale-95 shadow-sm"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
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