import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { Clock, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { useWeeklyAvailabilityCalendar } from '../../hooks/courts/useWeeklyAvailabilityCalendar.js';
import Spinner from '../../components/common/Spinner.jsx';

function WeeklyAvailabilityCalendar({
  weeklyAvailability,
  loadingWeeklyAvailability,
  weeklyAvailabilityError,
  onTimeSlotClick,
  daysOfWeek,
  hoursOfDay,
  monday,
  selectedSlot
}) {
  const { getSlotIconName } = useWeeklyAvailabilityCalendar(weeklyAvailability);
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [hoveredTime, setHoveredTime] = useState('');

  const handleMouseEnter = (formattedDate, hourNumber, hourRange) => {
    setHoveredTime(hourRange);
    setHoveredSlot({ date: formattedDate, hour: hourNumber });
  };

  const handleMouseLeave = () => {
    setHoveredTime('');
    setHoveredSlot(null);
  };

  const handleTimeSlotClick = (formattedDate, hourNumber, isAvailable) => {
    if (isAvailable && onTimeSlotClick) {
      onTimeSlotClick(formattedDate, hourNumber);
    }
  };

  if (loadingWeeklyAvailability) {
    return <Spinner />;
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
      <div className="bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                <th className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-800 px-4 py-4 text-center w-48">
                  <div className="flex flex-col items-center gap-1">
                    <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Horario</span>
                  </div>
                </th>
                {daysOfWeek.map((day, index) => {
                  const currentDay = addDays(monday, index);
                  return (
                    <th key={day} className="px-2 py-4 text-center">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 dark:text-white">{day}</span>
                        <span className="text-xs text-slate-600 dark:text-slate-400">{format(currentDay, 'dd/MM')}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {hoursOfDay.map((hourRange, hourIndex) => {
                const startHour24 = hourIndex + 6;
                return (
                  <tr key={hourRange} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-800/95 px-4 py-3 border-r border-b border-slate-200 dark:border-slate-700/50">
                      <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {hourRange}
                      </span>
                    </td>
                    {daysOfWeek.map((day, dayIndex) => {
                      const now = new Date();
                      const currentDay = addDays(monday, dayIndex);
                      const hourNumber = startHour24;
                      const slotDateTime = new Date(currentDay);
                      slotDateTime.setHours(hourNumber, 0, 0, 0);

                      const isPast = slotDateTime < now;
                      const formattedDate = format(currentDay, 'yyyy-MM-dd');
                      const dailyAvailability = weeklyAvailability[formattedDate];
                      const isAvailable = dailyAvailability && dailyAvailability[hourNumber] === true;
                      const isOccupied = dailyAvailability && dailyAvailability[hourNumber] === false;
                      const isSelected = selectedSlot?.date === formattedDate && selectedSlot?.hour === hourNumber;

                      let slotStatus = 'default';
                      if (isPast) slotStatus = 'expired';
                      else if (isSelected) slotStatus = 'selected';
                      else if (isAvailable) slotStatus = 'available';
                      else if (isOccupied) slotStatus = 'occupied';

                      const isClickable = !isOccupied && !isPast;

                      const getSlotStyle = (status) => {
                        switch (status) {
                          case 'available': 
                            return 'bg-teal-400/50 hover:bg-teal-400/60 border-teal-500/70 dark:bg-teal-500/20 dark:hover:bg-teal-500/30 dark:border-teal-500/30';
                          case 'occupied': 
                            return 'bg-red-400/40 border-red-500/70 dark:bg-red-500/20 dark:border-red-500/40';
                          case 'expired': 
                            return 'bg-slate-200/60 border-slate-300/70 opacity-50 dark:bg-gray-500/10 dark:border-gray-600/20 dark:opacity-40';
                          case 'selected': 
                            return 'bg-blue-400/50 border-blue-500/80 ring-2 ring-blue-500 dark:bg-blue-500/30 dark:border-blue-500/50 dark:ring-2 dark:ring-blue-400';
                          default: 
                            return 'bg-slate-200/50 border-slate-300/60 dark:bg-gray-500/10 dark:border-gray-500/20';
                        }
                      };

                      return (
                        <td key={dayIndex} className="px-2 py-2">
                          <div
                            className={`relative w-full h-10 rounded-lg border-2 transition-all flex items-center justify-center ${getSlotStyle(slotStatus)} ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}`}
                            onClick={() => isClickable && handleTimeSlotClick(formattedDate, hourNumber, isAvailable)}
                            onMouseEnter={() => isClickable && handleMouseEnter(formattedDate, hourNumber, hourRange)}
                            onMouseLeave={handleMouseLeave}
                            title={isPast ? 'Horario pasado' : isOccupied ? 'Ocupado' : 'Disponible'}
                          >
                            {hoveredSlot && hoveredSlot.date === formattedDate && hoveredSlot.hour === hourNumber && isClickable && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white text-xs font-bold rounded-md z-10">
                                {hourRange}
                              </div>
                            )}
                            <div className="z-0">
                              {isPast ? <MinusCircle className="w-4 h-4 text-slate-500 dark:text-gray-500" /> :
                                isAvailable ? <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" /> :
                                  isOccupied ? <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" /> : null}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>     
    </>
  );
}

export default WeeklyAvailabilityCalendar;