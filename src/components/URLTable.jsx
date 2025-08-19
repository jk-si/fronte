import { useState, useEffect } from 'react';
import { Copy, ExternalLink, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

// Mock data for demonstration
const mockUrls = [
  {
    id: 1,
    originalUrl: 'https://example.com/product/laptop-gaming',
    country: 'United States',
    countryCode: 'us',
            generatedUrl: 'https://generate.linkforge.com/us/abc123?url=https%3A//example.com/product/laptop-gaming',
    dateTime: '2024-01-15 14:30:22',
    status: 'active',
    clicks: 156,
  },
  {
    id: 2,
    originalUrl: 'https://shop.example.com/books/programming',
    country: 'United Kingdom',
    countryCode: 'uk',
            generatedUrl: 'https://generate.linkforge.com/uk/def456?url=https%3A//shop.example.com/books/programming',
    dateTime: '2024-01-15 13:15:10',
    status: 'active',
    clicks: 89,
  },
  {
    id: 3,
    originalUrl: 'https://store.example.com/electronics/phone',
    country: 'Canada',
    countryCode: 'ca',
            generatedUrl: 'https://generate.linkforge.com/ca/ghi789?url=https%3A//store.example.com/electronics/phone',
    dateTime: '2024-01-15 12:45:33',
    status: 'paused',
    clicks: 234,
  },
  {
    id: 4,
    originalUrl: 'https://market.example.com/fashion/shoes',
    country: 'Australia',
    countryCode: 'au',
            generatedUrl: 'https://generate.linkforge.com/au/jkl012?url=https%3A//market.example.com/fashion/shoes',
    dateTime: '2024-01-15 11:20:45',
    status: 'active',
    clicks: 67,
  },
  {
    id: 5,
    originalUrl: 'https://tech.example.com/gadgets/smartwatch',
    country: 'Germany',
    countryCode: 'de',
            generatedUrl: 'https://generate.linkforge.com/de/mno345?url=https%3A//tech.example.com/gadgets/smartwatch',
    dateTime: '2024-01-15 10:05:18',
    status: 'active',
    clicks: 123,
  },
];

export function URLTable({ urls: propUrls }) {
  const [urls, setUrls] = useState(propUrls || mockUrls);
console.log(urls ,"urls")
  useEffect(() => {
    console.log(propUrls ,'propUrlspropUrlspropUrlspropUrls')
    if (propUrls) setUrls(propUrls);
  }, [propUrls]);

  const handleCopy = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Copied!",
        description: "URL copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (id) => {
    setUrls(urls.filter(url => url.id !== id));
    toast({
      title: "URL Deleted",
              description: "Generate URL has been removed.",
    });
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'bg-success text-success-foreground',
      paused: 'bg-warning text-warning-foreground',
      inactive: 'bg-muted text-muted-foreground',
    };
    
    return (
      <Badge className={variants[status] || variants.inactive}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-card">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">
                      Generated URLs
        </CardTitle>
        <p className="text-sm text-muted-foreground">
                      Manage and track your generate links
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/50">
                {/* <TableHead className="font-medium text-foreground">Original URL</TableHead> */}
                <TableHead className="font-medium text-foreground">Country</TableHead>
                <TableHead className="font-medium text-foreground">Generated URL</TableHead>
                <TableHead className="font-medium text-foreground">proxyIp</TableHead>
                <TableHead className="font-medium text-foreground">Created</TableHead>
                {/* <TableHead className="font-medium text-foreground">Status</TableHead> */}
                {/* <TableHead className="font-medium text-foreground">Clicks</TableHead> */}
                <TableHead className="font-medium text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {urls.map((url) => {
                const fullGenerateUrl = url.originalUrl && url.generateSuffix ? url.originalUrl + url.generateSuffix : '';
                return (
                  <TableRow key={url.id} className="border-border hover:bg-muted/30">
                    {/* <TableCell className="max-w-xs">
                      <div className="flex items-center space-x-2">
                        <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate text-foreground" title={url.originalUrl}>
                          {url.originalUrl}
                        </span>
                      </div>
                    </TableCell> */}
                    <TableCell>
                      <span className="text-foreground">{url.country}</span>
                    </TableCell>
                    <TableCell className="max-w-xs">
                                          <code className="text-xs text-muted-foreground truncate block" title={fullGenerateUrl}>
                      {fullGenerateUrl}
                    </code>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {url.proxyIp}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {url.dateTime}
                    </TableCell>
                    {/* <TableCell>
                      {getStatusBadge(url.status)}
                    </TableCell> */}
                    {/* <TableCell className="text-foreground font-medium">
                      {url.clicks}
                    </TableCell> */}
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(fullGenerateUrl)}
                          className="h-8 w-8"
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        {/* Add preview/share buttons here if needed, using fullGenerateUrl */}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
} 