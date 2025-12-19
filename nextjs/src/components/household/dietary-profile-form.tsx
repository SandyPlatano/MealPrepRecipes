"use client";

/**
 * Dietary Profile Form
 * Component for editing user's dietary profile in household coordination
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Save, Loader2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import {
  getMyDietaryProfile,
  upsertMyDietaryProfile,
} from "@/app/actions/household";
import type {
  MemberDietaryProfile,
  MemberDietaryProfileFormData,
  SpiceTolerance,
} from "@/types/household";
import {
  COMMON_DIETARY_RESTRICTIONS,
  COMMON_ALLERGENS,
  SPICE_TOLERANCE_LABELS,
  SPICE_TOLERANCE_EMOJIS,
} from "@/types/household";

interface DietaryProfileFormProps {
  initialProfile?: MemberDietaryProfile | null;
  className?: string;
}

export function DietaryProfileForm({
  initialProfile,
  className,
}: DietaryProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>(
    initialProfile?.dietary_restrictions ?? []
  );
  const [customRestriction, setCustomRestriction] = useState("");

  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(
    initialProfile?.allergens ?? []
  );
  const [customAllergen, setCustomAllergen] = useState("");

  const [dislikesText, setDislikesText] = useState(
    initialProfile?.dislikes?.join(", ") ?? ""
  );
  const [preferencesText, setPreferencesText] = useState(
    initialProfile?.preferences?.join(", ") ?? ""
  );

  const [spiceTolerance, setSpiceTolerance] = useState<SpiceTolerance | null>(
    initialProfile?.spice_tolerance ?? null
  );

  const [notes, setNotes] = useState(initialProfile?.notes ?? "");

  // Load profile on mount if not provided
  useEffect(() => {
    if (!initialProfile) {
      loadProfile();
    }
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    const result = await getMyDietaryProfile();

    if (result.error) {
      toast.error(result.error);
    } else if (result.data) {
      setSelectedRestrictions(result.data.dietary_restrictions ?? []);
      setSelectedAllergens(result.data.allergens ?? []);
      setDislikesText(result.data.dislikes?.join(", ") ?? "");
      setPreferencesText(result.data.preferences?.join(", ") ?? "");
      setSpiceTolerance(result.data.spice_tolerance ?? null);
      setNotes(result.data.notes ?? "");
    }

    setIsLoading(false);
  };

  // Handlers for dietary restrictions
  const toggleRestriction = (restriction: string) => {
    setSelectedRestrictions((prev) =>
      prev.includes(restriction)
        ? prev.filter((r) => r !== restriction)
        : [...prev, restriction]
    );
  };

  const addCustomRestriction = () => {
    const trimmed = customRestriction.trim();
    if (trimmed && !selectedRestrictions.includes(trimmed)) {
      setSelectedRestrictions([...selectedRestrictions, trimmed]);
      setCustomRestriction("");
    }
  };

  const removeRestriction = (restriction: string) => {
    setSelectedRestrictions(
      selectedRestrictions.filter((r) => r !== restriction)
    );
  };

  // Handlers for allergens
  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen]
    );
  };

  const addCustomAllergen = () => {
    const trimmed = customAllergen.trim();
    if (trimmed && !selectedAllergens.includes(trimmed)) {
      setSelectedAllergens([...selectedAllergens, trimmed]);
      setCustomAllergen("");
    }
  };

  const removeAllergen = (allergen: string) => {
    setSelectedAllergens(selectedAllergens.filter((a) => a !== allergen));
  };

  // Parse comma-separated text into arrays
  const parseTextList = (text: string): string[] => {
    return text
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  // Save handler
  const handleSave = async () => {
    setIsSaving(true);

    const formData: MemberDietaryProfileFormData = {
      dietary_restrictions: selectedRestrictions,
      allergens: selectedAllergens,
      dislikes: parseTextList(dislikesText),
      preferences: parseTextList(preferencesText),
      spice_tolerance: spiceTolerance,
      notes: notes.trim() || null,
    };

    const result = await upsertMyDietaryProfile(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Dietary profile saved successfully");
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5" />
          My Dietary Profile
        </CardTitle>
        <CardDescription>
          Share your dietary needs so your household can plan meals that work
          for everyone
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {/* Dietary Restrictions */}
        <div className="flex flex-col gap-3">
          <Label className="text-base font-medium">Dietary Restrictions</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {COMMON_DIETARY_RESTRICTIONS.map((restriction) => (
              <div key={restriction} className="flex items-center gap-2">
                <Checkbox
                  id={`restriction-${restriction}`}
                  checked={selectedRestrictions.includes(restriction)}
                  onCheckedChange={() => toggleRestriction(restriction)}
                  disabled={isSaving}
                />
                <Label
                  htmlFor={`restriction-${restriction}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {restriction}
                </Label>
              </div>
            ))}
          </div>

          {/* Custom restrictions */}
          {selectedRestrictions.filter(
            (r) => !COMMON_DIETARY_RESTRICTIONS.includes(r as never)
          ).length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedRestrictions
                .filter((r) => !COMMON_DIETARY_RESTRICTIONS.includes(r as never))
                .map((restriction) => (
                  <div
                    key={restriction}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                  >
                    <span>{restriction}</span>
                    <button
                      type="button"
                      onClick={() => removeRestriction(restriction)}
                      className="ml-1 hover:text-destructive"
                      disabled={isSaving}
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>
          )}

          {/* Add custom restriction */}
          <div className="flex gap-2">
            <Input
              placeholder="Add custom restriction..."
              value={customRestriction}
              onChange={(e) => setCustomRestriction(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomRestriction();
                }
              }}
              disabled={isSaving}
            />
            <Button
              variant="outline"
              onClick={addCustomRestriction}
              disabled={isSaving || !customRestriction.trim()}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Allergens */}
        <div className="flex flex-col gap-3">
          <Label className="text-base font-medium">Allergens</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {COMMON_ALLERGENS.map((allergen) => (
              <div key={allergen} className="flex items-center gap-2">
                <Checkbox
                  id={`allergen-${allergen}`}
                  checked={selectedAllergens.includes(allergen)}
                  onCheckedChange={() => toggleAllergen(allergen)}
                  disabled={isSaving}
                />
                <Label
                  htmlFor={`allergen-${allergen}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {allergen}
                </Label>
              </div>
            ))}
          </div>

          {/* Custom allergens */}
          {selectedAllergens.filter(
            (a) => !COMMON_ALLERGENS.includes(a as never)
          ).length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedAllergens
                .filter((a) => !COMMON_ALLERGENS.includes(a as never))
                .map((allergen) => (
                  <div
                    key={allergen}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-destructive/10 text-destructive rounded-md text-sm"
                  >
                    <span>{allergen}</span>
                    <button
                      type="button"
                      onClick={() => removeAllergen(allergen)}
                      className="ml-1 hover:text-destructive"
                      disabled={isSaving}
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>
          )}

          {/* Add custom allergen */}
          <div className="flex gap-2">
            <Input
              placeholder="Add custom allergen..."
              value={customAllergen}
              onChange={(e) => setCustomAllergen(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomAllergen();
                }
              }}
              disabled={isSaving}
            />
            <Button
              variant="outline"
              onClick={addCustomAllergen}
              disabled={isSaving || !customAllergen.trim()}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Dislikes */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="dislikes" className="text-base font-medium">
            Foods I Dislike
          </Label>
          <Textarea
            id="dislikes"
            placeholder="Enter foods separated by commas (e.g., olives, mushrooms, cilantro)"
            value={dislikesText}
            onChange={(e) => setDislikesText(e.target.value)}
            rows={3}
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground">
            Separate items with commas
          </p>
        </div>

        {/* Preferences */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="preferences" className="text-base font-medium">
            Foods I Love
          </Label>
          <Textarea
            id="preferences"
            placeholder="Enter favorite foods separated by commas (e.g., pasta, grilled chicken, fresh vegetables)"
            value={preferencesText}
            onChange={(e) => setPreferencesText(e.target.value)}
            rows={3}
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground">
            Separate items with commas
          </p>
        </div>

        {/* Spice Tolerance */}
        <div className="flex flex-col gap-3">
          <Label className="text-base font-medium">Spice Tolerance</Label>
          <RadioGroup
            value={spiceTolerance ?? ""}
            onValueChange={(value) => setSpiceTolerance(value as SpiceTolerance)}
            disabled={isSaving}
          >
            {(
              Object.entries(SPICE_TOLERANCE_LABELS) as [
                SpiceTolerance,
                string
              ][]
            ).map(([value, label]) => (
              <div key={value} className="flex items-center gap-2">
                <RadioGroupItem value={value} id={`spice-${value}`} />
                <Label
                  htmlFor={`spice-${value}`}
                  className="text-sm font-normal cursor-pointer flex items-center gap-2"
                >
                  <span>{SPICE_TOLERANCE_EMOJIS[value]}</span>
                  <span>{label}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="notes" className="text-base font-medium">
            Additional Notes
          </Label>
          <Textarea
            id="notes"
            placeholder="Any other dietary information, cultural preferences, or cooking notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            disabled={isSaving}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
