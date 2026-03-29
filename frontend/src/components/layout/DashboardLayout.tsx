import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const DashboardLayout = () => {
  const { isAuthenticated } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!mobile) {
        setMobileMenuOpen(false); // auto close on desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ✅ SINGLE Sidebar (handles both desktop + mobile) */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={isMobile ? mobileMenuOpen : false}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main Content */}
      <div
        className={`min-h-screen flex flex-col ${
          !isMobile ? (sidebarCollapsed ? 'ml-20' : 'ml-[280px]') : ''
        }`}
      >
        <TopBar
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          setMobileSidebarOpen={setMobileMenuOpen}
        />

        <main className="flex-1 bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;