"use server";

import { createClient } from "@/lib/supabase/server";
import { getCachedUserWithHousehold } from "@/lib/supabase/cached-queries";
import { revalidatePath } from "next/cache";
import type {
  CustomFieldDefinition,
  CustomFieldDefinitionFormData,
  CustomFieldValue,
} from "@/types/custom-fields";

// ============================================================================
// Field Definitions
// ============================================================================

/**
 * Get all custom field definitions for a household
 */
export async function getCustomFieldDefinitions(householdId: string): Promise<{
  data: CustomFieldDefinition[] | null;
  error: string | null;
}> {
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("custom_recipe_field_definitions")
    .select("*")
    .eq("household_id", householdId)
    .order("sort_order", { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  // Map snake_case to camelCase
  const mappedData: CustomFieldDefinition[] = (data || []).map((row) => ({
    id: row.id,
    householdId: row.household_id,
    name: row.name,
    slug: row.slug,
    fieldType: row.field_type,
    description: row.description,
    isRequired: row.is_required,
    defaultValue: row.default_value,
    options: row.options,
    validationRules: row.validation_rules,
    showInCard: row.show_in_card,
    showInFilters: row.show_in_filters,
    sortOrder: row.sort_order,
    icon: row.icon,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return { data: mappedData, error: null };
}

/**
 * Create a new custom field definition
 */
export async function createFieldDefinition(
  householdId: string,
  formData: CustomFieldDefinitionFormData
): Promise<{ data: CustomFieldDefinition | null; error: string | null }> {
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Generate slug from name
  const slug = formData.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  // Get the next sort_order
  const { data: existingFields } = await supabase
    .from("custom_recipe_field_definitions")
    .select("sort_order")
    .eq("household_id", householdId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextSortOrder = existingFields?.[0]?.sort_order
    ? existingFields[0].sort_order + 1
    : 0;

  const { data, error } = await supabase
    .from("custom_recipe_field_definitions")
    .insert({
      household_id: householdId,
      name: formData.name,
      slug,
      field_type: formData.fieldType,
      description: formData.description || null,
      is_required: formData.isRequired || false,
      default_value: formData.defaultValue || null,
      options: formData.options || null,
      validation_rules: formData.validationRules || null,
      show_in_card: formData.showInCard || false,
      show_in_filters: formData.showInFilters || true,
      sort_order: nextSortOrder,
      icon: formData.icon || null,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  // Map to camelCase
  const mappedData: CustomFieldDefinition = {
    id: data.id,
    householdId: data.household_id,
    name: data.name,
    slug: data.slug,
    fieldType: data.field_type,
    description: data.description,
    isRequired: data.is_required,
    defaultValue: data.default_value,
    options: data.options,
    validationRules: data.validation_rules,
    showInCard: data.show_in_card,
    showInFilters: data.show_in_filters,
    sortOrder: data.sort_order,
    icon: data.icon,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  revalidatePath("/app/settings");
  revalidatePath("/app/recipes");

  return { data: mappedData, error: null };
}

/**
 * Update an existing custom field definition
 */
export async function updateFieldDefinition(
  id: string,
  formData: Partial<CustomFieldDefinitionFormData>
): Promise<{ error: string | null }> {
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Build update object
  const updateData: Record<string, unknown> = {};

  if (formData.name !== undefined) {
    updateData.name = formData.name;
    // Update slug if name changes
    updateData.slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }
  if (formData.fieldType !== undefined) updateData.field_type = formData.fieldType;
  if (formData.description !== undefined) updateData.description = formData.description;
  if (formData.isRequired !== undefined) updateData.is_required = formData.isRequired;
  if (formData.defaultValue !== undefined) updateData.default_value = formData.defaultValue;
  if (formData.options !== undefined) updateData.options = formData.options;
  if (formData.validationRules !== undefined) updateData.validation_rules = formData.validationRules;
  if (formData.showInCard !== undefined) updateData.show_in_card = formData.showInCard;
  if (formData.showInFilters !== undefined) updateData.show_in_filters = formData.showInFilters;
  if (formData.icon !== undefined) updateData.icon = formData.icon;

  const { error } = await supabase
    .from("custom_recipe_field_definitions")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/recipes");

  return { error: null };
}

/**
 * Delete a custom field definition (cascades to all values)
 */
export async function deleteFieldDefinition(id: string): Promise<{ error: string | null }> {
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("custom_recipe_field_definitions")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/recipes");

  return { error: null };
}

/**
 * Reorder field definitions
 */
export async function reorderFieldDefinitions(
  householdId: string,
  orderedIds: string[]
): Promise<{ error: string | null }> {
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Update sort_order for each field
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("custom_recipe_field_definitions")
      .update({ sort_order: index })
      .eq("id", id)
      .eq("household_id", householdId)
  );

  const results = await Promise.all(updates);

  const firstError = results.find((r) => r.error);
  if (firstError?.error) {
    return { error: firstError.error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app/recipes");

  return { error: null };
}

// ============================================================================
// Field Values
// ============================================================================

/**
 * Get all custom field values for a recipe
 */
export async function getFieldValues(recipeId: string): Promise<{
  data: CustomFieldValue[] | null;
  error: string | null;
}> {
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("custom_recipe_field_values")
    .select("*")
    .eq("recipe_id", recipeId);

  if (error) {
    return { error: error.message, data: null };
  }

  // Map to camelCase
  const mappedData: CustomFieldValue[] = (data || []).map((row) => ({
    id: row.id,
    recipeId: row.recipe_id,
    fieldDefinitionId: row.field_definition_id,
    value: row.value,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return { data: mappedData, error: null };
}

/**
 * Set a custom field value for a recipe (upsert)
 */
export async function setFieldValue(
  recipeId: string,
  fieldDefinitionId: string,
  value: unknown
): Promise<{ error: string | null }> {
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("custom_recipe_field_values").upsert(
    {
      recipe_id: recipeId,
      field_definition_id: fieldDefinitionId,
      value,
    },
    {
      onConflict: "recipe_id,field_definition_id",
    }
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  revalidatePath(`/app/recipes/${recipeId}`);

  return { error: null };
}

/**
 * Bulk set field values for a recipe
 */
export async function bulkSetFieldValues(
  recipeId: string,
  values: { fieldDefinitionId: string; value: unknown }[]
): Promise<{ error: string | null }> {
  const { user } = await getCachedUserWithHousehold();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  const rows = values.map((v) => ({
    recipe_id: recipeId,
    field_definition_id: v.fieldDefinitionId,
    value: v.value,
  }));

  const { error } = await supabase
    .from("custom_recipe_field_values")
    .upsert(rows, {
      onConflict: "recipe_id,field_definition_id",
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/recipes");
  revalidatePath(`/app/recipes/${recipeId}`);

  return { error: null };
}
