'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Barcode, Loader2, AlertCircle, Camera, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getPantryScanQuota } from '@/app/actions/pantry-scan';
import { ScannedProduct, BarcodeLookupResponse } from '@/types/barcode';

interface BarcodeScannerProps {
  onScanComplete: (product: ScannedProduct) => void;
  onNotFound: (barcode: string) => void;
  subscriptionTier?: 'free' | 'pro' | 'premium';
}

type ScannerState = 'idle' | 'scanning' | 'processing' | 'manual';

export default function BarcodeScanner({
  onScanComplete,
  onNotFound,
  subscriptionTier = 'free'
}: BarcodeScannerProps) {
  const [scannerState, setScannerState] = useState<ScannerState>('idle');
  const [manualBarcode, setManualBarcode] = useState('');
  const [quota, setQuota] = useState<{ used: number; limit: number | 'unlimited'; resetDate: Date | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<unknown>(null);

  // Load quota on component mount
  useEffect(() => {
    if (subscriptionTier !== 'free') {
      getPantryScanQuota().then(setQuota).catch(console.error);
    }
  }, [subscriptionTier]);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        const scanner = html5QrCodeRef.current as { stop: () => Promise<void>; clear: () => void };
        await scanner.stop();
        scanner.clear();
      } catch {
        // Scanner may already be stopped
      }
      html5QrCodeRef.current = null;
    }
  }, []);

  const lookupBarcode = async (barcode: string) => {
    setScannerState('processing');
    setError(null);

    try {
      const response = await fetch('/api/pantry/lookup-barcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode }),
      });

      const data: BarcodeLookupResponse & { remaining_scans?: number | 'unlimited'; quotaExceeded?: boolean } = await response.json();

      if (!response.ok) {
        if (data.quotaExceeded) {
          toast.error(data.error || 'Quota exceeded', {
            action: {
              label: 'Upgrade',
              onClick: () => window.location.href = '/settings/subscription'
            }
          });
        } else {
          toast.error(data.error || 'Failed to look up barcode');
        }
        setScannerState('idle');
        return;
      }

      // Update quota display
      if (subscriptionTier === 'pro' && quota && typeof data.remaining_scans === 'number') {
        setQuota({
          ...quota,
          used: quota.limit === 'unlimited' ? 0 : (quota.limit as number) - data.remaining_scans
        });
      }

      if (data.found && data.product) {
        // Haptic feedback on success
        if ('vibrate' in navigator) {
          navigator.vibrate(100);
        }
        toast.success(`Found: ${data.product.name}`);
        onScanComplete(data.product);
      } else {
        toast.info('Product not found in database');
        onNotFound(barcode);
      }

      setScannerState('idle');
    } catch (err) {
      console.error('Barcode lookup error:', err);
      setError('Failed to look up barcode. Please try again.');
      setScannerState('idle');
    }
  };

  const startScanner = async () => {
    if (subscriptionTier === 'free') {
      toast.error('Barcode scanning is available for Pro and Premium tiers only');
      return;
    }

    setError(null);

    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
    } catch {
      setCameraPermission('denied');
      setError('Camera access denied. Please enable camera permissions or use manual entry.');
      return;
    }

    setScannerState('scanning');

    // Dynamically import html5-qrcode to avoid SSR issues
    const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');

    if (!scannerRef.current) return;

    const scannerId = 'barcode-scanner-container';

    // Ensure the container has the ID
    scannerRef.current.id = scannerId;

    const html5QrCode = new Html5Qrcode(scannerId, {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
      ],
      verbose: false,
    });

    html5QrCodeRef.current = html5QrCode;

    try {
      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 300, height: 100 }, // Rectangular for barcodes
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          // Stop scanner before processing
          await stopScanner();

          // Haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate(50);
          }

          // Look up the barcode
          await lookupBarcode(decodedText);
        },
        () => {
          // QR code detection failure - this is called frequently, ignore
        }
      );
    } catch (err) {
      console.error('Scanner start error:', err);
      setError('Failed to start camera. Please try again or use manual entry.');
      setScannerState('idle');
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedBarcode = manualBarcode.trim();

    if (!trimmedBarcode) {
      toast.error('Please enter a barcode');
      return;
    }

    // Basic validation: should be 8-14 digits
    if (!/^\d{8,14}$/.test(trimmedBarcode)) {
      toast.error('Invalid barcode format. Enter 8-14 digits.');
      return;
    }

    await lookupBarcode(trimmedBarcode);
    setManualBarcode('');
  };

  const handleStopScanner = async () => {
    await stopScanner();
    setScannerState('idle');
  };

  const remainingScans = quota
    ? quota.limit === 'unlimited'
      ? 'unlimited'
      : Math.max(0, (quota.limit as number) - quota.used)
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Barcode className="h-5 w-5 text-blue-500" />
              Barcode Scanner
            </CardTitle>
            <CardDescription>
              Scan product barcodes to add items and view nutrition info
            </CardDescription>
          </div>
          {subscriptionTier === 'pro' && typeof remainingScans === 'number' && (
            <Badge variant={remainingScans > 3 ? 'secondary' : 'destructive'}>
              {remainingScans} scans left
            </Badge>
          )}
          {subscriptionTier === 'premium' && (
            <Badge variant="default" className="bg-gradient-to-r from-blue-500 to-cyan-500">
              Unlimited Scans
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {subscriptionTier === 'free' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Barcode scanning is available for Pro and Premium subscribers.
              <Button
                variant="link"
                className="px-1"
                onClick={() => window.location.href = '/settings/subscription'}
              >
                Upgrade now
              </Button>
              to unlock this feature.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Camera Scanner View */}
        {scannerState === 'scanning' && (
          <div className="flex flex-col gap-4">
            <div
              ref={scannerRef}
              className="relative rounded-lg overflow-hidden bg-black"
              style={{ minHeight: '300px' }}
            />
            <p className="text-sm text-muted-foreground text-center">
              Point camera at barcode
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleStopScanner}
            >
              Cancel Scan
            </Button>
          </div>
        )}

        {/* Processing State */}
        {scannerState === 'processing' && (
          <div className="py-12 text-center flex flex-col gap-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Looking up product...</p>
          </div>
        )}

        {/* Idle / Manual Entry State */}
        {(scannerState === 'idle' || scannerState === 'manual') && subscriptionTier !== 'free' && (
          <div className="flex flex-col gap-4">
            {/* Camera Button */}
            {cameraPermission !== 'denied' && (
              <Button
                className="w-full"
                onClick={startScanner}
              >
                <Camera className="mr-2 h-4 w-4" />
                Start Camera Scanner
              </Button>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or enter manually
                </span>
              </div>
            </div>

            {/* Manual Entry */}
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <Input
                placeholder="Enter barcode number..."
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                pattern="\d*"
                inputMode="numeric"
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!manualBarcode.trim()}
              >
                <Keyboard className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground">
              Tip: Enter the 8-14 digit barcode number printed below the barcode
            </p>
          </div>
        )}

        {/* Quota Information */}
        {quota && quota.resetDate && subscriptionTier === 'pro' && (
          <p className="text-xs text-muted-foreground text-center">
            Quota resets on {new Date(quota.resetDate).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
