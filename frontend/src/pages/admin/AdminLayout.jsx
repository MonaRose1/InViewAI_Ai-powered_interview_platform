import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import TopHeader from '../../components/TopHeader';
import Breadcrumbs from '../../components/common/Breadcrumbs';

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-textPrimary">
      <div className="flex-1 ml-64 flex flex-col">
        <TopHeader />
        <div className="p-8 flex-1 overflow-y-auto">
          <Breadcrumbs />
          <Outlet />
        </div>
      </div>
      <Sidebar role="admin" />
    </div>
  );
};

export default AdminLayout;
