'use client';

import { useState, useEffect } from 'react';
import { Calendar, Image, Trash2, RefreshCw, Package, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { getPantryScanHistory, deletePantryScan, PantryScan } from '@/app/actions/pantry-scan';

interface ScanHistoryProps {
  onReuseScan?: (scan: PantryScan) => void;
  maxItems?: number;
}

export default function ScanHistory({ onReuseScan, maxItems = 10 }: ScanHistoryProps) {
  const [scans, setScans] = useState<PantryScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);

  useEffect(() => {
    loadScanHistory();
  }, [maxItems]);

  const loadScanHistory = async () => {
    try {
      setLoading(true);
      const history = await getPantryScanHistory(maxItems);
      setScans(history);
    } catch (error) {
      console.error('Error loading scan history:', error);
      toast.error('Failed to load scan history');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScan = async (scanId: string) => {
    setDeletingId(scanId);
    try {
      const result = await deletePantryScan(scanId);
      if (result.success) {
        setScans(scans.filter(scan => scan.id !== scanId));
        toast.success('Scan deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete scan');
      }
    } catch (error) {
      console.error('Error deleting scan:', error);
      toast.error('Failed to delete scan');
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(false);
    }
  };

  const confirmDelete = (scanId: string) => {
    setSelectedScanId(scanId);
    setDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: PantryScan['processing_status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getScanTypeIcon = (type: PantryScan['scan_type']) => {
    switch (type) {
      case 'fridge':
        return '❄️';
      case 'pantry':
        return '🗄️';
      default:
        return '📦';
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
          <CardDescription>Loading scan history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="h-16 w-16 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (scans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scan History</CardTitle>
          <CardDescription>Your previous pantry and fridge scans</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Package className="h-4 w-4" />
            <AlertDescription>
              No scans yet. Take a photo of your fridge or pantry to get started!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Scan History</CardTitle>
              <CardDescription>Your previous pantry and fridge scans</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadScanHistory}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scans.map((scan) => {
              const itemCount = scan.confirmed_items?.length || scan.detected_items?.length || 0;
              const hasError = scan.processing_status === 'failed';

              return (
                <div
                  key={scan.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                    {scan.image_url ? (
                      <img
                        src={scan.image_url}
                        alt={`${scan.scan_type} scan`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image className="h-6 w-6 text-muted-foreground" />
                    )}
                    <div className="absolute top-1 left-1 text-lg">
                      {getScanTypeIcon(scan.scan_type)}
                    </div>
                  </div>

                  {/* Scan Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">
                        {scan.scan_type} Scan
                      </span>
                      {getStatusBadge(scan.processing_status)}
                    </div>
                    {hasError ? (
                      <div className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {scan.error_message || 'Scan failed'}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {itemCount} items • {formatDate(scan.created_at)}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {scan.processing_status === 'completed' && onReuseScan && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onReuseScan(scan)}
                      >
                        Reuse
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => confirmDelete(scan.id)}
                      disabled={deletingId === scan.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scan?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this scan and its image. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedScanId && handleDeleteScan(selectedScanId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}