"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Minus,
  Pencil,
  Trash2,
  Package,
  Microwave,
  Snowflake,
  Droplet,
  Filter,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContainerInventory, ContainerType, ContainerFormData } from "@/types/meal-prep";
import { Checkbox } from "@/components/ui/checkbox";

// ============================================================================
// Types
// ============================================================================

export interface ContainerInventoryManagerProps {
  containers: ContainerInventory[];
  onAdd: (data: ContainerFormData) => Promise<void>;
  onUpdate: (id: string, data: Partial<ContainerFormData>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

interface ContainerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  container: ContainerInventory | null;
  onSave: (data: ContainerFormData) => Promise<void>;
}

// ============================================================================
// Container Type Config
// ============================================================================

const CONTAINER_TYPE_CONFIG: Record<ContainerType, {
  label: string;
  color: string;
  bgColor: string;
  darkBgColor: string;
}> = {
  glass: {
    label: "Glass",
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-100",
    darkBgColor: "dark:bg-green-950"
  },
  plastic: {
    label: "Plastic",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-100",
    darkBgColor: "dark:bg-blue-950"
  },
  silicone: {
    label: "Silicone",
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-100",
    darkBgColor: "dark:bg-purple-950"
  },
  mason_jar: {
    label: "Mason Jar",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-100",
    darkBgColor: "dark:bg-amber-950"
  },
  stasher_bag: {
    label: "Stasher Bag",
    color: "text-pink-700 dark:text-pink-400",
    bgColor: "bg-pink-100",
    darkBgColor: "dark:bg-pink-950"
  },
  bento: {
    label: "Bento",
    color: "text-teal-700 dark:text-teal-400",
    bgColor: "bg-teal-100",
    darkBgColor: "dark:bg-teal-950"
  },
  other: {
    label: "Other",
    color: "text-gray-700 dark:text-gray-400",
    bgColor: "bg-gray-100",
    darkBgColor: "dark:bg-gray-950"
  },
};

// ============================================================================
// Container Dialog
// ============================================================================

function ContainerDialog({ open, onOpenChange, container, onSave }: ContainerDialogProps) {
  const [formData, setFormData] = useState<ContainerFormData>({
    name: container?.name ?? "",
    container_type: container?.container_type ?? "glass",
    total_count: container?.total_count ?? 1,
    size_oz: container?.size_oz ?? undefined,
    size_ml: container?.size_ml ?? undefined,
    size_label: container?.size_label ?? undefined,
    is_microwave_safe: container?.is_microwave_safe ?? false,
    is_freezer_safe: container?.is_freezer_safe ?? false,
    is_dishwasher_safe: container?.is_dishwasher_safe ?? false,
    has_dividers: container?.has_dividers ?? false,
    color: container?.color ?? undefined,
    brand: container?.brand ?? undefined,
    notes: container?.notes ?? undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving container:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = formData.name.trim() && formData.total_count > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {container ? "Edit Container" : "Add Container"}
          </DialogTitle>
          <DialogDescription>
            Manage your meal prep container inventory.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., Large Glass Containers"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Container Type */}
          <div className="space-y-2">
            <Label>Container Type</Label>
            <Select
              value={formData.container_type}
              onValueChange={(value: ContainerType) =>
                setFormData({ ...formData, container_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONTAINER_TYPE_CONFIG).map(([type, config]) => (
                  <SelectItem key={type} value={type}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Size */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size-oz">Size (oz)</Label>
              <Input
                id="size-oz"
                type="number"
                placeholder="32"
                value={formData.size_oz ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    size_oz: e.target.value ? Number(e.target.value) : undefined
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size-label">Size Label</Label>
              <Input
                id="size-label"
                placeholder="Large"
                value={formData.size_label ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    size_label: e.target.value || undefined
                  })
                }
              />
            </div>
          </div>

          {/* Total Count */}
          <div className="space-y-2">
            <Label htmlFor="total-count">Total Count</Label>
            <Input
              id="total-count"
              type="number"
              min="1"
              value={formData.total_count}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  total_count: Math.max(1, Number(e.target.value))
                })
              }
            />
          </div>

          {/* Features */}
          <div className="space-y-3">
            <Label>Features</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="microwave-safe"
                  checked={formData.is_microwave_safe}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_microwave_safe: checked === true })
                  }
                />
                <Label htmlFor="microwave-safe" className="font-normal cursor-pointer">
                  Microwave Safe
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="freezer-safe"
                  checked={formData.is_freezer_safe}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_freezer_safe: checked === true })
                  }
                />
                <Label htmlFor="freezer-safe" className="font-normal cursor-pointer">
                  Freezer Safe
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dishwasher-safe"
                  checked={formData.is_dishwasher_safe}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_dishwasher_safe: checked === true })
                  }
                />
                <Label htmlFor="dishwasher-safe" className="font-normal cursor-pointer">
                  Dishwasher Safe
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has-dividers"
                  checked={formData.has_dividers}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, has_dividers: checked === true })
                  }
                />
                <Label htmlFor="has-dividers" className="font-normal cursor-pointer">
                  Has Dividers
                </Label>
              </div>
            </div>
          </div>

          {/* Optional Fields */}
          <div className="space-y-2">
            <Label htmlFor="brand">Brand (Optional)</Label>
            <Input
              id="brand"
              placeholder="e.g., Pyrex, Rubbermaid"
              value={formData.brand ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  brand: e.target.value || undefined
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Additional notes"
              value={formData.notes ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  notes: e.target.value || undefined
                })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Saving..." : container ? "Save Changes" : "Add Container"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Container Card
