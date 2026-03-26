import React from 'react';
import FilterPanel from '../FilterPanel.jsx';

const DashboardOverviewFilterSection = ({
  activeTab,
  isFilterOpen,
  setIsFilterOpen,
  courtFilters,
  bookingFilters,
  handleFilterChange,
  clearCourtFilters,
  clearBookingFilters,
  activeFilterCount,
}) => {
  if (activeTab === 'torneos') return null;

  return (
    <FilterPanel
      isOpen={isFilterOpen}
      onClose={() => setIsFilterOpen(false)}
      filters={activeTab === 'canchas' ? courtFilters : bookingFilters}
      onFilterChange={handleFilterChange}
      onClearFilters={activeTab === 'canchas' ? clearCourtFilters : clearBookingFilters}
      activeFilterCount={activeFilterCount}
    />
  );
};

export default DashboardOverviewFilterSection;
