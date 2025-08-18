import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export function EditCampaignModal({ campaign, isOpen, onClose, onSave, countries }) {
  const [form, setForm] = useState({ originalUrl: '', country: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (campaign) {
      setForm({
        originalUrl: campaign.originalUrl || '',
        country: campaign.country || ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.originalUrl || !form.country) {
      toast({ title: 'All fields are required', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/campaign/${campaign._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          originalUrl: form.originalUrl,
          country: form.country
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to update campaign');
      }

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

