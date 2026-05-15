import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileMenu from './MobileMenu';

const DashboardLayout = () => {
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const marginLeft = !isMobile ? (sidebarCollapsed ? 'ml-20' : 'ml-[280px]') : 'ml-0';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      )}
      
      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      {/* Main Content */}
      <div className={`min-h-screen flex flex-col transition-all duration-300 ${marginLeft}`}>
        <TopBar 
          onMenuClick={() => setMobileMenuOpen(true)}
          isMobile={isMobile}
        />
        <main className="flex-1 bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
