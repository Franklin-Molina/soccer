import React from 'react';

import Spinner from '../../../components/common/Spinner.jsx';
import StatCards from '../../../components/Dashboard/overview/StatCards.jsx';
import DashboardOverviewHeader from '../../../components/Dashboard/overview/DashboardOverviewHeader.jsx';
import DashboardOverviewContent from '../../../components/Dashboard/overview/DashboardOverviewContent.jsx';
import DashboardOverviewFilterSection from '../../../components/Dashboard/overview/DashboardOverviewFilterSection.jsx';

import { useDashboardOverviewLogic } from '../../../hooks/dashboard/useDashboardOverviewLogic.js';

function DashboardOverviewPage() {
  const {
    userStats,
    bookingStats,
    courtsProps,
    bookingsProps,
    tournamentsProps,
    filterProps,
    headerProps,
    loading,
    activeTab,
  } = useDashboardOverviewLogic();

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-4 sm:px-6 py-4 sm:py-6">
      <div className="max-w-8xl mx-auto space-y-4 sm:space-y-6">
        <StatCards userStats={userStats} bookingStats={bookingStats} />

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <DashboardOverviewHeader {...headerProps} />

          <DashboardOverviewFilterSection {...filterProps} />

          <DashboardOverviewContent
            activeTab={activeTab}
            courtsProps={courtsProps}
            bookingsProps={bookingsProps}
            tournamentsProps={tournamentsProps}
          />
        </div>
      </div>
    </div>
  );
}

export default DashboardOverviewPage;
