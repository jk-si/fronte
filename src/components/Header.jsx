import { Bell, Search, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Header({ sidebarCollapsed, isMobile, onMobileMenuToggle, mobileSidebarOpen }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-40 bg-surface border-b border-border shadow-sm transition-all duration-300 ease-smooth',
        !isMobile && (sidebarCollapsed ? 'left-16' : 'left-64'),
        isMobile && 'left-0'
      )}
      id="mobile-header"
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Mobile Menu Button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileMenuToggle}
            className="lg:hidden hover:bg-muted"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileSidebarOpen}
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}

        {/* Search - Hidden on mobile for space */}
        {!isMobile && (
          <div className="flex-1 max-w-md">
            {/* <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search URLs, countries..."
                className="pl-10 bg-muted/50 border-0 focus:bg-surface"
              />
            </div> */}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              aria-label="Open profile menu"
            >
              <User className="w-5 h-5" />
            </Button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-lg shadow-lg z-50 py-2">
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-muted focus:bg-muted focus:outline-none"
                  onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                >
                  Profile
                </button>
                <div className="border-t my-1" />
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
} 