// src/components/layout/UserLayout.js
import React from 'react';
import MainLayout from './MainLayout';
import { userMenuItems } from '../../config/menuItems';

const UserLayout = ({ children }) => {
  return (
    <MainLayout sidebarItems={userMenuItems}>
      {children}
    </MainLayout>
  );
};

export default UserLayout;