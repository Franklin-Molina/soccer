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

  if (loadingWeeklyAvailability) return <Spinner />;

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

// 1. GENERAR TODOS LOS DÍAS (Sin filtrar los pasados)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allDays = daysOfWeek.map((dayName, index) => {
    const date = addDays(monday, index);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    return {
      dayName,
      date,
      originalIndex: index,
      isValid: dateOnly >= today // Sigue sabiendo si es pasado o no
    };
  }); // <-- ¡Le quitamos el .filter() de aquí!

  return (
    <>
      <div className="bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm">
        {/* pb-2 añadido para que la barra de scroll nativa no corte el contenido */}
        <div className="overflow-x-auto ">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                {/* 1. HORARIO: Redujimos el ancho drásticamente (w-20 en móvil) y añadimos sombra lateral */}
                <th className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-800 px-2 py-3 sm:py-4 text-center w-24 min-w-[4rem] sm:w-32 shadow-[4px_0_8px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_8px_rgba(0,0,0,0.2)]">
                  <div className="flex flex-col items-center gap-1">
                    <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-[10px] sm:text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Hora</span>
                  </div>
                </th>
                
                {allDays.map((col) => {
                  return (
                    <th key={col.dayName} className={`px-2 py-4 text-center min-w-[80px] sm:min-w-[100px]   ${!col.isValid ? 'hidden lg:table-cell opacity-60' : ''}`}>
                      <div className="flex flex-col">
                        <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-white capitalize">{col.dayName}</span>
                        <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">{format(col.date, 'dd/MM')}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {hoursOfDay.map((hourRange, hourIndex) => {
                const startHour24 = hourIndex + 6;
                
                // 1. SEPARAMOS LA HORA DE INICIO Y FIN EXACTAMENTE POR EL GUION
                // Si hourRange es "6:00 AM - 7:00 AM", startTime="6:00 AM" y endTime="7:00 AM"
                const [startTime, endTime] = hourRange.split(' - ');

                return (
                  <tr key={hourRange} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors group">
                    
                    {/* CELDA DE HORA FIJA (Responsive) */}
                    <td className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-800/95 border-r border-b border-slate-200 dark:border-slate-700/50 w-20 min-w-[80px] sm:w-24 shadow-[4px_0_8px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_8px_rgba(0,0,0,0.1)]">
                      {/* Usamos flex-col SIEMPRE, sin condicionales sm: */}
                      <div className="flex flex-col items-center justify-center py-2 px-1 gap-0.5">
                        
                        {/* HORA DE INICIO */}
                        <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          {startTime}
                        </span>
                        
                        {/* HORA DE FIN (Un poco más tenue para dar jerarquía) */}
                        <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {endTime}
                        </span>
                        
                      </div>
                    </td>
                    
                    {/* ... EL RESTO DE TU CÓDIGO (El map de los días) ... */}
                    
                    {allDays.map((col) => {
                      const now = new Date();
                      const currentDay = col.date;
                      const dayIndex = col.originalIndex;
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

                      // 3. ESTILOS DE CELDA: Cambiamos border-2 por border normal y ajustamos colores para menos ruido
                      const getSlotStyle = (status) => {
                        switch (status) {
                          case 'available': 
                            return 'bg-teal-50 dark:bg-teal-500/10 hover:bg-teal-100 dark:hover:bg-teal-500/20 border-teal-200 dark:border-teal-500/30 text-teal-600 dark:text-teal-400 shadow-sm';
                          case 'occupied': 
                            return 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-500 dark:text-rose-400';
                          case 'expired': 
                            return 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-700/50 text-slate-400 dark:text-slate-600 opacity-60';
                          case 'selected': 
                            return 'bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-500 dark:border-emerald-400 shadow-md transform scale-105';
                          default: 
                            return 'bg-transparent border-transparent';
                        }
                      };

                  return (
                        <td key={dayIndex} className={`px-2 py-1.5 ${!col.isValid ? 'hidden lg:table-cell' : ''}`}>
                          <div
                            className={`relative w-full h-10 rounded-lg border transition-all duration-300 flex items-center justify-center ${getSlotStyle(slotStatus)} ${isClickable ? 'cursor-pointer hover:-translate-y-0.5 active:translate-y-0' : 'cursor-not-allowed'}`}
                            onClick={() => isClickable && handleTimeSlotClick(formattedDate, hourNumber, isAvailable)}
                            onMouseEnter={() => isClickable && handleMouseEnter(formattedDate, hourNumber, hourRange)}
                            onMouseLeave={handleMouseLeave}
                          >
                            <div className="flex items-center justify-center">
                              {isPast ? <MinusCircle className="w-4 h-4" /> :
                                isAvailable ? <CheckCircle className="w-4 h-4" /> :
                                  isOccupied ? <XCircle className="w-4 h-4" /> : null}
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