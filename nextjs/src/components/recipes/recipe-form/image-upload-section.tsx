import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { uploadRecipeImage } from "@/app/actions/recipes";

interface ImageUploadSectionProps {
  imageUrl: string;
  uploadingImage: boolean;
  title: string;
  handleImageUpload: (url: string) => void;
  handleRemoveImage: () => void;
  setUploadingImageState: (state: boolean) => void;
}

export function ImageUploadSection({
  imageUrl,
  uploadingImage,
  title,
  handleImageUpload,
  handleRemoveImage,
  setUploadingImageState,
}: ImageUploadSectionProps) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImageState(true);
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadRecipeImage(formData);

    if (result.error) {
      toast.error(result.error);
    } else if (result.data) {
      handleImageUpload(result.data.url);
      toast.success("Image uploaded!");
    }

    setUploadingImageState(false);
    e.target.value = ""; // Reset input
  };

  return (
    <div className="flex flex-col gap-2">
      <Label>Recipe Image</Label>
      {imageUrl ? (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border">
          <Image
            src={imageUrl}
            alt={title || "Recipe image"}
            fill
            className="object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-48 border-2 border-dashed rounded-lg hover:border-primary/50 transition-colors">
          <label htmlFor="image-upload" className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
            {uploadingImage ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload image</span>
                <span className="text-xs text-muted-foreground">PNG, JPG, WebP or GIF (max 5MB)</span>
              </div>
            )}
            <input
              id="image-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              disabled={uploadingImage}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
}
