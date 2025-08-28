import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { put } from '@/utils/api';

export function EditCampaignModal({ campaign, isOpen, onClose, onSave, countries }) {
  const [form, setForm] = useState({ originalUrl: '', country: '', urlSuffix: [], intervalMinutes: 6 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (campaign) {
      setForm({
        originalUrl: campaign.originalUrl || '',
        country: campaign.country || '',
        urlSuffix: Array.isArray(campaign.urlSuffix) ? campaign.urlSuffix : [],
        intervalMinutes: campaign.intervalMinutes ?? 6
      });
    }
  }, [campaign]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountry = (value) => {
    setForm((prev) => ({ ...prev, country: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.originalUrl || !form.country) {
      toast({ title: 'All fields are required', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      // Filter out empty keys
      const filteredUrlSuffix = form.urlSuffix.map(k => k.trim()).filter(Boolean);
      const data = await put(`/campaign/${campaign._id}`, {
        originalUrl: form.originalUrl,
        country: form.country,
        urlSuffix: filteredUrlSuffix,
        intervalMinutes: Number(form.intervalMinutes)
      });

      toast({ title: 'Campaign updated successfully!' });
      onSave(data);
      onClose();
    } catch (err) {
      toast({ title: err.message || 'Failed to update campaign', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !campaign) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Campaign</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Select value={form.country} onValueChange={handleCountry}>
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
            <Label htmlFor="intervalMinutes">Run Interval (minutes)</Label>
            <Input
              id="intervalMinutes"
              name="intervalMinutes"
              type="number"
              min={1}
              step={1}
              placeholder="e.g., 5"
              value={form.intervalMinutes}
              onChange={handleChange}
              required
            />
          </div>

          {/* URL Suffix Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">URL Suffix Keys</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addUrlSuffix}
                className="text-xs h-7 px-2"
              >
                Add More
              </Button>
            </div>
            
            {form.urlSuffix.length === 0 ? (
              <div className="text-center py-4 text-gray-500 border border-dashed border-gray-200 rounded-md text-sm">
                <p>No URL suffix keys</p>
              </div>
            ) : (
              <div className="space-y-2">
                {form.urlSuffix.map((key, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Input
                        placeholder="Key"
                        value={key}
                        onChange={(e) => updateUrlSuffix(index, e.target.value)}
                        className="text-sm h-8"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeUrlSuffix(index)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {form.urlSuffix.length > 0 && (
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-800 font-medium mb-1">Preview:</p>
                <p className="text-xs text-blue-700 font-mono break-all">
                  {form.urlSuffix
                    .map(k => k.trim())
                    .filter(Boolean)
                    .map(k => `${k}={random}`)
                    .join('&') || 'No valid keys yet'}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Campaign'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

