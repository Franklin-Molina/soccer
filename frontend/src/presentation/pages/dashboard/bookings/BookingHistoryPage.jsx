import React, { useState, useMemo, useCallback } from 'react';
import Spinner from '../../../components/common/Spinner';
import BookingTable from '../../../components/Bookings/BookingTable';
import { useFetchBookings } from '../../../hooks/bookings/useFetchBookings';
import CustomSelect from '../../../components/common/CustomSelect';
import { Filter } from 'lucide-react';

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
      <div className="flex justify-center items-center min-h-[400px]">
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Historial de Reservas
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestiona y revisa tus reservas pasadas
          </p>
        </div>
        
        <div className="w-full lg:w-auto bg-white dark:bg-gray-900/50 p-3 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* <div className="hidden sm:flex  items-center gap-2 text-gray-500 dark:text-gray-400 mr-2">
              <Filter size={18} />
              <span className="text-xs font-medium uppercase tracking-wider whitespace-nowrap">Filtrar:</span>
            </div> */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
              <div className="min-w-[140px]">
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
              <div className={`min-w-[140px] ${selectedYear === -1 ? 'opacity-50 pointer-events-none' : ''}`}>
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
              <div className={`min-w-[140px] ${selectedMonth === -1 ? 'opacity-50 pointer-events-none' : ''}`}>
                <CustomSelect
                  options={weekOptions}
                  value={selectedWeek}
                  onChange={setSelectedWeek}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {totalBookings === 0 ? (
        <div className="text-center py-16 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="max-w-xs mx-auto">
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              No hay reservas finalizadas en el historial.
            </p>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
              Las reservas completadas aparecerán aquí una vez que finalicen.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-all">
          <div className="px-4 py-4 sm:px-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Reservas Finalizadas
            </h2>
            <span className="inline-flex items-center bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-medium w-fit">
              {totalBookings} {totalBookings === 1 ? 'reserva' : 'reservas'}
            </span>
          </div>
          <div className="p-0 sm:p-2">
            <BookingTable
              bookings={bookings}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              totalBookings={totalBookings}
              deleteBooking={deleteBooking}
              getRowNumber={getRowNumber}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingHistoryPage;
