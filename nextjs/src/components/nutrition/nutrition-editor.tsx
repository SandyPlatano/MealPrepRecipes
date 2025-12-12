"use client";

/**
 * Nutrition Editor Component
 * Form for manually entering or editing recipe nutrition data
 */

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";
import { updateRecipeNutrition } from "@/app/actions/nutrition";
import type { RecipeNutrition, NutritionData } from "@/types/nutrition";
import { validateNutritionRanges } from "@/lib/ai/nutrition-extraction-prompt";
import { toast } from "sonner";

const nutritionSchema = z.object({
  calories: z.coerce.number().min(0).max(5000).optional().nullable(),
  protein_g: z.coerce.number().min(0).max(500).optional().nullable(),
  carbs_g: z.coerce.number().min(0).max(1000).optional().nullable(),
  fat_g: z.coerce.number().min(0).max(500).optional().nullable(),
  fiber_g: z.coerce.number().min(0).max(100).optional().nullable(),
  sugar_g: z.coerce.number().min(0).max(500).optional().nullable(),
  sodium_mg: z.coerce.number().min(0).max(10000).optional().nullable(),
});

type NutritionFormData = z.infer<typeof nutritionSchema>;

interface NutritionEditorProps {
  recipeId: string;
  initialNutrition?: RecipeNutrition | null;
  onSave: (nutrition: RecipeNutrition) => void;
  onCancel: () => void;
}

export function NutritionEditor({
  recipeId,
  initialNutrition,
  onSave,
  onCancel,
}: NutritionEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [warnings, setWarnings] = useState<string[]>([]);

  const form = useForm<NutritionFormData>({
    resolver: zodResolver(nutritionSchema),
    defaultValues: {
      calories: initialNutrition?.calories ?? null,
      protein_g: initialNutrition?.protein_g ?? null,
      carbs_g: initialNutrition?.carbs_g ?? null,
      fat_g: initialNutrition?.fat_g ?? null,
      fiber_g: initialNutrition?.fiber_g ?? null,
      sugar_g: initialNutrition?.sugar_g ?? null,
      sodium_mg: initialNutrition?.sodium_mg ?? null,
    },
  });

  // Validate on change
  const handleValidation = () => {
    const values = form.getValues();
    const validationWarnings = validateNutritionRanges(values as NutritionData);
    setWarnings(validationWarnings);
  };

  const onSubmit = (data: NutritionFormData) => {
    startTransition(async () => {
      try {
        const result = await updateRecipeNutrition(recipeId, data as NutritionData);

        if (result.error) {
          toast.error("Failed to save nutrition data", {
            description: result.error,
          });
          return;
        }

        if (result.data) {
          toast.success("Nutrition data saved successfully");
          onSave(result.data);
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error(error);
      }
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialNutrition ? "Edit Nutrition Data" : "Add Nutrition Data"}
          </DialogTitle>
          <DialogDescription>
            Enter nutrition information per serving. Leave fields blank if unknown.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Warnings */}
            {warnings.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold">Validation Warnings:</div>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                    {warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Primary Macros */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Primary Nutrients</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="calories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="450"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            field.onChange(e.target.value ? Number(e.target.value) : null);
                            handleValidation();
                          }}
                        />
                      </FormControl>
                      <FormDescription>kcal per serving</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="protein_g"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="30.5"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            field.onChange(e.target.value ? Number(e.target.value) : null);
                            handleValidation();
                          }}
                        />
                      </FormControl>
                      <FormDescription>grams per serving</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="carbs_g"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carbohydrates</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="40.0"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            field.onChange(e.target.value ? Number(e.target.value) : null);
                            handleValidation();
                          }}
                        />
                      </FormControl>
                      <FormDescription>grams per serving</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fat_g"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fat</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="15.5"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            field.onChange(e.target.value ? Number(e.target.value) : null);
                            handleValidation();
                          }}
                        />
                      </FormControl>
                      <FormDescription>grams per serving</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Nutrients */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Additional Nutrients (Optional)</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fiber_g"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fiber</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="5.0"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            field.onChange(e.target.value ? Number(e.target.value) : null);
                            handleValidation();
                          }}
                        />
                      </FormControl>
                      <FormDescription>grams per serving</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sugar_g"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sugar</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="8.0"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            field.onChange(e.target.value ? Number(e.target.value) : null);
                            handleValidation();
                          }}
                        />
                      </FormControl>
                      <FormDescription>grams per serving</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sodium_mg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sodium</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="600"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            field.onChange(e.target.value ? Number(e.target.value) : null);
                            handleValidation();
                          }}
                        />
                      </FormControl>
                      <FormDescription>milligrams per serving</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Nutrition Data
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
