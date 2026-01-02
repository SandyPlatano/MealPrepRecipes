"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Pencil, Trash2, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CookAvatar } from "./cook-avatar";
import {
  createCustomCook,
  updateCustomCook,
  deleteCustomCook,
  uploadCookAvatar,
} from "@/app/actions/settings";
import type { HouseholdCook } from "@/types/household-cooks";
import { COOK_COLORS } from "@/types/household-cooks";
import { cn } from "@/lib/utils";

interface CustomCooksManagerProps {
  initialCooks: HouseholdCook[];
}

export function CustomCooksManager({ initialCooks }: CustomCooksManagerProps) {
  const [cooks, setCooks] = useState<HouseholdCook[]>(initialCooks);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCook, setEditingCook] = useState<HouseholdCook | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add/Edit form state
  const [formName, setFormName] = useState("");
  const [formColor, setFormColor] = useState<string>(COOK_COLORS[0]);

  const resetForm = () => {
    setFormName("");
    setFormColor(COOK_COLORS[0]);
  };

  const openEditDialog = (cook: HouseholdCook) => {
    setEditingCook(cook);
    setFormName(cook.name);
    setFormColor(cook.color || COOK_COLORS[0]);
  };

  const closeDialog = () => {
    setIsAddDialogOpen(false);
    setEditingCook(null);
    resetForm();
  };

  const handleAddCook = async () => {
    if (!formName.trim()) {
      toast.error("Please enter a name");
      return;
    }

    setIsLoading(true);
    const { error, data } = await createCustomCook({
      name: formName.trim(),
      color: formColor,
    });
    setIsLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    if (data) {
      setCooks((prev) => [...prev, data]);
      toast.success("Cook added successfully");
      closeDialog();
    }
  };

  const handleUpdateCook = async () => {
    if (!editingCook || !formName.trim()) {
      toast.error("Please enter a name");
      return;
    }

    setIsLoading(true);
    const { error } = await updateCustomCook(editingCook.id, {
      name: formName.trim(),
      color: formColor,
    });
    setIsLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    setCooks((prev) =>
      prev.map((c) =>
        c.id === editingCook.id
          ? { ...c, name: formName.trim(), color: formColor }
          : c
      )
    );
    toast.success("Cook updated successfully");
    closeDialog();
  };

  const handleDeleteCook = async (cookId: string) => {
    setIsLoading(true);
    const { error } = await deleteCustomCook(cookId);
    setIsLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    setCooks((prev) => prev.filter((c) => c.id !== cookId));
    toast.success("Cook deleted");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => resetForm()}>
              <Plus className="size-4 mr-2" />
              Add Cook
            </Button>
          </DialogTrigger>
          <DialogContent>
            <CookFormContent
              title="Add Custom Cook"
              description="Add a family member who doesn't have their own account."
              formName={formName}
              formColor={formColor}
              onNameChange={setFormName}
              onColorChange={setFormColor}
              onSubmit={handleAddCook}
              onCancel={closeDialog}
              isLoading={isLoading}
              submitLabel="Add Cook"
            />
          </DialogContent>
        </Dialog>
      </div>

      {cooks.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No custom cooks yet. Add family members who don&apos;t have their own accounts.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {cooks.map((cook) => (
            <CookRow
              key={cook.id}
              cook={cook}
              onEdit={() => openEditDialog(cook)}
              onDelete={() => handleDeleteCook(cook.id)}
              onAvatarUploaded={(url) => {
                setCooks((prev) =>
                  prev.map((c) =>
                    c.id === cook.id ? { ...c, avatar_url: url } : c
                  )
                );
              }}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingCook} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <CookFormContent
            title="Edit Cook"
            description="Update cook details."
            formName={formName}
            formColor={formColor}
            onNameChange={setFormName}
            onColorChange={setFormColor}
            onSubmit={handleUpdateCook}
            onCancel={closeDialog}
            isLoading={isLoading}
            submitLabel="Save Changes"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CookFormContentProps {
  title: string;
  description: string;
  formName: string;
  formColor: string;
  onNameChange: (name: string) => void;
  onColorChange: (color: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  submitLabel: string;
}

function CookFormContent({
  title,
  description,
  formName,
  formColor,
  onNameChange,
  onColorChange,
  onSubmit,
  onCancel,
  isLoading,
  submitLabel,
}: CookFormContentProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="cook-name">Name</Label>
          <Input
            id="cook-name"
            placeholder="e.g., Grandma, Kids"
            value={formName}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Color</Label>
          <div className="flex gap-2">
            {COOK_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={cn(
                  "size-8 rounded-full transition-all",
                  formColor === color
                    ? "ring-2 ring-offset-2 ring-primary scale-110"
                    : "hover:scale-105"
                )}
                style={{ backgroundColor: color }}
                onClick={() => onColorChange(color)}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <CookAvatar
            name={formName || "Preview"}
            color={formColor}
            size="lg"
          />
          <span className="text-sm text-muted-foreground">Preview</span>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={isLoading}>
          {isLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
          {submitLabel}
        </Button>
      </DialogFooter>
    </>
  );
}

interface CookRowProps {
  cook: HouseholdCook;
  onEdit: () => void;
  onDelete: () => void;
  onAvatarUploaded: (url: string) => void;
}

function CookRow({ cook, onEdit, onDelete, onAvatarUploaded }: CookRowProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    const { error, url } = await uploadCookAvatar(cook.id, formData);
    setIsUploading(false);

    if (error) {
      toast.error(error);
      return;
    }

    if (url) {
      onAvatarUploaded(url);
      toast.success("Avatar uploaded");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <button
        type="button"
        className="relative group"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        <CookAvatar
          name={cook.name}
          avatarUrl={cook.avatar_url}
          color={cook.color}
          size="lg"
        />
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
          {isUploading ? (
            <Loader2 className="size-4 text-white animate-spin" />
          ) : (
            <Upload className="size-4 text-white" />
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarUpload}
        />
      </button>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{cook.name}</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="size-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="size-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
