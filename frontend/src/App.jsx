import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RepositoryProvider } from './presentation/context/RepositoryContext.jsx';
import { UseCaseProvider } from './presentation/context/UseCaseContext.jsx';
import { NotificationProvider, useNotification } from './presentation/context/NotificationContext.jsx';
import Notification from './presentation/components/common/Notification.jsx';
import HomePage from './presentation/pages/general/HomePage.jsx'; 
import RegisterForm from './presentation/components/Auth/RegisterForm.jsx';
import ForgotPassword from './presentation/components/Auth/ForgotPassword.jsx';
import ResetPasswordConfirm from './presentation/components/Auth/ResetPasswordConfirm.jsx';
import ActivateAccount from './presentation/components/Auth/ActivateAccount.jsx';
import BookingPage from './presentation/pages/bookings/BookingPage.jsx'; 
import ProtectedRoute from './presentation/components/Auth/ProtectedRoute.jsx';
import AuthPage from './presentation/components/Auth/AuthPage.jsx';
import AdminRegisterPage from './presentation/components/Auth/AdminRegisterPage.jsx';
import Layout from './presentation/components/common/Layout.jsx';
import DashboardLayout from './presentation/components/Dashboard/DashboardLayout.jsx';
import DashboardOverviewPage from './presentation/pages/dashboard/overview/DashboardOverviewPage.jsx'; 
import DashboardCourtsPage from './presentation/pages/dashboard/courts/DashboardCourtsPage.jsx'; 
import DashboardManageCourtsPage from './presentation/pages/dashboard/courts/DashboardManageCourtsPage.jsx'; 
import CourtDetailPage from './presentation/pages/courts/CourtDetailPage.jsx'; 
import DashboardBookingsPage from './presentation/pages/dashboard/bookings/DashboardBookingsPage.jsx'; 
import BookingHistoryPage from './presentation/pages/dashboard/bookings/BookingHistoryPage.jsx'; 
import DashboardProfilePage from './presentation/pages/dashboard/users/DashboardProfilePage.jsx'; 
import DashboardUsersPage from './presentation/pages/dashboard/users/DashboardUsersPage.jsx'; 
import DashboardModifyCourtPage from './presentation/pages/dashboard/courts/DashboardModifyCourtPage.jsx'; 
import AdminGlobalDashboardPage from './presentation/pages/dashboard/admin/AdminGlobalDashboardPage.jsx'; 
import ManageAdminsTable from './presentation/components/AdminGlobalDashboard/ManageAdminsTable.jsx';
import CategoryManagement from './presentation/components/Courts/CategoryManagement.jsx'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ClientDashboardLayout from './presentation/components/Dashboard/ClientDashboardLayout.jsx';
import MyBookingsPage from './presentation/pages/bookings/MyBookingsPage.jsx'; 
import OpenMatchesPage from './presentation/pages/Matches/OpenMatchesPage.jsx';
import { AuthProvider, useAuth } from './presentation/context/AuthContext.jsx'; 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Spinner from './presentation/components/common/Spinner.jsx'; 
import NotFound from './presentation/components/common/NotFound.jsx'; 
import ServerErrorFallback from './presentation/components/common/ServerErrorFallback.jsx'; 

import TournamentsPage from './presentation/pages/Tournaments/TournamentsPage.jsx'
import TournamentDetailPage from './presentation/pages/Tournaments/TournamentDetailPage.jsx'

// 🔥 1. AGREGAMOS LAS IMPORTACIONES DEL DASHBOARD DE TORNEOS AQUÍ
import DashboardManageTournamentsPage from './presentation/pages/Tournaments/DashboardManageTournamentsPage.jsx';
import DashboardTournamentFormPage from './presentation/pages/Tournaments/DashboardTournamentFormPage.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos de caché por defecto
      gcTime: 10 * 60 * 1000, // 10 minutos de recolección de basura
      refetchOnWindowFocus: false, // Desactivar refetch al enfocar la ventana para evitar parpadeos
    },
  },
});

