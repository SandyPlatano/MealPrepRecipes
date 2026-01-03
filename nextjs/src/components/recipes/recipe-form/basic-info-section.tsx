import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RecipeType } from "@/types/recipe";
import { DEFAULT_RECIPE_TYPES } from "@/types/recipe";
import { ImageUploadSection } from "./image-upload-section";

interface CustomRecipeType {
  id: string;
  name: string;
  emoji: string | null;
}

interface BasicInfoSectionProps {
  title: string;
  setTitle: (value: string) => void;
  recipeType: RecipeType;
  setRecipeType: (value: RecipeType) => void;
  category: string;
  setCategory: (value: string) => void;
  proteinType: string;
  setProteinType: (value: string) => void;
  prepTime: string;
  setPrepTime: (value: string) => void;
  cookTime: string;
  setCookTime: (value: string) => void;
  servings: string;
  setServings: (value: string) => void;
  baseServings: number | undefined;
  setBaseServings: (value: number | undefined) => void;
  imageUrl: string;
  uploadingImage: boolean;
  handleImageUpload: (url: string) => void;
  handleRemoveImage: () => void;
  setUploadingImageState: (state: boolean) => void;
  customRecipeTypes: CustomRecipeType[];
  typesLoading: boolean;
}

export function BasicInfoSection({
  title,
  setTitle,
  recipeType,
  setRecipeType,
  category,
  setCategory,
  proteinType,
  setProteinType,
  prepTime,
  setPrepTime,
  cookTime,
  setCookTime,
  servings,
  setServings,
  baseServings,
  setBaseServings,
  imageUrl,
  uploadingImage,
  handleImageUpload,
  handleRemoveImage,
  setUploadingImageState,
  customRecipeTypes,
  typesLoading,
}: BasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Info</CardTitle>
        <CardDescription>
          The essentials. What are we cooking?
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Recipe Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Sheet Pan Lemon Herb Chicken"
            required
            maxLength={200}
          />
          {title.length > 150 && (
            <p className={`text-xs ${title.length >= 200 ? "text-destructive" : "text-muted-foreground"}`}>
              {title.length}/200 characters
            </p>
          )}
        </div>

        <ImageUploadSection
          imageUrl={imageUrl}
          uploadingImage={uploadingImage}
          title={title}
          handleImageUpload={handleImageUpload}
          handleRemoveImage={handleRemoveImage}
          setUploadingImageState={setUploadingImageState}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="recipeType">Type *</Label>
            <Select
              value={recipeType}
              onValueChange={(value) => setRecipeType(value as RecipeType)}
              disabled={typesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={typesLoading ? "Loading..." : "Select type"} />
              </SelectTrigger>
              <SelectContent>
                {customRecipeTypes.length > 0 ? (
                  customRecipeTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      <span className="flex items-center gap-2">
                        {type.emoji && <span>{type.emoji}</span>}
                        <span>{type.name}</span>
                      </span>
                    </SelectItem>
                  ))
                ) : (
                  DEFAULT_RECIPE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Chicken, Pasta, Salad"
              maxLength={100}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="proteinType">Protein Type</Label>
          <Input
            id="proteinType"
            value={proteinType}
            onChange={(e) => setProteinType(e.target.value)}
            placeholder="e.g., Chicken, Beef, Vegetarian"
            maxLength={100}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="baseServings">
              Number of Servings{" "}
              <span className="text-xs text-muted-foreground">(for scaling)</span>
            </Label>
            <Input
              id="baseServings"
              type="number"
              min="1"
              value={baseServings || ""}
              onChange={(e) => {
                const val = e.target.value;
                setBaseServings(val ? parseInt(val) : undefined);
              }}
              placeholder="e.g., 4"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="servings">
              Servings Description{" "}
              <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="servings"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              placeholder="e.g., Serves 4-6 or Makes 24 cookies"
              maxLength={100}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="prepTime">Prep Time</Label>
            <Input
              id="prepTime"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              placeholder="e.g., 15 minutes"
              maxLength={50}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="cookTime">Cook Time</Label>
            <Input
              id="cookTime"
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              placeholder="e.g., 35 minutes"
              maxLength={50}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
