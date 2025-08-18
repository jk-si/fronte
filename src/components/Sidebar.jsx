import { useState, useEffect, forwardRef } from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Link, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  Globe,
  TrendingUp,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
  },
  {
    name: 'Manage Campaign',
    icon: BarChart3,
    href: '/manage-campaign',
  },
];

export const Sidebar = forwardRef(({ isCollapsed, onToggle, isMobile, isOpen }, ref) => {
  const location = useLocation();
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Touch gesture handling for mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleTouchStart = (e) => {
      setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > 50;
      const isRightSwipe = distance < -50;

      if (isLeftSwipe && isOpen) {
        onToggle(); // Close sidebar on left swipe
      } else if (isRightSwipe && !isOpen) {
        onToggle(); // Open sidebar on right swipe
      }

      setTouchStart(null);
      setTouchEnd(null);
    };

    const sidebar = document.getElementById('mobile-sidebar');
    if (sidebar) {
      sidebar.addEventListener('touchstart', handleTouchStart, { passive: true });
      sidebar.addEventListener('touchmove', handleTouchMove, { passive: true });
      sidebar.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      if (sidebar) {
        sidebar.removeEventListener('touchstart', handleTouchStart);
        sidebar.removeEventListener('touchmove', handleTouchMove);
        sidebar.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isMobile, isOpen, onToggle, touchStart, touchEnd]);

  // Mobile sidebar classes
  const mobileClasses = isMobile ? [
    'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out',
    'touch-pan-y', // Enable vertical touch scrolling
    'will-change-transform', // Optimize for animations
    isOpen ? 'translate-x-0' : '-translate-x-full'
  ] : [];

  // Desktop sidebar classes
  const desktopClasses = !isMobile ? [
    'fixed inset-y-0 left-0 z-50 flex flex-col bg-surface border-r border-border shadow-lg transition-all duration-300 ease-smooth',
    isCollapsed ? 'w-16' : 'w-64'
  ] : [];

  const sidebarClasses = cn(
    'flex flex-col bg-surface border-r border-border shadow-lg',
    ...mobileClasses,
    ...desktopClasses
  );

  return (
    <div 
      ref={ref}
      className={sidebarClasses} 
      id="mobile-sidebar"
      role="navigation"
      aria-label="Main navigation"
      aria-hidden={isMobile && !isOpen}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {(!isCollapsed || isMobile) && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Link className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">LinkForge</h1>
          </div>
        )}
        
        {/* Desktop Toggle Button */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="hover:bg-muted"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <Menu className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </Button>
        )}

        {/* Mobile Close Button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="hover:bg-muted"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto overscroll-contain">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <RouterLink
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              onClick={() => isMobile && onToggle()} // Close mobile sidebar on navigation
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0')} />
              {(!isCollapsed || isMobile) && (
                <span className="transition-opacity delay-1000">{item.name}</span>
              )}
            </RouterLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      {(!isCollapsed || isMobile) && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Admin User</p>
              <p className="text-xs text-muted-foreground truncate">admin@linkforge.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

Sidebar.displayName = 'Sidebar'; 