"use client";

/**
 * Substitutions Settings Section
 * Component for settings page to manage ingredient substitutions
 */

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  createUserSubstitution,
  updateUserSubstitution,
  deleteUserSubstitution,
} from "@/app/actions/substitutions";
import type { Substitution, UserSubstitution } from "@/lib/substitutions";
import { toast } from "sonner";

interface SubstitutionsSectionProps {
  /** ID for scroll targeting from sidebar navigation */
  id?: string;
  initialUserSubstitutions: UserSubstitution[];
  defaultSubstitutions: Substitution[];
  className?: string;
}

export function SubstitutionsSection({
  id,
  initialUserSubstitutions,
  defaultSubstitutions,
  className,
}: SubstitutionsSectionProps) {
  const [userSubstitutions, setUserSubstitutions] = useState<UserSubstitution[]>(
    initialUserSubstitutions
  );
  const [showDefaults, setShowDefaults] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for adding new substitution
  const [newOriginal, setNewOriginal] = useState("");
  const [newSubstitute, setNewSubstitute] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Form state for editing
  const [editOriginal, setEditOriginal] = useState("");
  const [editSubstitute, setEditSubstitute] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const handleAdd = async () => {
    if (!newOriginal.trim() || !newSubstitute.trim()) {
      toast.error("Original ingredient and substitute are required");
      return;
    }

    setIsSaving(true);
    const result = await createUserSubstitution({
      original_ingredient: newOriginal.trim(),
      substitute_ingredient: newSubstitute.trim(),
      notes: newNotes.trim() || undefined,
    });

    if (result.error) {
      toast.error(result.error);
    } else if (result.data) {
      setUserSubstitutions([...userSubstitutions, result.data as UserSubstitution]);
      setNewOriginal("");
      setNewSubstitute("");
      setNewNotes("");
      setIsAdding(false);
      toast.success("Substitution added");
    }
    setIsSaving(false);
  };

  const handleStartEdit = (sub: UserSubstitution) => {
    setEditingId(sub.id);
    setEditOriginal(sub.original_ingredient);
    setEditSubstitute(sub.substitute_ingredient);
    setEditNotes(sub.notes || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditOriginal("");
    setEditSubstitute("");
    setEditNotes("");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editOriginal.trim() || !editSubstitute.trim()) {
      toast.error("Original ingredient and substitute are required");
      return;
    }

    setIsSaving(true);
    const result = await updateUserSubstitution(id, {
      original_ingredient: editOriginal.trim(),
      substitute_ingredient: editSubstitute.trim(),
      notes: editNotes.trim() || undefined,
    });

    if (result.error) {
      toast.error(result.error);
    } else if (result.data) {
      setUserSubstitutions(
        userSubstitutions.map((s) =>
          s.id === id ? (result.data as UserSubstitution) : s
        )
      );
      setEditingId(null);
      toast.success("Substitution updated");
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    setIsSaving(true);
    const result = await deleteUserSubstitution(id);

    if (result.error) {
      toast.error(result.error);
    } else {
      setUserSubstitutions(userSubstitutions.filter((s) => s.id !== id));
      toast.success("Substitution deleted");
    }
    setIsSaving(false);
  };

  return (
    <Card id={id} className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <RefreshCw className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-0.5">
            <CardTitle className="text-base">Ingredient Substitutions</CardTitle>
            <CardDescription>
              Define ingredient substitutions to see alternatives when viewing recipes
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator className="mb-0" />

      <CardContent className="pt-6 space-y-6">
        {/* User's Custom Substitutions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Your Substitutions</Label>
            {!isAdding && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAdding(true)}
                disabled={isSaving}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </div>

          {/* Add new substitution form */}
          {isAdding && (
            <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="new-original" className="text-xs">
                    Original Ingredient
                  </Label>
                  <Input
                    id="new-original"
                    placeholder="e.g., butter"
                    value={newOriginal}
                    onChange={(e) => setNewOriginal(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-substitute" className="text-xs">
                    Substitute With
                  </Label>
                  <Input
                    id="new-substitute"
                    placeholder="e.g., coconut oil"
                    value={newSubstitute}
                    onChange={(e) => setNewSubstitute(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-notes" className="text-xs">
                  Notes (optional)
                </Label>
                <Input
                  id="new-notes"
                  placeholder="e.g., Use 1:1 ratio"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setNewOriginal("");
                    setNewSubstitute("");
                    setNewNotes("");
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAdd} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          )}

          {/* List of user substitutions */}
          {userSubstitutions.length === 0 && !isAdding ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No custom substitutions yet. Add your own to personalize recipe
              suggestions.
            </p>
          ) : (
            <div className="space-y-2">
              {userSubstitutions.map((sub) => (
                <div
                  key={sub.id}
                  className="border rounded-lg p-3 flex items-start justify-between gap-2"
                >
                  {editingId === sub.id ? (
                    // Edit mode
                    <div className="flex-1 space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Original</Label>
                          <Input
                            value={editOriginal}
                            onChange={(e) => setEditOriginal(e.target.value)}
                            disabled={isSaving}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Substitute</Label>
                          <Input
                            value={editSubstitute}
                            onChange={(e) => setEditSubstitute(e.target.value)}
                            disabled={isSaving}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Notes</Label>
                        <Input
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Optional notes"
                          disabled={isSaving}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(sub.id)}
                          disabled={isSaving}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Display mode
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">
                            {sub.original_ingredient}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span>{sub.substitute_ingredient}</span>
                        </div>
                        {sub.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {sub.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleStartEdit(sub)}
                          disabled={isSaving}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(sub.id)}
                          disabled={isSaving}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Default Substitutions (read-only, collapsible) */}
        <Collapsible open={showDefaults} onOpenChange={setShowDefaults}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between px-0">
              <span className="text-sm font-medium">
                Common Substitutions ({defaultSubstitutions.length})
              </span>
              {showDefaults ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="space-y-2">
              {defaultSubstitutions.map((sub) => (
                <div
                  key={sub.id}
                  className="border rounded-lg p-3 bg-muted/30"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{sub.original_ingredient}</span>
                    <span className="text-muted-foreground">→</span>
                    <span>{sub.substitute_ingredient}</span>
                    <Badge variant="secondary" className="text-xs">
                      Default
                    </Badge>
                  </div>
                  {sub.notes && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {sub.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              These are built-in substitutions. Add your own above to customize or
              override them.
            </p>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
