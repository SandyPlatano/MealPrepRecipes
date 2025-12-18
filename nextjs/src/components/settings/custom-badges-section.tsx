"use client";

/**
 * Custom Nutrition Badges Settings Section
 * Allows users to create and manage custom nutrition badges
 * with personalized criteria for recipe categorization
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tags, Plus, X, Pencil, Trash2, Info } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  type BadgeCondition,
  type BadgeColor,
  type CustomBadge,
  EXAMPLE_BADGES,
  AVAILABLE_NUTRIENTS,
  AVAILABLE_OPERATORS,
  AVAILABLE_BADGE_COLORS,
  getBadgeColorClasses,
  formatConditionsDescription,
} from "@/lib/nutrition/badge-calculator";
import {
  getCustomBadges,
  createCustomBadge,
  updateCustomBadge,
  deleteCustomBadge,
  toggleBadgeActive,
} from "@/app/actions/custom-badges";

interface CustomBadgesSectionProps {
  /** ID for scroll targeting from sidebar navigation */
  id?: string;
  className?: string;
}

export function CustomBadgesSection({ id, className }: CustomBadgesSectionProps) {
  const [customBadges, setCustomBadges] = useState<CustomBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showExamples, setShowExamples] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<CustomBadge | null>(null);

  // Load custom badges on mount
  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    setIsLoading(true);
    const result = await getCustomBadges();
    if (result.error) {
      toast.error("Failed to load badges");
      console.error(result.error);
    } else {
      setCustomBadges(result.data || []);
    }
    setIsLoading(false);
  };

  const handleToggleActive = async (badge: CustomBadge) => {
    const result = await toggleBadgeActive(badge.id, !badge.is_active);
    if (result.error) {
      toast.error("Failed to update badge");
    } else {
      setCustomBadges((prev) =>
        prev.map((b) => (b.id === badge.id ? { ...b, is_active: !b.is_active } : b))
      );
      toast.success(badge.is_active ? "Badge disabled" : "Badge enabled");
    }
  };

  const handleDelete = async (badge: CustomBadge) => {
    const result = await deleteCustomBadge(badge.id);
    if (result.error) {
      toast.error("Failed to delete badge");
    } else {
      setCustomBadges((prev) => prev.filter((b) => b.id !== badge.id));
      toast.success("Badge deleted");
    }
  };

  const handleEdit = (badge: CustomBadge) => {
    setEditingBadge(badge);
    setIsDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingBadge(null);
    setIsDialogOpen(true);
  };

  const handleSave = async (data: { name: string; color: BadgeColor; conditions: BadgeCondition[] }) => {
    if (editingBadge) {
      const result = await updateCustomBadge({
        id: editingBadge.id,
        ...data,
      });
      if (result.error) {
        toast.error(result.error);
        return false;
      }
      setCustomBadges((prev) =>
        prev.map((b) => (b.id === editingBadge.id ? result.data! : b))
      );
      toast.success("Badge updated");
    } else {
      const result = await createCustomBadge(data);
      if (result.error) {
        toast.error(result.error);
        return false;
      }
      setCustomBadges((prev) => [result.data!, ...prev]);
      toast.success("Badge created");
    }
    setIsDialogOpen(false);
    return true;
  };

  return (
    <Card id={id} className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Tags className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-0.5">
            <CardTitle className="text-base">Nutrition Badges</CardTitle>
            <CardDescription>
              Create custom badges to categorize recipes by nutrition criteria
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator className="mb-0" />

      <CardContent className="pt-6 space-y-6">
        {/* How It Works Info */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-medium">How badges work</p>
              <p className="text-sm text-muted-foreground">
                Create custom badges to automatically label recipes based on their nutrition data.
                Badges appear on recipe cards when a recipe meets all the conditions you set.
              </p>
              <p className="text-sm text-muted-foreground">
                Each badge can have up to 4 conditions using nutrients like calories, protein, carbs, fat, fiber, sugar, or sodium.
              </p>
            </div>
          </div>

          {/* Example Badges Toggle */}
          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
              onClick={() => setShowExamples(!showExamples)}
            >
              <span className="text-xs">See example badges</span>
              <span className="text-xs text-muted-foreground">{showExamples ? "Hide" : "Show"}</span>
            </Button>

            {showExamples && (
              <div className="mt-3 space-y-2">
                {EXAMPLE_BADGES.map((badge) => {
                  const colors = getBadgeColorClasses(badge.color);
                  return (
                    <div key={badge.key} className="flex items-center gap-3 text-sm">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium shrink-0",
                          colors.bg,
                          colors.text,
                          colors.border
                        )}
                      >
                        {badge.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {badge.description}
                      </span>
                    </div>
                  );
                })}
                <p className="text-xs text-muted-foreground italic pt-1">
                  These are just examples — create your own badges below!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Custom Badges */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Your Custom Badges</Label>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={handleCreateNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Badge
                </Button>
              </DialogTrigger>
              <BadgeFormDialog
                badge={editingBadge}
                onSave={handleSave}
                onClose={() => setIsDialogOpen(false)}
              />
            </Dialog>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Loading badges...
            </div>
          ) : customBadges.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <Tags className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">No custom badges yet</p>
              <p className="text-xs text-muted-foreground">
                Create badges like &quot;Kid Friendly&quot; or &quot;Post-Workout&quot;
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {customBadges.map((badge) => (
                <CustomBadgeRow
                  key={badge.id}
                  badge={badge}
                  onToggleActive={() => handleToggleActive(badge)}
                  onEdit={() => handleEdit(badge)}
                  onDelete={() => handleDelete(badge)}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Single custom badge row with actions
 */
function CustomBadgeRow({
  badge,
  onToggleActive,
  onEdit,
  onDelete,
}: {
  badge: CustomBadge;
  onToggleActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const colors = getBadgeColorClasses(badge.color);

  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <Switch checked={badge.is_active} onCheckedChange={onToggleActive} />
        <div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                colors.bg,
                colors.text,
                colors.border,
                !badge.is_active && "opacity-50"
              )}
            >
              {badge.name}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatConditionsDescription(badge.conditions)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Badge</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{badge.name}&quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

/**
 * Badge creation/editing dialog
 */
function BadgeFormDialog({
  badge,
  onSave,
  onClose,
}: {
  badge: CustomBadge | null;
  onSave: (data: { name: string; color: BadgeColor; conditions: BadgeCondition[] }) => Promise<boolean>;
  onClose: () => void;
}) {
  const [name, setName] = useState(badge?.name || "");
  const [color, setColor] = useState<BadgeColor>(badge?.color || "coral");
  const [conditions, setConditions] = useState<BadgeCondition[]>(
    badge?.conditions || [{ nutrient: "protein_g", operator: "gt", value: 30 }]
  );
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when dialog opens with new badge
  useEffect(() => {
    setName(badge?.name || "");
    setColor(badge?.color || "coral");
    setConditions(badge?.conditions || [{ nutrient: "protein_g", operator: "gt", value: 30 }]);
  }, [badge]);

  const handleAddCondition = () => {
    if (conditions.length >= 4) {
      toast.error("Maximum 4 conditions allowed");
      return;
    }
    setConditions([...conditions, { nutrient: "calories", operator: "lt", value: 400 }]);
  };

  const handleRemoveCondition = (index: number) => {
    if (conditions.length <= 1) {
      toast.error("At least one condition is required");
      return;
    }
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleConditionChange = (
    index: number,
    field: keyof BadgeCondition,
    value: string | number
  ) => {
    setConditions(
      conditions.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Badge name is required");
      return;
    }

    setIsSaving(true);
    const success = await onSave({ name: name.trim(), color, conditions });
    setIsSaving(false);

    if (!success) {
      // Error handled by parent
    }
  };

  const previewColors = getBadgeColorClasses(color);

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{badge ? "Edit Badge" : "Create Custom Badge"}</DialogTitle>
        <DialogDescription>
          Define conditions for your custom nutrition badge
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        {/* Badge Name */}
        <div className="space-y-2">
          <Label htmlFor="badge-name">Badge Name</Label>
          <Input
            id="badge-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Post-Workout, Kid Friendly"
            maxLength={50}
          />
        </div>

        {/* Badge Color */}
        <div className="space-y-2">
          <Label>Badge Color</Label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_BADGE_COLORS.map((c) => {
              const colorClasses = getBadgeColorClasses(c.key);
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setColor(c.key)}
                  className={cn(
                    "rounded-full border-2 px-3 py-1 text-xs font-medium transition-all",
                    colorClasses.bg,
                    colorClasses.text,
                    color === c.key
                      ? "ring-2 ring-offset-2 ring-primary"
                      : "opacity-60 hover:opacity-100"
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Conditions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Conditions (ALL must be true)</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCondition}
              disabled={conditions.length >= 4}
            >
              <Plus className="mr-1 h-3 w-3" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {conditions.map((condition, index) => (
              <ConditionRow
                key={index}
                condition={condition}
                onChange={(field, value) => handleConditionChange(index, field, value)}
                onRemove={() => handleRemoveCondition(index)}
                canRemove={conditions.length > 1}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2 rounded-lg border p-3">
          <Label className="text-xs text-muted-foreground">Preview</Label>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                previewColors.bg,
                previewColors.text,
                previewColors.border
              )}
            >
              {name || "Badge Name"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatConditionsDescription(conditions) || "No conditions set"}
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? "Saving..." : badge ? "Save Changes" : "Create Badge"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

/**
 * Single condition row in the form
 */
function ConditionRow({
  condition,
  onChange,
  onRemove,
  canRemove,
}: {
  condition: BadgeCondition;
  onChange: (field: keyof BadgeCondition, value: string | number) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const nutrient = AVAILABLE_NUTRIENTS.find((n) => n.key === condition.nutrient);
  const showSecondValue = condition.operator === "between";

  return (
    <div className="flex items-center gap-2">
      {/* Nutrient Select */}
      <Select
        value={condition.nutrient}
        onValueChange={(value) => onChange("nutrient", value)}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="z-[10001]">
          {AVAILABLE_NUTRIENTS.map((n) => (
            <SelectItem key={n.key} value={n.key}>
              {n.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Operator Select */}
      <Select
        value={condition.operator}
        onValueChange={(value) => onChange("operator", value)}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="z-[10001]">
          {AVAILABLE_OPERATORS.map((op) => (
            <SelectItem key={op.key} value={op.key}>
              {op.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Value Input */}
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min="0"
          value={condition.value}
          onChange={(e) => onChange("value", parseFloat(e.target.value) || 0)}
          className="w-20 font-mono"
        />
        {showSecondValue && (
          <>
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              min="0"
              value={condition.value2 || ""}
              onChange={(e) => onChange("value2", parseFloat(e.target.value) || 0)}
              className="w-20 font-mono"
            />
          </>
        )}
        <span className="text-xs text-muted-foreground">{nutrient?.unit}</span>
      </div>

      {/* Remove Button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        disabled={!canRemove}
        className="h-8 w-8"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
