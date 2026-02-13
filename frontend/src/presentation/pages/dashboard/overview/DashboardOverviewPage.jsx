import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Plus, MapPin, Calendar } from 'lucide-react';

import Spinner from '../../../components/common/Spinner.jsx';
import FilterPanel from '../../../components/Dashboard/FilterPanel.jsx';
import StatCards from '../../../components/Dashboard/overview/StatCards.jsx';
import CourtsManagement from '../../../components/Dashboard/overview/CourtsManagement.jsx';
import BookingsManagement from '../../../components/Dashboard/overview/BookingsManagement.jsx';
import SystemStatus from '../../../components/Dashboard/overview/SystemStatus.jsx';

import { useManageCourtsLogic } from '../../../hooks/courts/useManageCourtsLogic.js';
import { useFetchBookings } from '../../../hooks/bookings/useFetchBookings.js';
import { useFetchAllCourts } from '../../../hooks/courts/useFetchAllCourts.js';
import { useAutoRefresh } from '../../../hooks/bookings/useAutoRefresh.js';
import useUserStats from '../../../hooks/users/useUserStats.js';
import useBookingStats from '../../../hooks/bookings/useBookingStats.js';
import { useBookingsRealtime } from '../../../hooks/bookings/useBookingsRealtime';
import { toast } from 'react-toastify';

