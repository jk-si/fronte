import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { URLGenerator } from '@/components/URLGenerator';
import { URLTable } from '@/components/URLTable';
import { cn } from '@/lib/utils';

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-background">

      <main
        className={cn(
          '',
        )}
      >
        <div className="px-6 space-y-8">
          {/* Dashboard Overview */}
          <Dashboard />
          
          {/* URL Generator */}
          {/* <URLGenerator /> */}
          
          {/* URL Management Table */}
          {/* <URLTable /> */}
        </div>
      </main>
    </div>
  );
};

export default Index; 