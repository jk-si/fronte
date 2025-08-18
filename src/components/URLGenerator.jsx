import { useState } from 'react';
import { Copy, ExternalLink, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'in', label: 'India' },
  { value: 'br', label: 'Brazil' },
  { value: 'mx', label: 'Mexico' },
];

export function URLGenerator() {
  const [url, setUrl] = useState('');
  const [country, setCountry] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [affiliateSuffix, setAffiliateSuffix] = useState('');

  const handleGenerate = () => {
    if (!url || !country) {
      toast({
        title: "Missing Information",
        description: "Please enter both URL and country to generate affiliate link.",
        variant: "destructive",
      });
      return;
    }
    // Simulate affiliate suffix generation
    const affiliateId = Math.random().toString(36).substring(2, 8);
    const suffix = `?aff=${affiliateId}&country=${country}`;
    setAffiliateSuffix(suffix);
    toast({
      title: "Suffix Generated!",
      description: "Your affiliate suffix has been generated successfully.",
    });
  };

  const fullAffiliateUrl = url && affiliateSuffix ? url + affiliateSuffix : '';

  return (
    <div className="space-y-6">
      {/* URL Generator Form */}
      <Card className="shadow-lg border-0 bg-gradient-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground flex items-center space-x-2">
            <ExternalLink className="w-5 h-5 text-primary" />
            <span>Affiliate URL Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-url" className="text-sm font-medium text-foreground">
                Product URL
              </Label>
              <Input
                id="product-url"
                type="url"
                placeholder="https://example.com/product"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-surface border-border focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium text-foreground">
                Country
              </Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="bg-surface border-border focus:border-primary">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent className="bg-surface border-border shadow-lg z-50">
                  {countries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={handleGenerate}
            className="w-full md:w-auto"
            variant="gradient"
            size="lg"
          >
            Generate Affiliate URL
          </Button>
        </CardContent>
      </Card>

      {/* Generated URL Preview */}
      {fullAffiliateUrl && (
        <Card className="shadow-lg border-0 bg-gradient-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground">
              Generated Affiliate URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
              <code className="flex-1 text-sm text-foreground break-all">
                {fullAffiliateUrl}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(fullAffiliateUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                    toast({
                      title: "Copied!",
                      description: "Affiliate URL copied to clipboard.",
                    });
                  } catch (err) {
                    toast({
                      title: "Copy Failed",
                      description: "Failed to copy URL to clipboard.",
                      variant: "destructive",
                    });
                  }
                }}
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 