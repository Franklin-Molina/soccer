import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useAdminDashboard } from '../../../hooks/dashboard/useAdminDashboard';
import Spinner from '../../../components/common/Spinner';
function AdminGlobalDashboardPage() {
  const { user } = useAuth();
  const dashboardData = useAdminDashboard();

  if (dashboardData.loading) {
    return <Spinner />;
  }

  if (dashboardData.error) {
    return <div style={{ color: 'red' }}>Error al cargar administradores: {dashboardData.error.message}</div>;
  }

  if (!user || user.role !== 'adminglobal') {
    return <div>Acceso denegado. Debes ser Administrador Global para ver esta página.</div>;
  }

  return (
    <>
      {dashboardData.suspendSuccess && (
        <div className="mb-4 p-4 text-green-700 bg-green-100 border border-green-400 rounded-lg">
          {dashboardData.suspendSuccess}
        </div>
      )}
      <Outlet context={dashboardData} />
    </>
  );
}

export default AdminGlobalDashboardPage;
