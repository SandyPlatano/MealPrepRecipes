"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  FileText,
  Image as ImageIcon,
  FileDown,
  ChevronDown,
  Download,
  Clipboard,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
import { UsernameSetupModal } from "@/components/social/username-setup-modal";
import { RecipeExportPreview } from "./export/recipe-export-preview";
import {
  copyMarkdownToClipboard,
  downloadMarkdownFile,
} from "@/lib/export/recipe-to-markdown";
import { exportRecipeToPdf } from "@/lib/export/recipe-to-pdf";
import { exportRecipeToImage } from "@/lib/export/recipe-to-image";

interface ShareExportSheetProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: RecipeWithNutrition & { nutrition?: RecipeNutrition | null };
  isPublic: boolean;
  shareToken: string | null;
  viewCount: number;
}

export function ShareExportSheet({
  isOpen,
  onClose,
  recipe,
  isPublic: initialIsPublic,
  shareToken: initialShareToken,
  viewCount,
}: ShareExportSheetProps) {
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
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingImage, setExportingImage] = useState(false);
  const [exportingMarkdown, setExportingMarkdown] = useState(false);

  // Refs
  const exportPreviewRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Mount state for portal (SSR compatibility)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Check if user has username on mount
  useEffect(() => {
    async function checkUsername() {
      const { data } = await getCurrentUserProfile();
      setHasUsername(!!data?.username);
    }
    if (isOpen) {
      checkUsername();
    }
  }, [isOpen]);

  // Update share URL when token changes
  useEffect(() => {
    if (shareToken) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      setShareUrl(`${baseUrl}/shared/${shareToken}`);
    } else {
      setShareUrl(null);
    }
  }, [shareToken]);

  // Load analytics when sheet opens
  useEffect(() => {
    async function loadAnalytics() {
      const { data } = await getShareAnalytics(recipe.id);
      if (data) {
        setAnalytics(data);
      }
    }
    if (isOpen && (shareToken || isPublic)) {
      loadAnalytics();
    }
  }, [isOpen, recipe.id, shareToken, isPublic]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

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

  // Export handlers
  const handleExportPdf = async () => {
    if (!exportPreviewRef.current) return;

    setExportingPdf(true);
    try {
      await exportRecipeToPdf(exportPreviewRef.current, recipe.title);
      toast.success("PDF downloaded!");
    } catch (error) {
      console.error("PDF export failed:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportImage = async () => {
    if (!exportPreviewRef.current) return;

    setExportingImage(true);
    try {
      await exportRecipeToImage(exportPreviewRef.current, recipe.title, "png");
      toast.success("Image downloaded!");
    } catch (error) {
      console.error("Image export failed:", error);
      toast.error("Failed to generate image. Please try again.");
    } finally {
      setExportingImage(false);
    }
  };

  const handleCopyMarkdown = async () => {
    setExportingMarkdown(true);
    try {
      const success = await copyMarkdownToClipboard(recipe);
      if (success) {
        toast.success("Markdown copied to clipboard!");
      } else {
        toast.error("Failed to copy markdown");
      }
    } finally {
      setExportingMarkdown(false);
    }
  };

  const handleDownloadMarkdown = () => {
    downloadMarkdownFile(recipe);
    toast.success("Markdown file downloaded!");
  };

  // Don't render if not mounted (SSR) or not open
  if (!mounted || !isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop with blur */}
      <div
        className={cn(
          "fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm",
          "animate-in fade-in duration-200"
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-[101]",
          "max-h-[85vh]",
          "bg-background rounded-t-2xl shadow-2xl",
          "animate-in slide-in-from-bottom duration-300 ease-out",
          "flex flex-col"
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <button
            onClick={onClose}
            className="w-12 h-1.5 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors"
            aria-label="Close"
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">Share & Export</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={onClose}
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {/* Recipe Title Preview */}
          <div className="mb-4 p-3 bg-muted/50 rounded-xl">
            <p className="font-medium text-base truncate">{recipe.title}</p>
            <p className="text-sm text-muted-foreground">
              {recipe.recipe_type}
              {recipe.category && ` • ${recipe.category}`}
            </p>
          </div>

          {/* Share Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Share
            </h3>

            {/* Public Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 mb-3">
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

            {/* Share Link */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
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
              <div className="mt-4 pt-4 border-t">
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
                    <p className="text-2xl font-bold">
                      {analytics?.copies || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Saves</p>
                  </div>
                </div>
              </div>
            )}

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 mt-4">
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
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 mt-4">
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
          </div>

          {/* Divider */}
          <div className="border-t my-4" />

          {/* Export Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Export
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {/* PDF Export */}
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={handleExportPdf}
                disabled={exportingPdf}
              >
                {exportingPdf ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <FileDown className="h-6 w-6" />
                )}
                <span className="text-xs">PDF</span>
              </Button>

              {/* Markdown Export (Dropdown) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    disabled={exportingMarkdown}
                  >
                    {exportingMarkdown ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <FileText className="h-6 w-6" />
                    )}
                    <span className="text-xs flex items-center gap-1">
                      Markdown
                      <ChevronDown className="h-3 w-3" />
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  <DropdownMenuItem onClick={handleCopyMarkdown}>
                    <Clipboard className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadMarkdown}>
                    <Download className="h-4 w-4 mr-2" />
                    Download .md
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Image Export */}
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={handleExportImage}
                disabled={exportingImage}
              >
                {exportingImage ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <ImageIcon className="h-6 w-6" />
                )}
                <span className="text-xs">Image</span>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-3 text-center">
              Export includes all recipe details, nutrition, and notes
            </p>
          </div>
        </div>
      </div>

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
    </>,
    document.body
  );
}
