"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Check,
  Link2,
  Globe,
  Lock,
  Eye,
  Share2,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  generateShareToken,
  revokeShareToken,
  toggleRecipePublic,
  getShareAnalytics,
  getCurrentUserProfile,
} from "@/app/actions/sharing";
import type { ShareAnalytics } from "@/types/social";
import { UsernameSetupModal } from "./username-setup-modal";

interface ShareRecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipeId: string;
  recipeTitle: string;
  isPublic: boolean;
  shareToken: string | null;
  viewCount: number;
}

export function ShareRecipeDialog({
  open,
  onOpenChange,
  recipeId,
  recipeTitle,
  isPublic: initialIsPublic,
  shareToken: initialShareToken,
  viewCount,
}: ShareRecipeDialogProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [shareToken, setShareToken] = useState(initialShareToken);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analytics, setAnalytics] = useState<ShareAnalytics | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [hasUsername, setHasUsername] = useState<boolean | null>(null);

  // Check if user has username on mount
  useEffect(() => {
    async function checkUsername() {
      const { data } = await getCurrentUserProfile();
      setHasUsername(!!data?.username);
    }
    if (open) {
      checkUsername();
    }
  }, [open]);

  // Update share URL when token changes
  useEffect(() => {
    if (shareToken) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      setShareUrl(`${baseUrl}/shared/${shareToken}`);
    } else {
      setShareUrl(null);
    }
  }, [shareToken]);

  // Load analytics when dialog opens
  useEffect(() => {
    async function loadAnalytics() {
      const { data } = await getShareAnalytics(recipeId);
      if (data) {
        setAnalytics(data);
      }
    }
    if (open && (shareToken || isPublic)) {
      loadAnalytics();
    }
  }, [open, recipeId, shareToken, isPublic]);

  const handleGenerateLink = async () => {
    setIsLoading(true);
    const { data, error } = await generateShareToken(recipeId);
    setIsLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    if (data) {
      setShareToken(data.share_token);
      setShareUrl(data.share_url);
      toast.success("Share link created!");
    }
  };

  const handleRevokeLink = async () => {
    setIsLoading(true);
    const { error, success } = await revokeShareToken(recipeId);
    setIsLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    if (success) {
      setShareToken(null);
      setShareUrl(null);
      toast.success("Share link revoked");
    }
  };

  const handleTogglePublic = async (checked: boolean) => {
    // Check if user has username first
    if (checked && !hasUsername) {
      setShowUsernameModal(true);
      return;
    }

    setIsLoading(true);
    const { error, success, requiresUsername } = await toggleRecipePublic(
      recipeId,
      checked
    );
    setIsLoading(false);

    if (requiresUsername) {
      setShowUsernameModal(true);
      return;
    }

    if (error) {
      toast.error(error);
      return;
    }

    if (success) {
      setIsPublic(checked);
      toast.success(
        checked
          ? "Recipe is now public and can be discovered by anyone"
          : "Recipe is now private"
      );
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleUsernameSet = () => {
    setShowUsernameModal(false);
    setHasUsername(true);
    // Retry making public
    handleTogglePublic(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Recipe
            </DialogTitle>
            <DialogDescription>
              Share &quot;{recipeTitle}&quot; with friends or the community.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Public Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {isPublic ? (
                    <Globe className="h-4 w-4 text-green-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Label htmlFor="public-toggle" className="font-medium">
                    Make Public
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isPublic
                    ? "Anyone can discover this recipe"
                    : "Only you and people with the link can see this"}
                </p>
              </div>
              <Switch
                id="public-toggle"
                checked={isPublic}
                onCheckedChange={handleTogglePublic}
                disabled={isLoading}
              />
            </div>

            {/* Share Link Section */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Private Share Link
              </Label>

              {shareUrl ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={shareUrl}
                      readOnly
                      className="text-sm font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyLink}
                      className="shrink-0"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRevokeLink}
                    disabled={isLoading}
                    className="text-destructive hover:text-destructive"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Revoke Link
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleGenerateLink}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Link2 className="h-4 w-4 mr-2" />
                  )}
                  Generate Share Link
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                Anyone with this link can view the recipe without signing up.
              </p>
            </div>

            {/* Analytics */}
            {(analytics || viewCount > 0) && (
              <div className="border-t pt-4">
                <Label className="flex items-center gap-2 mb-3">
                  <Eye className="h-4 w-4" />
                  Share Analytics
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">
                      {analytics?.total_views || viewCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Views</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">
                      {analytics?.copies || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Saves</p>
                  </div>
                </div>
              </div>
            )}

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              {isPublic && (
                <Badge variant="secondary" className="gap-1">
                  <Globe className="h-3 w-3" />
                  Public
                </Badge>
              )}
              {shareToken && (
                <Badge variant="outline" className="gap-1">
                  <Link2 className="h-3 w-3" />
                  Link Active
                </Badge>
              )}
            </div>

            {/* Warning for public without username */}
            {!hasUsername && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Username required
                  </p>
                  <p className="text-amber-700 dark:text-amber-300 text-xs">
                    Set a username to make recipes public. Your username will be
                    shown as the author.
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Username Setup Modal */}
      <UsernameSetupModal
        open={showUsernameModal}
        onOpenChange={setShowUsernameModal}
        onSuccess={handleUsernameSet}
      />
    </>
  );
}
