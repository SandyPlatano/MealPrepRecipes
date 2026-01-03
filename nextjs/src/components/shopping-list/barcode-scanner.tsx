"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Loader2, Smartphone } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string) => void;
}

export function BarcodeScanner({ isOpen, onClose, onScanSuccess }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasScannedRef = useRef(false);
  const isMobile = useIsMobile();

  const handleScanSuccess = useCallback(
    (decodedText: string) => {
      // Prevent duplicate scans
      if (hasScannedRef.current) return;
      hasScannedRef.current = true;

      // Stop scanner and pass result
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
      onScanSuccess(decodedText);
    },
    [onScanSuccess]
  );

  useEffect(() => {
    if (!isOpen) {
      hasScannedRef.current = false;
      return;
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      try {
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          rememberLastUsedCamera: true,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          formatsToSupport: [
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
          ],
        };

        const scanner = new Html5QrcodeScanner("barcode-reader", config, false);

        scanner.render(
          handleScanSuccess,
          () => {} // Ignore scan failures (they happen frequently while scanning)
        );

        scannerRef.current = scanner;
        setIsInitializing(false);
        setError(null);
      } catch {
        setError("Failed to initialize camera. Please check camera permissions.");
        setIsInitializing(false);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [isOpen, handleScanSuccess]);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Scan Barcode
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {!isMobile && (
          <div className="flex items-center gap-3 p-4 bg-[#1A1A1A] rounded-xl text-sm">
            <Smartphone className="h-5 w-5 text-[#D9F99D] flex-shrink-0" />
            <p className="text-white">
              <span className="font-semibold">Best on mobile.</span> Desktop cameras are often poorly positioned for barcode scanning.
            </p>
          </div>
        )}

        <div className="relative min-h-[300px]">
          {isInitializing && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Starting camera...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="text-center p-4">
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={handleClose}>
                  Close
                </Button>
              </div>
            </div>
          )}

          <div id="barcode-reader" className="w-full" />
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Point your camera at a product barcode
        </p>
      </DialogContent>
    </Dialog>
  );
}
