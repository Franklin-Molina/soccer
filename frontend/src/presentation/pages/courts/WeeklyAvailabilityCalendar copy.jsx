import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { Clock, Check, X, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { useWeeklyAvailabilityCalendar } from '../../hooks/courts/useWeeklyAvailabilityCalendar.js';
import Spinner from '../../components/common/Spinner.jsx';

function WeeklyAvailabilityCalendar({
  weeklyAvailability,
  loadingWeeklyAvailability,
  weeklyAvailabilityError,
  onTimeSlotClick,
  daysOfWeek,
  hoursOfDay, // This prop is expected to contain strings like "5:00 PM - 6:00 PM"
  monday,
  selectedSlot
}) {
  const { getSlotIconName } = useWeeklyAvailabilityCalendar(weeklyAvailability);
  const [hoveredSlot, setHoveredSlot] = useState(null); // Stores { date: 'YYYY-MM-DD', hour: number }
  const [hoveredTime, setHoveredTime] = useState('');

  const handleTimeSlotClick = (formattedDate, hourNumber, isAvailable) => {
    if (isAvailable && onTimeSlotClick) {
      onTimeSlotClick(formattedDate, hourNumber);
    }
  };

  const handleMouseEnter = (formattedDate, hourNumber, hourRange) => {
    // The user wants the format "5:00 PM - 6:00 PM".
    // The `hourRange` variable from the `hoursOfDay` map should already be in this format.
    // We will use it directly.
    setHoveredTime(hourRange);
    setHoveredSlot({ date: formattedDate, hour: hourNumber });
  };

  const handleMouseLeave = () => {
    setHoveredTime('');
    setHoveredSlot(null);
  };

  if (loadingWeeklyAvailability) {
    return (
      <Spinner />      
    );
  }

  if (weeklyAvailabilityError) {
    return (
      <div className="bg-rose-100 dark:bg-rose-500/20 border border-rose-300 dark:border-rose-500 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-lg text-center">
        <p>{weeklyAvailabilityError}</p>
      </div>
    );
  }

  if (!weeklyAvailability || Object.keys(weeklyAvailability).length === 0) {
    return (
      <div className="bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 px-4 py-3 rounded-lg text-center">
        <p>No hay disponibilidad cargada para esta semana.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto relative"> {/* Added relative positioning for absolute time display */}
      <div className="min-w-max">
        {/* Header */}
        <div className="grid grid-cols-8 bg-slate-100 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
          <div className="p-4 font-semibold border-r border-slate-200 dark:border-slate-700 flex items-center gap-2 text-slate-700 dark:text-white">
            <Clock className="w-5 h-5" /> Horario
          </div>
          {daysOfWeek.map((day, index) => {
            const currentDay = addDays(monday, index);
            return (
              <div key={day} className="p-4 text-center border-r border-slate-200 dark:border-slate-700">
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold">{day}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{format(currentDay, 'dd/MM')}</div>
              </div>
            );
          })}
        </div>

        {/* Time Slots Grid */}
        <div>
          {hoursOfDay.map((hourRange, hourIndex) => {
            const startHour24 = hourIndex + 6;
            return (
              <div key={hourRange} className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-700/50">
                <div className="p-3 text-sm text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700/50 flex items-center">
                  {hourRange}
                </div>
                {daysOfWeek.map((day, dayIndex) => {
                  const now = new Date();
                  const currentDay = addDays(monday, dayIndex);
                  const hourNumber = startHour24;
                  
                  // Construir la fecha y hora completa para la celda actual
                  const slotDateTime = new Date(currentDay);
                  slotDateTime.setHours(hourNumber, 0, 0, 0);

                  const isPast = slotDateTime < now;
                  
                  const formattedDate = format(currentDay, 'yyyy-MM-dd');

                  const dailyAvailability = weeklyAvailability[formattedDate];
                  const isAvailable = dailyAvailability && dailyAvailability[hourNumber] === true;
                  const isOccupied = dailyAvailability && dailyAvailability[hourNumber] === false;

                  let cellClassName = 'p-3 border-r border-slate-200 dark:border-slate-700/50 transition-all relative flex items-center justify-center';
                  
                  if (isPast) {
                    cellClassName += ' bg-gray-500/10 border-2 border-gray-600/20 opacity-40 cursor-not-allowed';
                  } else if (isAvailable) {
                    cellClassName += ' bg-teal-500/20 border-2 border-teal-500/30 hover:bg-teal-500/30 cursor-pointer';
                  } else if (isOccupied) {
                    cellClassName += ' bg-red-500/20 border-2 border-red-500/40';
                  } else {
                    cellClassName += ' bg-slate-50 dark:bg-slate-800/20'; // No disponible / sin datos
                  }

                  const isSelected = selectedSlot?.date === formattedDate && selectedSlot?.hour === hourNumber;
                  if (isSelected) {
                    cellClassName += ' ring-2 ring-emerald-500 dark:ring-emerald-400';
                  }

                  return (
                    <div
                      key={`${day}-${hourRange}`}
                      className={cellClassName}
                      onClick={() => !isPast && handleTimeSlotClick(formattedDate, hourNumber, isAvailable)}
                      onMouseEnter={() => !isPast && handleMouseEnter(formattedDate, hourNumber, hourRange)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {hoveredSlot && hoveredSlot.date === formattedDate && hoveredSlot.hour === hourNumber && !isPast && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white text-xs font-bold rounded-md z-10">
                          {hoveredTime}
                        </div>
                      )}
                      <div className="flex items-center justify-center h-full z-0">
                        {isPast ? (
                          <MinusCircle className="w-4 h-4 text-gray-500" />
                        ) : isAvailable ? (
                          <CheckCircle className="w-4 h-4 text-teal-400" />
                        ) : isOccupied ? (
                          <XCircle className="w-4 h-4 text-red-400" />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
        <div className="mt-6 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Leyenda:</h3>
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
              <span className="text-sm text-slate-300">Horario pasado (expirado)</span>
            </div>
          </div>
        </div>
    </>
  );
}

export default WeeklyAvailabilityCalendar;
