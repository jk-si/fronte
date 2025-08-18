import { useState, useEffect } from 'react';
import { TrendingUp, Link, Globe, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

console.log(API_BASE ,"API_BASEAPI_BASEAPI_BASEAPI_BASE")
export function Dashboard() {
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    inactiveCampaigns: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch dashboard stats: ${res.status}`);
        }
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        // Set default values on error
        setStats({
          totalCampaigns: 0,
          activeCampaigns: 0,
          inactiveCampaigns: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const dashboardStats = [
    {
      title: 'Total Campaigns',
      value: loading ? '...' : stats.totalCampaigns.toLocaleString(),
      change: '',
      changeType: 'neutral',
      icon: Link,
    },
    {
      title: 'Active Campaigns',
      value: loading ? '...' : stats.activeCampaigns.toLocaleString(),
      change: '',
      changeType: 'positive',
      icon: Globe,
    },
    {
      title: 'Inactive Campaigns',
      value: loading ? '...' : stats.inactiveCampaigns.toLocaleString(),
      change: '',
      changeType: 'neutral',
      icon: TrendingUp,
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-primary rounded-lg p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold mb-2">Welcome back, Admin!</h1>
        <p className="text-primary-foreground/80">
          Manage your affiliate URLs and track performance across different countries.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="shadow-md border-0 bg-gradient-card hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                {stat.change && (
                  <p className={`text-xs ${
                    stat.changeType === 'positive' 
                      ? 'text-success' 
                      : stat.changeType === 'negative'
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                  }`}>
                    {stat.change}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      {/* <Card className="shadow-lg border-0 bg-gradient-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Link className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Generate New URL</h3>
                  <p className="text-sm text-muted-foreground">Create affiliate links</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">View Analytics</h3>
                  <p className="text-sm text-muted-foreground">Track performance</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-success-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Manage Countries</h3>
                  <p className="text-sm text-muted-foreground">Add new regions</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
} 