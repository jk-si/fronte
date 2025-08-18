import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Eye, Search, Trash2, Edit } from 'lucide-react';
import { Fragment } from 'react';
import { EditCampaignModal } from '@/components/EditCampaignModal';
import { Switch } from '@/components/ui/switch';
import { useDebounce } from '@/hooks/use-debounce';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function CampaignGenerator() {
  const [countries, setCountries] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState({ country: '', originalUrl: '' });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteUrlsChecked, setDeleteUrlsChecked] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchLoading, setSearchLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 50
  });

  // Debounced search term for API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch countries once on mount
useEffect(() => {
  let mounted = true;
  const fetchCountries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/countries`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to fetch countries');
      if (mounted) {
        setCountries((data || []).map(c => ({
          value: c.code,   // Send code when submitting
          label: c.name    // Show name in dropdown
        })));
      }
    } catch (err) {
      toast({ title: err.message || 'Failed to fetch countries', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
  fetchCountries();
  return () => { mounted = false; };
}, []);


  // Fetch campaigns with search and filter
  const fetchCampaigns = async (page = 1) => {
    try {
      setSearchLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50'
      });
      
      if (debouncedSearchTerm.trim()) {
        params.append('search', debouncedSearchTerm.trim());
      }
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const res = await fetch(`${API_BASE}/campaigns?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to fetch campaigns');
      
      setCampaigns(data.campaigns || []);
      setPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 50
      });
    } catch (err) {
      toast({ title: err.message || 'Failed to fetch campaigns', variant: 'destructive' });
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => { fetchCampaigns(1); }, [debouncedSearchTerm, statusFilter]);

  // Handle search input change with debouncing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Reset to page 1 when searching
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Handle status filter change
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    // Reset to page 1 when filtering
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    fetchCampaigns(newPage);
  };

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle country select
const handleCountry = (value) => {
  setForm((prev) => ({ ...prev, country: value })); // value is the country code
};

  // Handle submit
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!form.country || !form.originalUrl) {
    toast({ title: 'All fields are required', variant: 'destructive' });
    return;
  }
  setSubmitting(true);
  try {
    const res = await fetch(`${API_BASE}/campaign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ 
        country: form.country, // <-- this is the country code now
        originalUrl: form.originalUrl 
      })
    });
    if (res.status === 409) {
      toast({ title: 'A campaign with this URL already exists.', variant: 'destructive' });
      return;
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Failed to create campaign');
    toast({ title: 'Campaign created!' });
    setForm({ country: '', originalUrl: '' });
    await fetchCampaigns();
  } catch (err) {
    toast({ title: err.message || 'Failed to create campaign', variant: 'destructive' });
  } finally {
    setSubmitting(false);
  }
};


  // Open modal
  const openDeleteModal = (campaign) => {
    setDeleteTarget(campaign);
    setDeleteUrlsChecked(false);
    setShowDeleteModal(true);
  };
  // Close modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
    setDeleteUrlsChecked(false);
  };

  // Enhanced delete logic
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      // Optionally delete affiliate URLs first
      if (deleteUrlsChecked) {
        // Fetch campaignId by originalUrl
        const campaignRes = await fetch(`${API_BASE}/campaign/${encodeURIComponent(deleteTarget.originalUrl)}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        });
        if (campaignRes.ok) {
          const campaignData = await campaignRes.json();
          if (campaignData._id) {
            await fetch(`${API_BASE}/affiliate-urls/${campaignData._id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
            });
          }
        }
      }
      // Delete campaign
      const res = await fetch(`${API_BASE}/campaign/${encodeURIComponent(deleteTarget.originalUrl)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || data.message || 'Failed to delete campaign');
      }
      toast({ title: 'Campaign deleted.' });
      await fetchCampaigns();
      closeDeleteModal();
    } catch (err) {
      toast({ title: err.message || 'Failed to delete campaign', variant: 'destructive' });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Edit campaign functions
  const openEditModal = (campaign) => {
    setEditTarget(campaign);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditTarget(null);
  };

  const handleEditSave = (updatedCampaign) => {
    setCampaigns(prev => prev.map(c => 
      c._id === updatedCampaign._id ? updatedCampaign : c
    ));
  };

  // Toggle campaign active status
  const handleToggleActive = async (campaign) => {
    const newActiveState = !campaign.isActive;
    
    // Optimistic update
    setCampaigns(prev => prev.map(c => 
      c._id === campaign._id ? { ...c, isActive: newActiveState } : c
    ));

    try {
      const res = await fetch(`${API_BASE}/campaign/${campaign._id}/active`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ isActive: newActiveState })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || data.message || 'Failed to update campaign status');
      }

      toast({ 
        title: `Campaign ${newActiveState ? 'activated' : 'deactivated'} successfully!` 
      });
    } catch (err) {
      // Revert optimistic update on error
      setCampaigns(prev => prev.map(c => 
        c._id === campaign._id ? { ...c, isActive: !newActiveState } : c
      ));
      toast({ title: err.message || 'Failed to update campaign status', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end" onSubmit={handleSubmit}>
          <div>
              <Label htmlFor="originalUrl">Original URL</Label>
              <Input
                id="originalUrl"
                name="originalUrl"
                type="url"
                placeholder="https://example.com"
                value={form.originalUrl}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Select value={form.country} onValueChange={handleCountry} disabled={loading}>
                <SelectTrigger id="country" className="w-full">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
 
            <div>
              <Button type="submit" className="w-full" disabled={submitting || loading}>
                {submitting ? 'Submitting...' : 'Create Campaign'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-6 py-4">
          <CardTitle>My Campaigns</CardTitle>
          <div className="flex w-full md:w-auto flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-auto min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by URL or Country"
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 bg-muted/50 border-0 focus:bg-surface w-full md:w-64"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-full md:w-32 bg-muted/50 border-0 focus:bg-surface">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Results Summary */}
          {(searchTerm || statusFilter !== 'all') && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center justify-between">
                <div className="text-sm text-blue-800">
                  <span className="font-medium">Search Results:</span>
                  {searchTerm && <span className="ml-2">"{searchTerm}" in URLs and countries</span>}
                  {statusFilter !== 'all' && (
                    <span className="ml-2">
                      {searchTerm ? ' and ' : ''}Status: {statusFilter === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  )}
                  <span className="ml-2">• {pagination.totalCount} result{pagination.totalCount !== 1 ? 's' : ''}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                >
                  Clear Search
                </Button>
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <Table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original URL</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                      {loading || searchLoading ? 'Loading...' : 'No campaigns found.'}
                    </td>
                  </tr>
                ) : (
                  campaigns.map((c) => (
                    <tr key={c._id || c.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-2 align-top">
                        <a 
                          href={c.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 underline block clamp-2-until-md"
                        >
                          {c.originalUrl}
                        </a>
                      </td>
                      <td className="px-4 py-2">{c.country}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={c.isActive !== false}
                            onCheckedChange={() => handleToggleActive(c)}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-2 ">
                        <span className="clamp-2-until-md">{formatDate(c.createdAt)}</span>
                      </td>
                      <td className="px-4 py-2 flex gap-2">
                        <Button size="icon" variant="outline" title="View" onClick={() => navigate(`/campaign-generator/${encodeURIComponent(c.originalUrl)}`)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="outline" title="Edit" onClick={() => openEditModal(c)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="destructive" title="Delete" onClick={() => openDeleteModal(c)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-2">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-700 px-3">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Campaign Modal */}
      <EditCampaignModal
        campaign={editTarget}
        isOpen={showEditModal}
        onClose={closeEditModal}
        onSave={handleEditSave}
        countries={countries}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-2 text-destructive">Delete Campaign</h2>
            <p className="mb-4 text-sm text-gray-700">Are you sure you want to delete this campaign?</p>
            <div className="flex items-center mb-4">
              <input
                id="delete-urls-checkbox"
                type="checkbox"
                checked={deleteUrlsChecked}
                onChange={e => setDeleteUrlsChecked(e.target.checked)}
                className="mr-2 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="delete-urls-checkbox" className="text-sm select-none">
                Also delete all <span className="font-semibold">Generated Affiliate URLs</span> linked to this campaign.
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeDeleteModal} disabled={deleteLoading}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={!deleteUrlsChecked || deleteLoading}>
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}