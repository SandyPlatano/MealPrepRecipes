import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, X, AlertCircle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface SubmitSectionProps {
  loading: boolean;
  uploadingImage: boolean;
  isEditing: boolean;
  error: string | null;
  errorRef: React.RefObject<HTMLDivElement | null>;
  setError: (error: string | null) => void;
  nutritionEnabled?: boolean;
}

export function SubmitSection({
  loading,
  uploadingImage,
  isEditing,
  error,
  errorRef,
  setError,
  nutritionEnabled = false,
}: SubmitSectionProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div
          ref={errorRef}
          className="p-4 text-sm bg-destructive/10 border border-destructive/20 rounded-lg shadow-lg animate-in slide-in-from-top-2"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-destructive mb-1">Please fix the following:</p>
              <p className="text-destructive/90">{error}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/20"
              onClick={() => setError(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Nutrition Auto-Extraction Info */}
      {!isEditing && nutritionEnabled && (
        <Alert className="bg-primary/5 border-primary/20">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Nutrition tracking enabled:</span> We&apos;ll automatically extract nutrition information from your ingredients after you create this recipe.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading || uploadingImage}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Saving..." : "Creating..."}
            </>
          ) : uploadingImage ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading Image...
            </>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Create Recipe"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
