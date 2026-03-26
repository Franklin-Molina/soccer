import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useManageCourtsLogic } from '../courts/useManageCourtsLogic.js';
import { useFetchBookings } from '../bookings/useFetchBookings.js';
import { useFetchAllCourts } from '../courts/useFetchAllCourts.js';
import useUserStats from '../users/useUserStats.js';
import useBookingStats from '../bookings/useBookingStats.js';
import { useBookingsRealtime } from '../bookings/useBookingsRealtime';
import { useManageTournaments } from '../tournaments/useManageTournaments.js';

export const useDashboardOverviewLogic = () => {
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('canchas');

  // ───────────────────────────────────────────────
  //                HOOKS
  // ───────────────────────────────────────────────
  const {
    courts,
    loading: loadingCourts,
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

  const {
    tournaments,
    loading: loadingTournaments,
    handleDelete: handleDeleteTournament,
    handleGenerateFixture,
  } = useManageTournaments();

  // Refrescar datos en tiempo real
  useBookingsRealtime(useCallback(() => {
    fetchAllBookings();
    if (fetchBookingStats) fetchBookingStats();
  }, [fetchAllBookings, fetchBookingStats]));

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
  const courtFilters = useMemo(() => [
    { id: 'name', label: 'Nombre', type: 'text', placeholder: 'Buscar por nombre…', value: courtNameFilter },
    { id: 'status', label: 'Estado', type: 'select', options: [
      { value: 'all', label: 'Todos' },
      { value: 'active', label: 'Activa' },
      { value: 'inactive', label: 'Inactiva' }
    ], value: courtStatusFilter },
  ], [courtNameFilter, courtStatusFilter]);

  const courtOptions = useMemo(() => [
    { value: 'all', label: 'Todas las canchas' },
    ...allCourts.map(c => ({ value: c.id, label: c.name })),
  ], [allCourts]);

  const bookingFilters = useMemo(() => [
    { id: 'search', label: 'Buscar', type: 'text', placeholder: 'Buscar por cancha o usuario…', value: bookingSearchFilter },
    { id: 'court', label: 'Cancha', type: 'select', options: courtOptions, value: bookingCourtFilter },
    { id: 'paymentStatus', label: 'Estado de Pago', type: 'select', options: [
      { value: 'all', label: 'Todos' },
      { value: 'pagado', label: 'Pagado' },
      { value: 'pendiente', label: 'Pendiente' },
    ], value: bookingPaymentStatusFilter },
  ], [bookingSearchFilter, courtOptions, bookingCourtFilter, bookingPaymentStatusFilter]);

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

  const activeFilterCount = useMemo(() => 
    activeTab === 'canchas'
      ? (courtNameFilter ? 1 : 0) + (courtStatusFilter !== 'all' ? 1 : 0)
      : activeTab === 'reservas'
        ? (bookingSearchFilter ? 1 : 0) +
          (bookingPaymentStatusFilter !== 'all' ? 1 : 0) +
          (bookingCourtFilter !== 'all' ? 1 : 0)
        : 0,
    [activeTab, courtNameFilter, courtStatusFilter, bookingSearchFilter, bookingPaymentStatusFilter, bookingCourtFilter]
  );

  const loading = loadingCourts || loadingBookings || loadingTournaments;

  const courtsProps = {
    courts: paginatedCourts,
    handleModifyRequest,
    handleDeleteRequest,
    handleSuspendCourtClick,
    handleReactivateCourtClick,
    courtsCurrentPage,
    setCourtsCurrentPage,
    courtsTotalPages,
    courtsItemsPerPage,
    setCourtsItemsPerPage,
    totalCourts,
    getRowNumber,
  };

  const bookingsProps = {
    bookings,
    deleteBooking,
    bookingsCurrentPage,
    bookingsTotalPages,
    setBookingsCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalBookings,
    getRowNumber,
  };

  const tournamentsProps = {
    tournaments,
    loading: loadingTournaments,
    onDelete: handleDeleteTournament,
    onGenerateFixture: handleGenerateFixture,
  };

  const filterProps = {
    activeTab,
    isFilterOpen,
    setIsFilterOpen,
    courtFilters,
    bookingFilters,
    handleFilterChange,
    clearCourtFilters,
    clearBookingFilters,
    activeFilterCount,
  };

  const headerProps = {
    activeTab,
    setActiveTab,
    isFilterOpen,
    setIsFilterOpen,
    navigate,
  };

  return {
    userStats,
    bookingStats,
    courtsProps,
    bookingsProps,
    tournamentsProps,
    filterProps,
    headerProps,
    loading,
    activeTab,
  };
};
