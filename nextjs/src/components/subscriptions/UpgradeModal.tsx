'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Users, Calendar, Mail } from 'lucide-react';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string; // Specific feature that triggered the modal
}

export function UpgradeModal({ open, onOpenChange, feature = 'AI Meal Suggestions' }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: 'pro' }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage = data.error || `Server error (${response.status})`;
        console.error('Error creating checkout:', {
          status: response.status,
          error: errorMessage,
          data,
        });
        alert(errorMessage);
        setLoading(false);
        return;
      }

      const { url } = data;

      if (url) {
        window.location.href = url;
        // Don't reset loading here since we're redirecting
      } else {
        console.error('No checkout URL received', data);
        alert('Failed to create checkout session. Please try again.');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      const errorMessage = error?.message || 'Network error. Please check your connection and try again.';
      alert(errorMessage);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-coral-500" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription>
            Unlock {feature} and more premium features!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 shrink-0 text-coral-500 mt-0.5" />
            <div>
              <p className="font-semibold">5 AI Meal Suggestions per Week</p>
              <p className="text-sm text-muted-foreground">
                Let Claude plan your meals based on your preferences and history
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 shrink-0 text-sage-600 mt-0.5" />
            <div>
              <p className="font-semibold">Household Sharing</p>
              <p className="text-sm text-muted-foreground">
                Share recipes and meal plans with family members
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold">Google Calendar Sync</p>
              <p className="text-sm text-muted-foreground">
                Automatically add meals to your calendar
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 shrink-0 text-purple-600 mt-0.5" />
            <div>
              <p className="font-semibold">Email Shopping Lists</p>
              <p className="text-sm text-muted-foreground">
                Send shopping lists directly to your inbox
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 shrink-0 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-semibold">Recipe Scaling & More</p>
              <p className="text-sm text-muted-foreground">
                Advanced features and priority support
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-center text-2xl font-bold">
              $7<span className="text-base font-normal text-muted-foreground">/month</span>
            </p>
            <p className="text-center text-sm text-muted-foreground">Cancel anytime</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Maybe Later
          </Button>
          <Button
            className="flex-1"
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Upgrade to Pro'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
