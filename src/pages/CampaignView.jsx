import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function CampaignView() {
  const { originalUrl } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [latestAffiliateUrl, setLatestAffiliateUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/campaign/${encodeURIComponent(originalUrl)}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || data.message || 'Failed to fetch campaign');
        }
        const data = await res.json();
        setCampaign(data);
        
        // Fetch latest affiliate URL for this campaign
        const affRes = await fetch(`${API_BASE}/affiliate-urls/${data._id}?latest=true`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        });

        if (affRes.ok) {
          const affData = await affRes.json();
          setLatestAffiliateUrl(affData);
        } else {
          setLatestAffiliateUrl(null);
        }
      } catch (err) {
        toast({ title: err.message || 'Failed to fetch campaign', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [originalUrl]);

  const handleGenerateAffiliateUrl = async () => {
    if (!campaign) return;
    
    if (!campaign.isActive) {
      toast({ 
        title: 'Campaign is inactive', 
        description: 'Cannot generate affiliate URL for inactive campaigns',
        variant: 'destructive' 
      });
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/affiliate-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          campaignId: campaign._id,
          baseAffiliateUrl: campaign.originalUrl,
          country: campaign.country
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to generate affiliate URL');
      }

      toast({ title: 'Affiliate URL generated successfully!' });
      
      // Refresh latest affiliate URL
      const affRes = await fetch(`${API_BASE}/affiliate-urls/${campaign._id}?latest=true`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });

      if (affRes.ok) {
        const affData = await affRes.json();
        setLatestAffiliateUrl(affData);
      }
    } catch (err) {
      toast({ title: err.message || 'Failed to generate affiliate URL', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!campaign) return <div className="p-8 text-center text-destructive">Campaign not found.</div>;

  return (
    <div className="space-y-8">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-2">&larr; Back</Button>
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Campaign Info */}
            <div className="flex flex-col md:flex-row md:items-center md:space-x-8 space-y-2 md:space-y-0">
              <div>
                <div className="text-xs text-muted-foreground">Original URL</div>
                <div className="font-medium break-all text-blue-700 underline">
                  <a href={campaign.originalUrl} target="_blank" rel="noopener noreferrer">{campaign.originalUrl}</a>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Country</div>
                <div className="font-medium">{campaign.country}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Status</div>
                <div className={`font-medium ${campaign.isActive !== false ? 'text-green-600' : 'text-red-600'}`}>
                  {campaign.isActive !== false ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
            
            {/* Generate Button */}
            <div>
              {/* <Button 
                onClick={handleGenerateAffiliateUrl}
                disabled={generating || campaign.isActive === false}
                className="w-full md:w-auto"
              >
                {generating ? 'Generating...' : 'Generate Affiliate URL'}
              </Button> */}
              {campaign.isActive === false && (
                <p className="text-sm text-red-600 mt-2">
                  Campaign is inactive. Cannot generate affiliate URLs.
                </p>
              )}
            </div>
            
            {/* Latest Affiliate URL Display */}
            {latestAffiliateUrl && latestAffiliateUrl.hasAffiliateUrl ? (
              <div className="border-t pt-6">
                <div className="text-sm font-medium text-gray-900 mb-3">Latest Affiliate URL</div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Full Affiliate URL</div>
                    <div className="p-3 bg-gray-50 rounded-md break-all font-mono text-sm border">
                      {latestAffiliateUrl.fullAffiliateUrl}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Proxy IP</div>
                      <div className="font-medium text-sm">{latestAffiliateUrl.proxyIp}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Generated</div>
                      <div className="font-medium text-sm">
                        {latestAffiliateUrl.createdAt ? new Date(latestAffiliateUrl.createdAt).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(latestAffiliateUrl.fullAffiliateUrl);
                            toast({ title: 'URL copied to clipboard!' });
                          } catch (err) {
                            toast({ title: 'Failed to copy URL', variant: 'destructive' });
                          }
                        }}
                      >
                        Copy URL
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-t pt-6">
                <div className="text-sm font-medium text-gray-900 mb-2">Affiliate URL</div>
                <p className="text-sm text-blue-600">
                  No affiliate URL generated yet.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}