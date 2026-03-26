import React from 'react';
import CourtsManagement from './CourtsManagement.jsx';
import BookingsManagement from './BookingsManagement.jsx';
import TournamentsManagement from './TournamentsManagement.jsx';

const DashboardOverviewContent = ({
  activeTab,
  courtsProps,
  bookingsProps,
  tournamentsProps,
}) => {
  return (
    <div className="overflow-x-auto px-2 sm:px-4 py-4">
      {activeTab === 'canchas' && <CourtsManagement {...courtsProps} />}
      {activeTab === 'reservas' && <BookingsManagement {...bookingsProps} />}
      {activeTab === 'torneos' && <TournamentsManagement {...tournamentsProps} />}
    </div>
  );
};

export default DashboardOverviewContent;
