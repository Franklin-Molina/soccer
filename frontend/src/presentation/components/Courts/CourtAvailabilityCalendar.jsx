import React from 'react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays,CheckCircle, XCircle, MinusCircle } from 'lucide-react';
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
    <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
          <h2 className="text-xl font-bold text-emerald-500 dark:text-emerald-400">Calendario de Disponibilidad</h2>
        </div>

          
      
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border-2 border-teal-500/30 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-teal-400" />
            </div>
            <span className="text-sm text-slate-300">Horario disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-sm text-slate-300">Horario ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-500/10 border-2 border-gray-600/20 opacity-40 flex items-center justify-center">
              <MinusCircle className="w-4 h-4 text-gray-500" />
            </div>
            <span className="text-sm text-slate-300">Horario Expirado</span>
          </div>
        </div>
    
        <div className="flex gap-2">
          <button onClick={handlePreviousWeek} className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors">
            &larr; Anterior
          </button>
          <button onClick={handleNextWeek} className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors">
            Siguiente &rarr;
          </button>
        </div>
      </div>
      <div className="text-center mb-4">
        <p className="text-lg font-semibold text-slate-600 dark:text-slate-300 capitalize">{format(currentWeekStartDate, 'MMMM', { locale: es })}</p>
        <p className="text-slate-500 dark:text-slate-400">
          {format(currentWeekStartDate, 'dd/MM/yyyy')} - {format(addDays(currentWeekStartDate, 6), 'dd/MM/yyyy')}
        </p>
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
