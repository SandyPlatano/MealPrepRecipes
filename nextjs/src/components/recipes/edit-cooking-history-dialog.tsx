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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Loader2,
  Calendar as CalendarIcon,
  Pencil,
  Camera,
  X,
  Upload,
} from "lucide-react";
import { updateCookingHistoryEntry } from "@/app/actions/cooking-history";
import {
  uploadCookingPhoto,
  deleteCookingPhoto,
} from "@/lib/upload-cooking-photo";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Flexible entry type that works with both local and typed versions
interface CookingHistoryEntryBase {
  id: string;
  cooked_at: string;
  rating: number | null;
  notes: string | null;
  modifications: string | null;
  photo_url?: string | null;
  cooked_by_profile?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

interface EditCookingHistoryDialogProps {
  entry: CookingHistoryEntryBase;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updated: CookingHistoryEntryBase) => void;
}

export function EditCookingHistoryDialog({
  entry,
  open,
  onOpenChange,
  onSuccess,
}: EditCookingHistoryDialogProps) {
  const [rating, setRating] = useState<number | null>(entry.rating);
  const [notes, setNotes] = useState(entry.notes || "");
  const [modifications, setModifications] = useState(entry.modifications || "");
  const [cookedAt, setCookedAt] = useState<Date>(new Date(entry.cooked_at));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Photo state
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    entry.photo_url || null
  );
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

  const handleRemovePhoto = async () => {
    // If there's an existing photo URL (not just preview), delete it from storage
    if (photoUrl && !photoPreview) {
      try {
        await deleteCookingPhoto(photoUrl);
      } catch {
        // Ignore delete errors - we'll still clear the UI
      }
    }
    setPhotoUrl(null);
    setPhotoPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    let finalPhotoUrl = photoUrl;

    // Upload new photo if selected
    if (selectedFile) {
      setIsUploading(true);
      try {
        // Delete old photo first if exists
        if (entry.photo_url) {
          await deleteCookingPhoto(entry.photo_url);
        }
        finalPhotoUrl = await uploadCookingPhoto(selectedFile);
      } catch {
        toast.error("Failed to upload photo");
        setIsSubmitting(false);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    // If photo was removed (no preview and no file), set to null
    if (!photoPreview && !selectedFile && !photoUrl) {
      finalPhotoUrl = null;
    }

    const result = await updateCookingHistoryEntry(entry.id, {
      rating: rating,
      notes: notes || null,
      modifications: modifications || null,
      cooked_at: cookedAt.toISOString(),
      photo_url: finalPhotoUrl,
    });
    setIsSubmitting(false);

    if (result.error) {
      toast.error("Failed to update", {
        description: result.error,
      });
      return;
    }

    toast.success("Entry updated!");
    onOpenChange(false);

    if (result.data) {
      onSuccess(result.data);
    }
  };

  const handleClose = () => {
    // Reset to original values
    setRating(entry.rating);
    setNotes(entry.notes || "");
    setModifications(entry.modifications || "");
    setCookedAt(new Date(entry.cooked_at));
    setPhotoUrl(entry.photo_url || null);
    setPhotoPreview(null);
    setSelectedFile(null);
    onOpenChange(false);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCookedAt(date);
      setCalendarOpen(false);
    }
  };

  const displayPhoto = photoPreview || photoUrl;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edit Cooking Entry
          </DialogTitle>
          <DialogDescription>
            Update the details of this cooking session.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col py-4">
          {/* Date Picker */}
          <div className="flex flex-col">
            <Label>Date Cooked</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !cookedAt && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {cookedAt ? format(cookedAt, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={cookedAt}
                  onSelect={handleDateSelect}
                  initialFocus
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Rating */}
          <div className="flex flex-col">
            <Label>Rating</Label>
            <div className="flex justify-center py-2">
              <StarRating rating={rating} onChange={setRating} size="lg" />
            </div>
            {rating !== null && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => setRating(null)}
              >
                Clear rating
              </Button>
            )}
          </div>

          {/* Photo Upload */}
          <div className="flex flex-col">
            <Label>Photo (optional)</Label>
            {displayPhoto ? (
              <div className="relative rounded-lg overflow-hidden border bg-muted">
                <Image
                  src={displayPhoto}
                  alt="Cooking photo"
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
            {displayPhoto && (
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

          {/* Modifications */}
          <div className="flex flex-col">
            <Label htmlFor="modifications">
              What did you change? (optional)
            </Label>
            <Textarea
              id="modifications"
              placeholder="e.g., Added extra garlic, reduced salt, used coconut milk instead of cream..."
              value={modifications}
              onChange={(e) => setModifications(e.target.value)}
              rows={2}
              maxLength={2000}
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col">
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
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isUploading}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? "Uploading..." : "Saving..."}
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