function DashboardOverviewPage() {
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('canchas');

  // ───────────────────────────────────────────────
  //                HOOKS
  // ───────────────────────────────────────────────
  const {
    courts,
    loading: loadingCourts,
    error: errorCourts,
    handleModifyRequest,
    handleDeleteRequest,
    handleSuspendCourtClick,
    handleReactivateCourtClick,
    currentPage: courtsCurrentPage,
    setCurrentPage: setCourtsCurrentPage,
    totalPages: courtsTotalPages,
    itemsPerPage: courtsItemsPerPage,
    setItemsPerPage: setCourtsItemsPerPage,
    totalCourts,
    nameFilter: courtNameFilter,
    setNameFilter: setCourtNameFilter,
    statusFilter: courtStatusFilter,
    setStatusFilter: setCourtStatusFilter,
    clearFilters: clearCourtFilters,
    fetchAllCourts,
  } = useManageCourtsLogic();

  const {
    bookings,
    loading: loadingBookings,
    error: errorBookings,
    currentPage: bookingsCurrentPage,
    setCurrentPage: setBookingsCurrentPage,
    totalPages: bookingsTotalPages,
    deleteBooking,
    itemsPerPage,
    setItemsPerPage,
    totalBookings,
    searchFilter: bookingSearchFilter,
    setSearchFilter: setBookingSearchFilter,
    paymentStatusFilter: bookingPaymentStatusFilter,
    setPaymentStatusFilter: setBookingPaymentStatusFilter,
    selectedCourtFilter: bookingCourtFilter,
    setSelectedCourtFilter: setBookingCourtFilter,
    clearFilters: clearBookingFilters,
    fetchAllBookings,
  } = useFetchBookings({ onlyActive: true });

  const { courts: allCourts } = useFetchAllCourts();
  const { stats: userStats, fetchUserStats } = useUserStats();
  const { stats: bookingStats, fetchBookingStats } = useBookingStats();

  // Refrescar datos en tiempo real (las notificaciones se manejan en el componente Notification global)
  useBookingsRealtime(useCallback(() => {
    fetchAllBookings();
    if (fetchBookingStats) fetchBookingStats();
  }, [fetchAllBookings, fetchBookingStats]));

  const refreshData = useCallback(() => {
    activeTab === 'canchas' ? fetchAllCourts() : fetchAllBookings();
  }, [activeTab, fetchAllCourts, fetchAllBookings]);

  const { timeSinceLastUpdate } = useAutoRefresh(
    refreshData,
    100000,
    activeTab === 'canchas' ? courts : bookings
  );

  const paginatedCourts = useMemo(() => {
    const startIndex = (courtsCurrentPage - 1) * courtsItemsPerPage;
    return courts.slice(startIndex, startIndex + courtsItemsPerPage);
  }, [courts, courtsCurrentPage, courtsItemsPerPage]);

  const getRowNumber = useCallback((index) => {
    const currentPage = activeTab === 'canchas' ? courtsCurrentPage : bookingsCurrentPage;
    const currentItemsPerPage = activeTab === 'canchas' ? courtsItemsPerPage : itemsPerPage;
    return (currentPage - 1) * currentItemsPerPage + index + 1;
  }, [activeTab, courtsCurrentPage, bookingsCurrentPage, courtsItemsPerPage, itemsPerPage]);

  // ───────────────────────────────────────────────
  //                   FILTERS
  // ───────────────────────────────────────────────
  const courtFilters = [
    { id: 'name', label: 'Nombre', type: 'text', placeholder: 'Buscar por nombre…', value: courtNameFilter },
    { id: 'status', label: 'Estado', type: 'select', options: [
      { value: 'all', label: 'Todos' },
      { value: 'active', label: 'Activa' },
      { value: 'inactive', label: 'Inactiva' }
    ], value: courtStatusFilter },
  ];

  const courtOptions = [
    { value: 'all', label: 'Todas las canchas' },
    ...allCourts.map(c => ({ value: c.id, label: c.name })),
  ];

  const bookingFilters = [
    { id: 'search', label: 'Buscar', type: 'text', placeholder: 'Buscar por cancha o usuario…', value: bookingSearchFilter },
    { id: 'court', label: 'Cancha', type: 'select', options: courtOptions, value: bookingCourtFilter },
    { id: 'paymentStatus', label: 'Estado de Pago', type: 'select', options: [
      { value: 'all', label: 'Todos' },
      { value: 'pagado', label: 'Pagado' },
      { value: 'pendiente', label: 'Pendiente' },
    ], value: bookingPaymentStatusFilter },
  ];

  const handleFilterChange = (id, value) => {
    if (activeTab === 'canchas') {
      if (id === 'name') setCourtNameFilter(value);
      if (id === 'status') setCourtStatusFilter(value);
      setCourtsCurrentPage(1);
    } else {
      if (id === 'search') setBookingSearchFilter(value);
      if (id === 'court') setBookingCourtFilter(value);
      if (id === 'paymentStatus') setBookingPaymentStatusFilter(value);
      setBookingsCurrentPage(1);
    }
  };

  const activeFilterCount =
    activeTab === 'canchas'
      ? (courtNameFilter ? 1 : 0) + (courtStatusFilter !== 'all' ? 1 : 0)
      : (bookingSearchFilter ? 1 : 0) +
        (bookingPaymentStatusFilter !== 'all' ? 1 : 0) +
        (bookingCourtFilter !== 'all' ? 1 : 0);

  if (loadingCourts || loadingBookings) return <Spinner />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-4 sm:px-6 py-4 sm:py-6">
      
      <div className="max-w-8xl mx-auto space-y-4 sm:space-y-6">

        <SystemStatus timeSinceLastUpdate={timeSinceLastUpdate} />

        <StatCards
          userStats={userStats}
          bookingStats={bookingStats}
        />

        {/* ───────────────────────────────────────────── */}
        {/*                  CARD PRINCIPAL              */}
        {/* ───────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">

          {/* HEADER */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

              {/* Title */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {activeTab === 'canchas' ? 'Gestión de Canchas' : 'Gestión de Reservas'}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  {activeTab === 'canchas'
                    ? 'Administra y controla tus espacios deportivos'
                    : 'Administra y controla las reservas de tus canchas'}
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">

                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800
                             hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700
                             text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium w-full sm:w-auto"
                >
                  <Filter className="w-4 h-4" />
                  Filtros
                </button>

                <button
                  onClick={activeTab === 'canchas' ? () => navigate('/dashboard/canchas/create') : () => {}}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500
                             text-white rounded-lg text-sm font-semibold shadow-lg shadow-emerald-600/20 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  {activeTab === 'canchas' ? 'Nueva Cancha' : 'Nueva Reserva'}
                </button>

              </div>
            </div>

            {/* TABS responsive: scroll en móvil */}
            <div className="mt-6 overflow-x-auto scrollbar-hide">
              <div className="flex w-max bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-lg">

                <button
                  onClick={() => setActiveTab('canchas')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold transition-all ${
                    activeTab === 'canchas'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  Canchas
                </button>

                <button
                  onClick={() => setActiveTab('reservas')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold transition-all ${
                    activeTab === 'reservas'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Reservas
                </button>

              </div>
            </div>

          </div>

          {/* FILTER PANEL */}
          <FilterPanel
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            filters={activeTab === 'canchas' ? courtFilters : bookingFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={activeTab === 'canchas' ? clearCourtFilters : clearBookingFilters}
            activeFilterCount={activeFilterCount}
          />

          {/* CONTENT */}
          <div className="overflow-x-auto px-2 sm:px-4 py-4">
            {activeTab === 'canchas' ? (
              <CourtsManagement
                courts={paginatedCourts}
                handleModifyRequest={handleModifyRequest}
                handleDeleteRequest={handleDeleteRequest}
                handleSuspendCourtClick={handleSuspendCourtClick}
                handleReactivateCourtClick={handleReactivateCourtClick}
                courtsCurrentPage={courtsCurrentPage}
                setCourtsCurrentPage={setCourtsCurrentPage}
                courtsTotalPages={courtsTotalPages}
                courtsItemsPerPage={courtsItemsPerPage}
                setCourtsItemsPerPage={setCourtsItemsPerPage}
                totalCourts={totalCourts}
                getRowNumber={getRowNumber}
              />
            ) : (
              <BookingsManagement
                bookings={bookings}
                deleteBooking={deleteBooking}
                bookingsCurrentPage={bookingsCurrentPage}
                bookingsTotalPages={bookingsTotalPages}
                setBookingsCurrentPage={setBookingsCurrentPage}
                itemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
                totalBookings={totalBookings}
                getRowNumber={getRowNumber}
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default DashboardOverviewPage;
