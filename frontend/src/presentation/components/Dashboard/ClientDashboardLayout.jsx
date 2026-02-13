import React from "react";
import { Outlet } from "react-router-dom";
import DashboardLayout from "./DashboardLayout.jsx";

const ClientDashboardLayout = () => {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default ClientDashboardLayout;
