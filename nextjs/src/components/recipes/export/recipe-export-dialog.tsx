"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Download,
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
import type { RecipeWithNutrition } from "@/types/recipe";
import type { RecipeNutrition } from "@/types/nutrition";
import type { ExportFormat } from "@/types/export";
import { UsernameSetupModal } from "@/components/social/username-setup-modal";
import { RecipeExportPreview } from "./recipe-export-preview";
import { ExportFormatButtons } from "./export-format-buttons";
import { downloadRecipeAsMarkdown } from "@/lib/export/recipe-markdown";
import { downloadRecipeAsJson } from "@/lib/export/recipe-to-json";
import { exportRecipeToPdf } from "@/lib/export/recipe-to-pdf";
import { exportRecipeToImage } from "@/lib/export/recipe-to-image";
import { DEFAULT_RECIPE_EXPORT_PREFERENCES } from "@/lib/export";

interface RecipeExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe: RecipeWithNutrition & { nutrition?: RecipeNutrition | null };
  isPublic: boolean;
  shareToken: string | null;
  viewCount: number;
}

export function RecipeExportDialog({
  open,
  onOpenChange,
  recipe,
  isPublic: initialIsPublic,
  shareToken: initialShareToken,
  viewCount,
}: RecipeExportDialogProps) {
  // Share state
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [shareToken, setShareToken] = useState(initialShareToken);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analytics, setAnalytics] = useState<ShareAnalytics | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [hasUsername, setHasUsername] = useState<boolean | null>(null);

  // Export state
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  // Refs
  const exportPreviewRef = useRef<HTMLDivElement>(null);

  // Sync initial values
  useEffect(() => {
    setIsPublic(initialIsPublic);
    setShareToken(initialShareToken);
  }, [initialIsPublic, initialShareToken]);

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
      const { data } = await getShareAnalytics(recipe.id);
      if (data) {
        setAnalytics(data);
      }
    }
    if (open && (shareToken || isPublic)) {
      loadAnalytics();
    }
  }, [open, recipe.id, shareToken, isPublic]);

  // Reset state when closed
  useEffect(() => {
    if (!open) {
      setCopied(false);
      setExportingFormat(null);
    }
  }, [open]);

  // Share handlers
  const handleGenerateLink = async () => {
    setIsLoading(true);
    const { data, error } = await generateShareToken(recipe.id);
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
    const { error, success } = await revokeShareToken(recipe.id);
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
    if (checked && !hasUsername) {
      setShowUsernameModal(true);
      return;
    }

    setIsLoading(true);
    const { error, success, requiresUsername } = await toggleRecipePublic(
      recipe.id,
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

  const handleUsernameSet = async () => {
    setShowUsernameModal(false);
    setHasUsername(true);
    await new Promise((resolve) => setTimeout(resolve, 150));
    await handleTogglePublic(true);
  };

  // Export handler
  const handleExport = async (format: ExportFormat) => {
    setExportingFormat(format);

    try {
      switch (format) {
        case "png":
        case "jpeg":
          if (!exportPreviewRef.current) {
            throw new Error("Export preview not ready");
          }
          await exportRecipeToImage(
            exportPreviewRef.current,
            recipe.title,
            format
          );
          toast.success(`${format.toUpperCase()} downloaded!`);
          break;

        case "pdf":
          if (!exportPreviewRef.current) {
            throw new Error("Export preview not ready");
          }
          await exportRecipeToPdf(exportPreviewRef.current, recipe.title);
          toast.success("PDF downloaded!");
          break;

        case "markdown":
          downloadRecipeAsMarkdown({
            recipe,
            nutrition: recipe.nutrition,
            preferences: DEFAULT_RECIPE_EXPORT_PREFERENCES,
          });
          toast.success("Markdown downloaded!");
          break;

        case "json":
          downloadRecipeAsJson(recipe, recipe.nutrition);
          toast.success("JSON downloaded!");
          break;
      }
    } catch (error) {
      console.error(`${format} export failed:`, error);
      toast.error(`Failed to export ${format.toUpperCase()}. Please try again.`);
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export & Share
            </DialogTitle>
          </DialogHeader>

          {/* Recipe Preview */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="font-medium truncate">{recipe.title}</p>
            <p className="text-sm text-muted-foreground">
              {recipe.recipe_type}
              {recipe.category && ` • ${recipe.category}`}
            </p>
          </div>

          <Tabs defaultValue="export" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="export" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </TabsTrigger>
              <TabsTrigger value="share" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </TabsTrigger>
            </TabsList>

            {/* Export Tab */}
            <TabsContent value="export" className="flex flex-col mt-4">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose a format to download your recipe
                </p>
                <ExportFormatButtons
                  onExport={handleExport}
                  exportingFormat={exportingFormat}
                />
              </div>

              <p className="text-xs text-muted-foreground text-center pt-2">
                Tip: Use JSON format to back up and restore recipes
              </p>
            </TabsContent>

            {/* Share Tab */}
            <TabsContent value="share" className="flex flex-col mt-4">
              {/* Public Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    {isPublic ? (
                      <Globe className="h-4 w-4 text-green-600" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Label htmlFor="public-toggle-dialog" className="font-medium">
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
                  id="public-toggle-dialog"
                  checked={isPublic}
                  onCheckedChange={handleTogglePublic}
                  disabled={isLoading}
                />
              </div>

              {/* Share Link */}
              <div className="flex flex-col">
                <Label className="flex items-center gap-2 text-sm">
                  <Link2 className="h-4 w-4" />
                  Private Share Link
                </Label>

                {shareUrl ? (
                  <div className="flex flex-col">
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
                <div className="pt-4 border-t">
                  <Label className="flex items-center gap-2 mb-3 text-sm">
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
                      <p className="text-2xl font-bold">{analytics?.copies || 0}</p>
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
                      Set a username to make recipes public.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Hidden Export Preview (off-screen for capturing) */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
        }}
      >
        <RecipeExportPreview ref={exportPreviewRef} recipe={recipe} />
      </div>

      {/* Username Setup Modal */}
      <UsernameSetupModal
        open={showUsernameModal}
        onOpenChange={(open) => {
          setShowUsernameModal(open);
          if (!open) {
            setTimeout(() => {
              getCurrentUserProfile().then(({ data }) => {
                setHasUsername(!!data?.username);
              });
            }, 100);
          }
        }}
        onSuccess={handleUsernameSet}
      />
    </>
  );
}
