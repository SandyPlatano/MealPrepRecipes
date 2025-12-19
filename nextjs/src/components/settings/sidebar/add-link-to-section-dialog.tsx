"use client";

import { useState } from "react";
import { Link as LinkIcon, Smile, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { LinkPresetGrid } from "./link-preset-grid";
import type { LinkPreset } from "@/lib/sidebar/link-presets";
import type {
  CustomSectionItem,
  InternalLinkItem,
  ExternalLinkItem,
} from "@/types/sidebar-customization";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

interface AddLinkToSectionDialogProps {
  open: boolean;
  onClose: () => void;
  onAddItem: (item: Omit<CustomSectionItem, "id" | "sortOrder">) => Promise<void>;
  existingHrefs?: string[];
}

type LinkType = "internal" | "external";

interface LinkForm {
  type: LinkType;
  label: string;
  url: string;
  emoji: string | null;
  openInNewTab: boolean;
}

const INITIAL_FORM: LinkForm = {
  type: "internal",
  label: "",
  url: "",
  emoji: null,
  openInNewTab: true,
};

type DialogView = "presets" | "preset-form" | "custom";

export function AddLinkToSectionDialog({
  open,
  onClose,
  onAddItem,
  existingHrefs = [],
}: AddLinkToSectionDialogProps) {
  const [form, setForm] = useState<LinkForm>(INITIAL_FORM);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogView, setDialogView] = useState<DialogView>("presets");
  const [activeTab, setActiveTab] = useState<"quick" | "app-page" | "external-url">("quick");

  const handleCloseDialog = () => {
    setForm(INITIAL_FORM);
    setShowEmojiPicker(false);
    setDialogView("presets");
    setActiveTab("quick");
    onClose();
  };

  const handleAddLink = async () => {
    if (!form.label.trim() || !form.url.trim()) return;

    setIsSubmitting(true);
    try {
      if (form.type === "internal") {
        const href = form.url.startsWith("/") ? form.url : `/${form.url}`;
        const internalItem: Omit<InternalLinkItem, "id" | "sortOrder"> = {
          type: "internal-link",
          label: form.label.trim(),
          href,
          icon: null,
          emoji: form.emoji,
        };
        await onAddItem(internalItem);
      } else {
        let url = form.url.trim();
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          url = `https://${url}`;
        }
        const externalItem: Omit<ExternalLinkItem, "id" | "sortOrder"> = {
          type: "external-link",
          label: form.label.trim(),
          url,
          icon: null,
          emoji: form.emoji,
          openInNewTab: form.openInNewTab,
        };
        await onAddItem(externalItem);
      }

      handleCloseDialog();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmojiSelect = (emojiData: { native: string }) => {
    setForm((prev) => ({ ...prev, emoji: emojiData.native }));
    setShowEmojiPicker(false);
  };

  const handleClearEmoji = () => {
    setForm((prev) => ({ ...prev, emoji: null }));
  };

  const handleTabChange = (value: string) => {
    const tab = value as "quick" | "app-page" | "external-url";
    setActiveTab(tab);

    if (tab === "app-page") {
      setForm((prev) => ({ ...prev, type: "internal", url: "" }));
    } else if (tab === "external-url") {
      setForm((prev) => ({ ...prev, type: "external", url: "" }));
    }
  };

  const handleSelectPreset = (preset: LinkPreset) => {
    setForm({
      type: "internal",
      label: preset.label,
      url: preset.href,
      emoji: preset.emoji,
      openInNewTab: false,
    });
    setDialogView("preset-form");
  };

  const handleBackToPresets = () => {
    setForm(INITIAL_FORM);
    setDialogView("presets");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="size-5" />
            Add Link
          </DialogTitle>
          <DialogDescription>
            Add a custom link to the Meal Planning section.
          </DialogDescription>
        </DialogHeader>

        {/* Preset Form View (after selecting a preset) */}
        {dialogView === "preset-form" ? (
          <>
            <div className="flex flex-col gap-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToPresets}
                className="text-muted-foreground -ml-2"
              >
                <ArrowLeft className="size-4 mr-1" />
                Back to presets
              </Button>

              <div className="flex flex-col gap-2">
                <Label htmlFor="link-label">Label</Label>
                <Input
                  id="link-label"
                  value={form.label}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, label: e.target.value }))
                  }
                  placeholder="e.g., My Recipes"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="link-url">App Path</Label>
                <Input
                  id="link-url"
                  value={form.url}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, url: e.target.value }))
                  }
                  placeholder="/app/recipes"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Icon (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-10 w-10 text-lg",
                          !form.emoji && "text-muted-foreground"
                        )}
                      >
                        {form.emoji || <Smile className="size-4" />}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[10000]" align="start" usePortal={false}>
                      <Picker
                        data={data}
                        onEmojiSelect={handleEmojiSelect}
                        theme="auto"
                        previewPosition="none"
                        skinTonePosition="search"
                      />
                    </PopoverContent>
                  </Popover>

                  {form.emoji && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClearEmoji}
                      className="h-8 w-8"
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleAddLink}
                disabled={isSubmitting || !form.label.trim() || !form.url.trim()}
              >
                {isSubmitting ? "Adding..." : "Add Link"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          /* Tabbed View */
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="quick">Quick Add</TabsTrigger>
              <TabsTrigger value="app-page">App Page</TabsTrigger>
              <TabsTrigger value="external-url">External URL</TabsTrigger>
            </TabsList>

            {/* Quick Add Tab */}
            <TabsContent value="quick" className="mt-0">
              <LinkPresetGrid
                existingHrefs={existingHrefs}
                onSelectPreset={handleSelectPreset}
              />
            </TabsContent>

            {/* App Page Tab */}
            <TabsContent value="app-page" className="mt-0">
              <div className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="app-page-label">Label</Label>
                  <Input
                    id="app-page-label"
                    value={form.label}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, label: e.target.value }))
                    }
                    placeholder="e.g., My Recipes"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="app-page-path">App Path</Label>
                  <Input
                    id="app-page-path"
                    value={form.url}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, url: e.target.value }))
                    }
                    placeholder="/app/recipes"
                  />
                  <p className="text-xs text-muted-foreground">
                    Start with / for app pages (e.g., /app/recipes)
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Icon (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-10 w-10 text-lg",
                            !form.emoji && "text-muted-foreground"
                          )}
                        >
                          {form.emoji || <Smile className="size-4" />}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[10000]" align="start" usePortal={false}>
                        <Picker
                          data={data}
                          onEmojiSelect={handleEmojiSelect}
                          theme="auto"
                          previewPosition="none"
                          skinTonePosition="search"
                        />
                      </PopoverContent>
                    </Popover>

                    {form.emoji && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClearEmoji}
                        className="h-8 w-8"
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddLink}
                  disabled={isSubmitting || !form.label.trim() || !form.url.trim()}
                >
                  {isSubmitting ? "Adding..." : "Add Link"}
                </Button>
              </DialogFooter>
            </TabsContent>

            {/* External URL Tab */}
            <TabsContent value="external-url" className="mt-0">
              <div className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="external-url-label">Label</Label>
                  <Input
                    id="external-url-label"
                    value={form.label}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, label: e.target.value }))
                    }
                    placeholder="e.g., YouTube Tutorial"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="external-url-input">URL</Label>
                  <Input
                    id="external-url-input"
                    value={form.url}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, url: e.target.value }))
                    }
                    placeholder="https://youtube.com/..."
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Icon (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-10 w-10 text-lg",
                            !form.emoji && "text-muted-foreground"
                          )}
                        >
                          {form.emoji || <Smile className="size-4" />}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[10000]" align="start" usePortal={false}>
                        <Picker
                          data={data}
                          onEmojiSelect={handleEmojiSelect}
                          theme="auto"
                          previewPosition="none"
                          skinTonePosition="search"
                        />
                      </PopoverContent>
                    </Popover>

                    {form.emoji && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClearEmoji}
                        className="h-8 w-8"
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="new-tab" className="text-sm">
                    Open in new tab
                  </Label>
                  <Switch
                    id="new-tab"
                    checked={form.openInNewTab}
                    onCheckedChange={(checked) =>
                      setForm((prev) => ({ ...prev, openInNewTab: checked }))
                    }
                  />
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddLink}
                  disabled={isSubmitting || !form.label.trim() || !form.url.trim()}
                >
                  {isSubmitting ? "Adding..." : "Add Link"}
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
