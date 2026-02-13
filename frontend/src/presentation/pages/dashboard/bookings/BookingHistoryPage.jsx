import React, { useState, useMemo, useCallback } from 'react';
import Spinner from '../../../components/common/Spinner';
import BookingTable from '../../../components/Bookings/BookingTable';
import { useFetchBookings } from '../../../hooks/bookings/useFetchBookings';
import CustomSelect from '../../../components/common/CustomSelect';

function BookingHistoryPage() {
  const [selectedYear, setSelectedYear] = useState(-1); // -1 para todos los años
  const [selectedMonth, setSelectedMonth] = useState(-1); // -1 para todos los meses
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 para todas las semanas

  const yearOptions = useMemo(() => [
    { value: -1, label: 'Todos los Años' },
    ...[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map(year => ({ value: year, label: String(year) }))
  ], []);

  const monthOptions = useMemo(() => [
    { value: -1, label: 'Todos los Meses' },
    ...[
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ].map((month, index) => ({ value: index, label: month }))
  ], []);

  const weekOptions = useMemo(() => [
    { value: 0, label: 'Todo el Mes' },
    { value: 1, label: 'Semana 1' },
    { value: 2, label: 'Semana 2' },
    { value: 3, label: 'Semana 3' },
    { value: 4, label: 'Semana 4' },
    { value: 5, label: 'Semana 5' }
  ], []);

  const {
    bookings,
    loading,
    error,
    currentPage,
    setCurrentPage,
    deleteBooking,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    totalBookings,
  } = useFetchBookings({
    onlyFinished: true,
    initialItemsPerPage: 10,
    year: selectedYear,
    month: selectedMonth,
    week: selectedWeek,
  });

  const getRowNumber = useCallback((index) => {
    return (currentPage - 1) * itemsPerPage + index + 1;
  }, [currentPage, itemsPerPage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-400">
        Error al cargar el historial de reservas: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Historial de Reservas
        </h1>
        <div className="flex items-center space-x-3 w-3/5">
          <div className="w-1/3">
            <CustomSelect
              options={yearOptions}
              value={selectedYear}
              onChange={(value) => {
                setSelectedYear(value);
                if (value === -1) {
                  setSelectedMonth(-1);
                  setSelectedWeek(0);
                }
              }}
            />
          </div>
          <div className={`w-1/3 ${selectedYear === -1 ? 'opacity-50 pointer-events-none' : ''}`}>
            <CustomSelect
              options={monthOptions}
              value={selectedMonth}
              onChange={(value) => {
                setSelectedMonth(value);
                if (value === -1) {
                  setSelectedWeek(0);
                }
              }}
            />
          </div>
          <div className={`w-1/3 ${selectedMonth === -1 ? 'opacity-50 pointer-events-none' : ''}`}>
            <CustomSelect
              options={weekOptions}
              value={selectedWeek}
              onChange={setSelectedWeek}
            />
          </div>
        </div>
      </div>

      {totalBookings === 0 ? (
        <div className="text-center text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          No hay reservas finalizadas en el historial.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">
              Reservas Finalizadas
            </h2>
          </div>
          <BookingTable
            bookings={bookings} // Usar directamente las reservas paginadas del hook
            currentPage={currentPage}
            totalPages={totalPages} // Usar totalPages del hook
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            totalBookings={totalBookings} // Usar totalBookings del hook
            deleteBooking={deleteBooking}
            getRowNumber={getRowNumber}
          />
        </div>
      )}
    </div>
  );
}

export default BookingHistoryPage;
