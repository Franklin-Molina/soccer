import React, { useMemo, useCallback } from 'react';
import Spinner from '../../../components/common/Spinner';
import BookingTable from '../../../components/Bookings/BookingTable';
import { useFetchBookings } from '../../../hooks/bookings/useFetchBookings';
import { useAutoRefresh } from '../../../hooks/bookings/useAutoRefresh';

function DashboardBookingsPage() {
  const {
    bookings,
    loading,
    error,
    currentPage,
    totalPages,
    totalBookings,
    setCurrentPage,
    deleteBooking,
    itemsPerPage,
    setItemsPerPage,
    fetchAllBookings,
  } = useFetchBookings({ onlyActive: true, initialItemsPerPage: 10 });

 

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
        Error al cargar reservas: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Gestión de Reservas
        </h1>
        <div className="flex items-center gap-4 bg-green-500/10 border border-green-500/30 px-5 py-3 rounded-lg">
          <div className="relative">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
          </div>
          <div>
            <div className="text-green-500 font-medium text-sm">Sistema Activo</div>
            <div className="text-xs text-gray-400">
           
            </div>
          </div>
        </div>
      </div>

      {totalBookings === 0 ? (
        <div className="text-center text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          No hay reservas activas.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">
              Reservas Activas
            </h2>
          </div>
          <BookingTable
            bookings={bookings} // Usamos directamente las reservas que ya vienen paginadas
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            totalBookings={totalBookings} // Usamos el total de reservas filtradas del hook
            deleteBooking={deleteBooking}
            getRowNumber={getRowNumber}
          />
        </div>
      )}
    </div>
  );
}

export default DashboardBookingsPage;
