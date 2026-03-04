import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../common/Header';

const DashboardLayout = ({ children }) => {
  return (
    <Header>
      {children || <Outlet />}
    </Header>
  );
};

export default DashboardLayout;
