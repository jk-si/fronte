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
import { get, post, del, patch } from '@/utils/api';
import { CampaignModal } from '@/components/CampaignModal';

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
  const [form, setForm] = useState({ country: '', originalUrl: '', urlSuffix: [] });
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
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch countries once on mount
useEffect(() => {
  let mounted = true;
  const fetchCountries = async () => {
    setLoading(true);
    try {
      const data = await get('/admin/countries');
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
      const params = {
        page: page.toString(),
        limit: '50'
      };
      
      if (debouncedSearchTerm.trim()) {
        params.search = debouncedSearchTerm.trim();
      }
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      const data = await get('/campaigns', params);
      
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

  // Handle URL suffix management (keys only)
  const addUrlSuffix = () => {
    setForm(prev => ({
      ...prev,
      urlSuffix: [...prev.urlSuffix, '']
    }));
  };

  const removeUrlSuffix = (index) => {
    setForm(prev => ({
      ...prev,
      urlSuffix: prev.urlSuffix.filter((_, i) => i !== index)
    }));
  };

  const updateUrlSuffix = (index, value) => {
    setForm(prev => ({
      ...prev,
      urlSuffix: prev.urlSuffix.map((item, i) => i === index ? value : item)
    }));
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
    // Filter out empty keys
    const filteredUrlSuffix = form.urlSuffix.map(k => k.trim()).filter(Boolean);
    const data = await post('/campaign', { 
      country: form.country,
      originalUrl: form.originalUrl,
      urlSuffix: filteredUrlSuffix
    });
    toast({ title: 'Campaign created!' });
    setForm({ country: '', originalUrl: '', urlSuffix: [] });
    await fetchCampaigns();
  } catch (err) {
    if (err.message.includes('409')) {
      toast({ title: 'A campaign with this URL already exists.', variant: 'destructive' });
    } else {
      toast({ title: err.message || 'Failed to create campaign', variant: 'destructive' });
    }
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
      // Optionally delete generate URLs first
      if (deleteUrlsChecked) {
        // Fetch campaignId by originalUrl
        const campaignData = await get(`/campaign/${encodeURIComponent(deleteTarget.originalUrl)}`);
        if (campaignData._id) {
          await del(`/generate-urls/${campaignData._id}`);
        }
      }
      // Delete campaign
      await del(`/campaign/${encodeURIComponent(deleteTarget.originalUrl)}`);
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
      await patch(`/campaign/${campaign._id}/active`, { isActive: newActiveState });
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

  // no-op: validation is handled inside CampaignModal

  return (
    <div className="">
      <Card className="mt-[30px]">
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

               <div>
              <Button className="w-full" onClick={() => setShowCreateModal(true)} disabled={loading}>
                Create Campaign
              </Button>
            </div>
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
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original URL</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL Suffix</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                      {loading || searchLoading ? 'Loading...' : 'No campaigns found.'}
                    </td>
                  </tr>
                ) : (
                  campaigns.map((c) => (
                    <tr key={c._id || c.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-2">{c._id}</td>
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
                        {c.urlSuffix ? (
                          <div className="max-w-xs">
                            <div className="text-xs text-gray-600 font-mono break-all">
                              {c.urlSuffix.split(',').map((key, index) => (
                                <span key={index} className="mr-2">{key}</span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No suffix</span>
                        )}
                      </td>
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
      <CampaignModal
        campaign={editTarget}
        isOpen={showEditModal}
        onClose={closeEditModal}
        onSave={handleEditSave}
        countries={countries}
      />

      <CampaignModal
        campaign={null}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={async () => { await fetchCampaigns(); setShowCreateModal(false); }}
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
                                 Also delete all <span className="font-semibold">Generated URLs</span> linked to this campaign.
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