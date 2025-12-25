import { z } from "zod";

// Recipe Form Validation Schema
export const recipeFormSchema = z.object({
  title: z
    .string()
    .min(1, "Recipe title is required")
    .max(200, "Title must be 200 characters or less")
    .transform((val) => val.trim()),
  recipe_type: z
    .string()
    .min(1, "Recipe type is required"),
  category: z
    .string()
    .max(100, "Category must be 100 characters or less")
    .optional()
    .transform((val) => val?.trim() || undefined),
  protein_type: z
    .string()
    .max(100, "Protein type must be 100 characters or less")
    .optional()
    .transform((val) => val?.trim() || undefined),
  prep_time: z
    .string()
    .max(50, "Prep time must be 50 characters or less")
    .optional()
    .transform((val) => val?.trim() || undefined),
  cook_time: z
    .string()
    .max(50, "Cook time must be 50 characters or less")
    .optional()
    .transform((val) => val?.trim() || undefined),
  servings: z
    .string()
    .max(50, "Servings must be 50 characters or less")
    .optional()
    .transform((val) => val?.trim() || undefined),
  base_servings: z
    .number()
    .int()
    .min(1, "Servings must be at least 1")
    .max(100, "Servings must be 100 or less")
    .optional(),
  ingredients: z
    .array(z.string().max(500, "Ingredient must be 500 characters or less"))
    .min(1, "At least one ingredient is required")
    .transform((arr) => arr.filter((i) => i.trim().length > 0)),
  instructions: z
    .array(z.string().max(2000, "Instruction step must be 2000 characters or less"))
    .transform((arr) => arr.filter((i) => i.trim().length > 0)),
  tags: z
    .array(z.string().max(50, "Tag must be 50 characters or less"))
    .default([]),
  notes: z
    .string()
    .max(5000, "Notes must be 5000 characters or less")
    .optional()
    .transform((val) => val?.trim() || undefined),
  source_url: z
    .string()
    .url("Invalid URL format")
    .max(500, "URL must be 500 characters or less")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val?.trim() || undefined)),
  image_url: z
    .string()
    .url("Invalid image URL format")
    .max(500, "Image URL must be 500 characters or less")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val?.trim() || undefined)),
  allergen_tags: z
    .array(z.string())
    .default([]),
  is_shared_with_household: z
    .boolean()
    .default(true),
  is_public: z
    .boolean()
    .default(false),
});

export type RecipeFormInput = z.input<typeof recipeFormSchema>;
export type RecipeFormOutput = z.output<typeof recipeFormSchema>;

// Partial schema for updates (all fields optional)
export const recipeUpdateSchema = recipeFormSchema.partial();

// Shopping List Item Validation
export const shoppingListItemSchema = z.object({
  name: z
    .string()
    .min(1, "Item name is required")
    .max(200, "Item name must be 200 characters or less")
    .transform((val) => val.trim()),
  quantity: z
    .string()
    .max(50, "Quantity must be 50 characters or less")
    .optional()
    .transform((val) => val?.trim() || undefined),
  unit: z
    .string()
    .max(50, "Unit must be 50 characters or less")
    .optional()
    .transform((val) => val?.trim() || undefined),
  category: z
    .string()
    .max(100, "Category must be 100 characters or less")
    .optional()
    .transform((val) => val?.trim() || undefined),
  notes: z
    .string()
    .max(500, "Notes must be 500 characters or less")
    .optional()
    .transform((val) => val?.trim() || undefined),
});

// Meal Assignment Validation
export const mealAssignmentSchema = z.object({
  recipe_id: z
    .string()
    .uuid("Invalid recipe ID"),
  day: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Day must be in YYYY-MM-DD format"),
  meal_type: z
    .string()
    .min(1, "Meal type is required")
    .max(50, "Meal type must be 50 characters or less"),
  servings: z
    .number()
    .int()
    .min(1, "Servings must be at least 1")
    .max(100, "Servings must be 100 or less")
    .default(1),
  cook_id: z
    .string()
    .uuid("Invalid cook ID")
    .optional()
    .nullable(),
});

// Folder Validation
export const folderSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .max(100, "Folder name must be 100 characters or less")
    .transform((val) => val.trim()),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .optional()
    .nullable(),
  icon: z
    .string()
    .max(10, "Icon must be 10 characters or less")
    .optional()
    .nullable(),
  parent_id: z
    .string()
    .uuid("Invalid parent folder ID")
    .optional()
    .nullable(),
});

// Helper to safely validate and return result
export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  // Return first error message (Zod v4 uses .issues instead of .errors)
  const firstIssue = result.error.issues[0];
  return {
    success: false,
    error: firstIssue?.message || "Validation failed",
  };
}