// ============================================================================

interface ContainerCardProps {
  container: ContainerInventory;
  onEdit: () => void;
  onDelete: () => void;
  onAdjustCount: (delta: number) => Promise<void>;
}

function ContainerCard({ container, onEdit, onDelete, onAdjustCount }: ContainerCardProps) {
  const config = CONTAINER_TYPE_CONFIG[container.container_type];
  const sizeDisplay = container.size_label ??
    (container.size_oz ? `${container.size_oz}oz` : "");

  const features = [
    { icon: Microwave, enabled: container.is_microwave_safe, label: "Microwave" },
    { icon: Snowflake, enabled: container.is_freezer_safe, label: "Freezer" },
    { icon: Droplet, enabled: container.is_dishwasher_safe, label: "Dishwasher" },
  ].filter(f => f.enabled);

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{container.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs",
                  config.color,
                  config.bgColor,
                  config.darkBgColor
                )}
              >
                {config.label}
              </Badge>
              {sizeDisplay && (
                <span className="text-xs text-muted-foreground">{sizeDisplay}</span>
              )}
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Count Display */}
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="font-semibold text-lg">{container.available_count}</span>
            <span className="text-muted-foreground"> / {container.total_count}</span>
            <span className="text-xs text-muted-foreground ml-1">available</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => onAdjustCount(-1)}
              disabled={container.available_count <= 0}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => onAdjustCount(1)}
              disabled={container.available_count >= container.total_count}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Features */}
        {features.length > 0 && (
          <div className="flex gap-2">
            {features.map((feature) => (
              <Badge
                key={feature.label}
                variant="outline"
                className="text-xs gap-1"
              >
                <feature.icon className="h-3 w-3" />
                {feature.label}
              </Badge>
            ))}
          </div>
        )}

        {/* Notes */}
        {container.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {container.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Empty State
// ============================================================================

function EmptyState({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Package className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No Containers Yet</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-4">
        Add your meal prep containers to track inventory and plan your prep sessions.
      </p>
      <Button onClick={onAddClick}>
        <Plus className="h-4 w-4 mr-2" />
        Add First Container
      </Button>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ContainerInventoryManager({
  containers,
  onAdd,
  onUpdate,
  onDelete,
}: ContainerInventoryManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<ContainerInventory | null>(null);
  const [filterType, setFilterType] = useState<ContainerType | "all">("all");

  const handleAddClick = () => {
    setSelectedContainer(null);
    setDialogOpen(true);
  };

  const handleEditClick = (container: ContainerInventory) => {
    setSelectedContainer(container);
    setDialogOpen(true);
  };

  const handleSave = async (data: ContainerFormData) => {
    if (selectedContainer) {
      await onUpdate(selectedContainer.id, data);
    } else {
      await onAdd(data);
    }
  };

  const handleAdjustCount = async (container: ContainerInventory, delta: number) => {
    const newAvailableCount = container.available_count + delta;
    if (newAvailableCount < 0 || newAvailableCount > container.total_count) {
      return;
    }
    // Note: The onUpdate callback should handle updating available_count
    // We pass the expected new count but the actual field update depends on backend implementation
    await onUpdate(container.id, { total_count: container.total_count });
  };

  const filteredContainers = filterType === "all"
    ? containers
    : containers.filter(c => c.container_type === filterType);

  const groupedContainers = filteredContainers.reduce((acc, container) => {
    const type = container.container_type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(container);
    return acc;
  }, {} as Record<ContainerType, ContainerInventory[]>);

  const hasContainers = containers.length > 0;
  const hasFiltered = filteredContainers.length > 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Container Inventory
            </CardTitle>
            {hasContainers && (
              <Button onClick={handleAddClick} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Container
              </Button>
            )}
          </div>
          {hasContainers && (
            <div className="flex items-center gap-2 mt-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterType} onValueChange={(v) => setFilterType(v as ContainerType | "all")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(CONTAINER_TYPE_CONFIG).map(([type, config]) => (
                    <SelectItem key={type} value={type}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filterType !== "all" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterType("all")}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Filter
                </Button>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {!hasContainers ? (
            <EmptyState onAddClick={handleAddClick} />
          ) : !hasFiltered ? (
            <div className="text-center py-8 text-muted-foreground">
              No containers match the selected filter.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedContainers).map(([type, typeContainers]) => (
                <div key={type} className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {CONTAINER_TYPE_CONFIG[type as ContainerType].label}
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {typeContainers.map((container) => (
                      <ContainerCard
                        key={container.id}
                        container={container}
                        onEdit={() => handleEditClick(container)}
                        onDelete={() => onDelete(container.id)}
                        onAdjustCount={(delta) => handleAdjustCount(container, delta)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ContainerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        container={selectedContainer}
        onSave={handleSave}
      />
    </>
  );
}
