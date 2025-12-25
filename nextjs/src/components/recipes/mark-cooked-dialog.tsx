"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/ui/star-rating";
import {
  Loader2,
  ChefHat,
  CheckCircle2,
  Camera,
  X,
  Upload,
} from "lucide-react";
import { markAsCooked } from "@/app/actions/cooking-history";
import { uploadCookingPhoto } from "@/lib/upload-cooking-photo";
import { toast } from "sonner";

interface MarkCookedDialogProps {
  recipeId: string;
  recipeTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MarkCookedDialog({
  recipeId,
  recipeTitle,
  open,
  onOpenChange,
  onSuccess,
}: MarkCookedDialogProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [modifications, setModifications] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Photo state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    let photoUrl: string | null = null;

    // Upload photo if selected
    if (selectedFile) {
      setIsUploading(true);
      try {
        photoUrl = await uploadCookingPhoto(selectedFile);
      } catch {
        toast.error("Failed to upload photo");
        setIsSubmitting(false);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const result = await markAsCooked({
      recipe_id: recipeId,
      rating: rating || undefined,
      notes: notes || undefined,
      modifications: modifications || undefined,
      photo_url: photoUrl,
    });
    setIsSubmitting(false);

    if (result.error) {
      toast.error("Failed to save", {
        description: result.error,
      });
      return;
    }

    // Success! Show confirmation toast
    toast.success("Logged as cooked! 🎉", {
      description: `${recipeTitle} has been added to your cooking history.`,
      icon: <CheckCircle2 className="h-4 w-4" />,
    });

    // Reset form
    setRating(null);
    setNotes("");
    setModifications("");
    setPhotoPreview(null);
    setSelectedFile(null);
    onOpenChange(false);

    // Notify parent to refresh data
    onSuccess?.();
  };

  const handleClose = () => {
    setRating(null);
    setNotes("");
    setModifications("");
    setPhotoPreview(null);
    setSelectedFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Nice work, chef!
          </DialogTitle>
          <DialogDescription>
            You made <span className="font-medium">{recipeTitle}</span>. How did
            it go?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-2">
            <Label>Rate this cook (optional)</Label>
            <div className="flex justify-center py-2">
              <StarRating rating={rating} onChange={setRating} size="lg" />
            </div>
          </div>

          {/* Photo Upload */}
          <div className="flex flex-col gap-2">
            <Label>Add a photo (optional)</Label>
            {photoPreview ? (
              <div className="relative rounded-lg overflow-hidden border bg-muted">
                <Image
                  src={photoPreview}
                  alt="Cooking photo preview"
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={handleRemovePhoto}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to add a photo of your dish
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Max 5MB, JPG or PNG
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            {photoPreview && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <Upload className="h-4 w-4 mr-2" />
                Replace photo
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="modifications">What did you change? (optional)</Label>
            <Textarea
              id="modifications"
              placeholder="e.g., Added extra garlic, reduced salt, used coconut milk instead of cream..."
              value={modifications}
              onChange={(e) => setModifications(e.target.value)}
              rows={2}
              maxLength={2000}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="How did it taste? Any tips for next time?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={2000}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Skip
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isUploading}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? "Uploading..." : "Saving..."}
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