function App() {
  const [isServerDown, setIsServerDown] = useState(false);

  useEffect(() => {
    const handleServerDown = () => {
      setIsServerDown(true);
    };

    window.addEventListener('server-down', handleServerDown);

    return () => {
      window.removeEventListener('server-down', handleServerDown);
    };
  }, []);

  if (isServerDown) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <ServerErrorFallback 
          title="Sin conexión al servidor"
          message="El backend está apagado o no responde. Si estás en modo local, asegúrate de correr 'python manage.py runserver'."
          onRetry={() => {
            setIsServerDown(false);
            window.location.reload(); 
          }} 
        />
      </div>
    );
  }
  return (
    <QueryClientProvider client={queryClient}>
      <RepositoryProvider>
        <UseCaseProvider>
          <AuthProvider>
            <NotificationProvider>
              <GlobalNotificationHandler />
              <AuthContent />
            </NotificationProvider>
          </AuthProvider>
        </UseCaseProvider>
        <ToastContainer position="top-right" autoClose={1500} />
      </RepositoryProvider>
    </QueryClientProvider>
  );
}

function GlobalNotificationHandler() {
  const { notification } = useNotification();
  return <Notification message={notification} />;
}

function AuthContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Spinner />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverviewPage />} />
        <Route path="canchas/manage" element={<DashboardManageCourtsPage />} />
        <Route path="canchas/create" element={<DashboardCourtsPage />} />
        <Route path="canchas/categories" element={<CategoryManagement />} />
        <Route path="reservas" element={<DashboardBookingsPage />} />
        <Route path="reservas/historial" element={<BookingHistoryPage />} />
        <Route path="usuarios" element={<DashboardUsersPage />} />
        <Route path="perfil" element={<DashboardProfilePage />} /> 
        <Route path="manage-courts/:id" element={<DashboardModifyCourtPage />} />   
        <Route path="tournaments" element={<DashboardManageTournamentsPage />} />
        <Route path="tournaments/new" element={<DashboardTournamentFormPage />} /> 
        <Route path="tournaments/edit/:id" element={<DashboardTournamentFormPage />} />

      </Route>

      <Route
        path="/client"
        element={
          <ProtectedRoute>
            <ClientDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MyBookingsPage />} />
        <Route path="bookings" element={<MyBookingsPage />} />
        <Route path="history" element={<BookingHistoryPage />} />
        <Route path="matches" element={<OpenMatchesPage />} />
        <Route path="profile" element={<DashboardProfilePage />} />
      </Route>

      <Route
        path="/"
        element={
          <Layout>
            <HomePage />
          </Layout>
        }
      />

      {/* RUTAS PÚBLICAS DE TORNEOS */}
      <Route
        path="/tournaments"
        element={
          <Layout>
            <TournamentsPage />          
          </Layout>
        }
      />
      <Route
        path="/tournaments/:id" 
        element={
          <Layout>
            <TournamentDetailPage />
          </Layout>
        }
      />

      <Route
        path="/register"
        element={
          <Layout>
            <RegisterForm userRole="cliente" />
          </Layout>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <Layout>
            <ForgotPassword />
          </Layout>
        }
      />
      <Route
        path="/password/reset/confirm/:uid/:token"
        element={
          <Layout>
            <ResetPasswordConfirm />
          </Layout>
        }
      />
      <Route
        path="/activate/:uid/:token"
        element={
          <Layout>
            <ActivateAccount />
          </Layout>
        }
      />
      <Route
        path="/courts/:courtId"
        element={
          <Layout>
            <CourtDetailPage />
          </Layout>
        }
      />
      <Route
        path="/booking/:courtId"
        element={
          <ProtectedRoute>
            <Layout>
              <BookingPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />         
      <Route
        path="/adminglobal"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path=""
          element={<AdminGlobalDashboardPage />}
        >
          <Route index element={<ManageAdminsTable />} />
          <Route path="manage-admins" element={<ManageAdminsTable />} />
          <Route path="register-admin" element={<AdminRegisterPage />} />
        </Route>
        <Route path="profile" element={<DashboardProfilePage />} />       
      </Route>

      {/* Ruta catch-all para 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;