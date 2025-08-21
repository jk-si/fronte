import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { get, post, getPublic } from '@/utils/api';

export default function CampaignView() {
  const { originalUrl } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [latestGenerateUrl, setLatestGenerateUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const computedFullGenerateUrl = campaign && latestGenerateUrl?.generateSuffix
    ? (campaign.originalUrl.includes('?')
        ? `${campaign.originalUrl}&${latestGenerateUrl.generateSuffix}`
        : `${campaign.originalUrl}?${latestGenerateUrl.generateSuffix}`)
    : '';

  useEffect(() => {
    const fetchCampaign = async () => {
      setLoading(true);
      try {
        const data = await get(`/campaign/${encodeURIComponent(originalUrl)}`);
        setCampaign(data);
        
        // Fetch latest generate URL for this campaign (public access)
        try {
          const affData = await getPublic(`/generate-urls/${data._id}`);
          setLatestGenerateUrl(affData);
        } catch (err) {
          setLatestGenerateUrl(null);
        }
      } catch (err) {
        toast({ title: err.message || 'Failed to fetch campaign', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [originalUrl]);

  const handleGenerateUrl = async () => {
    if (!campaign) return;
    
    if (!campaign.isActive) {
      toast({ 
        title: 'Campaign is inactive', 
        description: 'Cannot generate URL for inactive campaigns',
        variant: 'destructive' 
      });
      return;
    }

    setGenerating(true);
    try {
      await post('/generate-url', {
        campaignId: campaign._id,
        baseGenerateUrl: campaign.originalUrl,
        country: campaign.country
      });

      toast({ title: 'URL generated successfully!' });
      
      // Refresh latest generate URL (public access)
      try {
        const affData = await getPublic(`/generate-urls/${campaign._id}`);
        setLatestGenerateUrl(affData);
      } catch (err) {
        console.error('Failed to refresh generate URL:', err);
      }
    } catch (err) {
      toast({ title: err.message || 'Failed to generate URL', variant: 'destructive' });
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
                <div className={`text-xs text-muted-foreground`}>Status</div>
                <div className={`font-medium ${campaign.isActive !== false ? 'text-green-600' : 'text-red-600'}`}>
                  {campaign.isActive !== false ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
            
            {/* URL Suffix Parameters */}
            {campaign.urlSuffix && campaign.urlSuffix.trim() && (
              <div className="border-t pt-6">
                <div className="text-sm font-medium text-gray-900 mb-3">URL Suffix Parameters</div>
                <div className="space-y-2">
                  {campaign.urlSuffix.split('&').map((param, index) => {
                    const [key, value] = param.split('=');
                    return (
                      <div key={index} className="flex items-center space-x-4 p-2 bg-gray-50 rounded-md">
                        <div className="w-24 text-xs text-muted-foreground font-medium">{key}:</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Generate Button */}
            <div>
              {/* <Button 
                onClick={handleGenerateUrl}
                disabled={generating || campaign.isActive === false}
                className="w-full md:w-auto"
              >
                {generating ? 'Generating...' : 'Generate URL'}
              </Button> */}
              {campaign.isActive === false && (
                <p className="text-sm text-red-600 mt-2">
                  Campaign is inactive. Cannot generate URLs.
                </p>
              )}
            </div>
            
            {/* Latest Generate URL Display */}
            {latestGenerateUrl && latestGenerateUrl.generateSuffix ? (
              <div className="border-t pt-6">
                <div className="text-sm font-medium text-gray-900 mb-3">Latest Generate URL</div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Full Generate URL</div>
                    <div className="p-3 bg-gray-50 rounded-md break-all font-mono text-sm border">
                      {computedFullGenerateUrl}
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(computedFullGenerateUrl);
                          toast({ title: 'URL copied to clipboard!' });
                        } catch (err) {
                          toast({ title: 'Failed to copy URL', variant: 'destructive' });
                        }
                      }}
                    >
                      Copy URL
                    </Button>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="text-xs text-yellow-800 font-medium mb-2">Generated Suffix:</div>
                    <div className="text-xs text-yellow-700 font-mono break-all">
                      {latestGenerateUrl.generateSuffix}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-t pt-6">
                <div className="text-sm font-medium text-gray-900 mb-2">Generate URL</div>
                <p className="text-sm text-blue-600">
                  No generate URL generated yet.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}