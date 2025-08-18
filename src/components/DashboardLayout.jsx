import { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const mobileSidebarRef = useRef(null);

  // Handle sidebar toggle for desktop
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Handle mobile sidebar open/close
  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  // Close mobile sidebar when screen size changes
  useEffect(() => {
    if (!isMobile) {
      setMobileSidebarOpen(false);
    }
  }, [isMobile]);

  // Body scroll locking when mobile sidebar is open
  useEffect(() => {
    if (isMobile && mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, mobileSidebarOpen]);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && mobileSidebarOpen) {
        const sidebar = document.getElementById('mobile-sidebar');
        const header = document.getElementById('mobile-header');
        if (sidebar && !sidebar.contains(event.target) && 
            header && !header.contains(event.target)) {
          setMobileSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, mobileSidebarOpen]);

  // Handle escape key to close mobile sidebar
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isMobile && mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobile, mobileSidebarOpen]);

  // Focus management for mobile sidebar
  useEffect(() => {
    if (isMobile && mobileSidebarOpen && mobileSidebarRef.current) {
      // Focus the first focusable element in the sidebar
      const firstFocusable = mobileSidebarRef.current.querySelector('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }, [isMobile, mobileSidebarOpen]);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={toggleSidebar}
          isMobile={false}
        />
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && (
        <Sidebar 
          ref={mobileSidebarRef}
          isCollapsed={false}
          onToggle={toggleMobileSidebar}
          isMobile={true}
          isOpen={mobileSidebarOpen}
        />
      )}

      {/* Header */}
      <Header 
        sidebarCollapsed={sidebarCollapsed} 
        isMobile={isMobile}
        onMobileMenuToggle={toggleMobileSidebar}
        mobileSidebarOpen={mobileSidebarOpen}
      />

      {/* Main Content */}
      <main
        className={cn(
          'transition-all duration-300 ease-smooth pt-20 pb-8',
          !isMobile && (sidebarCollapsed ? 'ml-16' : 'ml-64'),
          isMobile && 'ml-0'
        )}
      >
        <div className="px-6 space-y-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Sidebar Backdrop */}
      {isMobile && mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default DashboardLayout;