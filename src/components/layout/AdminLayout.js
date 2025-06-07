// src/components/layout/AdminLayout.js
import React from 'react';
import MainLayout from './MainLayout';
import { adminMenuItems } from '../../config/menuItems';

const AdminLayout = ({ children }) => {
  return (
    <MainLayout sidebarItems={adminMenuItems}>
      {children}
    </MainLayout>
  );
};

export default AdminLayout;