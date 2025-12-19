'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Camera, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getPantryScanQuota } from '@/app/actions/pantry-scan';

interface DetectedItem {
  ingredient: string;
  quantity?: string;
  category: string;
  confidence: number;
  confirmed?: boolean;
  edited?: boolean;
}

interface SuggestedRecipe {
  id: string;
  title: string;
  prep_time?: number;
  cook_time?: number;
  image_url?: string;
  matching_ingredients: number;
  total_ingredients: number;
  missing_ingredients: number;
}

interface PantryScannerProps {
  onScanComplete: (scanId: string, detectedItems: DetectedItem[], suggestedRecipes: SuggestedRecipe[]) => void;
  subscriptionTier?: 'free' | 'pro' | 'premium';
}

export default function PantryScanner({ onScanComplete, subscriptionTier = 'free' }: PantryScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanType, setScanType] = useState<'fridge' | 'pantry' | 'other'>('fridge');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quota, setQuota] = useState<{ used: number; limit: number | 'unlimited'; resetDate: Date | null } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load quota on component mount
  useState(() => {
    if (subscriptionTier !== 'free') {
      getPantryScanQuota().then(setQuota).catch(console.error);
    }
  });

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please select a JPEG, PNG, or WebP image');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleScan = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    if (subscriptionTier === 'free') {
      toast.error('Pantry scanning is available for Pro and Premium tiers only');
      return;
    }

    setIsScanning(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('scanType', scanType);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/pantry/scan-image', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        if (data.quotaExceeded) {
          toast.error(data.error, {
            action: {
              label: 'Upgrade',
              onClick: () => window.location.href = '/settings/subscription'
            }
          });
        } else {
          toast.error(data.error || 'Failed to scan image');
        }
        return;
      }

      // Update quota if applicable
      if (subscriptionTier === 'pro' && quota) {
        setQuota({
          ...quota,
          used: quota.used + 1
        });
      }

      toast.success(`Detected ${data.detected_items.length} items!`);
      onScanComplete(data.scan_id, data.detected_items, data.suggested_recipes);

    } catch (error) {
      console.error('Error scanning image:', error);
      toast.error('Failed to scan image. Please try again.');
    } finally {
      setIsScanning(false);
      setUploadProgress(0);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const remainingScans = quota
    ? quota.limit === 'unlimited'
      ? 'unlimited'
      : Math.max(0, quota.limit - quota.used)
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Smart Pantry Scanner
            </CardTitle>
            <CardDescription>
              Take a photo of your fridge or pantry to automatically detect ingredients
            </CardDescription>
          </div>
          {subscriptionTier === 'pro' && typeof remainingScans === 'number' && (
            <Badge variant={remainingScans > 3 ? 'secondary' : 'destructive'}>
              {remainingScans} scans left
            </Badge>
          )}
          {subscriptionTier === 'premium' && (
            <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
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
              Pantry scanning is available for Pro and Premium subscribers.
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

        {/* Scan Type Selection */}
        <div className="flex flex-col gap-2">
          <Label>What are you scanning?</Label>
          <RadioGroup value={scanType} onValueChange={(value: string) => setScanType(value as 'fridge' | 'pantry' | 'other')}>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="fridge" id="fridge" />
              <Label htmlFor="fridge">Refrigerator</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="pantry" id="pantry" />
              <Label htmlFor="pantry">Pantry/Cupboard</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other">Other Storage</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Image Upload Area */}
        <div className="flex flex-col gap-4">
          {!selectedFile ? (
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-primary/10">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Click to upload an image</p>
                  <p className="text-sm text-muted-foreground">
                    JPEG, PNG or WebP • Max 5MB
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Image Preview */}
              <div className="relative rounded-lg overflow-hidden bg-muted">
                {previewUrl && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Selected image"
                      className="w-full h-64 object-cover"
                    />
                  </>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={handleReset}
                >
                  Change Image
                </Button>
              </div>

              {/* Upload Progress */}
              {isScanning && uploadProgress > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Analyzing image...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isScanning || subscriptionTier === 'free'}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={handleScan}
            disabled={!selectedFile || isScanning || subscriptionTier === 'free'}
          >
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Scan {scanType === 'fridge' ? 'Fridge' : scanType === 'pantry' ? 'Pantry' : 'Items'}
              </>
            )}
          </Button>

          {selectedFile && !isScanning && (
            <Button variant="outline" onClick={handleReset}>
              Cancel
            </Button>
          )}
        </div>

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